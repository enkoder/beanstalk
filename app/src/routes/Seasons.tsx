import { useQuery } from "@tanstack/react-query";
import moment from "moment";
import * as React from "react";
import { type GetSeasonsResponse, SeasonsService } from "../client";
import { Link } from "../components/Link";
import { PageHeading } from "../components/PageHeader";

const DT_FORMAT = "MMMM DD YYYY";

export function Seasons() {
  const { data: seasons } = useQuery<GetSeasonsResponse>({
    staleTime: 0,
    queryKey: ["seasons"],
    queryFn: () => SeasonsService.getGetSeasons(),
  });

  return (
    <>
      <PageHeading includeUnderline={true} text={"Seasons"} />
      <small className={"text-gray-400 text-lg"}>
        Seasons are a mechanic that keeps the leaderboard fresh. Seasons are
        typically tied to NSG content releases and the yearly tournament season
        cadence.
      </small>
      <table
        className={
          "mb-1 table w-full table-fixed border-separate border-spacing-0 text-gray-300"
        }
      >
        <thead className={"sticky top-0 h-10 bg-slate-950 text-center text-lg"}>
          <tr className={"border-b"}>
            <th
              scope="col"
              className={"border-gray-300 border-b-2 border-solid px-4"}
            >
              ID
            </th>
            <th
              scope="col"
              className={"border-gray-300 border-b-2 border-solid"}
            >
              Name
            </th>
            <th
              scope="col"
              className={"border-gray-300 border-b-2 border-solid"}
            >
              Start Date
            </th>
            <th
              scope="col"
              className={"border-gray-300 border-b-2 border-solid"}
            >
              End Date
            </th>
          </tr>
        </thead>

        <tbody>
          {seasons?.seasons.map((season) => (
            <tr
              className={
                "text-center align-middle even:bg-slate-950 odd:bg-slate-900"
              }
            >
              <td>{season.id}</td>
              <td className={"px-4 py-2"}>
                <Link to={`/?season=${season.id}`}>{season.name}</Link>
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
    </>
  );
}
