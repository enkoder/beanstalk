import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { Result, Tournament, TournamentService } from "../client";
import { Link } from "../components/Link";
import { PageHeading } from "../components/PageHeader";

type TournamentParams = {
  tournament: string;
};

export function TournamentPage() {
  const params = useParams<TournamentParams>();
  const tournamentId = Number(params.tournament);

  const { data: results } = useQuery<Result[]>({
    queryKey: ["tournamentResults", tournamentId],
    queryFn: () => TournamentService.getGetTournamentResults(tournamentId),
  });

  const { data: tournament } = useQuery<Tournament>({
    queryKey: ["tournament", tournamentId],
    queryFn: () => TournamentService.getGetTournament(tournamentId),
  });

  return (
    <>
      <PageHeading text={"Tournament"} includeUnderline={true} />
      {tournament && (
        <div className={"mt-2 flex flex-row items-center text-lg"}>
          <Link to={`https://alwaysberunning.net/tournaments/${tournament.id}`}>
            {tournament.name}
          </Link>
          <span className={"my-4 ml-auto text-gray-400"}>
            {`${tournament.players_count} Players`}
          </span>
        </div>
      )}

      <div className={"mx-auto mt-4 max-w-7xl"}>
        <table
          className={
            "mt-4 w-full table-fixed border-separate border-spacing-0 text-xs text-gray-300 sm:text-base md:text-lg xl:text-xl"
          }
        >
          <thead className={"sticky top-0 h-10 bg-slate-950 text-lg"}>
            <tr className={"border-b"}>
              <th
                scope="col"
                className={
                  "w-1/12 border-b-2 border-solid border-gray-300 pl-4 text-left"
                }
              >
                Place
              </th>
              <th
                scope="col"
                className={
                  "w-1/12 border-b-2 border-solid border-gray-300 pl-4 text-left"
                }
              >
                Seed
              </th>
              <th
                scope="col"
                className={
                  "w-2/3 border-b-2 border-solid border-gray-300 text-center"
                }
              >
                Player
              </th>
              <th
                scope="col"
                className={
                  "w-1/3 border-b-2 border-solid border-gray-300 pr-4 text-right"
                }
              >
                Total Beans
              </th>
            </tr>
          </thead>
          {results && (
            <tbody>
              {results.map((result) => (
                <tr className={"text-left odd:bg-slate-900 even:bg-slate-950"}>
                  <td className={"w-1/12 pl-4 pr-4 text-left"}>
                    {result.rank_cut || result.rank_swiss}
                  </td>
                  <td className={"w-1/12 pl-4 pr-4 text-left"}>
                    {result.rank_cut ? result.rank_swiss : ""}
                  </td>
                  <td className={"w-2/3 pr-4 text-center"}>
                    <Link to={`/results/${result.user_name}`}>
                      {result.user_name}
                    </Link>
                  </td>
                  <td className={"w-1/6 pr-4 text-right"}>
                    {result.points_earned.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          )}
        </table>
      </div>
    </>
  );
}
