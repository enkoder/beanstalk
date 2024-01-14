import { Transition } from "@headlessui/react";
import { ChevronDownIcon, ChevronRightIcon } from "@heroicons/react/24/solid";
import { useQuery } from "@tanstack/react-query";
import { clsx } from "clsx";
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  LeaderboardRow,
  LeaderboardService,
  RankingConfig,
  Result,
  ResultsService,
  User,
  UserResultsResponse,
} from "../client";
import {
  FilterSection,
  getFilterValues,
  getSearchParamsFromValues,
} from "../components/FilterSection";
import { Link } from "../components/Link";
import { PageHeading } from "../components/PageHeader";
import { Tooltip, TooltipContent, TooltipTrigger } from "../components/Tooltip";
import { capStr } from "../util";

type ExpandedSectionProps = {
  results: UserResultsResponse | undefined;
  rankingConfig: RankingConfig | undefined;
};

export function ExpandedSection({
  results,
  rankingConfig,
}: ExpandedSectionProps) {
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
            <Tooltip placement={"right-end"}>
              <TooltipTrigger asChild={true}>
                <tr
                  className={"text-left"}
                  key={`${results.user_id}/${result.tournament_id}`}
                >
                  <td
                    className={clsx(
                      !result.is_valid && "text-gray-500",
                      "w-2/12 px-4 py-2",
                    )}
                  >
                    {formatPlacement(result)}
                  </td>
                  <td className={"w-8/12 whitespace-pre-wrap py-2"}>
                    <span>
                      <Link
                        className={clsx(!result.is_valid && "text-gray-500")}
                        to={`/tournament/${result.tournament_id}`}
                      >
                        {result.tournament_name}
                      </Link>
                      <Link
                        className={clsx(
                          !result.is_valid && "text-gray-500",
                          "pl-2 text-xs",
                        )}
                        to={`https://alwaysberunning.net/tournaments/${result.tournament_id}`}
                      >
                        (ABR)
                      </Link>
                    </span>
                  </td>
                  <td
                    className={clsx(
                      !result.is_valid && "text-gray-500",
                      "w-2/12 pr-4 text-right",
                    )}
                  >
                    {result.points_earned.toFixed(2)}
                  </td>
                </tr>
              </TooltipTrigger>
              <TooltipContent
                className={
                  "rounded-lg border border-gray-600 bg-gray-950 p-2 text-sm text-cyan-500 shadow-lg"
                }
                arrowClassName={
                  "fill-gray-950 [&>path:first-of-type]:stroke-gray-600"
                }
              >
                {!result.is_valid && rankingConfig ? (
                  <span>
                    Limit{" "}
                    {
                      rankingConfig.tournament_configs[result.tournament_type]
                        .tournament_limit
                    }{" "}
                    per {capStr(result.tournament_type)}
                  </span>
                ) : (
                  <span>{capStr(result.tournament_type)}</span>
                )}
              </TooltipContent>
            </Tooltip>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Leaderboard() {
  const [searchParams] = useSearchParams();
  const values = getFilterValues(searchParams);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const { data: leaderboardRows } = useQuery<LeaderboardRow[]>({
    queryKey: [
      "leaderboard",
      values.seasonId,
      values.faction,
      values.format,
      values.tags,
    ],
    queryFn: () =>
      LeaderboardService.getGetLeaderboard(
        values.seasonId,
        values.faction,
        values.format,
        values.tags,
      ),
  });

  const { data: results } = useQuery<UserResultsResponse>({
    queryKey: [
      "results",
      selectedUser?.name,
      values.seasonId,
      values.faction,
      values.format,
      values.tags,
    ],
    queryFn: () =>
      ResultsService.getGetUserResults(
        selectedUser?.name || "",
        values.seasonId,
        values.faction,
        values.format,
        values.tags,
      ),
    enabled: selectedUser !== null,
  });

  const { data: rankingConfig } = useQuery<RankingConfig>({
    queryKey: ["rankingConfig"],
    queryFn: () => LeaderboardService.getGetRankingConfig(),
  });

  const onRowClick = (row: LeaderboardRow) => {
    if (row.user_name === selectedUser?.name) {
      setSelectedUser(null);
    } else {
      setSelectedUser({ name: row.user_name, id: row.user_id } as User);
    }
  };

  const getLinkToUserSearchParams = (row: LeaderboardRow) => {
    const userName = encodeURI(row.user_name || "");
    const searchParams = getSearchParamsFromValues(values);
    return `results/${userName}?${searchParams.toString()}`;
  };

  return (
    <>
      <PageHeading includeUnderline={true} text={"Leaderboard"}>
        {leaderboardRows && (
          <h1 className={"text-gray-500 text-xl"}>
            {leaderboardRows.length} Players
          </h1>
        )}
      </PageHeading>
      <FilterSection hasSearchBar={true} />
      <table
        className={
          "w-full table-auto border-separate border-spacing-0 text-xs text-gray-300 sm:text-base md:text-lg xl:text-xl"
        }
      >
        <thead className={"h-10 bg-slate-950 text-lg"}>
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
            .map((row) => (
              <>
                <tr
                  className={
                    "w-full odd:bg-slate-900 even:bg-slate-950 hover:text-cyan-500"
                  }
                  onKeyDown={() => onRowClick(row)}
                  onClick={() => onRowClick(row)}
                >
                  <td>
                    {selectedUser?.name === row.user_name ? (
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
                  show={selectedUser?.name === row.user_name && results != null}
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
                      <ExpandedSection
                        results={results}
                        rankingConfig={rankingConfig}
                      />
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
