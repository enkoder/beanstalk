import {
  Result,
  ResultsService,
  Season,
  SeasonsService,
  UserResultsResponse,
} from "../client";
import { ChangeEvent, useCallback, useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import "./Results.css";

const DEFAULT_SEASON = 1;
const seasonParam = "season";

type ResultsParams = {
  user: string;
};

function Decks(result: Result) {
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {result.corp_deck_url ? (
        <small>
          <a href={result.corp_deck_url}>
            {/* TODO: replace the corp ID with the picture of the faction and the name of the ID */}
            {result.corp_deck_identity_name}
          </a>
        </small>
      ) : (
        <small>{result.corp_deck_identity_name}</small>
      )}
      {result.runner_deck_url ? (
        <small>
          <a href={result.runner_deck_url}>
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
  const [selectedSeason, setSelectedSeason] = useState<number>(DEFAULT_SEASON);

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
    <>
      {loading || !results ? (
        <div className={"results-container"}>
          <article aria-busy="true"></article>
        </div>
      ) : (
        <div className={"results-container"}>
          <div className={"results-header"}>
            <hgroup>
              <h1>{results.user_name}</h1>
              {results.rank ? (
                <h2>
                  Ranked #{results.rank} for Season {results.seasonId} -{" "}
                  {results.seasonName}
                </h2>
              ) : (
                <></>
              )}
            </hgroup>

            <div className={"season-select-container"}>
              <form>
                <label style={{ textAlign: "center" }}>
                  <small>
                    <Link to={"/seasons"}>Season Select</Link>
                  </small>

                  <select
                    id="season"
                    name={"season"}
                    onChange={handleSeasonChange}
                    style={{ borderRadius: "5rem" }}
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
                  </select>
                </label>
              </form>
            </div>
          </div>
          <div className={"results-scroller"}>
            <table>
              <thead>
                <tr>
                  <th scope="col">Tournament</th>
                  <th scope="col">Decks</th>
                  <th scope="col">
                    <div>
                      <div>Results</div>
                      <small>Cut/Swiss/Total</small>
                    </div>
                  </th>
                  <th scope="col">Points</th>
                </tr>
              </thead>
              <tbody>
                {results.results.map((result) => (
                  <tr key={results.user_id + "/" + result.tournament_id}>
                    <td>
                      <span>
                        <text className={"results-row-tournament-name"}>
                          <Link to={`tournaments/${result.tournament_id}`}>
                            {result.tournament_name}
                          </Link>
                        </text>
                        <small style={{ paddingLeft: "10px" }}>
                          <a
                            href={
                              "https://alwaysberunning.net/tournaments/" +
                              result.tournament_id
                            }
                          >
                            ABR
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
          </div>
        </div>
      )}
    </>
  );
}
