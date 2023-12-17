import { useQuery } from "@tanstack/react-query";
import { clsx } from "clsx";
import { useParams, useSearchParams } from "react-router-dom";
import {
  LeaderboardService,
  RankingConfig,
  Result,
  ResultsService,
  type UserResultsResponse,
} from "../client";
import { FilterSection, getFilterValues } from "../stories/FilterSection";
import { Link } from "../stories/Link";
import { PageHeading } from "../stories/PageHeader";
import { Tooltip, TooltipContent, TooltipTrigger } from "../stories/Tooltip";
import { capStr } from "../util";

type ResultsParams = {
  user: string;
};

function Decks(result: Result) {
  const imageSizes = "h-5 w-5 sm:h-8 sm:w-8 lg:w-10 lg:h-10 xl:h-12 xl:w-12";

  return (
    <div className={"flex flex-row justify-center text-gray-400"}>
      {/*grey separator between deck images*/}
      <div className={"b-2 border-r border-gray-700 pr-2"}>
        {/* cyan underline showing its clickable */}
        <div
          className={clsx(
            result.corp_deck_url &&
              "border-b-2 border-cyan-600 pb-1 hover:border-cyan-400",
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
              "border-b-2 border-cyan-600 pb-1 hover:border-cyan-400",
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
    queryKey: ["results", user, values.seasonId, values.faction, values.format],
    queryFn: () =>
      ResultsService.getGetUserResults(
        params.user || "",
        values.seasonId,
        values.faction,
        values.format,
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
              <text className={"text-lg text-gray-400"}>
                No results found for search filters
              </text>
            ) : (
              <text className={"text-lg text-gray-400"}>
                Ranked #{results.rank}
                {results.seasonName &&
                  ` for Season ${results.seasonId} - ${results.seasonName}`}
              </text>
            )}
          </>
        )}
      </div>

      <FilterSection hasSearchBar={false} />

      <table
        className={
          "mt-4 w-full table-fixed border-separate border-spacing-0 text-xs text-gray-300 sm:text-base md:text-lg xl:text-xl"
        }
      >
        <thead className={"sticky top-0 bg-slate-950 text-left"}>
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
                    className={"text-left odd:bg-slate-900 even:bg-slate-950"}
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
                {!result.is_valid && rankingConfig && (
                  <TooltipContent
                    className={
                      "text-cyan-500 text-sm bg-gray-950 p-2 rounded-lg shadow-lg border-gray-600 border"
                    }
                  >
                    Limit{" "}
                    {
                      rankingConfig.tournament_configs[result.tournament_type]
                        .tournament_limit
                    }{" "}
                    per {capStr(result.tournament_type)}
                  </TooltipContent>
                )}
              </Tooltip>
            </>
          ))}
        </tbody>
      </table>
    </>
  );
}
