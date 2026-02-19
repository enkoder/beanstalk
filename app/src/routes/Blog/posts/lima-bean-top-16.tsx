import { useQuery } from "@tanstack/react-query";
import { Format, type LeaderboardRow } from "../../../client";
import { LeaderboardService } from "../../../client/services/LeaderboardService";
import { LeaderboardTable } from "../../../components/LeaderboardTable";
import { Link } from "../../../components/Link";
import { Sep } from "../../../components/Sep";
import { BlogContent, Section } from "../components/BlogSections";
import type { BlogPost } from "../types";

export const LimaBeanTop16Post: BlogPost = {
  id: "lima-beans",
  title: "Lima Beans 2025",
  date: "2026-02-18",
  showTOC: true,
  showInList: true,
  component: ({ onSectionsChange }) => {
    const { data: leaderboard } = useQuery<LeaderboardRow[]>({
      queryKey: ["leaderboard", 3, "standard"],
      queryFn: () =>
        LeaderboardService.getGetLeaderboard(3, undefined, Format.STANDARD),
    });

    const top16 = leaderboard?.slice(0, 16);
    const champion = top16?.[0];

    return (
      <BlogContent onSectionsChange={onSectionsChange}>
        <Section title="This concludes our 2025 Season">
          With the conclusion of CBI, this marks the close of the 2025 Lima Bean
          season! What an incredible year of competitive Netrunner. With the
          removal of baseline points and the changes to the new scaling system,
          every bean mattered more than ever. The competition was fierce from
          start to finish, and the leaderboard saw plenty of movement throughout
          the year. Going back to my goals listed out from the blog post on{" "}
          <Link to="/blog/2024-season-reflections">
            2024 Season Reflections
          </Link>
          , I feel confident that the changes we made to the points system were
          a success. The leaderboard rewarded more consistent performance and
          flattened the curve, making it more competitive and exciting for
          players at all levels. It was awesome to see so many different players
          rise up the ranks and challenge for the top spots throughout the
          season.
          <Sep className="mt-4" />
          However, there was one clearly dominant player this season and I'll
          list out some of their accomplishments:
          <ul className="list-inside list-disc">
            <li>2nd Place at the 361 person Worlds</li>
            <li>1st Place in the 110 person EMEA Continentals</li>
            <li>8th Place in the 190 person Worlds Showdown</li>
            <li>4th Place in the 149 person Summer Showdown</li>
            <li>Very strong placements across all districts</li>
          </ul>
        </Section>

        <Section title="Your 2025 Lima Bean Champion">
          {champion && (
            <>
              An absolutely incredible season from {champion.user_name}.
              Congrats on being our Lima Bean champion!
              <div className="my-4 flex flex-col items-center gap-2">
                <Link
                  to={`/results/${champion.user_name}?season=3&formatCode=standard`}
                  className="text-3xl font-bold"
                >
                  {champion.user_name}
                </Link>
                <span className="text-xl text-cyan-600">
                  {champion.points.toFixed(2)} beans
                </span>
              </div>
              <Sep className="mt-4" />
            </>
          )}
        </Section>

        <Section title="Top 16 Standings">
          Additionally, congrats to everyone who made it into the top 16 this
          season. An incredible achievement and testament to your skill and
          dedication to the game. Here are the final standings for the top 16
          players in the Lima Bean season:
          <LeaderboardTable
            leaderboard={top16}
            values={{ seasonId: 3, format: Format.STANDARD }}
          />
        </Section>

        <Section title="Season 4: Mung Beans">
          Now that Lima Bean season is behind us, it's time to look ahead.
          Introducing the 2026 season...
          <div className="my-4 flex flex-col items-center gap-4">
            <Link
              to="/?season=4&formatCode=standard"
              className="text-2xl font-bold"
            >
              Mung Beans
            </Link>
          </div>
          <Sep className="mt-4" />
          The leaderboard has been reset and a new season of competitive
          Netrunner awaits. Good luck to all players in the 2026 Mung Bean
          season. Let's go Vantage Point!!
        </Section>
      </BlogContent>
    );
  },
};
