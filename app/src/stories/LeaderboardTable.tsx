import { LeaderboardResponse } from "../client";
import { Link } from "react-router-dom";

type LeaderboardProps = {
  leaderboard?: LeaderboardResponse;
  searchString: string;
  selectedSeason: number;
};

export function LeaderboardTable({
  leaderboard,
  searchString,
  selectedSeason,
}: LeaderboardProps) {
  return (
    <table
      className={
        "w-full table-fixed border-separate border-spacing-0 text-gray-300"
      }
    >
      <thead className={"sticky top-0 h-10 bg-slate-950 text-center text-lg"}>
        <tr className={"border-b"}>
          <th
            scope="col"
            className={"border-b-2 border-solid border-gray-300 px-4"}
          >
            #
          </th>
          <th scope="col" className={"border-b-2 border-solid border-gray-300"}>
            Name
          </th>
          <th scope="col" className={"border-b-2 border-solid border-gray-300"}>
            Beans
          </th>
        </tr>
      </thead>
      <tbody>
        {leaderboard &&
          leaderboard.users
            .filter(
              (user) =>
                user &&
                user.name?.toLowerCase().includes(searchString.toLowerCase()),
            )
            .map((user) => (
              <tr className={"text-center odd:bg-slate-900 even:bg-slate-950"}>
                <td className={"px-4 py-2"}>{user.rank}</td>
                <th
                  scope="row"
                  className="whitespace-nowrap font-medium text-cyan-500"
                >
                  <Link
                    className={
                      "hover:font-bold hover:text-cyan-400 hover:underline"
                    }
                    to={`results/${user.name}?season=${selectedSeason}`}
                  >
                    {user.name}
                  </Link>
                </th>
                <td>{user.points.toFixed(2)}</td>
              </tr>
            ))}
      </tbody>
    </table>
  );
}
