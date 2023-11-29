import { PageHeading } from "../stories/PageHeader";
import { Result, Tournament, TournamentService } from "../client";
import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

type TournamentParams = {
  tournament: string;
};

export function Tournament() {
  const params = useParams<TournamentParams>();
  const [results, setResults] = useState<Result[]>([]);
  const [tournament, setTournament] = useState<Tournament>();
  const [loading, setLoading] = useState<boolean>(true);

  const fetchResults = useCallback(async (tournamentId: number) => {
    TournamentService.getGetTournamentResults(tournamentId).then((results) => {
      setResults(results);
    });
  }, []);

  const fetchTournament = useCallback(async (tournamentId: number) => {
    TournamentService.getGetTournament(tournamentId).then((t) => {
      setTournament(t);
    });
  }, []);

  useEffect(() => {
    setLoading(true);
    const tournamentId = Number(params.tournament);
    fetchResults(tournamentId).catch((e) => console.log(e));
    fetchTournament(tournamentId).catch((e) => console.log(e));
    setLoading(false);
    return () => {};
  }, [params.tournament]);

  return (
    <div
      className={"mt-4 flex h-[100svh] flex-row justify-center overflow-auto"}
    >
      <div className={"m-4 flex w-5/6 flex-col text-gray-300"}>
        <PageHeading text={"Tournament"} />
        {tournament && (
          <text className={"my-4 text-lg"}>{tournament.name}</text>
        )}

        <div className={"overflow-auto whitespace-nowrap"}>
          <table
            className={
              "w-full table-auto border-separate border-spacing-0 text-gray-300"
            }
          >
            <thead
              className={"sticky top-0 h-10 bg-slate-950 text-left text-lg"}
            >
              <tr className={"border-b"}>
                <th
                  scope="col"
                  className={"border-b-2 border-solid border-gray-300"}
                >
                  Placement
                </th>
                <th
                  scope="col"
                  className={"border-b-2 border-solid border-gray-300"}
                >
                  Player
                </th>
                <th
                  scope="col"
                  className={"border-b-2 border-solid border-gray-300"}
                >
                  Points
                </th>
              </tr>
            </thead>
            <tbody>
              {results.map((result) => (
                <tr className={"text-left odd:bg-slate-900 even:bg-slate-950"}>
                  <td>
                    {result.rank_cut ? result.rank_cut : result.rank_swiss}
                  </td>
                  <td>
                    <Link
                      className={
                        "text-cyan-400 hover:font-bold hover:text-cyan-300 hover:underline"
                      }
                      to={`/results/${result.user_name}`}
                    >
                      {result.user_name}
                    </Link>
                  </td>
                  <td>{result.points_earned.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
