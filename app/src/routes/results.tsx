import {
  GetUserRankingResponse,
  ResultsService,
  UserResultsResponse,
  UserService,
} from "../client";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import "./Results.css";

type ResultsParams = {
  user: string;
};

export function ResultRow(result: Result) {
  return (
    <>
      <div style={{ height: "100px" }}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          <Link to={`tournaments/${result.tournament_id}`}>
            {result.tournament_name}
          </Link>
          <span>
            <small style={{ paddingLeft: "25px" }}>
              {result.registration_count} Players
            </small>
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
        </div>
      </div>
      <div>
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
      </div>
      <div>
        {result.rank_swiss}
        {result.rank_cut ? " -> " + result.rank_cut : ""}
      </div>
      <div>
        <span>{result.points_earned.toFixed(2)}</span>
      </div>
    </>
  );
}
export function Results() {
  const params = useParams<ResultsParams>();

  const [userRankResponse, setUserRankResponse] =
    useState<GetUserRankingResponse>();
  const [results, setResults] = useState<UserResultsResponse>();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    console.log(params);
    if (params.user) {
      ResultsService.getGetUserResults(params.user).then((results) => {
        setResults(results);
        setLoading(false);
      });
      // TODO: Make this UsersService
      UserService.getGetUserRankForSeason(params.user, 1).then((resp) => {
        setUserRankResponse(resp);
      });
    }
    return () => {
      setLoading(false);
    };
  }, [params]);

  return (
    <div>
      {loading || !results || !userRankResponse ? (
        <article aria-busy="true"></article>
      ) : (
        <>
          <hgroup>
            <h1>{results.user_name}</h1>
            {userRankResponse.rank ? (
              <h2>
                Ranked #{userRankResponse.rank} for Season{" "}
                {userRankResponse.seasonId} - {userRankResponse.seasonName}
              </h2>
            ) : (
              <></>
            )}
          </hgroup>
          <div className={"results-container"}>
            <div className={"results-header-item"}>Tournament</div>
            <div className={"results-header-item"}>Decks</div>
            <div className={"results-header-item"}>Placement</div>
            <div className={"results-header-item"}>Beans</div>
            {results.results.map((result) => (
              <ResultRow {...result} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
