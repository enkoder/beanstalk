import { PageHeading } from "../stories/PageHeader";
import {
  GetPointDistributionResponse,
  LeaderboardService,
  Tier,
} from "../client";
import { FormEvent, useEffect, useState } from "react";

export function Sim() {
  const [selectedTier, setSelectedTier] = useState<number>(0);
  const [tiers, setTiers] = useState<Tier[]>([]);
  const [numPlayers, setNumPlayers] = useState<number>(32);
  const [pointsDistributionResponse, setPointsDistributionResponse] =
    useState<GetPointDistributionResponse>();

  useEffect(() => {
    LeaderboardService.getGetTiers().then((tiers) => {
      setTiers(tiers);
      console.log(tiers);
    });
  }, []);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (tiers) {
      LeaderboardService.getGetPointDistribution(
        tiers[selectedTier].points,
        numPlayers,
      ).then((response) => {
        setPointsDistributionResponse(response);
      });
    }
  };
  return (
    <div className={"mx-4 mt-4 flex h-[100svh] flex-col"}>
      <PageHeading text={"Bean Simulator"} />
      <text className={"mb-4 text-gray-400"}>
        Below you can enter in the configuration for your tournament and get a
        breakdown of the bean distribution. Use this to figure out how many
        beans you'll get for your performance!
      </text>
      <form className={"mx-4 mb-4 flex flex-row"} onSubmit={handleSubmit}>
        <select
          className={
            "flex-1 border border-gray-600 bg-slate-900 px-2 py-2 text-gray-400"
          }
          onChange={(e) => setSelectedTier(Number(e.target.value))}
        >
          {tiers &&
            tiers.map((tier, index) => (
              <option value={index}>{tier.name}</option>
            ))}
        </select>

        <input
          className={
            "w-full border border-gray-600 bg-slate-900 px-2 py-2 text-gray-400"
          }
          type="number"
          disabled
          value={tiers.length ? tiers[selectedTier].points : 0}
        />
        <input
          className={
            "w-full border border-gray-600 bg-slate-900 px-2 py-2 text-gray-400"
          }
          type="number"
          placeholder={"Num Players"}
          value={numPlayers}
          onChange={(e) => setNumPlayers(Number(e.target.value))}
        />
        <button
          className={
            "w-full border border-gray-600 bg-cyan-500 px-2 py-2 text-slate-950"
          }
          type="submit"
        >
          Run
        </button>
      </form>
      <div className={"flex-1 overflow-y-auto whitespace-nowrap"}>
        <table
          className={
            "h-full w-full table-fixed border-separate border-spacing-0 text-gray-300"
          }
        >
          <thead
            className={"sticky top-0 h-10 bg-slate-950 text-center text-lg"}
          >
            <tr className={"border-b"}>
              <th
                scope="col"
                className={"border-b-2 border-solid border-gray-300 px-4"}
              >
                Placement
              </th>
              <th
                scope="col"
                className={"border-b-2 border-solid border-gray-300 px-4"}
              >
                Beans
              </th>
              <th
                scope="col"
                className={"border-b-2 border-solid border-gray-300 px-4"}
              >
                Cumulative (
                {pointsDistributionResponse &&
                  pointsDistributionResponse.adjustedTotalPoints}
                )
              </th>
            </tr>
          </thead>
          <tbody>
            {pointsDistributionResponse &&
              pointsDistributionResponse.pointDistribution.map((row) => (
                <tr
                  key={row.placement}
                  className={
                    "text-center align-middle odd:bg-slate-900 even:bg-slate-950"
                  }
                >
                  <td>{row.placement}</td>
                  <td>{row.points}</td>
                  <td>{row.cumulative}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
