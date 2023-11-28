import {
  LeaderboardResponse,
  LeaderboardService,
  Season,
  SeasonsService,
} from "../client";
import { LeaderboardTable } from "../stories/LeaderboardTable";
import { Select } from "../stories/Select";
import { Input } from "../stories/Input";
import { PageHeading } from "../stories/PageHeader";
import { useSearchParams } from "react-router-dom";
import { ChangeEvent, useCallback, useEffect, useState } from "react";

const DEFAULT_SEASON = 1;
const seasonParam = "season";

export async function LeaderboardLoader() {
  const [leaderboard, seasons] = await Promise.all([
    LeaderboardService.getGetLeaderboard(),
    SeasonsService.getGetSeasons(),
  ]);
  return { leaderboard, seasons };
}

export function Leaderboard() {
  const [searchParams] = useSearchParams();

  const initialSeason = Number(searchParams.get(seasonParam) || DEFAULT_SEASON);
  const [leaderboard, setLeaderboard] = useState<LeaderboardResponse>();
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [searchString, setSearchString] = useState<string>("");
  const [selectedSeason, setSelectedSeason] = useState<number>(initialSeason);

  const fetchLeaderboard = useCallback(async (seasonId: number | null) => {
    LeaderboardService.getGetLeaderboard(null, null, seasonId).then(
      (leaderboard) => {
        setLeaderboard(leaderboard);
      },
    );
  }, []);

  const fetchSeasons = useCallback(async () => {
    SeasonsService.getGetSeasons().then((seasons) => {
      setSeasons(seasons);
    });
  }, []);

  // fetches initial resources
  useEffect(() => {
    fetchSeasons().catch((e) => console.log(e));
    fetchLeaderboard(selectedSeason).catch((e) => console.log(e));
    return () => {};
  }, []);

  const handleSeasonChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const { value } = event.target;
    setSelectedSeason(Number(value));

    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set(seasonParam, value);
    const newURL = `${window.location.pathname}?${newSearchParams.toString()}`;
    window.history.pushState({ path: newURL }, "", newURL);

    LeaderboardService.getGetLeaderboard(null, null, Number(value)).then(
      (leaderboard: LeaderboardResponse) => {
        setLeaderboard(leaderboard);
      },
    );
  };

  return (
    <div
      className={"mt-4 flex h-[100svh] flex-row justify-center overflow-auto"}
    >
      <div className={"flex w-full flex-col sm:w-5/6"}>
        <PageHeading text={"Leaderboard"} />
        <div className={"mb-4 flex flex-col sm:flex-row"}>
          <Select
            label={"Seasons"}
            options={seasons.map((s) => {
              return { value: s.id, text: s.name };
            })}
            id="season"
            name={seasonParam}
            onChange={handleSeasonChange}
          />
          <Input
            label={"Search"}
            type={"search"}
            placeholder="Search"
            onChange={(e) => setSearchString(e.target.value)}
          />
        </div>
        <div className={"flex-1 overflow-y-auto whitespace-nowrap"}>
          <LeaderboardTable
            leaderboard={leaderboard}
            searchString={searchString}
            selectedSeason={selectedSeason}
          />
        </div>
      </div>
    </div>
  );
}
