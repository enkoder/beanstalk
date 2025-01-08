import { trace as otel } from "@opentelemetry/api";
import objectHash from "object-hash";
import { g } from "./g.js";
import {
  type ABREntryType,
  type ABRTournamentType,
  ABRTournamentTypeFilter,
  abrToResult,
  abrToTournament,
  getEntries,
  getTournamentsByType,
  getTournamentsByUserId,
} from "./lib/abr.js";
import * as NRDB from "./lib/nrdb.js";
import { calculatePointDistribution, getSeasonConfig } from "./lib/ranking.js";
import { trace } from "./lib/tracer.js";
import { Results } from "./models/results.js";
import { Seasons } from "./models/season.js";
import { Tournaments } from "./models/tournament.js";
import { Users } from "./models/user.js";
import type { Result, Tournament, User } from "./schema.js";
import type {
  Env,
  IngestResultQueueMessage,
  IngestTournamentQueueMessage,
  TriggerType,
} from "./types.d.js";

const DISALLOW_TOURNAMENT_ID = [
  // circuit opener selected as circuit breaker
  3694,
];

enum Queues {
  IngestTournament = "ingest-tournament",
  IngestTournamentPreview = "ingest-tournament-preview",
  IngestTournamentDLQ = "ingest-tournament-dlq",
  IngestTournamentDLQPreview = "ingest-tournament-dlq-preview",
  IngestResult = "ingest-result",
  IngestResultPreview = "ingest-result-preview",
  IngestResultDLQ = "ingest-result-dlq",
  IngestResultDLQPreview = "ingest-result-dlq-preview",
  IngestCard = "ingest-card",
  IngestCardPreview = "ingest-card-preview",
}

const SUPPORTED_TOURNAMENT_TYPES: ABRTournamentTypeFilter[] = [
  ABRTournamentTypeFilter.CircuitOpener,
  ABRTournamentTypeFilter.CircuitBreaker,
  ABRTournamentTypeFilter.WorldsChampionship,
  ABRTournamentTypeFilter.NationalChampionship,
  ABRTournamentTypeFilter.IntercontinentalChampionship,
  ABRTournamentTypeFilter.ContinentalChampionship,
  ABRTournamentTypeFilter.PlayersCircuit,
];

export async function processScheduledEvent(event: ScheduledEvent, env: Env) {
  switch (event.cron) {
    // Every day at midnight
    case "0 0 * * *":
      await trace(
        "publishAllTournamentIngest",
        () => publishAllTournamentIngest(env, "cron"),
        { cron: event.cron, trigger: "cron" },
      );
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
      case Queues.IngestTournamentPreview: {
        const ingestTournamentMessage =
          message.body as IngestTournamentQueueMessage;

        const tournament = ingestTournamentMessage.tournament;
        if (DISALLOW_TOURNAMENT_ID.includes(tournament.id)) {
          break;
        }

        await trace(
          "handleTournamentIngest",
          () => handleTournamentIngest(env, ingestTournamentMessage),
          {
            queue: Queues.IngestTournament,
            tournament_title: tournament.title,
            tournament_id: tournament.id,
          },
        );
        break;
      }
      case Queues.IngestTournamentDLQ:
      case Queues.IngestTournamentDLQPreview: {
        await trace(
          "handleTournamentIngestDLQ",
          () => handleTournamentIngestDLQ(message.body as ABRTournamentType),
          {
            queue: Queues.IngestTournamentDLQ,
          },
        );
        break;
      }
      case Queues.IngestResult:
      case Queues.IngestResultPreview: {
        const { tournament, entry } = message.body as IngestResultQueueMessage;
        await trace(
          "handleResultIngest",
          () => handleResultIngest(env, tournament, entry),
          {
            queue: Queues.IngestResult,
            tournament_id: tournament.id,
            tournament_name: tournament.name,
            tournament_type: tournament.type,
            user_name: entry.user_name,
            user_name_import: entry.user_import_name,
          },
        );
        break;
      }
      case Queues.IngestResultDLQ:
      case Queues.IngestResultDLQPreview: {
        const { tournament, entry } = message.body as IngestResultQueueMessage;
        await trace(
          "handleResultIngestDLQ",
          () => handleResultIngestDLQ(tournament, entry),
          {
            queue: Queues.IngestResultDLQ,
          },
        );
        break;
      }
      case Queues.IngestCard:
      case Queues.IngestCardPreview: {
        await trace(
          "handleCardIngest",
          () => handleCardIngest(env, message.body),
          {
            queue: Queues.IngestCard,
          },
        );
        break;
      }
    }
  }
}

export async function publishAllTournamentIngest(
  env: Env,
  trigger: TriggerType,
) {
  const data = { publish: "tournament", trigger: trigger };
  for (const type of SUPPORTED_TOURNAMENT_TYPES) {
    try {
      await publishIngestTournament(env, trigger, null, type);
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
    user = await Users.insert({
      id: entry.user_id,
      name: name,
    });
  }

  // update name based upon their NRDB account if it has changed
  if (user && user.name !== name) {
    user = await Users.insert({
      id: user.id,
      name: name,
    });
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
  let count = 0;
  if (
    tournament.type === "intercontinental championship" &&
    tournament.season_id !== 0 &&
    tournament.season_id !== null
  ) {
    // We use the number of continental championships as the total number of players
    count =
      (await Results.countUniqueAttendeesByType(
        "continental championship",
        tournament.season_id,
      )) *
      getSeasonConfig(tournament.season_id).POINTS_PER_PLAYER[
        "intercontinental championship"
      ];
  }

  const { points } = calculatePointDistribution(
    tournament.players_count,
    tournament.type,
    count,
    tournament.season_id,
  );

  const placementIndex = (abrEntry.rank_top || abrEntry.rank_swiss) - 1;
  if (placementIndex < 0 || placementIndex >= points.length) {
    g().sentry.captureException(
      new Error(
        `Somehow the placement (${placementIndex}) is out of rang of points (${points})`,
      ),
    );
  }

  const loggedData = {
    tournament_id: tournament.id,
    tournament_name: tournament.name,
    tournament_type: tournament.type,
    user_name: abrEntry.user_name,
    user_name_import: abrEntry.user_import_name,
  };

  const span = otel.getActiveSpan();
  try {
    const result = await ingestEntry(
      env,
      abrEntry,
      tournament.id,
      points[placementIndex],
    );

    if (!result) {
      span.setAttribute("ingest_status", "skip");
      console.log(
        JSON.stringify({
          status: "skip",
          ...loggedData,
        }),
      );
    } else {
      span.setAttribute("ingest_status", "success");
      console.log(
        JSON.stringify({
          status: "success",
          ...loggedData,
        }),
      );
    }
  } catch (e) {
    g().sentry.captureException(e);
    span.setAttribute("ingest_status", "error");
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
  message: IngestTournamentQueueMessage,
) {
  const { tournament: abrTournament, trigger } = message;

  const seasons = await Seasons.getFromTimestamp(abrTournament.date.toString());
  const seasonId = seasons.length !== 0 ? seasons[0].id : null;

  if (seasonId === null) {
    return;
  }

  const entries = await getEntries(abrTournament.id);
  const cutTo = entries.filter((e) => e.rank_top !== null).length;
  const tournamentBlob = abrToTournament(abrTournament, seasonId, cutTo);

  const fingerprint = objectHash({
    tournament: tournamentBlob,
    season_id: seasonId,
    entries: entries,
  });

  let tournament = await Tournaments.get(tournamentBlob.id);

  // Is this a new tournament we've never seen?
  if (!tournament) {
    tournament = await Tournaments.insert({
      ...tournamentBlob,
      fingerprint: fingerprint,
    });
  } else {
    if (trigger !== "api" && tournament.fingerprint === fingerprint) {
      console.log(`skipping ${tournament.name} due to fingerprint match`);
      return;
    }

    tournament = await Tournaments.update({
      ...tournamentBlob,
      fingerprint: fingerprint,
    });
  }

  for (const entry of entries) {
    await env.INGEST_RESULT_Q.send({ tournament: tournament, entry: entry });
  }
}

function handleTournamentIngestDLQ(tournament: ABRTournamentType) {
  // TODO: actually do something here on ingest fail
  const str = JSON.stringify(tournament, null, 4);
  console.log(`handleTournamentIngestDLQ | ${str}`);
}

function handleResultIngestDLQ(tournament: Tournament, entry: ABREntryType) {
  // TODO: actually do something here on ingest fail
  const tournamentStr = JSON.stringify(tournament, null, 4);
  const entryStr = JSON.stringify(entry, null, 4);
  console.log(
    `handleResultIngestDLQ | tournament=${tournamentStr} | entry=${entryStr}`,
  );
}

export async function publishIngestTournament(
  env: Env,
  trigger: TriggerType,
  userId?: number,
  tournamentTypeFilter?: ABRTournamentTypeFilter,
) {
  // fetch and insert the tournament row
  let abrTournaments: ABRTournamentType[] = [];
  if (userId) {
    abrTournaments = await getTournamentsByUserId(userId);
  } else if (tournamentTypeFilter) {
    abrTournaments = await getTournamentsByType(tournamentTypeFilter);
  }

  // 100 is the limit for batch sizes
  const chunkSize = 100;
  for (let i = 0; i < abrTournaments.length; i += chunkSize) {
    const chunkedTournaments = abrTournaments.slice(i, i + chunkSize);
    await env.INGEST_TOURNAMENT_Q.sendBatch(
      chunkedTournaments.map((t) => ({
        body: { tournament: t, trigger: trigger },
        contentType: "json",
      })),
    );
  }
}

async function handleCardIngest(env: Env, card) {
  await env.CARDS_KV.put(String(Number(card.code)), JSON.stringify(card));
}
