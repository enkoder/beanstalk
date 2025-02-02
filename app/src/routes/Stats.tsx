import { useQuery } from "@tanstack/react-query";
import React, { useMemo } from "react";
import colors from "tailwindcss/colors";
import { AnalyticsService } from "../client/services/AnalyticsService";
import { StackedAreaChart } from "../components/Charts";

interface ChartDataPoint {
  date: string;
  [key: string]: string | number;
}

export default function Stats() {
  const { data: tournamentTrends } = useQuery({
    queryKey: ["tournamentTrends"],
    queryFn: () => AnalyticsService.getGetTournamentTypeTrends(),
  });

  const uniqueTournamentTypes = useMemo(() => {
    if (!tournamentTrends) return [];

    // Get total points for each tournament type
    const typeToTotal = tournamentTrends.reduce(
      (acc, curr) => {
        acc[curr.tournament_type] =
          (acc[curr.tournament_type] || 0) + curr.total_points;
        return acc;
      },
      {} as Record<string, number>,
    );

    // Only include tournament types that have points allocated at some point
    return Array.from(
      new Set(tournamentTrends.map((trend) => trend.tournament_type)),
    )
      .filter((type) => typeToTotal[type] > 0)
      .sort((a, b) => typeToTotal[b] - typeToTotal[a]);
  }, [tournamentTrends]);

  const chartData = useMemo(() => {
    if (!tournamentTrends) return [];

    // Get all unique months and sort them chronologically
    const months = Array.from(
      new Set(tournamentTrends.map((trend) => trend.month)),
    ).sort();

    // Create a data point for each month with all tournament types initialized to 0
    const data = months.map((month) => {
      const dataPoint: ChartDataPoint = {
        date: month,
      };

      // Initialize all tournament types to 0
      for (const type of uniqueTournamentTypes) {
        dataPoint[type] = 0;
        dataPoint[`${type}_count`] = 0;
      }

      // Fill in actual values from the data
      const monthTrends = tournamentTrends.filter(
        (trend) => trend.month === month,
      );
      for (const trend of monthTrends) {
        if (uniqueTournamentTypes.includes(trend.tournament_type)) {
          dataPoint[trend.tournament_type] = trend.total_points;
          dataPoint[`${trend.tournament_type}_count`] = trend.tournament_count;
        }
      }

      return dataPoint;
    });

    return data;
  }, [tournamentTrends, uniqueTournamentTypes]);

  // Tournament type to color mapping with brighter colors
  const typeColors: Record<string, string> = {
    worlds: colors.red[400],
    continental_championship: colors.orange[400],
    national_championship: colors.pink[400],
    seasonal_championship: colors.purple[400],
    store_championship: colors.blue[400],
    circuit_opener: colors.green[400],
    online_tournament: colors.cyan[400],
    community: colors.amber[400],
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="font-bold text-2xl text-gray-200">
          Tournament Points Distribution
        </h1>
      </div>

      {chartData.length > 0 && (
        <div className="h-full w-full">
          <StackedAreaChart
            data={chartData}
            width={"100%"}
            height={500}
            dateKey="date"
            series={uniqueTournamentTypes.map((type) => ({
              key: type,
              label: type
                .split("_")
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(" "),
              color: typeColors[type],
              countKey: `${type}_count`,
            }))}
            yAxisFormatter={(value) => value.toLocaleString()}
            dateFormatter={(date) =>
              new Date(date).toLocaleDateString(undefined, {
                month: "short",
                year: "numeric",
              })
            }
          />
        </div>
      )}
    </div>
  );
}
