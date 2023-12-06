import { LeaderboardRow, LeaderboardService } from "../client";
import {
  FilterSection,
  FilterSectionValues,
  getFilterValues,
  getSearchParamsFromValues,
} from "../stories/FilterSection";
import { PageHeading } from "../stories/PageHeader";
import { Link } from "../stories/Link";
import { useState } from "react";
import { useSearchParams } from "react-router-dom";

export function Leaderboard() {
  const [leaderboardRows, setLeaderboardRows] = useState<LeaderboardRow[]>();
  const [searchParams] = useSearchParams();
  const values = getFilterValues(searchParams);

  const getLeaderboard = (v: FilterSectionValues) => {
    LeaderboardService.getGetLeaderboard(v.seasonId, v.faction, v.format).then(
      (rows) => {
        setLeaderboardRows(rows);
      },
    );
  };

  const getLinkToUserSearchParams = (row: LeaderboardRow) => {
    const userName = encodeURI(row.user_name || "");
    const searchParams = getSearchParamsFromValues(values);
    return `results/${userName}?${searchParams.toString()}`;
  };

  return (
    <>
      <PageHeading includeUnderline={true} text={"Leaderboard"} />
      <FilterSection hasSearchBar={true} onParamChange={getLeaderboard} />
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
            <th
              scope="col"
              className={"border-b-2 border-solid border-gray-300"}
            >
              Name
            </th>
            <th
              scope="col"
              className={"border-b-2 border-solid border-gray-300"}
            >
              Beans
            </th>
          </tr>
        </thead>
        <tbody>
          {leaderboardRows &&
            leaderboardRows
              .filter((row) =>
                row.user_name
                  ? row.user_name
                      .toLowerCase()
                      .includes(values.searchString?.toLowerCase() || "")
                  : false,
              )
              .map((row) => (
                <tr
                  className={"text-center odd:bg-slate-900 even:bg-slate-950"}
                >
                  <td className={"px-4 py-2"}>{row.rank}</td>
                  <th
                    scope="row"
                    className="whitespace-pre-wrap font-medium text-cyan-500"
                  >
                    <Link to={getLinkToUserSearchParams(row)}>
                      {row.user_name}
                    </Link>
                  </th>
                  <td>{row.points.toFixed(2)}</td>
                </tr>
              ))}
        </tbody>
      </table>
    </>
  );
}
