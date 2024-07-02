import { useQuery } from "@tanstack/react-query";
import { clsx } from "clsx";
import { useParams, useSearchParams } from "react-router-dom";
import {
  LeaderboardService,
  type RankingConfig,
  type Result,
  ResultsService,
  type UserResultsResponse,
} from "../client";
import { FilterSection } from "../components/FilterSection";
import { Link } from "../components/Link";
import { PageHeading } from "../components/PageHeader";
import { Tooltip, TooltipContent, TooltipTrigger } from "../components/Tooltip";
import { getFilterValues } from "../filterUtils";
import { capStr } from "../util";

type ResultsParams = {
  user: string;
};

function Decks(result: Result) {
  const imageSizes = "h-5 w-5 sm:h-8 sm:w-8 lg:w-10 lg:h-10 xl:h-12 xl:w-12";

  return (
    <div className={"flex flex-row justify-center text-gray-400"}>
      {/*grey separator between deck images*/}
      <div className={"b-2 border-gray-700 border-r pr-2"}>
        {/* cyan underline showing its clickable */}
        <div
          className={clsx(
            result.corp_deck_url &&
              "border-cyan-600 border-b-2 pb-1 hover:border-cyan-400",
          )}
        >
          <Link to={result.corp_deck_url || ""}>
            {/* TODO: replace the corp ID with the picture of the faction and the name of the ID */}
            <img
              className={clsx(imageSizes, "rounded")}
              src={`https://alwaysberunning.net/img/ids/${result.corp_deck_identity_id
                .toString()
                .padStart(5, "0")}.png`}
              alt={result.corp_deck_identity_name || ""}
            />
          </Link>
        </div>
      </div>
      <div className={"pl-2"}>
        <div
          className={clsx(
            result.corp_deck_url &&
              "border-cyan-600 border-b-2 pb-1 hover:border-cyan-400",
          )}
        >
          <Link to={result.runner_deck_url || ""}>
            <img
              className={clsx(imageSizes, "rounded")}
              src={`https://alwaysberunning.net/img/ids/${result.runner_deck_identity_id
                .toString()
                .padStart(5, "0")}.png`}
              alt={result.runner_deck_identity_name || ""}
            />
          </Link>
        </div>
      </div>
    </div>
  );
}

export function Results() {
  const params = useParams<ResultsParams>();
  const [searchParams] = useSearchParams();
  const values = getFilterValues(searchParams);
  const user = params.user || "";

  const { data: results } = useQuery<UserResultsResponse>({
    queryKey: [
      "results",
      user,
      values.seasonId,
      values.faction,
      values.format,
      values.tags,
    ],
    queryFn: () =>
      ResultsService.getGetUserResults(
        params.user || "",
        values.seasonId,
        values.faction,
        values.format,
        values.tags,
      ),
  });

  const { data: rankingConfig } = useQuery<RankingConfig>({
    queryKey: ["rankingConfig"],
    queryFn: () => LeaderboardService.getGetRankingConfig(),
  });

  const formatPlacement = (r: Result) => {
    let retStr = `${r.rank_swiss} / ${r.players_count}`;
    if (r.rank_cut) {
      retStr = `${r.rank_cut} / ${retStr}`;
    }
    return retStr;
  };

  return (
    <>
      <div className={"mb-4"}>
        {results && (
          <>
            <PageHeading text={results.user_name} includeUnderline={true} />
            {results.results.length === 0 ? (
              <text className={"text-gray-400 text-lg"}>
                No results found for search filters
              </text>
            ) : (
              <text className={"text-gray-400 text-lg"}>
                Ranked #{results.rank}
                {results.seasonName &&
                  ` for Season ${results.seasonId} - ${results.seasonName}`}
              </text>
            )}
          </>
        )}
      </div>

      <FilterSection hasSearchBar={false} startSeason={2} />

      <table
        className={
          "mt-4 w-full table-fixed border-separate border-spacing-0 text-gray-300 text-xs md:text-lg sm:text-base xl:text-xl"
        }
      >
        <thead className={"bg-slate-950 text-left"}>
          <tr>
            <th scope="col" className={"w-3/6 text-left"}>
              Tournament
            </th>
            <th scope="col" className={"w-1/6 text-center"}>
              Decks
            </th>
            <th scope="col" className={"w-3/12 text-center"}>
              <div>
                <div>Results</div>
                <small>C / S / #</small>
              </div>
            </th>
            <th scope="col" className={"w-1/12 text-right"}>
              Points
            </th>
          </tr>
        </thead>
        <tbody>
          {results?.results.map((result) => (
            <>
              <Tooltip placement={"right-end"}>
                <TooltipTrigger asChild={true}>
                  <tr
                    className={"text-left even:bg-slate-950 odd:bg-slate-900"}
                    key={`${results.user_id}/${result.tournament_id}`}
                  >
                    <td className={"whitespace-pre-wrap py-2"}>
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
                    <td className={"py-2 align-middle"}>{Decks(result)}</td>
                    <td
                      className={clsx(
                        !result.is_valid && "text-gray-500",
                        "py-2 text-center",
                      )}
                    >
                      <span>{formatPlacement(result)}</span>
                    </td>
                    <td
                      className={clsx(
                        !result.is_valid && "text-gray-500",
                        "py-2 text-right",
                      )}
                    >
                      <span
                        className={clsx(!result.is_valid && "text-gray-500")}
                      >
                        {result.points_earned.toFixed(2)}
                      </span>
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
                      {rankingConfig.tournament_configs[result.tournament_type]
                        ?.tournament_limit ?? 0}{" "}
                      per {capStr(result.tournament_type)}
                    </span>
                  ) : (
                    <span>{capStr(result.tournament_type)}</span>
                  )}
                </TooltipContent>
              </Tooltip>
            </>
          ))}
        </tbody>
      </table>
    </>
  );
}
