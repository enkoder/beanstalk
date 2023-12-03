import { PageHeading } from "../stories/PageHeader";
import { Anchor } from "../stories/Anchor";
// @ts-ignore
import whitepaper from "../../assets/whitepaper.pdf";
import { Sep } from "../stories/Sep";
import { Link } from "../stories/Link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload, faHeart } from "@fortawesome/free-solid-svg-icons";

type Section = {
  title: string;
  id: string;
  content: JSX.Element;
};

const SECTIONS: Section[] = [
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
        known as the 80/20 rule and it can be found in a number of places. This
        principle was a motivating factor for me to pursue an exponential
        decaying distribution, or a power law function and not something linear
        or bucketed. Initially, my goal was to set a configurable % of total
        beans that the top % of players should receive. For example, I wanted to
        set a target of the top 20% of players should receive 80% of the total
        beans. I would then calculate the appropriate rate of decay based upon
        those constraints. This was mostly working, but I wanted to find a
        simpler solution and took to researching other strategies, articles, and
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
        parts of it and and the paper clearly states the requirements and goal
        of the system much better than I could. A notable difference is is that
        I am only implementing the first part, without adding "nice numbers" or
        a minimum bean value to the algorithm. Their strategy is to use a flat
        percentage for the first place player which greatly simplified the
        algorithm. The only required inputs into the function are the beans for
        first place and the total beans being distributed. From these values,
        you can use a binary search tree to find an accurate value of Alpha
        which is used to calculate the rate of exponential decay.
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
        As stated in the section above, we need to set a flat percentage to go
        to first place. Winning a tournament is very hard, and I believe winners
        of large tournaments should be heavily rewarded. However, the payout
        shouldn't be so large that winning large tournaments creates such a
        massive gap. There's a sweet spot here, and currently we landed on 20%.
        At this value, second place receives ~10% and third place gets ~%7 for a
        tournament with 100 players, which creates high stakes for a tournament
        to win first, but doesn't create a huge separation between first and the
        rest of the players. We're coming for you{" "}
        <Link to={"/results/Sokka"}>
          Sokka <FontAwesomeIcon className={"text-red-700"} icon={faHeart} />{" "}
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
        The tournament type or tier, sets the baseline total beans available for
        distribution. For example, winning the World Championship will payout
        more beans to players than winning a National Championship. We achieve
        this goal by implementing a tiered bean system where the baseline beans
        correspond to the various tournament types.
        <Sep className={"my-2"} />
        You can find the tiered bean values defined in{" "}
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
    title: "Tournament Size",
    id: "tournament-size",
    content: (
      <p className={"pl-2"}>
        Winning a Nationals tournament with 100 players should award more beans
        than a 16-person Nationals. The difference in bean totals should be
        grounded in the difficulty required to win that tournament, meaning
        winning a large tournament should reward the players appropriately.
        <Sep className={"my-2"} />
        After some trial and error, I settled on a dead simple approach -
        increase the total available beans by 20 per player. This seemed to
        scale well for the typical number of tournament players we see in
        Netrunner tournaments.
        <Sep className={"my-2"} />
        Again, head over to the{" "}
        <Link className={"text-lg text-cyan-600"} to={"/sim"}>
          Sim
        </Link>{" "}
        to take a look at how the bean values change as you add more players.
      </p>
    ),
  },
  {
    title: "Top Half Winners",
    id: "top-half-winners",
    content: (
      <p className={"pl-2"}>
        Making the cut is such a rewarding experience for people. Of course,
        everyone wants to get 1st, but when you make the top cut, it's a special
        feeling. To recreate this feeling, we have implemented a top-half cutoff
        where you need to make top half of the tournament in order to receive
        any beans. This should create exciting experiences for people who don't
        make the cut but perform well enough to make the top half. For large
        tournaments, the beans acquired by making top half is still significant.
        This mechanic also creates a better concentration of beans for the top
        winners.
      </p>
    ),
  },
  {
    title: "Minimum Players",
    id: "minimum-players",
    content: (
      <p className={"pl-2"}>
        This is arbitrarily set to 10 for now, but we will need to set an
        appropriate limit on number of players. This is relevant for small
        tournaments like Nationals which do happen in the UK. The way we make
        attempt to make this fair is by scaling beans off of the number of
        players while also setting an appropriate baseline number of beans. We
        will have to keep an eye on this value. We could set a higher floor, but
        we could also scale the added beans per player on a tiered basis. For
        the smaller tournaments like some nationals, this would have a lower
        base bean totals but have a higher scaling method. Again, for now I'm
        not going to change this and keep it at a fixed threshold.
      </p>
    ),
  },
  {
    title: "Intercontinentals",
    id: "interconts",
    content: (
      <p className={"pl-2"}>
        Intercontinentals is such a fun tournament. Top 4 of each continental
        dukes it out for fame and the prestigious award being able to design a
        card with <Link to={"https://nullsignal.games/"}>NSG</Link>. Since it's
        such a fun tournament for the community, we've decided that there should
        be some bean action associated with it.
        <Sep className={"mb-4"}></Sep>
        To increase the stakes and ramp up the fun, the Intercontinental payout
        structure is winner takes all! You can find the current number of beans
        given to first place on the <Link to={"/code"}>Code</Link> page.
      </p>
    ),
  },
];

export function Beans() {
  return (
    <div
      className={"mt-4 flex h-[100svh] flex-row justify-center overflow-hidden"}
    >
      <div className={"m-4 flex w-5/6 flex-col"}>
        <PageHeading text={"Beans"} includeUnderline={true} />
        <div className={"overflow-auto pt-4 text-gray-400"}>
          <text className={"text-gray-400"}>
            This goal of this page is to share the thought process behind the
            tournament scoring system. Our goal is to be as transparent as
            possible and equip everyone with an equitable level of context and
            information. We are always looking for feedback to make the
            Beanstalk better, if you have questions, please reach out to the dev
            team.
          </text>

          {SECTIONS.map((s) => (
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
              by <Link to={"https://github.com/enkoder"}>enkoder</Link>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
