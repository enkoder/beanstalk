import {
  GetUserRankingResponse,
  Result,
  ResultsService,
  UserResultsResponse,
  UserService,
} from "../client";
import { getOrdinal } from "../../../api/src/lib/util";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import "./Results.css";

type ResultsParams = {
  user: string;
};

export function ResultRow(result: Result) {
  const formatPlacement = (r: Result) => {
    let retStr = `${r.rank_swiss}${getOrdinal(r.rank_swiss)} S`;
    if (r.rank_cut) {
      retStr += ` / ${r.rank_cut}${getOrdinal(r.rank_cut)} C`;
    }
    return `${retStr} / ${r.registration_count} T`;
  };

  return (
    <div className={"results-row"}>
      <div className={"results-row-tournament"}>
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
        <span>
          <small style={{ paddingLeft: "25px" }}>
            {formatPlacement(result)}
          </small>
        </span>
      </div>
      <div className={"results-row-player"}>
        <div className={"results-row-ids"}>
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
        <span
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-evenly",
            gap: "10px",
          }}
        >
          <small>{result.points_earned.toFixed(2)} Points</small>
        </span>
      </div>
    </div>
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
    <>
      {loading || !results || !userRankResponse ? (
        <div className={"results-container"}>
          <article aria-busy="true"></article>
        </div>
      ) : (
        <div className={"results-container"}>
          <div>
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
          </div>
          <div className={"results-scroller"}>
            {results.results.map((result) => (
              <ResultRow {...result} />
            ))}
          </div>
        </div>
      )}
    </>
  );
}
