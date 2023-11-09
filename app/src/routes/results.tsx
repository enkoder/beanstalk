import { ResultsService, UserResultsResponse } from "../client";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

type ResultsParams = {
  user: string;
};

export function Results() {
  const params = useParams<ResultsParams>();

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
    }
    return () => {
      setLoading(false);
    };
  }, [params]);

  return (
    <div className={"container"}>
      {loading || !results ? (
        <article aria-busy="true"></article>
      ) : (
        <>
          <hgroup>
            <h1>{results.user_name}</h1>
            <h3>Ranked X for Season Y</h3>
          </hgroup>
          <div>
            <table>
              <thead>
                <tr>
                  <th scope="col">Tournament</th>
                  <th scope="col">Num Players</th>
                  <th scope="col">Swiss</th>
                  <th scope="col">Cut</th>
                  <th scope="col">Runner</th>
                  <th scope="col">Corp</th>
                  <th scope="col">Points</th>
                </tr>
              </thead>
              <tbody>
                {results.results.map((result) => (
                  <tr key={results.user_id + "/" + result.tournament_id}>
                    <td>
                      <a
                        href={
                          "https://alwaysberunning.net/tournaments/" +
                          result.tournament_id
                        }
                      >
                        {result.tournament_name}
                      </a>{" "}
                    </td>
                    <td>{result.registration_count}</td>
                    <td>{result.rank_swiss}</td>
                    <td>{result.rank_cut}</td>
                    <td>
                      {result.runner_deck_url ? (
                        <a href={result.runner_deck_url}>
                          {/* TODO: replace the runner ID with the picture of the faction and the name of the ID */}
                          {result.runner_deck_identity_name}
                        </a>
                      ) : (
                        <text>{result.runner_deck_identity_name}</text>
                      )}
                    </td>
                    <td>
                      {result.corp_deck_url ? (
                        <a href={result.corp_deck_url}>
                          {/* TODO: replace the corp ID with the picture of the faction and the name of the ID */}
                          {result.corp_deck_identity_name}
                        </a>
                      ) : (
                        <text>{result.corp_deck_identity_name}</text>
                      )}
                    </td>
                    <td>{result.points_earned.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
