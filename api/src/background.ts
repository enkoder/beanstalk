import { g } from "./g.js";
import {
  ABREntryType,
  ABRTournamentType,
  ABRTournamentTypeFilter,
  abrToResult,
  abrToTournament,
  getEntries,
  getTournamentsByType,
  getTournamentsByUserId,
} from "./lib/abr.js";
import * as NRDB from "./lib/nrdb.js";
import { calculateTournamentPointDistribution } from "./lib/ranking.js";
import * as Results from "./models/results.js";
import * as Seasons from "./models/season.js";
import * as Tournaments from "./models/tournament.js";
import * as Users from "./models/user.js";
import { Result, Tournament, User } from "./schema.js";
import { Env, IngestResultQueueMessage } from "./types.d.js";

enum Queues {
  IngestTournament = "ingest-tournament",
  IngestTournamentDLQ = "ingest-tournament-dlq",
  IngestResult = "ingest-result",
  IngestResultDLQ = "ingest-result-dlq",
  IngestCard = "ingest-card",
}

const SUPPORTED_TOURNAMENT_TYPES: ABRTournamentTypeFilter[] = [
  ABRTournamentTypeFilter.CircuitOpener,
  ABRTournamentTypeFilter.WorldsChampionship,
  ABRTournamentTypeFilter.NationalChampionship,
  ABRTournamentTypeFilter.IntercontinentalChampionship,
  ABRTournamentTypeFilter.ContinentalChampionship,
];

export async function processScheduledEvent(event: ScheduledEvent, env: Env) {
  switch (event.cron) {
    // Every day at midnight
    case "0 0 * * *":
      await publishAllTournamentIngest(env, "cron");
      break;
  }
}

export async function processQueueBatch(
  batch: MessageBatch<ABRTournamentType | ABREntryType>,
  env: Env,
) {
  for (const message of batch.messages) {
    switch (batch.queue) {
      case Queues.IngestTournament:
        await handleTournamentIngest(env, message.body as ABRTournamentType);
        break;
      case Queues.IngestTournamentDLQ:
        await handleTournamentIngestDLQ(message.body as ABRTournamentType);
        break;
      case Queues.IngestResult: {
        const { tournament, entry } = message.body as IngestResultQueueMessage;
        await handleResultIngest(env, tournament, entry);
        break;
      }
      case Queues.IngestResultDLQ: {
        const { tournament, entry } = message.body as IngestResultQueueMessage;
        await handleResultIngestDLQ(tournament, entry);
        break;
      }
      case Queues.IngestCard: {
        await handleCardIngest(env, message.body);
        break;
      }
    }
  }
}

export async function publishAllTournamentIngest(
  env: Env,
  trigger: "api" | "cron",
) {
  const data = { publish: "tournament", trigger: trigger };
  for (const type of SUPPORTED_TOURNAMENT_TYPES) {
    try {
      await publishIngestTournament(env, null, type);
      console.log(
        JSON.stringify({
          tournament_type: type,
          status: "success",
          ...data,
        }),
      );
    } catch (e) {
      g().sentry.captureException(e);
      console.log(
        JSON.stringify({
          tournament_type: type,
          status: "error",
          ...data,
        }),
      );
    }
  }
}

async function ingestEntry(
  env: Env,
  entry: ABREntryType,
  tournamentId: number,
  points: number,
): Promise<Result | null> {
  // If there's a non-zero user_id then the user has claimed their spot in the tournament
  let user: User | null = null;
  let name: string = entry.user_id
    ? await NRDB.getNameFromId(entry.user_id)
    : entry.user_name;

  // name can be null and ID can be 0
  if (!name && entry.user_import_name) {
    name = entry.user_import_name;
  }

  if (entry.user_id) {
    user = await Users.get(entry.user_id);
  } else {
    // It's possible the user's name is known, but they haven't claimed yet
    user = await Users.getByName(name);
  }

  // first time here, let's make a new user for later
  if (!user && entry.user_id) {
    user = await Users.insert({ id: entry.user_id, name: name });
  }

  if (!user) {
    return null;
  }

  // TODO: types
  const runner_card = JSON.parse(
    await env.CARDS_KV.get(String(entry.runner_deck_identity_id)),
  );
  const corp_card = JSON.parse(
    await env.CARDS_KV.get(String(entry.corp_deck_identity_id)),
  );

  const runner_deck_identity_name = runner_card.title;
  const runner_deck_faction = runner_card.faction_code;

  const corp_deck_identity_name = corp_card.title;
  const corp_deck_faction = corp_card.faction_code;

  // this is a partial, be sure to add the extra stuff that isn't coming from abr
  return await Results.insert(
    abrToResult(entry, {
      tournament_id: tournamentId,
      user_id: user.id,
      points_earned: points,
      runner_deck_identity_name: runner_deck_identity_name,
      runner_deck_faction: runner_deck_faction,
      corp_deck_identity_name: corp_deck_identity_name,
      corp_deck_faction: corp_deck_faction,
    }),
    true,
  );
}

async function handleResultIngest(
  env: Env,
  tournament: Tournament,
  abrEntry: ABREntryType,
) {
  // Being explicit, even though defaults are supplied
  const { points } = calculateTournamentPointDistribution(
    tournament.players_count,
    tournament.type,
  );
  const placement = abrEntry.rank_top || abrEntry.rank_swiss;

  const loggedData = {
    tournament_id: tournament.id,
    tournament_name: tournament.name,
    tournament_type: tournament.type,
    user_name: abrEntry.user_name,
    user_name_import: abrEntry.user_import_name,
  };

  try {
    const result = await ingestEntry(
      env,
      abrEntry,
      tournament.id,
      points[placement - 1],
    );

    if (!result) {
      console.log(
        JSON.stringify({
          status: "skip",
          ...loggedData,
        }),
      );
    } else {
      console.log(
        JSON.stringify({
          status: "success",
          ...loggedData,
        }),
      );
    }
  } catch (e) {
    g().sentry.captureException(e);
    console.log(
      JSON.stringify({
        status: "error",
        ...loggedData,
      }),
    );
    throw e;
  }
}

async function handleTournamentIngest(
  env: Env,
  abrTournament: ABRTournamentType,
) {
  const seasons = await Seasons.getFromTimestamp(abrTournament.date.toString());
  const seasonId = seasons.length !== 0 ? seasons[0].id : null;

  const tournament = await Tournaments.insert(
    abrToTournament(abrTournament, seasonId),
    true,
  );

  const entries = await getEntries(tournament.id);
  for (const entry of entries) {
    await env.INGEST_RESULT_Q.send({ tournament: tournament, entry: entry });
  }
}

async function handleTournamentIngestDLQ(tournament: ABRTournamentType) {
  // TODO: actually do something here on ingest fail
  const str = JSON.stringify(tournament, null, 4);
  console.log(`handleTournamentIngestDLQ | ${str}`);
}

async function handleResultIngestDLQ(
  tournament: Tournament,
  entry: ABREntryType,
) {
  // TODO: actually do something here on ingest fail
  const tournamentStr = JSON.stringify(tournament, null, 4);
  const entryStr = JSON.stringify(entry, null, 4);
  console.log(
    `handleResultIngestDLQ | tournament=${tournamentStr} | entry=${entryStr}`,
  );
}

export async function publishIngestTournament(
  env: Env,
  userId?: number,
  tournamentTypeFilter?: ABRTournamentTypeFilter,
) {
  // fetch and insert the tournament row
  let abrTournaments: ABRTournamentType[] = null;
  if (userId) {
    abrTournaments = await getTournamentsByUserId(userId);
  } else if (tournamentTypeFilter) {
    abrTournaments = await getTournamentsByType(tournamentTypeFilter);
  }

  for (const abrTournament of abrTournaments) {
    await env.INGEST_TOURNAMENT_Q.send(abrTournament, { contentType: "json" });
  }
}

async function handleCardIngest(env: Env, card) {
  await env.CARDS_KV.put(String(Number(card.code)), JSON.stringify(card));
}
