import {
  LeaderboardResponse,
  LeaderboardService,
  Season,
  SeasonsService,
} from "../client";
import { LeaderboardTable } from "../stories/LeaderboardTable";
import { Link, useSearchParams } from "react-router-dom";
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
  const [seasons, setSeasons] = useState<Season[]>();
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
    <div className={"leaderboard-container"}>
      <div className={"filters"}>
        <div className={"season-select-container"}>
          <h6>
            <Link to={"/seasons"}>Season Select</Link>
          </h6>
        </div>
        <div className={"filters-item"}>
          <select id="season" name={seasonParam} onChange={handleSeasonChange}>
            {seasons &&
              seasons.map((season) => (
                <option
                  value={season.id}
                  selected={seasons && season.id == selectedSeason}
                >
                  S{season.id} - {season.name}
                </option>
              ))}
          </select>
        </div>
        <div className={"filters-item"}>
          <input
            type="search"
            id="search"
            name="search"
            placeholder="Search"
            onChange={(e) => setSearchString(e.target.value)}
          />
        </div>
      </div>
      <div className={"leaderboard"}>
        <LeaderboardTable
          leaderboard={leaderboard}
          searchString={searchString}
          selectedSeason={selectedSeason}
        ></LeaderboardTable>
      </div>
    </div>
  );
}
