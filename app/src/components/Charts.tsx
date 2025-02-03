import { useMemo } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import colors from "tailwindcss/colors";

interface ChartDataPoint {
  date: string | Date;
  [key: string]: string | Date | number;
}

interface Series<T> {
  key: keyof T;
  data?: ChartDataPoint[];
  label: string;
  color?: string;
  countKey?: keyof T;
}

interface LineChartProps<T extends ChartDataPoint> {
  data: T[];
  width: number | string;
  height: number | string;
  dateKey: keyof T;
  series: Series<T>[];
  yAxisFormatter?: (value: number) => string;
  dateFormatter?: (date: Date) => string;
}

// Default color palette using Tailwind colors
const defaultColors = [
  colors.blue[500],
  colors.red[500],
  colors.green[500],
  colors.yellow[500],
  colors.purple[500],
  colors.cyan[500],
  colors.pink[500],
  colors.orange[500],
] as const;

export const StackedAreaChart = <T extends ChartDataPoint>({
  data,
  width,
  height,
  dateKey,
  series,
  yAxisFormatter = (value: number) => `${value}%`,
  dateFormatter = (date: Date) =>
    date.toLocaleDateString(undefined, { month: "short" }),
}: LineChartProps<T>) => {
  const chartData = useMemo(() => {
    return data.map((item: T) => ({
      ...item,
      [dateKey]:
        typeof item[dateKey] === "string"
          ? new Date(item[dateKey] as string)
          : item[dateKey],
    }));
  }, [data, dateKey]);

  return (
    <div
      className="relative rounded-lg bg-gray-900 shadow-lg"
      style={{ width, height }}
    >
      <ResponsiveContainer>
        <LineChart
          data={chartData}
          margin={{
            top: 20,
            right: 30,
            bottom: 20,
            left: 30,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={colors.gray[700]} />
          <XAxis
            dataKey={dateKey as string}
            tickFormatter={(date: Date) => dateFormatter(date)}
            stroke={colors.gray[400]}
            tick={{ fill: colors.gray[300] }}
            interval="preserveStartEnd"
          />
          <YAxis
            tickFormatter={yAxisFormatter}
            stroke={colors.gray[400]}
            tick={{ fill: colors.gray[300] }}
            width={35}
          />
          <Tooltip
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="max-w-[250px] rounded-lg border border-gray-700 bg-gray-800 p-2 shadow-lg sm:max-w-none sm:p-4">
                    <div className="mb-1 font-medium text-gray-200 text-sm sm:mb-2 sm:text-base">
                      {dateFormatter(label as Date)}
                    </div>
                    <div className="space-y-1 sm:space-y-2">
                      {payload
                        .filter((entry) => entry.value !== 0)
                        .sort(
                          (a, b) => (b.value as number) - (a.value as number),
                        )
                        .map((entry) => {
                          const seriesItem = series.find(
                            (s) => s.key === entry.dataKey,
                          );
                          if (!seriesItem) return null;

                          const tournamentCount = seriesItem.countKey
                            ? Number(
                                chartData.find(
                                  (d: T) => d[dateKey] === label,
                                )?.[seriesItem.countKey as keyof T] ?? 0,
                              )
                            : undefined;

                          return (
                            <div
                              key={entry.dataKey as string}
                              className="flex items-center justify-between"
                            >
                              <span
                                className="pr-2 font-medium text-xs sm:pr-4 sm:text-sm"
                                style={{ color: entry.color }}
                              >
                                {seriesItem.label}
                              </span>
                              <div className="flex items-center gap-1 text-xs sm:gap-2 sm:text-sm">
                                <span className="font-semibold text-gray-200">
                                  {typeof entry.value === "number"
                                    ? yAxisFormatter(entry.value)
                                    : entry.value}
                                </span>
                                {tournamentCount !== undefined &&
                                  tournamentCount > 0 && (
                                    <span className="hidden text-gray-400 sm:inline">
                                      ({tournamentCount} tournament
                                      {tournamentCount !== 1 ? "s" : ""})
                                    </span>
                                  )}
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                );
              }
              return null;
            }}
          />

          {series.map((item, index) => (
            <Line
              key={item.key as string}
              type="monotone"
              dataKey={item.key as string}
              name={item.label}
              stroke={item.color || defaultColors[index % defaultColors.length]}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 6, fill: colors.gray[900] }}
              connectNulls
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
