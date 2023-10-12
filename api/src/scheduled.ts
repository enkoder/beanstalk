import { Env } from "./types";
import {
  abrToResult,
  abrToTournament,
  getEntries,
  getTournaments,
} from "./abr";
import { initDB } from "./models";
import { Formats, Tournaments } from "./models/tournament";
import { Results } from "./models/results";
import { Users } from "./models/user";

const CUTOFF_DATE = new Date("2022-01-01");

export async function handleScheduled(event: ScheduledEvent, env: Env) {
  initDB(env.DB);

  let offset = 0;
  const limit = 100;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    console.log(`offset: ${offset}`);
    const tournaments = await getTournaments(offset, limit);
    const minDate = new Date(
      Math.min(...tournaments.map((t) => t.date.getTime())),
    );
    const ids = tournaments.map((t) => t.id);
    const countNew = await Tournaments.getCountFromIds(ids);
    console.log(`Inserting ${countNew} new tournaments`);

    for (const abrTournament of tournaments) {
      // Only ingest known formats for now
      if (!Object.values(Formats).includes(abrTournament.format as Formats)) {
        continue;
      }
      const tournament = await Tournaments.insert(
        abrToTournament(abrTournament),
        true,
      );
      console.log(tournament);
      const entries = await getEntries(tournament.id);
      for (const entry of entries) {
        const user = await Users.get(entry.user_id);
        if (!user) {
          await Users.insert({ id: entry.user_id });
        }

        // this is a partial, be sure to add the extra stuff that isn't coming from abr
        const result = await Results.insert(
          abrToResult(entry, { tournament_id: tournament.id }),
          true,
        );
        console.log(
          `Inserted result - user_id ${result.user_id} tournament_id: ${result.tournament_id}`,
        );
      }
    }

    console.log(`MinDate ${minDate}`);
    if (minDate < CUTOFF_DATE) {
      break;
    }

    offset = offset + limit;
  }
}
