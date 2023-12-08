import { Result, ResultsService, UserResultsResponse } from "../client";
import { PageHeading } from "../stories/PageHeader";
import { FilterSection, FilterSectionValues } from "../stories/FilterSection";
import { Link } from "../stories/Link";
import { useState } from "react";
import { useParams } from "react-router-dom";
import { clsx } from "clsx";

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
  const [results, setResults] = useState<UserResultsResponse>();

  const getResults = (v: FilterSectionValues) => {
    if (params.user) {
      ResultsService.getGetUserResults(
        params.user,
        v.seasonId,
        v.faction,
        v.format,
      ).then((results) => {
        setResults(results);
      });
    }
  };

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

      <FilterSection hasSearchBar={false} onParamChange={getResults} />

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
          {results &&
            results.results.map((result) => (
              <tr
                className={"text-left odd:bg-slate-900 even:bg-slate-950"}
                key={results.user_id + "/" + result.tournament_id}
              >
                <td className={"whitespace-pre-wrap py-2"}>
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
                <td className={"py-2 align-middle"}>{Decks(result)}</td>
                <td className={"py-2 text-center"}>
                  {formatPlacement(result)}
                </td>
                <td className={"py-2 text-right"}>
                  {result.points_earned.toFixed(2)}
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </>
  );
}
