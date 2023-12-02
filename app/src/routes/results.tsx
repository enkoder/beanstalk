import {
  Result,
  ResultsService,
  Season,
  SeasonsService,
  UserResultsResponse,
} from "../client";
import { PageHeading } from "../stories/PageHeader";
import { Select } from "../stories/Select";
import { ChangeEvent, useCallback, useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";

const DEFAULT_SEASON = 1;
const seasonParam = "season";

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
  const [searchParams] = useSearchParams();

  const [seasons, setSeasons] = useState<Season[]>();
  const [results, setResults] = useState<UserResultsResponse>();
  const [loading, setLoading] = useState(false);

  const [selectedSeason, setSelectedSeason] = useState<number>(
    searchParams.get("season")
      ? Number(searchParams.get("season"))
      : DEFAULT_SEASON,
  );

  const fetchSeasons = useCallback(async () => {
    SeasonsService.getGetSeasons().then((seasons) => {
      setSeasons(seasons);
    });
  }, []);

  const fetchResults = useCallback(async () => {
    if (params.user) {
      ResultsService.getGetUserResults(params.user, selectedSeason).then(
        (results) => {
          setResults(results);
        },
      );
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchSeasons().catch((e) => console.log(e));
    fetchResults().catch((e) => console.log(e));
    setLoading(false);
    return () => {};
  }, [params.user, searchParams]);

  const handleSeasonChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const { value } = event.target;
    setSelectedSeason(Number(value));

    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set(seasonParam, value);
    const newURL = `${window.location.pathname}?${newSearchParams.toString()}`;
    window.history.pushState({ path: newURL }, "", newURL);

    if (params.user) {
      ResultsService.getGetUserResults(params.user, Number(value)).then(
        (results) => {
          setResults(results);
        },
      );
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
      className={"mt-4 flex h-[100svh] flex-row justify-center overflow-auto"}
    >
      <div className={"m-4 flex w-5/6 flex-col text-gray-300"}>
        {loading || !results ? (
          <article aria-busy="true"></article>
        ) : (
          <>
            <div className={"mb-8"}>
              <PageHeading text={results.user_name} />
              {results.rank != null && (
                <text className={"text-gray-400"}>
                  Ranked #{results.rank} for Season {results.seasonId} -{" "}
                  {results.seasonName}
                </text>
              )}
            </div>

            <Select
              className={"ml-auto w-2/6 rounded-3xl"}
              label={"Season Select"}
              id="season"
              onChange={handleSeasonChange}
            >
              {seasons &&
                seasons.map((season) => (
                  <option
                    value={season.id}
                    selected={seasons && season.id == selectedSeason}
                  >
                    S{season.id} - {season.name}
                  </option>
                ))}
            </Select>
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
                {results.results.map((result) => (
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
                    <td>{Decks(result)}</td>
                    <td>{formatPlacement(result)}</td>
                    <td>{result.points_earned.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>
    </div>
  );
}
