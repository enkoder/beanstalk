import { Env } from "./types";
import {
  ABREntryType,
  ABRTournamentType,
  ABRTournamentTypeFilter,
  abrToResult,
  abrToTournament,
  getEntries,
  getTournamentsByType,
  getTournamentsByUserId,
} from "./lib/abr";
import { initDB } from "./models";
import { Tournaments } from "./models/tournament";
import { Result, Results } from "./models/results";
import { User, Users } from "./models/user";
import * as NRDB from "./lib/nrdb";
import { getSeason0Points } from "./lib/ranking";

enum Queues {
  TournamentIngest = "ingest-tournament",
  TournamentIngestDLQ = "ingest-tournament-dlq",
}

async function ingestEntry(
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

  // this is a partial, be sure to add the extra stuff that isn't coming from abr
  return await Results.insert(
    abrToResult(entry, {
      tournament_id: tournamentId,
      user_id: user.id,
      points_earned: points,
    }),
    true,
  );
}

async function handleTournamentIngest(abrTournament: ABRTournamentType) {
  const tournament = await Tournaments.insert(
    abrToTournament(abrTournament),
    true,
  );

  const entries = await getEntries(tournament.id);
  for (const entry of entries) {
    const points = getSeason0Points(
      tournament.type,
      tournament.registration_count,
      entry.rank_swiss,
      entry.rank_top,
    );

    //console.log(JSON.stringify(entry, null, 4));
    try {
      const result = await ingestEntry(entry, tournament.id, points);
      if (!result) {
        console.log(
          [
            `${Queues.TournamentIngest} | `,
            "FAIL | ",
            `user_id: ${entry.user_id} | `,
            `user_name: ${entry.user_name} | `,
            `user_import_name: ${entry.user_import_name} | `,
            `tournament_id: ${tournament.id} | `,
            `tournament_name: ${tournament.name}`,
          ].join(" "),
        );
      } else {
        console.log(
          [
            `${Queues.TournamentIngest} | `,
            "SUCCESS | ",
            `user_id: ${result.user_id} | `,
            `user_name: ${entry.user_name} | `,
            `user_import_name: ${entry.user_import_name} | `,
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
}

async function handleTournamentIngestDLQ(tournament: ABRTournamentType) {
  // TODO: actually do something here on ingest fail
  const str = JSON.stringify(tournament, null, 4);
  console.log(`handleTournamentIngestDLQ | ${str}`);
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
    await env.INGEST_TOURNAMENT_Q.send(abrTournament);
  }
}

export async function handleQueue(
  batch: MessageBatch<ABRTournamentType>,
  env: Env,
): Promise<void> {
  initDB(env.DB);
  for (const message of batch.messages) {
    console.log(`${batch.queue} | ${JSON.stringify(message)}`);
    switch (batch.queue) {
      case Queues.TournamentIngest:
        await handleTournamentIngest(message.body);
        break;
      case Queues.TournamentIngestDLQ:
        await handleTournamentIngestDLQ(message.body);
        break;
    }
  }
}

export async function handleScheduled(event: ScheduledEvent, env: Env) {
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
