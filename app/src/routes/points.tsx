import * as React from "react";
import { GetPointDistributionResponse, LeaderboardService } from "../client";
import { useLoaderData } from "react-router-dom";

const DEFAULT_TOTAL_POINTS = 500;
const DEFAULT_NUM_PLAYERS = 32;

export async function getPointDistribution() {
  const searchParams = new URL(location.href).searchParams;

  function getSearchParam(
    sp: URLSearchParams,
    name: string,
    defaultVal: number | null,
  ) {
    return sp.get(name) && typeof sp.get(name)
      ? Number(sp.get(name))
      : defaultVal;
  }

  const totalPoints = getSearchParam(
    searchParams,
    "totalPoints",
    DEFAULT_TOTAL_POINTS,
  );
  const numPlayers = getSearchParam(
    searchParams,
    "numPlayers",
    DEFAULT_NUM_PLAYERS,
  );
  const targetTopPercentage = getSearchParam(
    searchParams,
    "targetTopPercentage",
    null,
  );
  const targetPointPercentageForTop = getSearchParam(
    searchParams,
    "targetTopPercentage",
    null,
  );

  return LeaderboardService.getGetPointDistribution(
    totalPoints,
    numPlayers,
    targetTopPercentage,
    targetPointPercentageForTop,
  );
}

export function PointDistributionTable() {
  const pointsDistributionResponse =
    useLoaderData() as GetPointDistributionResponse;

  return (
    <>
      <div>
        <table>
          <thead>
            <tr>
              <th scope="col">Placement</th>
              <th scope="col">Points</th>
            </tr>
          </thead>
          <tbody>
            {pointsDistributionResponse.pointDistribution.map(
              (value, index) => (
                <tr>
                  <td>{index + 1}</td>
                  <td>{value}</td>
                </tr>
              ),
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
