//import "./Faq.css";
import { PageHeading } from "../stories/PageHeader";
import { Anchor } from "../stories/Anchor";
import { Link } from "react-router-dom";

type Question = {
  title: string;
  id: string;
  content: JSX.Element;
};

const QUESTIONS: Question[] = [
  {
    title: "Beans? What are beans?",
    id: "what-are-beans",
    content: (
      <p>
        Beans are points, the unit of measurement we use here at the Beanstalk.
        In some circles, primarily close to{" "}
        <a
          className={"text-cyan-500"}
          href={"https://netrunnerdb.com/en/profile/6502/ctz"}
        >
          CTZ
        </a>
        , people call the card Beanstalk Royalties "green beans". Count up those
        beans, because you're going to need them in order to climb the rankings
        to the top of the Beanstalk.
      </p>
    ),
  },
  {
    title: "How are Beans calculated?",
    id: "how-are-beans-calculated",
    content: (
      <p>
        We've got a great page that goes deep on how beans are calculated, shows
        the full algorithm, and has a tool to simulate the payout based upon a
        few inputs sources. We want to be as transparent as possible so everyone
        knows how to climb the beanstalk. Check it out!
        <div className={"mt-4 flex justify-center"}>
          <Link className={"text-cyan-500"} to={"/beans"}>
            https://netrunner-beanstalk.net/beans
          </Link>
        </div>
      </p>
    ),
  },
  {
    title: "What's the origin story of Beanstalk",
    id: "origin-story",
    content: (
      <p>
        During discussions about starting a pro-circuit for Netrunner, my
        <a
          className={"text-cyan-500"}
          href={"https://netrunnerdb.com/en/card/34008"}
        >
          {" "}
          wheels
        </a>{" "}
        got spinning. The ideas of building a global leaderboard complete with
        seasons and a dynamic point system was just too exciting to let go. The
        original goal was to just build a leaderboard for the pro circuit, but I
        totally got nerd sniped by this project resulting in me jamming on this
        during nights and weekends. I had a lot of fun building the website, and
        I hope the community enjoys it as well.
      </p>
    ),
  },
  {
    title: "What's next for the project?",
    id: "what-is-next",
    content: (
      <p>
        My dream is to create a comprehensive seasonal ranking leaderboard for
        all online games played on
        <a className={"text-cyan-500"} href={"https//jinteki.net"}>
          {" "}
          jinteki.net
        </a>
        , independent of tournaments. The ranking would be based on an ELO-like
        system. Both ranked and unranked games would be recorded and logged,
        affecting your current season ranking. I also envision access to
        seasonal stats, all-time stats, and analytical tools for evaluating
        data. This includes not just your win/loss rate, but also a detailed
        analysis of your win rate against specific runners and corporations, as
        well as win-loss rates against other players. This is an ambitious goal,
        but I'm optimistic. I believe this game has longevity, and I'm committed
        to creating an exciting experience for the community.
      </p>
    ),
  },
];

export function Faq() {
  // TODO: Figure out how to link to an anchor
  return (
    <div
      className={"mt-4 flex h-[100svh] flex-row justify-center overflow-auto"}
    >
      <div className={"m-4 flex w-5/6 flex-col text-gray-300"}>
        <PageHeading text={"Frequently Asked Questions"} />
        {QUESTIONS.map((question) => (
          <>
            <Anchor navToPath={"faq"} id={question.id} className={"mb-2 mt-4"}>
              {question.title}
            </Anchor>
            <p className={"pl-2 text-gray-400"}> {question.content}</p>
          </>
        ))}
      </div>
    </div>
  );
}
