import { useQuery } from "@tanstack/react-query";
import type { ReactNode } from "react";
import type { RankingConfig } from "../../../client";
import { LeaderboardService } from "../../../client/services/LeaderboardService";
import { Link } from "../../../components/Link";
import { Sep } from "../../../components/Sep";
import { TournamentTrendsChart } from "../../../components/TournamentTrendsChart";
import { BlogContent, Section } from "../components/BlogSections";
import type { BlogPost } from "../types";

function SubHeader({ children }: { children: ReactNode }) {
  return <h3 className="mt-4 font-bold text-cyan-600 text-xl">{children}</h3>;
}

export const SeasonReflectionsPost: BlogPost = {
  id: "2024-season-reflections",
  title: "Beanstalk 2024: Reflections and Proposed Changes",
  date: "2024-02-03",
  showTOC: true,
  showInList: true,
  component: ({ onSectionsChange }) => {
    const { data: rankingConfig } = useQuery<RankingConfig>({
      queryKey: ["rankingConfig"],
      queryFn: () => LeaderboardService.getGetRankingConfig(3),
    });

    return (
      <BlogContent onSectionsChange={onSectionsChange}>
        <Section title="Final Standings">
          The <Link to="/blog/cbi-2024">Circuit Breaker Invitational</Link>{" "}
          tournament marked the close of the first full season of competitive
          play on the Beanstalk! This tournament drew a huge crowd with 139
          players and with 200 baseline points and 2 points per player, it was
          going to pay out some Big Beans :tm:. Going into CBI, the top were all
          quite close with Sokka in the lead by over 100 beans. However Sokka
          not attending CBI and AugustusCaesar's strong performance securiing
          him 279 beans, puts AugustusCaesar in first place for the 2024 Green
          Beans season!
          <Sep className="mt-4" />
          <div className="flex w-full justify-center">
            <Link to="/results/AugustusCaesar?season=2&formatCode=standard">
              AugustusCaesar
            </Link>
          </div>
        </Section>
        <Section title="Reflections">
          <Sep className="mt-4" />
          When I set out to make the Beanstalk, I had a few ideas in mind.
          First, I was just really interested in the technical challenge of
          building a website that could do this. I mostly work on tooling and
          backend systems, so learning UI and design was a fun new challenge for
          me. I love working with the Cloudflare Workers platform, so it was a
          great excuse to have some more fun. You can find out more about the
          technical details of the beanstalk{" "}
          <Link to={"https://github.com/enkoder/beanstalk"}>on Github</Link>
          <Sep className="mt-4" />
          Beyond the technical nerd stuff, I wanted to give back to the
          competitive organized play scene. I've been playing competitive
          Netrunner since 2017 and love this community and game so much. In
          2018, our local meta had regionals season where PJ20 built a similar
          tool. He tracked results in a spreadsheet, allocated points based upon
          placement, and it created a thrilling year of Netrunner that still
          goes down as my favorite Netrunner season of all time. I wanted to
          recreate this experience and build a fully automated and feature rich
          tool that helps facilitate an engaging competitive season for anyone
          and everyone.
          <Sep className="mt-4" />
          I'm glad to say that the Beanstalk has done just that. People have
          shared with me that they are going to more tournaments and also
          staying in tournaments longer without dropping. You can't drop once
          you're out of the cut, there are bean on the line!! It's been so fun
          and rewarding to hear all the great feedback and kind words from the
          community. It's been super fun, and I'm stoked to say that it's not
          going anywhere. I'm going to continue to invest in and improve the
          Beanstalk. It's a labor of love at this point and the general positive
          reaction has been overwhelmingly positive.
          <Sep className="mt-4" />
          2024 marks the first full year, and I said in the FAQ, this first
          season was really just a trial. When I created the initla rankings
          system,I had no clue if I nailed it or not. After watching how this
          past season when down, I'm quite happy with most of it. That being
          said, there's some things that I didn't like and some things I'd like
          to change. In this post, I'm going to reflect on the season and share
          some observations and changes I'm making for the next season. Let's
          jack in.
        </Section>

        <Section title="Observations">
          <SubHeader>Tournament Points Distribution</SubHeader>
          <p>
            Looking at the distribution of tournament points over the season, we
            can see some interesting patterns that have influenced our decisions
            for the next season. The chart above shows how different tournament
            types contributed to the overall point distribution throughout the
            year.
          </p>
          <SubHeader>Participation</SubHeader>
          <p>
            While the system has been well-received, we've only seen about 230
            players opt in to into the leaderboard. There are 834 users who have
            a tournament result, which means 834 users have claimed a tournament
            result on ABR in the 2024 season. This is an opt-in rate of only
            27.5% and something I would like to improve next year. If we look at
            players with 4 or more claims, we see an opt-in rate of 57.6%. So
            for the more competitive players, Beanstalk participation is higher,
            which certainly makes sense.
            <Sep className="mt-4" />
            This suggests to me that I, and others, could be doing a better job
            of getting the word out there and lowering the barrier to entry. I
            think the regional tagging feature could help with this where you
            can make small local leaderboards and create more excitement and
            competition amoungst your local meta. This would drive more players
            to opt in and participate, but not care about being on the global
            leaderboard. However, basically no one actually uses this feature. I
            have some ideas for how to make this system approachable for more
            players, but would love to hear your thoughts on this as well.
            <Sep className="mt-4" />I understand that for many, being on a
            leaderboard isn't for them. They just want to play and not be
            evaluated by their performance.I completely respect that decision
            and no one should ever feel pressured to participate!
          </p>
          <SubHeader>Tournament Limits</SubHeader>
          <p>
            I think the current tournament limits was actually great. Gave
            people an opportunity to attend multiple nationals and COs and grind
            for their best results. Also, allowing 5 COs meant the more
            approachable online tournaments like Maninthemoon's Showdown
            tournaments could give some big beans, promoting even more
            competitive tournaments.
          </p>
          <SubHeader>Website</SubHeader>
          <p>
            I've been pretty happy wiht the website overall. The design is good,
            not great. It works on mobile and desktop. It's fast enough and from
            a reliability perspective, I have done very little in terms of
            debugging issues once they land on prod. I've had a lot of fun
            building it and I'm pretty proud of what I've built.
            <Sep className="mt-4" />
            One thing that I'd like to improve is the accessibility of the
            website. I haven't done any testing with screen readers and I
            suspect it just doesn't work for the visually impaired. Sorry
            Brandon! I want to get around to this at some point.
          </p>
          <SubHeader>Point Distribution</SubHeader>
          <p>
            I have received a good amount of feedback about the ranking system
            and I agree that there are some issues with it. Here's a few I've
            observed over the season
          </p>
          <ul className="mt-2 list-inside list-disc">
            <li>
              The <Link to="/blog/beans#tournament-tiers">baseline points</Link>{" "}
              system occasionally resulted in disproportionate rewards for
              smaller tournaments (like a 12-person Nationals earning 124
              points)
            </li>
            <li>
              <Link to="/tournament/4331">Worlds</Link> was too heavily
              weighted, making it nearly essential to attend for top leaderboard
              placement. Also, <Link to="/blog/cbi-2024">CBI</Link> was too
              heavily weighted as well.
            </li>
            <li>
              This year's{" "}
              <Link to="/tournament/4331">Intercontinental tournament</Link>{" "}
              provided 10-15% of potential total points, which may have been too
              generous given it's exclusive nature
            </li>
          </ul>
          <Sep className="mt-4" />
          Drilling into the total beans allocated by type, we can clearly see
          how big each major tournament is. Worlds clearly sticks out as the
          biggest allocation of beans throughtout the year and continentals
          coming in second. While I believe this is to be expected, I do think
          that the point distribution is a bit skewed. I think we should reduce
          the spikes next year which should shorten the distance between players
          on the leaderboard.
          <div className="my-4">
            <TournamentTrendsChart seasonId={2} height={400} />
          </div>
        </Section>

        <Section title="Changes for the 2025 Season">
          <p>
            To address these issues above, I'm implementing several significant
            changes:
          </p>
          <SubHeader>Baseline Points</SubHeader>
          <p>
            The first change is to remove the baseline points system entirely.
            This means that all tournaments will now have the same baseline
            point distribution of 0. All points will be allocated based on the
            number of players in the tournament. This should hopefully create
            more equitable point distributions across all tournaments. No more
            small tournaments throwing out huge beans.
          </p>

          <SubHeader>Tournament Limits</SubHeader>
          <p>
            I would make a change to Intercontinental tournament payouts,
            however they aren't going to exist in the coming organized play
            season. So, problem solved! I will need to add limits for the new
            District Championships and Megacity tournaments, but will set these
            once we get closer and have a better sense for how many and how
            accessible they will be. Stay tuned for another blog post on this.
          </p>
          <SubHeader>Scaling by Tournament Size</SubHeader>
          <p>
            This is the biggest change and the main way we'll be allocating
            beans throughout the season. Just like last season, each tournament
            type will have a different multiplier of beans per player. Here's
            the 2025 beans per player multiplier for each tournament type:
          </p>
          {rankingConfig && (
            <ul className="mt-4 list-inside list-disc">
              {Object.entries(rankingConfig.tournament_configs).map(
                ([key, value]) => (
                  <li key={key}>
                    {key}: {value.points_per_player}
                  </li>
                ),
              )}
            </ul>
          )}
        </Section>

        <Section title="Looking Forward">
          <p>These changes aim to create a more balanced system where:</p>
          <ul className="my-4 list-inside list-disc">
            <li>Consistent performance throughout the season is rewarded</li>
            <li>
              Tournament size is more appropriately reflected in point
              distribution
            </li>
            <li>The gap between different tournament types is reduced</li>
            <li>
              Points are more equitably distributed across the competitive
              season
            </li>
          </ul>
          <p>
            The goal remains the same: to provide an engaging competitive
            framework that motivates players to participate in more events and
            stay engaged throughout the entire season. I believe these
            adjustments will help create an even better experience for Season 2.
          </p>
        </Section>
        <Section title="Preview these changes">
          In order to get a good sense of how these changes will affect the
          leaderboard, I've created a preview environment that is using the
          season 3 config, but for season 2 results. Go check them out now and
          let me know how it all feels!
        </Section>
        <Section title="Lima Beans">
          Last and certainly now least -- I am happy to announce that the new
          season is live! Introducing the name for the 2025 season
          <div className="flex justify-center">Lima</div>
        </Section>
      </BlogContent>
    );
  },
};
