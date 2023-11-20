import "./Seasons.css";
import { Season, SeasonsService } from "../client";
import { Link, useLoaderData } from "react-router-dom";
import moment from "moment";

export async function SeasonsLoader() {
  return SeasonsService.getGetSeasons();
}

const DT_FORMAT = "MMMM DD YYYY";

export function Seasons() {
  const seasons = useLoaderData() as Season[];

  // TODO: Figure out how to link to an anchor
  return (
    <div className={"seasons-container"}>
      <hgroup>
        <h1>Seasons</h1>
        <small>
          Seasons are a mechanic that keeps the leaderboard fresh. Seasons are
          typically tied to NSG content releases and the yearly tournament
          season cadence.
        </small>
      </hgroup>
      <table>
        <thead>
          <tr>
            <th scope="col">ID</th>
            <th scope="col">Name</th>
            <th scope="col">Start Date</th>
            <th scope="col">End Date</th>
          </tr>
        </thead>
        <tbody>
          {seasons &&
            seasons.map((season) => (
              <tr>
                <td>{season.id}</td>
                <td>
                  <Link to={"/?season=" + season.id}>{season.name}</Link>
                </td>
                <td>{moment(season.started_at).format(DT_FORMAT)}</td>
                <td>
                  {season.ended_at
                    ? moment(season.ended_at).format(DT_FORMAT)
                    : "Active"}
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}
