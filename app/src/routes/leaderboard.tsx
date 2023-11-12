import {
  LeaderboardResponse,
  LeaderboardService,
  Season,
  SeasonsService,
} from "../client";
import { Link, useSearchParams } from "react-router-dom";
import "./Leaderboard.css";
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
        <form>
          <fieldset>
            <label>Username</label>
            <input
              type="search"
              id="search"
              name="search"
              placeholder="Search"
              onChange={(e) => setSearchString(e.target.value)}
            />
            <label>Season</label>
            <select
              id="season"
              name={seasonParam}
              onChange={handleSeasonChange}
            >
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
          </fieldset>
        </form>
      </div>
      <div className={"leaderboard"}>
        <table className={"striped"}>
          <thead>
            <tr>
              <th scope="col">#</th>
              <th scope="col">Name</th>
              <th scope="col">Beans</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard &&
              leaderboard.users
                .filter(
                  (user) =>
                    user &&
                    user.name
                      ?.toLowerCase()
                      .includes(searchString.toLowerCase()),
                )
                .map((user) => (
                  <tr>
                    <td>{user.rank}</td>{" "}
                    <td align={"center"}>
                      <Link to={`results/${user.name}`}>{user.name}</Link>
                    </td>
                    <td>{user.points.toFixed(2)}</td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
