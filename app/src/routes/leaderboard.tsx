import * as React from "react";
import { LeaderboardResponse, LeaderboardService } from "../client";
import { Link, useLoaderData } from "react-router-dom";

export async function LeaderboardLoader() {
  return LeaderboardService.getGetLeaderboard();
}

export function Leaderboard() {
  const leaderboard = useLoaderData() as LeaderboardResponse;

  return (
    <>
      <div>
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
                  <Link to={`results/${user.name}`}>{user.name}</Link>
                </td>
                <td>{user.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
