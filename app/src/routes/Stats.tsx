import { TournamentTrendsChart } from "../components/TournamentTrendsChart";

export default function Stats() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="font-bold text-2xl text-gray-200">
          Tournament Points Distribution
        </h1>
      </div>

      <div className="h-full w-full">
        <TournamentTrendsChart seasonId={2} />
      </div>
    </div>
  );
}
