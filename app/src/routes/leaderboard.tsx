import * as React from "react";
import { useEffect, useState } from "react";
import { LeaderboardService } from "../client";
import { Link } from "react-router-dom";

export function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    LeaderboardService.getGetLeaderboard().then((leaderboard) => {
      setLeaderboard(leaderboard);
      setLoading(false);
    });
    return () => {
      setLoading(false);
    };
  }, []);

  return (
    <>
      <div>
        {loading || !leaderboard ? (
          <article aria-busy="true"></article>
        ) : (
          <table>
            <thead>
              <tr>
                <th scope="col">#</th>
                <th scope="col">Name</th>
                <th scope="col">Points</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.users.map((user) => (
                <tr>
                  <td>{user.rank}</td>
                  <td align={"center"}>
                    <Link
                      to={`results/${user.name}`}
                      state={{ user: user.name }}
                    >
                      {user.name}
                    </Link>
                  </td>
                  <td>{user.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
