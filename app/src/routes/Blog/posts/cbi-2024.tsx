import { Link } from "../../../components/Link";
import { Sep } from "../../../components/Sep";
import { BlogContent, Section } from "../components/BlogSections";
import type { BlogPost } from "../types";

export const CBI2024Post: BlogPost = {
  id: "cbi-2024",
  title: "CBI for the 2024 season",
  date: "2024-02-02",
  showTOC: true,
  showInList: true,
  component: ({ onSectionsChange }) => {
    return (
      <BlogContent onSectionsChange={onSectionsChange}>
        <Section title="Circuit Breaker Invitational">
          CBI marked the close of the first full season of competitive play on
          the Beanstalk! Congrats to <Link to={"/results/Kikai"}>Kikai</Link>{" "}
          for taking it down and congrats to everyone else who played. Everyone
          made it to CBI because you took down a CO+ and that's awesome!
          <Sep className="mt-4" />
          CBI drew a huge crowd with 139 players. NSG OP team wisely decided to
          split the swiss rounds into 3 pods, one for each major time zone. This
          was great for making CBI accessible but made it difficult for the
          Beanstalk to track the tournament on the leaderboard. I somehow needed
          to take all three swiss rounds and a top cut and merge them together
          to get a one tournament with ordered results. Additionally, the pods
          had different number of rounds, so I couldn't simply merge the players
          by points, sos, and esos. It took some iteration, but I'm glad to say,
          we got there.
          <Sep className="mt-4" />
          In order to sort the swiss results, I used a normalized point system
          where I rank the players by the total percent of points available. For
          example:
          <ul className="list-inside list-disc">
            <li>
              If you scored 18 points in 7 round APAC, you would have scored 18
              / (7 * 3) * 100 = 85.7% of the points available.
            </li>
            <li>
              If you scored 21 points in 8 round EMEA, you would have scored 21
              / (8 * 3) * 100 = 87.5% of the points available.
            </li>
          </ul>
          In this way, if you had the same number of losses in EMEA and
          Americas, you would have scored higher than if you had the same number
          of losses in APAC. If the normalized score was the same, then I broke
          the tie with their sos and extended sos.
          <Sep className="mt-4" />
          Implementing this was also pretty tricky. I could have manually
          entered the results, but I wanted to give players an opportunity to go
          back and claim their decks without me having to manually update the
          results again. Using the same ingestion system was important to me in
          this case. This meant that I needed to pull data from{" "}
          <Link to="https://tournaments.nullsignal.games">
            tournaments.nullsignal.games
          </Link>{" "}
          and merge the results together as this was the only way to get the
          number of points, sos, and esos.
          <Sep className="mt-4" />
          With all that being said - I'm happy to announce that the results are
          in and you can find the final tournament results for CBI here
          <Sep className="mt-4" />
          <div className="flex w-full justify-center">
            <Link to="/results/4689">CBI 2024 Results</Link>
          </div>
        </Section>
      </BlogContent>
    );
  },
};
