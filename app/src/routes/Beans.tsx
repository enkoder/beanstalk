import { faDownload, faHeart } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
// @ts-ignore
import whitepaper from "../../assets/whitepaper.pdf";
import { LeaderboardService, RankingConfig } from "../client";
import { Anchor } from "../stories/Anchor";
import { Link } from "../stories/Link";
import { PageHeading } from "../stories/PageHeader";
import { Sep } from "../stories/Sep";
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
        title: "Exponential decaying distribution",
        id: "distribution-function",
        content: (
          <p>
            The{" "}
            <Link to={"https://en.wikipedia.org/wiki/Pareto_principle"}>
              Pareto Principle
            </Link>{" "}
            states that 20% of the input yields 80% of the output. This is also
            known as the 80/20 rule and it can be found in a number of places.
            This principle was a motivating factor for me to pursue an
            exponential decaying distribution, or a power law function and not
            something linear or bucketed. Initially, my goal was to set a
            configurable % of total beans that the top % of players should
            receive. For example, I wanted to set a target of the top 20% of
            players should receive 80% of the total beans. I would then
            calculate the appropriate rate of decay based upon those
            constraints. This was mostly working, but I wanted to find a simpler
            solution and took to researching other strategies, articles, and
            research papers.
            <Sep className={"py-2"} />
            Eventually I found a paper titled
            <Link to={"https://arxiv.org/pdf/1601.04203.pdf"}>
              {" "}
              Determining Tournament Payout Structures for Daily Fantasy Sports.{" "}
            </Link>{" "}
            (
            <Link to={whitepaper} download>
              Download <FontAwesomeIcon icon={faDownload} />
            </Link>
            )
            <Sep className={"mb-4"} />
            This paper is a great read. Please go read it as I have implemented
            parts of it and and the paper clearly states the requirements and
            goal of the system much better than I could. A notable difference is
            is that I am only implementing the first part, without adding "nice
            numbers" or a minimum bean value to the algorithm. Their strategy is
            to use a flat percentage for the first place player which greatly
            simplified the algorithm. The only required inputs into the function
            are the beans for first place and the total beans being distributed.
            From these values, you can use a binary search tree to find an
            accurate value of Alpha which is used to calculate the rate of
            exponential decay.
            <Sep className={"mb-4"} />
            You can find a well documented and tested algorithm over at the{" "}
            <Link to={"/code"}>Code</Link> page.
          </p>
        ),
      },
      {
        title: "Beans for 1st Place",
        id: "first-place",
        content: (
          <p className={"pl-2"}>
            As stated in the section above, we need to set a flat percentage to
            go to first place. Winning a tournament is very hard, and I believe
            winners of large tournaments should be heavily rewarded. However,
            the payout shouldn't be so large that winning large tournaments
            creates such a massive gap. There's a sweet spot here, and currently
            we landed on {(rankingConfig?.percent_for_first_place || 0) * 100}%.
            At this value, second place receives ~8% and third place gets ~%6.5
            for a tournament with 100 players, which creates high stakes for a
            tournament to win first, but doesn't create a huge separation
            between first and the rest of the players. We're coming for you{" "}
            <Link to={"/results/Sokka"}>
              Sokka{" "}
              <FontAwesomeIcon className={"text-red-700"} icon={faHeart} />{" "}
            </Link>
            <Sep className={"mt-4"} />
            Head over to the{" "}
            <Link className={"text-lg text-cyan-600"} to={"/sim"}>
              Sim
            </Link>{" "}
            and get a feel for yourself!
          </p>
        ),
      },
      {
        title: "Tournament Tiers",
        id: "tiers",
        content: (
          <p className={"pl-2"}>
            The tournament type or tier, sets the baseline total beans available
            for distribution. For example, winning the World Championship will
            payout more beans to players than winning a National Championship.
            We achieve this goal by implementing a tiered bean system where the
            baseline beans correspond to the various tournament types.
            <Sep className={"my-2"} />
            The following tiers are
            <ul className={"list-disc px-8"}>
              {tournamentConfigs.map((tc) => (
                <li>
                  <div className={"flex w-full flex-row"}>
                    <span className={"w-5/6 sm:w-4/6 lg:w-2/6"}>
                      {capStr(tc.code)}
                    </span>
                    <span className={"w-1/6"}>{tc.points}</span>
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
            tournament, meaning winning a large tournament should reward the
            players appropriately. After some trial and error, I settled on a
            dead simple approach - increase the total available beans by{" "}
            {rankingConfig?.extra_points_per_person} per player. This seemed to
            scale well for the typical number of players we see in Netrunner
            tournaments.
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
        title: "Top Half Winners",
        id: "top-half-winners",
        content: (
          <p className={"pl-2"}>
            Making the cut is such a rewarding experience for people. Of course,
            everyone wants to get 1st, but when you make the top cut, it's a
            special feeling. To recreate this feeling, we have implemented a
            top-half cutoff where you need to make top half of the tournament in
            order to receive any beans. This should create exciting experiences
            for people who don't make the cut but perform well enough to make
            the top half. For large tournaments, the beans acquired by making
            top half is still significant. This mechanic also creates a better
            concentration of beans for the top winners.
          </p>
        ),
      },
      {
        title: "Minimum Players",
        id: "minimum-players",
        content: (
          <p className={"pl-2"}>
            This is arbitrarily set to {rankingConfig?.min_players_to_be_legal}{" "}
            for now, but we will need to set an appropriate limit on number of
            players. We'll see how this value changes over time, but it needs to
            be small enough to keep things exciting for tournaments. The way we
            make attempt to make this fair is by scaling beans off of the number
            of players while also setting an appropriate baseline number of
            beans. There are various nobs we can tweak over time and we will
            re-examine this floor if necessary. If we see many smaller
            tournaments like Nationals where too many beans are getting
            distributed, we should raise this value and set a higher requirement
            for beans. This could also insensitive local metas to recruit and
            get more people to play!
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
      {
        title: "Intercontinentals",
        id: "interconts",
        content: (
          <p className={"pl-2"}>
            Intercontinentals is such a fun tournament. Top 4 of each
            continental dukes it out for fame and the prestigious award being
            able to design a card with{" "}
            <Link to={"https://nullsignal.games/"}>NSG</Link>. Since it's such a
            fun tournament for the community, we've decided that there should be
            some bean action associated with it.
            <Sep className={"mb-4"} />
            To increase the stakes and ramp up the fun, the Intercontinental
            payout structure is winner takes all! You can find the current
            number of beans given to first place on the{" "}
            <Link to={"/code"}>Code</Link> page.
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
