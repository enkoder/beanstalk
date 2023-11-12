import {
  LeaderboardResponse,
  LeaderboardService,
  Season,
  SeasonsService,
} from "../client";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import "./Leaderboard.css";
import {
  ChangeEvent,
  FormEvent,
  useCallback,
  useEffect,
  useState,
} from "react";

const DEFAULT_SEASON = 1;
const seasonParam = "season";
interface LeaderboardFormData {
  season: number;
}

export async function LeaderboardLoader() {
  const [leaderboard, seasons] = await Promise.all([
    LeaderboardService.getGetLeaderboard(),
    SeasonsService.getGetSeasons(),
  ]);
  return { leaderboard, seasons };
}

export function Leaderboard() {
  const [searchParams] = useSearchParams();
  const location = useLocation();

  const [formData, setFormData] = useState<LeaderboardFormData>({
    season: Number(searchParams.get(seasonParam) || DEFAULT_SEASON),
  });

  const [leaderboard, setLeaderboard] = useState<LeaderboardResponse>();
  const [seasons, setSeasons] = useState<Season[]>();
  const [searchString, setSearchString] = useState<string>("");

  const fetchLeaderboard = useCallback(async (seasonId: number | null) => {
    LeaderboardService.getGetLeaderboard(null, null, seasonId).then(
      (leaderboard) => {
        console.log("heyy");
        setLeaderboard(leaderboard);
      },
    );
  }, []);

  const fetchSeasons = useCallback(async () => {
    SeasonsService.getGetSeasons().then((seasons) => {
      console.log("heyy");
      setSeasons(seasons);
    });
  }, []);

  // fetches initial resources
  useEffect(() => {
    fetchLeaderboard(formData.season).catch((e) => console.log(e));
    fetchSeasons().catch((e) => console.log(e));
    return () => {};
  }, []);

  // Parse and update form values from search parameters in the URL
  useEffect(() => {
    // when the query string changes, update the form values on load
    setFormData({
      season: Number(searchParams.get(seasonParam)) || 0,
    });
  }, [location.search]);

  const handleSeasonChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: Number(value) });
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    LeaderboardService.getGetLeaderboard(null, null, formData.season).then(
      (leaderboard: LeaderboardResponse) => {
        setLeaderboard(leaderboard);

        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.set(seasonParam, formData.season.toString());
        const newURL = `${
          window.location.pathname
        }?${newSearchParams.toString()}`;
        window.history.pushState({ path: newURL }, "", newURL);
      },
    );
  };

  return (
    <div className={"leaderboard-container"}>
      <div className={"filters"}>
        <form onSubmit={handleSubmit}>
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
                    selected={seasons && season.id == formData.season}
                  >
                    S{season.id} - {season.name}
                  </option>
                ))}
            </select>
            <label>Faction</label>
            <select id="season" disabled={true}>
              <option value={0} selected>
                Coming Soon!
              </option>
            </select>
          </fieldset>
          <input type={"submit"} onSubmit={handleSubmit} value={"Submit"} />
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
