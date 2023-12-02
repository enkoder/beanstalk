import { Season, SeasonsService } from "../client";
import { PageHeading } from "../stories/PageHeader";
import { Link, useLoaderData } from "react-router-dom";
import moment from "moment";

export async function SeasonsLoader() {
  return SeasonsService.getGetSeasons();
}

const DT_FORMAT = "MMMM DD YYYY";

export function Seasons() {
  const seasons = useLoaderData() as Season[];

  return (
    <div
      className={"mt-4 flex h-[100svh] flex-row justify-center overflow-auto"}
    >
      <div className={"m-4 flex w-5/6 flex-col text-gray-300"}>
        <PageHeading includeUnderline={true} text={"Seasons"} />
        <small className={"text-sm text-gray-400"}>
          Seasons are a mechanic that keeps the leaderboard fresh. Seasons are
          typically tied to NSG content releases and the yearly tournament
          season cadence.
        </small>
        <table
          className={
            "mb-1 table w-full table-fixed border-separate border-spacing-0 text-gray-300"
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
                ID
              </th>
              <th
                scope="col"
                className={"border-b-2 border-solid border-gray-300"}
              >
                Name
              </th>
              <th
                scope="col"
                className={"border-b-2 border-solid border-gray-300"}
              >
                Start Date
              </th>
              <th
                scope="col"
                className={"border-b-2 border-solid border-gray-300"}
              >
                End Date
              </th>
            </tr>
          </thead>

          <tbody>
            {seasons &&
              seasons.map((season) => (
                <tr
                  className={
                    "text-center align-middle odd:bg-slate-900 even:bg-slate-950"
                  }
                >
                  <td>{season.id}</td>
                  <td className={"px-4 py-2"}>
                    <Link
                      className={
                        "text-cyan-500 hover:font-bold hover:text-cyan-400 hover:underline"
                      }
                      to={"/?season=" + season.id}
                    >
                      {season.name}
                    </Link>
                  </td>
                  <td className={"px-4 py-2"}>
                    {moment(season.started_at).format(DT_FORMAT)}
                  </td>
                  <td className={"px-4 py-2"}>
                    {season.ended_at
                      ? moment(season.ended_at).format(DT_FORMAT)
                      : "Active"}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
