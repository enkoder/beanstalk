import { Transition } from "@headlessui/react";
import { ChevronDownIcon, ChevronRightIcon } from "@heroicons/react/24/solid";
import { useQuery } from "@tanstack/react-query";
import { clsx } from "clsx";
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  type LeaderboardRow,
  LeaderboardService,
  type RankingConfig,
  type Result,
  ResultsService,
  type User,
  type UserResultsResponse,
} from "../client";
import { FilterSection } from "../components/FilterSection";
import { Link } from "../components/Link";
import { PageHeading } from "../components/PageHeader";
import { Tooltip, TooltipContent, TooltipTrigger } from "../components/Tooltip";
import { getFilterValues, getSearchParamsFromValues } from "../filterUtils";
import useAuth from "../useAuth";
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
          "w-full table-auto border-separate border-spacing-0 text-gray-300 text-xs lx:text-lg md:text-base"
        }
      >
        <tbody>
          {results?.results.map((result) => (
            <Tooltip placement={"right-end"}>
              <TooltipTrigger asChild={true}>
                <tr
                  className={"text-left"}
                  key={`${results.userId}/${result.tournament_id}`}
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
                  "rounded-lg border border-gray-600 bg-gray-950 p-2 text-cyan-500 text-sm shadow-lg"
                }
                arrowClassName={
                  "fill-gray-950 [&>path:first-of-type]:stroke-gray-600"
                }
              >
                {!result.is_valid && rankingConfig ? (
                  <span>
                    Limit{" "}
                    {
                      rankingConfig.tournament_configs?.[result.tournament_type]
                        ?.tournament_limit
                    }{" "}
                    per {capStr(result.tournament_type)}
                  </span>
                ) : result.normalized_tournament_type_used ? (
                  <span>
                    {capStr(result.tournament_type)}
                    <br />
                    <span className="text-yellow-400">
                      (normalized as{" "}
                      {capStr(result.normalized_tournament_type_used)})
                    </span>
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
  const [includeDisabled, setIncludeDisabled] = useState(false);
  const { user } = useAuth();

  const { data: leaderboardRows } = useQuery<LeaderboardRow[]>({
    queryKey: [
      "leaderboard",
      values.seasonId,
      values.faction,
      values.format,
      values.tags,
      includeDisabled,
    ],
    queryFn: () =>
      LeaderboardService.getGetLeaderboard(
        values.seasonId,
        values.faction,
        values.format,
        values.tags,
        includeDisabled,
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
    if (row.disabled) return;
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
    <div
      className={
        "scrollbar-thumb-rounded-full scrollbar-track-rounded-full scrollbar scrollbar-thumb-slate-700 scrollbar-track-slate-300 min-h-96 overflow-y-auto"
      }
    >
      <PageHeading includeUnderline={true} text={"Leaderboard"}>
        {leaderboardRows && (
          <h1 className={"text-gray-500 text-xl"}>
            {leaderboardRows.length} Players
          </h1>
        )}
      </PageHeading>
      {user?.is_admin && (
        <div className={"mb-4 flex items-center gap-2 px-4"}>
          <input
            type="checkbox"
            id="includeDisabled"
            checked={includeDisabled}
            onChange={(e) => setIncludeDisabled(e.target.checked)}
            className={
              "h-4 w-4 cursor-pointer rounded border-gray-600 bg-gray-900 text-cyan-500 focus:ring-2 focus:ring-cyan-500"
            }
          />
          <label
            htmlFor="includeDisabled"
            className={"cursor-pointer text-gray-300 text-sm"}
          >
            Show all users (including disabled accounts)
          </label>
        </div>
      )}
      <FilterSection hasSearchBar={true} startSeason={3} />
      <table
        className={
          "w-full table-auto border-separate border-spacing-0 text-gray-300 text-xs md:text-lg sm:text-base xl:text-xl"
        }
      >
        <thead className={"h-10 bg-slate-950 text-lg"}>
          <tr className={"w-full border-b text-left"}>
            <th
              scope="col"
              className={"w-1/12 border-gray-300 border-b-2 border-solid px-4"}
            />
            <th
              scope="col"
              className={"w-2/12 border-gray-300 border-b-2 border-solid px-4"}
            >
              Rank
            </th>
            <th
              scope="col"
              className={
                "w-7/12 border-gray-300 border-b-2 border-solid text-center"
              }
            >
              Name
            </th>
            <th
              scope="col"
              className={
                "w-3/12 border-gray-300 border-b-2 border-solid pr-4 text-right"
              }
            >
              Beans
            </th>
          </tr>
        </thead>
        <tbody>
          {leaderboardRows
            ?.filter((row) => {
              if (!values.searchString) {
                return true;
              }
              return row.user_name
                ? row.user_name
                    .toLowerCase()
                    .includes(values.searchString?.toLowerCase() || "")
                : false;
            })
            .map((row) => (
              <>
                <tr
                  className={clsx(
                    !row.disabled && "hover:text-cyan-500",
                    "w-full even:bg-slate-950 odd:bg-slate-900",
                  )}
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
                    className={clsx(
                      !row.disabled && "text-cyan-500",
                      "whitespace-pre-wrap font-medium",
                    )}
                  >
                    {row.disabled ? (
                      <text className="text-gray-500">{row.user_name}</text>
                    ) : (
                      <Link to={getLinkToUserSearchParams(row)}>
                        {row.user_name}
                      </Link>
                    )}
                  </th>
                  <td className={"pr-4 text-right"}>{row.points.toFixed(2)}</td>
                </tr>
                <Transition
                  as={"tr"}
                  show={selectedUser?.name === row.user_name && results != null}
                  className={
                    "w-full border border-cyan-400 even:bg-slate-950 odd:bg-slate-900"
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
    </div>
  );
}
