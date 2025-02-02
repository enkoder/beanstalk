import * as _ from "react";
import type { ReactNode } from "react";
import { Link } from "../../../components/Link";
import { Sep } from "../../../components/Sep";
import { BlogContent, Section } from "../components/BlogSections";
import type { BlogPost } from "../types";

function SubHeader({ children }: { children: ReactNode }) {
  return <h3 className="mt-4 font-bold text-cyan-600 text-xl">{children}</h3>;
}

export const SeasonReflectionsPost: BlogPost = {
  id: "2024-season-reflections",
  title: "Beanstalk 2024: Reflections and Proposed Changes",
  date: "2024-01-16",
  showTOC: true,
  showInList: true,
  component: ({ onSectionsChange }) => {
    return (
      <BlogContent onSectionsChange={onSectionsChange}>
        <Section title="Green Beans">
          CBI marked the close of the first full season of competitive play on
          the Beanstalk! Congrats to <Link to={"/results/Kikai"}>Kikai</Link>{" "}
          for taking it down and congrats to rest of the players in the top cut.
          <Sep className="mt-4" />
          CBI will likely draw a huge crowd and at 2 beans per player + 200
          baseline beans, there's still a lot of beans to snatch up that could
          really shake up the that could really shake up the leaderboard. I know
          a lot of people will be vying for a higher position on the leaderboard
          and not just playing for the top cut at CBI.
          <Sep className="mt-4" />
          This type of drama and an emotional connection to the Beanstalk is
          exactly what I had in mind when making the Beanstalk. When I set out
          to make the Beanstalk, I had a few ideas in mind. First, I was just
          really interested in the technical challenge of building a website
          that could do this. I mostly work on tooling and backend systems, so
          learning UI and design was a fun new challenge for me. I love working
          with the Cloudflare Workers platform, so it was a great excuse to have
          some more fun.
          <Sep className="mt-4" />
          Beyond the technical nerd stuff, I wanted to give back to the
          competitive organized play scene. I've been playing competitive
          Netrunner since 2017 and love this community and game so much. In
          2018, our local meta had regionals season where PJ20 built a similar
          tool. He tracked results in a spreadsheet, allocated points based upon
          placement, and it created a thrilling year of Netrunner that still
          goes down as my favorite Netrunner season of all time. I wanted to
          recreate this experience and build a rich tool that helps facilitate
          an engaging competitive season.
          <Sep className="mt-4" />
          I'm glad to say that the Beanstalk has done just that. People have
          shared with me that they are going to more tournaments and also
          staying in tournaments longer without dropping. You can't drop once
          you're out of the cut, every bean matters!! It's been so fun and
          rewarding to hear all the great feedback and kind words from the
          community. It's been super fun, and I'm stoked to say that it's not
          going anywhere. I'm going to continue to invest in and improve the
          Beanstalk.
          <Sep className="mt-4" />
          2024 marks the first full year and I said in the FAQ, this first
          season is just a trial. I had no clue if I nailed it or not. After
          watching how this past season when down, I'm quite happy with most of
          it. That being said, there's some things that I didn't like and things
          I'd like to change. In this post, I'm going to reflect on the season
          and share some observations and changes I'm making for the next
          season. Let's jack in.
        </Section>

        <Section title="Observations">
          <SubHeader>Participation</SubHeader>
          <p>
            While the system has been well-received, we've only seen about 230
            players opt in to into the leaderboard. There were 834 users who
            have a tournament result logged in the Beanstalk, which means 834
            user have claimed a tournament result on ABR. This is only 27.5% and
            something I would like to improve next year. If we look at players
            with 4 or more claims though we see 57.6% of users have opted in to
            the leaderboard. So for the more competitive players, Beanstalk
            participation is higher. Still, I think we can do better here.
            <Sep className="mt-4" />
            Thi suggests to me that I and others could be doing a better job of
            getting the word out there and lowering the barrier to entry. I
            think the regional tagging feature could help with this where you
            can make small local leaderboards and create more excitement and
            competition amoungst your local meta. This would drive more players
            to opt in and participate, but not care about being on the global
            leaderboard.
            <Sep className="mt-4" />I understand that for many, being on a
            leaderboard isn't for them. I completely respect that decision and
            no one should feel pressured to participate!
          </p>
          <SubHeader>Website</SubHeader>
        </Section>

        <Section title="Point Distribution Issues" level={3}>
          <p>Our current point distribution system has revealed some flaws:</p>
          <ol>
            <li>
              The baseline points system occasionally resulted in
              disproportionate rewards for smaller tournaments (like a 12-person
              Nationals earning 120 points)
            </li>
            <li>
              The Worlds tournament was too heavily weighted, making it nearly
              essential for top leaderboard placement
            </li>
            <li>
              Intercontinental tournaments provided approximately 15% of
              potential total points, which may have been too generous given
              their exclusive nature
            </li>
          </ol>
        </Section>

        <Section title="Changes for Season 2">
          <p>
            To address these issues, we're implementing several significant
            changes:
          </p>
        </Section>

        <Section title="New Point System" level={3}>
          <ul>
            <li>Removing the baseline points system entirely</li>
            <li>
              Implementing a pure points-per-player ratio that varies by
              tournament type
            </li>
            <li>
              Reducing the overall point gap between different tournament types
            </li>
            <li>
              Adjusting Worlds tournament weighting to account for its naturally
              large attendance
            </li>
          </ul>
        </Section>

        <Section title="Tournament Structure" level={3}>
          <ul>
            <li>Removing Intercontinental tournaments from the system</li>
            <li>
              Maintaining current tournament limits:
              <ul>
                <li>3 Nationals</li>
                <li>1 Continental</li>
                <li>1 Worlds</li>
                <li>5 Circuit Openers</li>
              </ul>
            </li>
          </ul>
        </Section>

        <Section title="Looking Forward">
          <p>These changes aim to create a more balanced system where:</p>
          <ul>
            <li>
              Consistent performance throughout the season is better rewarded
            </li>
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
            stay engaged throughout the entire season. We believe these
            adjustments will help create an even better experience for Season 2.
          </p>
          <p>
            Stay tuned for more specific details about point calculations and
            tournament weightings as we get closer to the new season!
          </p>
        </Section>
      </BlogContent>
    );
  },
};
