import { Env, IngestResultQueueMessage } from "./types";
import {
  ABREntryType,
  abrToResult,
  abrToTournament,
  ABRTournamentType,
  ABRTournamentTypeFilter,
  getEntries,
  getTournamentsByType,
  getTournamentsByUserId,
} from "./lib/abr";
import { initDB } from "./models";
import { Tournament, Tournaments } from "./models/tournament";
import { Result, Results } from "./models/results";
import { User, Users } from "./models/user";
import * as NRDB from "./lib/nrdb";
import {
  calculateTournamentPointDistribution,
  findAlphaForDesiredDistribution,
  TOURNAMENT_POINTS,
} from "./lib/ranking";
import { Seasons } from "./models/season";

enum Queues {
  IngestTournament = "ingest-tournament",
  IngestTournamentDLQ = "ingest-tournament-dlq",
  IngestResult = "ingest-result",
  IngestResultDLQ = "ingest-result-dlq",
  IngestCard = "ingest-card",
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

  const runner_deck_identity_name = runner_card["title"];
  const runner_deck_faction = runner_card["faction_code"];

  const corp_deck_identity_name = corp_card["title"];
  const corp_deck_faction = corp_card["faction_code"];

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
  const alpha = findAlphaForDesiredDistribution(tournament.registration_count);
  const { points } = calculateTournamentPointDistribution(
    TOURNAMENT_POINTS[tournament.type],
    tournament.registration_count,
    alpha,
  );
  const placement = abrEntry.rank_top || abrEntry.rank_swiss;

  //console.log(JSON.stringify(entry, null, 4));
  try {
    const result = await ingestEntry(
      env,
      abrEntry,
      tournament.id,
      points[placement],
    );
    if (!result) {
      console.log(
        [
          `${Queues} | `,
          "FAIL | ",
          `user_id: ${abrEntry.user_id} | `,
          `user_name: ${abrEntry.user_name} | `,
          `user_import_name: ${abrEntry.user_import_name} | `,
          `tournament_id: ${tournament.id} | `,
          `tournament_name: ${tournament.name}`,
        ].join(" "),
      );
    } else {
      console.log(
        [
          `${Queues.IngestTournament} | `,
          "SUCCESS | ",
          `user_id: ${result.user_id} | `,
          `user_name: ${abrEntry.user_name} | `,
          `user_import_name: ${abrEntry.user_import_name} | `,
          `tournament_id: ${tournament.id} | `,
          `tournament_name: ${tournament.name}`,
        ].join(" "),
      );
    }
  } catch (e) {
    console.log(`Error in handleTournamentIngest ${e}`);
    throw e;
  }
}

async function handleTournamentIngest(
  env: Env,
  abrTournament: ABRTournamentType,
) {
  const seasons = await Seasons.getFromTimestamp(abrTournament.date.toString());

  const tournament = await Tournaments.insert(
    abrToTournament(abrTournament, seasons[0].id),
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

export async function abrIngest(
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

  if (!abrTournaments) {
    throw new Error(
      `abrIngest | Could not find ABR Tournaments from query and args`,
    );
  }

  for (const abrTournament of abrTournaments) {
    await env.INGEST_TOURNAMENT_Q.send(abrTournament, { contentType: "json" });
  }
}

async function handleCardIngest(env: Env, card: any) {
  await env.CARDS_KV.put(String(Number(card["code"])), JSON.stringify(card));
}

export async function handleQueue(
  batch: MessageBatch<ABRTournamentType | ABREntryType>,
  env: Env,
): Promise<void> {
  initDB(env.DB);
  for (const message of batch.messages) {
    //console.log(`${batch.queue} | ${JSON.stringify(message)}`);
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
      case Queues.IngestResultDLQ:
        {
          const { tournament, entry } =
            message.body as IngestResultQueueMessage;
          await handleResultIngestDLQ(tournament, entry);
        }
        break;
      case Queues.IngestCard: {
        await handleCardIngest(env, message.body);
        break;
      }
    }
  }
}

export async function handleScheduled(_: ScheduledEvent, env: Env) {
  initDB(env.DB);
  await abrIngest(
    env,
    null,
    ABRTournamentTypeFilter.IntercontinentalChampionship,
  );
  await abrIngest(env, null, ABRTournamentTypeFilter.ContinentalChampionship);
  await abrIngest(env, null, ABRTournamentTypeFilter.NationalChampionship);
  await abrIngest(env, null, ABRTournamentTypeFilter.WorldsChampionship);
}
