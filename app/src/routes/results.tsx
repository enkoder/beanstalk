import { Result, ResultsService, UserResultsResponse } from "../client";
import { PageHeading } from "../stories/PageHeader";
import { FilterSection, FilterSectionValues } from "../stories/FilterSection";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";

type ResultsParams = {
  user: string;
};

function Decks(result: Result) {
  return (
    <div className={"flex flex-col text-gray-400"}>
      {result.corp_deck_url ? (
        <small>
          <a
            className={
              "text-cyan-400 hover:font-bold hover:text-cyan-300 hover:underline"
            }
            href={result.corp_deck_url}
          >
            {/* TODO: replace the corp ID with the picture of the faction and the name of the ID */}
            {result.corp_deck_identity_name}
          </a>
        </small>
      ) : (
        <small>{result.corp_deck_identity_name}</small>
      )}
      {result.runner_deck_url ? (
        <small>
          <a
            className={
              "text-cyan-400 hover:font-bold hover:text-cyan-300 hover:underline"
            }
            href={result.runner_deck_url}
          >
            {/* TODO: replace the runner ID with the picture of the faction and the name of the ID */}
            {result.runner_deck_identity_name}
          </a>
        </small>
      ) : (
        <small>{result.runner_deck_identity_name}</small>
      )}
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
    let retStr = `${r.rank_swiss} / ${r.registration_count}`;
    if (r.rank_cut) {
      retStr = `${r.rank_cut} / ${retStr}`;
    }
    return retStr;
  };

  return (
    <div
      className={"mt-4 flex h-[100svh] flex-row justify-center overflow-hidden"}
    >
      <div className={"m-4 flex w-5/6 flex-col text-gray-300"}>
        <div className={"mb-8"}>
          {results && (
            <>
              <PageHeading text={results.user_name} />
              {results.results.length === 0 ? (
                <text className={"text-lg text-gray-400"}>
                  No results found for search filters
                </text>
              ) : (
                <text className={"text-lg text-gray-400"}>
                  Ranked #{results.rank} for Season {results.seasonId} -{" "}
                  {results.seasonName}
                </text>
              )}
            </>
          )}
        </div>

        <FilterSection hasSearchBar={false} onParamChange={getResults} />
        <div className={"overflow-auto whitespace-nowrap"}>
          <table
            className={
              "mt-4 w-full table-auto border-separate border-spacing-0 text-gray-300"
            }
          >
            <thead
              className={"sticky top-0 h-10 bg-slate-950 text-left text-lg"}
            >
              <tr className={"border-b"}>
                <th
                  scope="col"
                  className={"border-b-2 border-solid border-gray-300"}
                >
                  Tournament
                </th>
                <th
                  scope="col"
                  className={"border-b-2 border-solid border-gray-300"}
                >
                  Format
                </th>
                <th
                  scope="col"
                  className={"border-b-2 border-solid border-gray-300"}
                >
                  Decks
                </th>
                <th
                  scope="col"
                  className={"border-b-2 border-solid border-gray-300"}
                >
                  <div>
                    <div>Results</div>
                    <small>Cut/Swiss/Total</small>
                  </div>
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
              {results &&
                results.results.map((result) => (
                  <tr
                    className={"text-left odd:bg-slate-900 even:bg-slate-950"}
                    key={results.user_id + "/" + result.tournament_id}
                  >
                    <td>
                      <span>
                        <Link
                          className={
                            "text-cyan-400 hover:font-bold hover:text-cyan-300 hover:underline"
                          }
                          to={`/tournament/${result.tournament_id}`}
                        >
                          {result.tournament_name}
                        </Link>
                        <small style={{ paddingLeft: "10px" }}>
                          <a
                            className={
                              "text-cyan-400 hover:font-bold hover:text-cyan-300 hover:underline"
                            }
                            href={
                              "https://alwaysberunning.net/tournaments/" +
                              result.tournament_id
                            }
                          >
                            (ABR)
                          </a>
                        </small>
                      </span>
                    </td>
                    <td>{result.format}</td>
                    <td>{Decks(result)}</td>
                    <td>{formatPlacement(result)}</td>
                    <td>{result.points_earned.toFixed(2)}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
