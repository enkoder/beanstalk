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
        <text className={"my-4 text-xl text-gray-400"}>
          {`${tournament.name} - ${tournament.players_count} Players`}
        </text>
      )}

      <div className={"overflow-auto whitespace-nowrap text-lg"}>
        <table
          className={
            "mt-4 w-full table-fixed border-separate border-spacing-0 text-xs text-gray-300 sm:text-base md:text-lg xl:text-xl"
          }
        >
          <thead className={"sticky top-0 h-10 bg-slate-950 text-left text-lg"}>
            <tr className={"border-b"}>
              <th
                scope="col"
                className={"w-1/3 border-b-2 border-solid border-gray-300 pl-4"}
              >
                Placement
              </th>
              <th
                scope="col"
                className={
                  "w-1/3 border-b-2 border-solid border-gray-300 text-center"
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
                Points
              </th>
            </tr>
          </thead>
          {results && (
            <tbody>
              {results.map((result) => (
                <tr className={"text-left odd:bg-slate-900 even:bg-slate-950"}>
                  <td className={"w-1/3 pl-4 pr-4"}>
                    {result.rank_cut ? result.rank_cut : result.rank_swiss}
                  </td>
                  <td className={"w-1/3 pr-4 text-center"}>
                    <Link to={`/results/${result.user_name}`}>
                      {result.user_name}
                    </Link>
                  </td>
                  <td className={"w-1/3 pr-4 text-right"}>
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
