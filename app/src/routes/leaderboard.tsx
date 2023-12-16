import { Transition } from "@headlessui/react";
import { ChevronDownIcon, ChevronRightIcon } from "@heroicons/react/24/solid";
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  LeaderboardRow,
  LeaderboardService,
  Result,
  ResultsService,
  UserResultsResponse,
} from "../client";
import {
  FilterSection,
  FilterSectionValues,
  getFilterValues,
  getSearchParamsFromValues,
} from "../stories/FilterSection";
import { Link } from "../stories/Link";
import { PageHeading } from "../stories/PageHeader";

type ExpandedSectionProps = {
  results: UserResultsResponse | null;
};

export function ExpandedSection({ results }: ExpandedSectionProps) {
  const formatPlacement = (r: Result) => {
    let retStr = `${r.rank_swiss} / ${r.players_count}`;
    if (r.rank_cut) {
      retStr = `${r.rank_cut} / ${retStr}`;
    }
    return retStr;
  };
  return (
    <div className={"flex flex-col"}>
      <table
        className={
          "lx:text-lg w-full table-auto border-separate border-spacing-0 text-xs text-gray-300 md:text-base"
        }
      >
        <tbody>
          {results?.results.map((result) => (
            <tr
              className={"text-left"}
              key={`${results.user_id}/${result.tournament_id}`}
            >
              <td className={"w-1/12 py-2"} />
              <td className={"w-2/12 px-4 py-2"}>{formatPlacement(result)}</td>
              <td className={"w-8/12 whitespace-pre-wrap py-2"}>
                <span>
                  <Link to={`/tournament/${result.tournament_id}`}>
                    {result.tournament_name}
                  </Link>
                  <Link
                    className={"pl-2 text-xs"}
                    to={`https://alwaysberunning.net/tournaments/${result.tournament_id}`}
                  >
                    (ABR)
                  </Link>
                </span>
              </td>
              <td className={"w-2/12 pr-4 text-right"}>
                {result.points_earned.toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Leaderboard() {
  const [leaderboardRows, setLeaderboardRows] = useState<LeaderboardRow[]>();
  const [searchParams] = useSearchParams();
  const values = getFilterValues(searchParams);
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const [results, setResults] = useState<UserResultsResponse | null>(null);

  const onRowClick = (row: LeaderboardRow, rowNum: number) => {
    if (rowNum === expandedRow) {
      setExpandedRow(null);
    } else {
      setExpandedRow(rowNum);
    }
    if (row.user_name) {
      ResultsService.getGetUserResults(
        row.user_name,
        values.seasonId,
        values.faction,
        values.format,
      ).then((results) => {
        setResults(results);
      });
    }
  };

  const getLeaderboard = (v: FilterSectionValues) => {
    LeaderboardService.getGetLeaderboard(v.seasonId, v.faction, v.format).then(
      (rows) => {
        setLeaderboardRows(rows);
        setExpandedRow(null);
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
          "w-full table-auto border-separate border-spacing-0 text-xs text-gray-300 sm:text-base md:text-lg xl:text-xl"
        }
      >
        <thead className={"sticky top-0 h-10 bg-slate-950 text-lg"}>
          <tr className={"w-full border-b text-left"}>
            <th
              scope="col"
              className={"w-1/12 border-b-2 border-solid border-gray-300 px-4"}
            />
            <th
              scope="col"
              className={"w-2/12 border-b-2 border-solid border-gray-300 px-4"}
            >
              Rank
            </th>
            <th
              scope="col"
              className={
                "w-7/12 border-b-2 border-solid border-gray-300 text-center"
              }
            >
              Name
            </th>
            <th
              scope="col"
              className={
                "w-3/12 border-b-2 border-solid border-gray-300 pr-4 text-right"
              }
            >
              Beans
            </th>
          </tr>
        </thead>
        <tbody>
          {leaderboardRows
            ?.filter((row) =>
              row.user_name
                ? row.user_name
                    .toLowerCase()
                    .includes(values.searchString?.toLowerCase() || "")
                : false,
            )
            .map((row, i) => (
              <>
                <tr
                  className={
                    "w-full odd:bg-slate-900 even:bg-slate-950 hover:text-cyan-500"
                  }
                  onKeyDown={() => onRowClick(row, i)}
                  onClick={() => onRowClick(row, i)}
                >
                  <td>
                    {expandedRow === i ? (
                      <ChevronDownIcon
                        className={"ml-4 h-5 w-5 text-cyan-400"}
                      />
                    ) : (
                      <ChevronRightIcon className={"ml-4 h-5 w-5"} />
                    )}
                  </td>
                  <td className={"px-4 py-2"}>{row.rank}</td>
                  <th
                    scope="row"
                    className="whitespace-pre-wrap font-medium text-cyan-500"
                  >
                    <Link to={getLinkToUserSearchParams(row)}>
                      {row.user_name}
                    </Link>
                  </th>
                  <td className={"pr-4 text-right"}>{row.points.toFixed(2)}</td>
                </tr>
                <Transition
                  as={"tr"}
                  show={expandedRow === i && results != null}
                  className={
                    "w-full border border-cyan-400 odd:bg-slate-900 even:bg-slate-950"
                  }
                  enter="transition-opacity duration-100"
                  enterFrom="opacity-0"
                  enterTo="opacity-100"
                  leave="transition-opacity duration-100"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <td colSpan={5}>
                    <div className={"w-full"}>
                      <ExpandedSection results={results} />
                    </div>
                  </td>
                </Transition>
              </>
            ))}
        </tbody>
      </table>
    </>
  );
}
