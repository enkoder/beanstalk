import { LeaderboardRow, LeaderboardService } from "../client";
import { LeaderboardTable } from "../stories/LeaderboardTable";
import {
  FilterSection,
  FilterSectionValues,
  getFilterValues,
} from "../stories/FilterSection";
import { PageHeading } from "../stories/PageHeader";
import { useState } from "react";
import { useSearchParams } from "react-router-dom";

export function Leaderboard() {
  const [leaderboardRows, setLeaderboardRows] = useState<LeaderboardRow[]>();
  const [searchParams] = useSearchParams();
  const values = getFilterValues(searchParams);

  const getLeaderboard = (v: FilterSectionValues) => {
    LeaderboardService.getGetLeaderboard(v.seasonId, v.faction, v.format).then(
      (rows) => {
        setLeaderboardRows(rows);
      },
    );
  };

  return (
    <div
      className={"mt-4 flex h-[100svh] flex-row justify-center overflow-auto"}
    >
      <div className={"m-4 flex w-5/6 flex-col text-gray-300"}>
        <PageHeading
          includeUnderline={true}
          className={"mb-8"}
          text={"Leaderboard"}
        />
        <FilterSection hasSearchBar={true} onParamChange={getLeaderboard} />
        <div className={"overflow-auto whitespace-nowrap"}>
          <LeaderboardTable leaderboard={leaderboardRows} values={values} />
        </div>
      </div>
    </div>
  );
}
