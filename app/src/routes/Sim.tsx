import { useQuery } from "@tanstack/react-query";
import { FormEvent, useEffect, useState } from "react";
import {
  GetPointDistributionResponse,
  LeaderboardService,
  RankingConfig,
  TournamentConfig,
} from "../client";
import { Input } from "../stories/Input";
import { PageHeading } from "../stories/PageHeader";
import { Select } from "../stories/Select";

export function Sim() {
  const [selectedTournamentConfig, setSelectedTournamentConfig] =
    useState<TournamentConfig | null>(null);
  const [numPlayers, setNumPlayers] = useState<number>(32);
  const [pointsDistributionResponse, setPointsDistributionResponse] =
    useState<GetPointDistributionResponse>();

  const { data: config } = useQuery<RankingConfig>({
    queryKey: ["rankingConfig"],
    queryFn: () => LeaderboardService.getGetRankingConfig(),
  });

  useEffect(() => {
    if (config)
      setSelectedTournamentConfig(
        config.tournament_configs["worlds championship"],
      );
  }, [config]);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (config) {
      LeaderboardService.getGetPointDistribution(
        selectedTournamentConfig.points,
        numPlayers,
        selectedTournamentConfig.type,
      ).then((response) => {
        setPointsDistributionResponse(response);
      });
    }
  };
  return (
    <>
      <PageHeading includeUnderline={true} text={"Bean Simulator"} />
      <text className={"mb-8 text-gray-400"}>
        Below you can enter in the configuration for your tournament and get a
        breakdown of the bean distribution. Use this to figure out how many
        beans you'll get for your performance!
      </text>
      <form
        className={"mb-4 flex flex-col gap-x-4 lg:flex-row lg:gap-4"}
        onSubmit={handleSubmit}
      >
        <Select
          width={"w-full"}
          label={"Tournament / Beans"}
          items={Object.values(config?.tournament_configs || {})}
          selected={selectedTournamentConfig}
          renderItem={(t) => {
            return t ? (
              <div className={"flex flex-row justify-between"}>
                <text>{t.name}</text>
                <span className="absolute inset-y-0 right-10 ml-3 flex items-center pr-2">
                  {t.points}
                </span>
              </div>
            ) : (
              "Loading..."
            );
          }}
          onChange={(t) => setSelectedTournamentConfig(t)}
        />
        <Input
          className={"h-12 w-full rounded-lg"}
          label={"Number of Players"}
          type="number"
          id={"num-players"}
          value={numPlayers}
          onChange={(e) => setNumPlayers(Number(e.target.value))}
        />
        <button
          className={
            "mt-6 h-12 w-full rounded-lg border border-gray-600 bg-cyan-500 px-2 py-2 font-bold text-gray-950"
          }
          type="submit"
        >
          Run
        </button>
      </form>
      <div className={"flex-1 overflow-y-auto whitespace-nowrap"}>
        <table
          className={
            "h-full w-full table-fixed border-separate border-spacing-0 break-all text-lg text-gray-300"
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
                className={
                  "break-words border-b-2 border-solid border-gray-300 px-4"
                }
              >
                Cumulative ({pointsDistributionResponse?.adjustedTotalPoints})
              </th>
            </tr>
          </thead>
          <tbody>
            {pointsDistributionResponse?.pointDistribution.map((row) => (
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
    </>
  );
}
