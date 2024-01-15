import { faHeart } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
// @ts-ignore
import whitepaper from "../../assets/whitepaper.pdf";
import { LeaderboardService, RankingConfig } from "../client";
import { Anchor } from "../components/Anchor";
import { Link } from "../components/Link";
import { PageHeading } from "../components/PageHeader";
import { Sep } from "../components/Sep";
import { capStr } from "../util";

type Section = {
  title: string;
  id: string;
  content: JSX.Element;
};

export function Beans() {
  const [sections, setSections] = useState<Section[]>([]);
  const { data: rankingConfig } = useQuery<RankingConfig>({
    queryKey: ["rankingConfig"],
    queryFn: () => LeaderboardService.getGetRankingConfig(),
  });

  useEffect(() => {
    setSections([
      {
        title: "Decaying distribution",
        id: "distribution-function",
        content: (
          <p>
            The{" "}
            <Link to={"https://en.wikipedia.org/wiki/Pareto_principle"}>
              Pareto Principle
            </Link>{" "}
            states that 20% of the input yields 80% of the output. This is also
            known as the 80/20 rule and it can be found in a number of places.
            This principle was a motivating factor for me to initially pursue an
            exponential decaying distribution, or a power law function and not
            something linear or bucketed. Initially, my goal was to set a
            configurable % of total beans that the top % of players should
            receive. For example, I wanted to set a target of the top 20% of
            players should receive 80% of the total beans. I would then
            calculate the appropriate rate of decay based upon those
            constraints. This was mostly working, but I wanted to find a simpler
            solution that players could reason about.
            <Sep className={"mb-4"} />
            The current algorithm is much simpler, but still follows a
            non-linear decaying distribution. We set a bean value for first
            place and then look for a rate of decay where the last player
            receives less than
            {rankingConfig?.bottom_threshold}.
            <Sep className={"mb-4"} />
            You can find a well documented and tested algorithm over at the{" "}
            <Link to={"/code"}>Code</Link> page.
          </p>
        ),
      },
      {
        title: "Tournament Tiers",
        id: "tiers",
        content: (
          <p className={"pl-2"}>
            The Netrunner tournament season follows a natural tiered progression
            with COs, Nationals, Continentals, and then Worlds. The bean value
            distributed at each level needs to intuitively match the level of
            the tournament. For example, Continentals should almost always
            distribute more beans than continentals. We achieve this goal by
            implementing a tiered bean system where a baseline bean value
            correspond to the various tournament types.
            <Sep className={"my-2"} />
            The following tiers are
            <ul className={"list-disc px-8"}>
              {tournamentConfigs.map((tc) => (
                <li>
                  <div className={"flex w-full flex-row"}>
                    <span className={"w-5/6 sm:w-4/6 lg:w-2/6"}>
                      {capStr(tc.code)}
                    </span>
                    <span className={"w-1/6"}>{tc.baseline_points}</span>
                  </div>
                </li>
              ))}
            </ul>
            <Sep className={"my-2"} />
            You can find this configured in{" "}
            <Link className={"text-lg text-cyan-600"} to={"/code"}>
              Code
            </Link>
            , or you can view them in the{" "}
            <Link className={"text-lg text-cyan-600"} to={"/sim"}>
              Sim
            </Link>
            .
          </p>
        ),
      },
      {
        title: "Scaling Beans on Tournament Size",
        id: "tournament-size",
        content: (
          <p className={"pl-2"}>
            Winning a large Nationals tournament with 100 players should award
            more beans than a 16-person Nationals. The difference in bean totals
            should be grounded in the difficulty required to win that
            tournament. Additionally, instead of scaling beans by a flat value,
            we use different values for tournament types. This is incredibly
            helpful to balance COs and other tournament types.
            <Sep className={"my-2"} />
            The current beans added per player is as follows follows
            <ul className={"list-disc px-8"}>
              {tournamentConfigs.map((tc) => (
                <li>
                  <div className={"flex w-full flex-row"}>
                    <span className={"w-5/6 sm:w-4/6 lg:w-2/6"}>
                      {capStr(tc.code)}
                    </span>
                    <span className={"w-1/6"}>{tc.points_per_player}</span>
                  </div>
                </li>
              ))}
            </ul>
            <Sep className={"my-2"} />
            Again, head over to the{" "}
            <Link className={"text-lg text-cyan-600"} to={"/sim"}>
              Sim
            </Link>{" "}
            to take a look at how the bean values change as you add more
            players.
          </p>
        ),
      },
      {
        title: "Beans for 1st Place",
        id: "first-place",
        content: (
          <p className={"pl-2"}>
            Setting a well-known bean value for first place makes it easy to
            reason about the system. Based upon the inputs discussed above, we
            calculate beans for first place as follows
            <Sep className={"mt-4"} />
            First Place Points = Baseline Points + (Beans Per Players * Num
            Players)
            <Sep className={"mt-4"} />
            The following bean values are for 50 person tournaments of each
            type.
            <ul className={"list-disc px-8"}>
              {tournamentConfigs.map((tc) => (
                <>
                  {tc.code !== "intercontinental championship" && (
                    <li>
                      <div className={"flex w-full flex-row"}>
                        <span className={"w-5/6 sm:w-4/6 lg:w-2/6"}>
                          {capStr(tc.code)}
                        </span>
                        <span className={"w-1/6"}>
                          {tc.baseline_points + (50 + tc.points_per_player)}
                        </span>
                      </div>
                    </li>
                  )}
                </>
              ))}
            </ul>
          </p>
        ),
      },
      {
        title: "Beans for top cut",
        id: "cut",
        content: (
          <p className={"pl-2"}>
            Top cut winners will receive and additional chunk of beans using the
            same decaying algorithm used to determine swiss payouts. We set the
            initial value by taking a flat percentage from the first place bean
            total and finding an acceptable rate of decay where the last person
            in the cut makes 10% of what the first place receives. You can see
            the additional beans awarded due to cut placement on the{" "}
            <Link to={"/sim"}>Sim</Link> page. It's the number in parenthesis in
            the beans column.
            <Sep className={"mt-4"} />
            First Place Cut Points = First place swiss points * configured
            percentage / 100
            <Sep className={"mt-4"} />
            The following bean values are for 50 person tournaments of each
            type.
            <ul className={"list-disc px-8"}>
              {tournamentConfigs.map((tc) => (
                <>
                  {tc.code !== "intercontinental championship" && (
                    <li>
                      <div className={"flex w-full flex-row"}>
                        <span className={"w-5/6 sm:w-4/6 lg:w-2/6"}>
                          {capStr(tc.code)}
                        </span>
                        <span className={"w-1/6"}>
                          {" "}
                          {tc.additional_top_cut_percentage}{" "}
                        </span>
                      </div>
                    </li>
                  )}
                </>
              ))}
            </ul>
          </p>
        ),
      },
      {
        title: "Top % Winners",
        id: "top-half-winners",
        content: (
          <p className={"pl-2"}>
            Making the cut is such a rewarding experience. Of course, everyone
            wants to get 1st, but making the cut feels great gives you another
            goal to shoot for. To recreate this feeling, we have implemented a
            configurable top-% cutoff where you need to hit a threshold in order
            to receive any beans. For major tournaments, this value is set to
            50%. This should create exciting experiences for people who don't
            make the cut but perform well enough to make the top half. For large
            tournaments, the beans acquired by making top half is still
            significant! This mechanic also creates a better concentration of
            beans for the top winners rewarding consistently solid paly.
            <Sep className={"mt-4"} />
            <ul className={"list-disc px-8"}>
              {tournamentConfigs.map((tc) => (
                <li>
                  <div className={"flex w-full flex-row"}>
                    <span className={"w-5/6 sm:w-4/6 lg:w-2/6"}>
                      {capStr(tc.code)}
                    </span>
                    <span className={"w-1/6"}>
                      {tc.percent_receiving_points}%
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </p>
        ),
      },
      {
        title: "Minimum Players",
        id: "minimum-players",
        content: (
          <p className={"pl-2"}>
            Circuit Openers and Nationals can be as small as less than 10 and
            get up to 100. In order to keep things balanced we've set minimum
            player limits.
            <Sep className={"mt-4"} />
            <ul className={"list-disc px-8"}>
              {tournamentConfigs.map((tc) => (
                <>
                  {(tc.code === "national championship" ||
                    tc.code === "circuit opener") && (
                    <li>
                      <div className={"flex w-full flex-row"}>
                        <span className={"w-5/6 sm:w-4/6 lg:w-2/6"}>
                          {capStr(tc.code)}
                        </span>
                        <span className={"w-1/6"}>
                          {tc.min_players_to_be_legal}
                        </span>
                      </div>
                    </li>
                  )}
                </>
              ))}
            </ul>
          </p>
        ),
      },
      {
        title: "Limits Per Tournament Type",
        id: "tournament-limit",
        content: (
          <p className={"pl-2"}>
            We don't want the Beanstalk to be "pay-to-win". For those that are
            fortunate enough to be able to travel to every Continental and
            National Tournament, they shouldn't get points for every tournaments
            as this will create a clear advantage over those that cannot. To
            make things more equitable across a season, we've implemented a
            limit per tournament type. A player can attend as many tournaments
            as they like, and we will take the top N tournaments for that type.
            <Sep className={"my-4"} />
            The following limits are
            <ul className={"list-disc px-8"}>
              {tournamentConfigs.map((tc) => (
                <li>
                  <div className={"flex w-full flex-row"}>
                    <span className={"w-5/6 sm:w-4/6 lg:w-2/6"}>
                      {capStr(tc.code)}
                    </span>
                    <span className={"w-1/6"}>Limit {tc.tournament_limit}</span>
                  </div>
                </li>
              ))}
            </ul>
          </p>
        ),
      },
    ]);
  }, [rankingConfig]);

  const tournamentConfigs = Object.values(
    rankingConfig?.tournament_configs || {},
  );

  return (
    <>
      <PageHeading text={"Beans"} includeUnderline={true} />
      <div className={"overflow-auto pt-4 text-gray-400"}>
        <text className={"text-gray-400"}>
          This goal of this page is to share the thought process behind the
          tournament scoring system. Our goal is to be as transparent as
          possible and equip everyone with an equitable level of context and
          information. We are always looking for feedback to make the Beanstalk
          better, if you have questions, please reach out to the dev team.
        </text>

        {sections.map((s) => (
          <>
            <Anchor id={s.id} className={"mb-2 mt-4"}>
              {" "}
              {s.title}
            </Anchor>
            {s.content}
            <Sep className={"my-4"} showLine={true} />
          </>
        ))}
        <div className={"my-32 flex flex-row justify-center"}>
          <span className={"text-lg"}>
            Made with{" "}
            <FontAwesomeIcon
              className={"text-xl text-red-700"}
              icon={faHeart}
            />{" "}
            by <Link to={"https://github.com/enkoder/beanstalk"}>enkoder</Link>
          </span>
        </div>
      </div>
    </>
  );
}
