import { PageHeading } from "../stories/PageHeader";
import { Result, Tournament, TournamentService } from "../client";
import { Link } from "../stories/Link";
import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";

type TournamentParams = {
  tournament: string;
};

export function Tournament() {
  const params = useParams<TournamentParams>();
  const [results, setResults] = useState<Result[]>([]);
  const [tournament, setTournament] = useState<Tournament>();

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
    const tournamentId = Number(params.tournament);
    fetchResults(tournamentId).catch((e) => console.log(e));
    fetchTournament(tournamentId).catch((e) => console.log(e));
    return () => {};
  }, [params.tournament]);

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
            "w-full table-auto border-separate border-spacing-0 text-gray-300"
          }
        >
          <thead className={"sticky top-0 h-10 bg-slate-950 text-left text-lg"}>
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
                <td>{result.rank_cut ? result.rank_cut : result.rank_swiss}</td>
                <td>
                  <Link to={`/results/${result.user_name}`}>
                    {result.user_name}
                  </Link>
                </td>
                <td>{result.points_earned.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
