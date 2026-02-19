import type { LeaderboardRow } from "../client";
import {
  type FilterSectionValues,
  getSearchParamsFromValues,
} from "../filterUtils";
import { Link } from "./Link";

type LeaderboardProps = {
  leaderboard?: LeaderboardRow[];
  values: FilterSectionValues;
};

export function LeaderboardTable({ leaderboard, values }: LeaderboardProps) {
  const getLinkToUserSearchParams = (row: LeaderboardRow) => {
    const userName = encodeURI(row.user_name || "");
    const searchParams = getSearchParamsFromValues(values);
    return `/results/${userName}?${searchParams.toString()}`;
  };

  return (
    <table
      className={
        "w-full table-auto border-separate border-spacing-0 text-gray-300"
      }
    >
      <thead className={"sticky top-0 h-10 bg-slate-950 text-center text-lg"}>
        <tr className={"border-b"}>
          <th
            scope="col"
            className={"border-gray-300 border-b-2 border-solid px-4"}
          >
            #
          </th>
          <th scope="col" className={"border-gray-300 border-b-2 border-solid"}>
            Name
          </th>
          <th scope="col" className={"border-gray-300 border-b-2 border-solid"}>
            Beans
          </th>
        </tr>
      </thead>
      <tbody>
        {leaderboard
          ?.filter((row) =>
            row.user_name
              ? row.user_name
                  .toLowerCase()
                  .includes(values.searchString?.toLowerCase() || "")
              : false,
          )
          .map((row) => (
            <tr className={"text-center even:bg-slate-950 odd:bg-slate-900"}>
              <td className={"px-4 py-2"}>{row.rank}</td>
              <th
                scope="row"
                className="whitespace-nowrap font-medium text-cyan-500"
              >
                <Link to={getLinkToUserSearchParams(row)}>{row.user_name}</Link>
              </th>
              <td>{row.points.toFixed(2)}</td>
            </tr>
          ))}
      </tbody>
    </table>
  );
}
