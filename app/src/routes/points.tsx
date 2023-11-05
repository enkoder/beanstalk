import * as React from "react";
import { GetPointDistributionResponse, LeaderboardService } from "../client";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";

const DEFAULT_TOTAL_POINTS = 500;
const DEFAULT_NUM_PLAYERS = 32;
const DEFAULT_TARGET_TOP_PERCENTAGE = 20;
const DEFAULT_TARGET_POINTS_PERCENTAGE_FOR_TOP = 80;
const DEFAULT_PERCENT_RECEIVING_POINTS = 50;

const numPlayersParam = "numPlayers";
const percentReceivingPointsParam = "percentReceivingPoints";
const totalPointsParam = "totalPoints";
const targetTopPercentageParam = "targetTopPercentage";
const targetPointsPercentageForTopParam = "targetPointsPercentageForTop";

interface PointsFormData {
  totalPoints: number;
  numPlayers: number;
  percentReceivingPoints: number;
  targetTopPercentage: number;
  targetPointsPercentageForTop: number;
}

export function PointDistributionTable() {
  const [searchParams, setSearch] = useSearchParams();
  const location = useLocation();

  const [formChanged, setFormChanged] = useState(true);
  const [formData, setFormData] = useState<PointsFormData>({
    totalPoints: 0,
    numPlayers: 0,
    percentReceivingPoints: 0,
    targetTopPercentage: 0,
    targetPointsPercentageForTop: 0,
  });
  const [pointsDistributionResponse, setPointsDistributionResponse] =
    useState<GetPointDistributionResponse>();

  // Parse and update form values from search parameters in the URL
  useEffect(() => {
    // when the query string changes, update the form values on load
    setFormData({
      totalPoints:
        Number(searchParams.get(totalPointsParam)) || DEFAULT_TOTAL_POINTS,
      numPlayers:
        Number(searchParams.get(numPlayersParam)) || DEFAULT_NUM_PLAYERS,
      percentReceivingPoints:
        Number(searchParams.get(percentReceivingPointsParam)) ||
        DEFAULT_PERCENT_RECEIVING_POINTS,
      targetTopPercentage:
        Number(searchParams.get(targetTopPercentageParam)) ||
        DEFAULT_TARGET_TOP_PERCENTAGE,
      targetPointsPercentageForTop:
        Number(searchParams.get(targetPointsPercentageForTopParam)) ||
        DEFAULT_TARGET_POINTS_PERCENTAGE_FOR_TOP,
    });
  }, [location.search]);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (formChanged) {
      LeaderboardService.getGetPointDistribution(
        formData.totalPoints,
        formData.numPlayers,
        formData.percentReceivingPoints,
        formData.targetTopPercentage,
        formData.targetPointsPercentageForTop,
      )
        .then((response) => {
          setPointsDistributionResponse(response);

          // Update search parameters with the current formData
          const newSearchParams = new URLSearchParams(searchParams);
          newSearchParams.set(
            totalPointsParam,
            formData.totalPoints.toString(),
          );
          newSearchParams.set(numPlayersParam, formData.numPlayers.toString());
          newSearchParams.set(
            targetTopPercentageParam,
            formData.targetTopPercentage.toString(),
          );
          newSearchParams.set(
            targetPointsPercentageForTopParam,
            formData.targetPointsPercentageForTop.toString(),
          );

          const newURL = `${
            window.location.pathname
          }?${newSearchParams.toString()}`;
          window.history.pushState({ path: newURL }, "", newURL);
        })
        .finally(() => setFormChanged(false));
    }
  };

  const handleInput = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
    setFormChanged(true);
  };

  return (
    <div className={"container"}>
      <form onSubmit={handleSubmit}>
        <div className="grid">
          <label>
            Total Points
            <input
              type="number"
              name={totalPointsParam}
              onChange={handleInput}
              value={formData.totalPoints}
            />
          </label>
          <label>
            Num Players
            <input
              type="number"
              name={numPlayersParam}
              onChange={handleInput}
              value={formData.numPlayers}
            />
          </label>
          <label>
            Percent Receiving Points
            <input
              type="number"
              name={percentReceivingPointsParam}
              onChange={handleInput}
              value={formData.percentReceivingPoints}
            />
          </label>
          <label>
            Top %
            <input
              type="number"
              name={targetTopPercentageParam}
              onChange={handleInput}
              value={formData.targetTopPercentage}
            />
          </label>
          <label>
            Target Points % for Top
            <input
              type="number"
              name={targetPointsPercentageForTopParam}
              onChange={handleInput}
              value={formData.targetPointsPercentageForTop}
            />
          </label>
          <button disabled={!formChanged}>Submit</button>
        </div>
      </form>
      <table>
        <thead>
          <tr>
            <th scope="col">Placement</th>
            <th scope="col">Points</th>
            <th scope="col">Cumulative</th>
          </tr>
        </thead>
        <tbody>
          {pointsDistributionResponse &&
            pointsDistributionResponse.pointDistribution.map((row) => (
              <tr key={row.placement}>
                <td>{row.placement}</td>
                <td>{row.points}</td>
                <td>{row.cumulative}</td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}
