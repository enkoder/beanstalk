import { useQuery } from "@tanstack/react-query";
import { clsx } from "clsx";
import { useEffect, useState } from "react";
import {
  type GetPointDistributionResponse,
  LeaderboardService,
  type RankingConfig,
  type Season,
  SeasonsService,
  type TournamentConfig,
} from "../client";
import { Input } from "../components/Input";
import { PageHeading } from "../components/PageHeader";
import { Select } from "../components/Select";
import { Sep } from "../components/Sep";
import { Tooltip, TooltipContent, TooltipTrigger } from "../components/Tooltip";

type SeasonData = {
  current_season: Season;
  seasons: Season[];
};

export function Sim() {
  const [selectedTournamentConfig, setSelectedTournamentConfig] = useState<
    TournamentConfig | null | undefined
  >(null);
  const [numPlayers, setNumPlayers] = useState<number | undefined>(32);
  const [selectedSeason, setSelectedSeason] = useState<Season | null>(null);
  const [pointsDistributionResponse, setPointsDistributionResponse] =
    useState<GetPointDistributionResponse>();

  const { data: config } = useQuery<RankingConfig>({
    queryKey: ["rankingConfig", selectedSeason?.id],
    queryFn: () => LeaderboardService.getGetRankingConfig(selectedSeason?.id),
  });

  const { data: seasons } = useQuery<SeasonData>({
    queryKey: ["seasons"],
    queryFn: () => SeasonsService.getGetSeasons(),
  });

  useEffect(() => {
    if (config)
      setSelectedTournamentConfig(
        config.tournament_configs["worlds championship"],
      );
  }, [config, selectedSeason]);

  useEffect(() => {
    if (seasons) {
      const currentSeason = seasons.current_season;
      if (currentSeason) {
        setSelectedSeason(currentSeason);
      }
    }
  }, [seasons]);

  useEffect(() => {
    // Create a timeout to submit after 500ms of no changes
    const timeoutId = setTimeout(() => {
      if (selectedTournamentConfig && numPlayers) {
        LeaderboardService.getGetPointDistribution(
          numPlayers,
          selectedTournamentConfig.code,
          selectedSeason?.id,
        ).then((response) => {
          setPointsDistributionResponse(response);
        });
      }
    }, 500);

    // Cleanup timeout on each change
    return () => clearTimeout(timeoutId);
  }, [selectedTournamentConfig, numPlayers, selectedSeason]);

  return (
    <>
      <PageHeading includeUnderline={true} text={"Bean Simulator"} />
      <text className={"mb-8 text-gray-400"}>
        Below you can enter in the configuration for your tournament and get a
        breakdown of the bean distribution. Use this to figure out how many
        beans you'll get for your performance!
      </text>
      <Sep className={"my-2 lg:my-4"} />

      <div className={"mb-4 flex flex-col gap-x-4 lg:flex-row lg:gap-4"}>
        <div className="flex w-full flex-col gap-4 lg:flex-row">
          <Select
            width={"w-full"}
            label={"Season"}
            items={seasons?.seasons || []}
            selected={selectedSeason}
            renderItem={(s) => {
              return s ? s.name : "Loading...";
            }}
            onChange={(s) => {
              if (s) setSelectedSeason(s);
            }}
          />

          <Tooltip placement={"top"}>
            <TooltipTrigger className={"w-full text-left"}>
              <Select
                width={"w-full"}
                label={"Tournament Type"}
                items={Object.values(config?.tournament_configs || {})}
                selected={selectedTournamentConfig}
                renderItem={(t) => {
                  return t ? (
                    <div className={"flex flex-row justify-between"}>
                      <text>{t.name}</text>
                      <span className="absolute inset-y-0 right-10 ml-3 flex items-center pr-2">
                        {t.points_per_player} / {t.baseline_points} /{" "}
                        {t.min_players_to_be_legal}
                      </span>
                    </div>
                  ) : (
                    "Loading..."
                  );
                }}
                onChange={(t) => {
                  if (t) setSelectedTournamentConfig(t);
                  if (t?.code === "intercontinental championship") {
                    setNumPlayers(12);
                  }
                }}
              />
            </TooltipTrigger>
            <TooltipContent
              className={
                "rounded-lg border border-gray-600 bg-gray-950 p-2 text-cyan-500 text-sm shadow-lg"
              }
              arrowClassName={
                "fill-gray-950 [&>path:first-of-type]:stroke-gray-600"
              }
            >
              <span>Beans Per Player / Baseline Beans / Min Players</span>
            </TooltipContent>
          </Tooltip>

          <Tooltip placement={"bottom"}>
            <TooltipTrigger className={"w-full text-left"}>
              <Input
                width={"w-full"}
                className={clsx(
                  numPlayers === undefined && "border border-red-900",
                  "h-12 rounded-lg",
                )}
                disabled={
                  selectedTournamentConfig?.code ===
                  "intercontinental championship"
                }
                label={"Number of Players"}
                type="number"
                id={"num-players"}
                value={
                  selectedTournamentConfig?.code ===
                  "intercontinental championship"
                    ? 12
                    : numPlayers
                }
                onChange={(e) =>
                  setNumPlayers(
                    e.target.value !== "" ? Number(e.target.value) : undefined,
                  )
                }
              />
            </TooltipTrigger>
            {selectedTournamentConfig?.code ===
              "intercontinental championship" && (
              <TooltipContent
                className={
                  "rounded-lg border border-gray-600 bg-gray-950 p-2 text-cyan-500 text-sm shadow-lg"
                }
                arrowClassName={
                  "fill-gray-950 [&>path:first-of-type]:stroke-gray-600"
                }
              >
                <span>Intercontinentals has a fixed number of 12 players</span>
              </TooltipContent>
            )}
          </Tooltip>
        </div>
      </div>
      <div className={"flex-1 overflow-y-auto whitespace-nowrap"}>
        <table
          className={
            "h-full w-full table-fixed border-separate border-spacing-0 break-all text-gray-300 text-lg"
          }
        >
          <thead
            className={"sticky top-0 h-10 bg-slate-950 text-center text-lg"}
          >
            <tr className={"border-b"}>
              <th
                scope="col"
                className={"border-gray-300 border-b-2 border-solid px-4"}
              >
                Placement
              </th>
              <th
                scope="col"
                className={"border-gray-300 border-b-2 border-solid px-4"}
              >
                Beans
              </th>
              <th
                scope="col"
                className={
                  "break-words border-gray-300 border-b-2 border-solid px-4"
                }
              >
                Cumulative %
              </th>
            </tr>
          </thead>
          <tbody>
            {pointsDistributionResponse?.pointDistribution.map((row) => (
              <tr
                key={row.placement}
                className={
                  "text-center align-middle even:bg-slate-950 odd:bg-slate-900"
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
