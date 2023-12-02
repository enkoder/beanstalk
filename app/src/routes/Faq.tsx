import { PageHeading } from "../stories/PageHeader";
import { Anchor } from "../stories/Anchor";
// @ts-ignore
import doggo from "../../assets/doggo.png";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart } from "@fortawesome/free-solid-svg-icons";

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
        , people call the card{" "}
        <a href={"https://netrunnerdb.com/en/card/01098"}>
          Beanstalk Royalties
        </a>{" "}
        "green beans". Count up those beans, because you're going to need them
        in order to climb the rankings to the top of the Beanstalk.
      </p>
    ),
  },
  {
    title: "How are Beans calculated?",
    id: "how-are-beans-calculated",
    content: (
      <p>
        There are a few pages dedicated to transparency around how points are
        calculated, including a view into the full algorithm. There's also a
        page where you can simulate a tournament and see the point distribution
        for yourself. We want to be as transparent as possible so everyone knows
        how to climb the beanstalk.
        <div className={"mt-4 flex flex-col"}>
          Check it out!
          <Link className={"ml-4 text-cyan-500"} to={"/beans"}>
            https://netrunner-beanstalk.net/beans
          </Link>
          <Link className={"ml-4 text-cyan-500"} to={"/sim"}>
            https://netrunner-beanstalk.net/sim
          </Link>
          <Link className={"ml-4 text-cyan-500"} to={"/code"}>
            https://netrunner-beanstalk.net/code
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
        got turning. The idea of building a global leaderboard complete with
        seasons and a dynamic point system was just too exciting to let go. The
        original goal was to just build a leaderboard for the pro circuit, but I
        totally got nerd sniped by this project resulting in me jamming on this
        during nights and weekends. I had a lot of fun building the website, and
        I hope the community enjoys it as well!
      </p>
    ),
  },
  {
    title: "What's next for the project?",
    id: "what-is-next",
    content: (
      <p>
        My long term vision for the Beanstalk is to deliver a comprehensive
        seasonal ranking leaderboard for all online games played on
        <a className={"text-cyan-500"} href={"https//jinteki.net"}>
          {" "}
          jinteki.net
        </a>
        . The ranking system would be based on an ELO-like system similar to
        Chess. Both ranked and unranked games would be recorded and logged,
        affecting your current season ranking. I also envision access to
        seasonal stats, all-time stats, and analytical tools for evaluating your
        performance throughout your Netrunner career. Win/loss rate is a given,
        but I would love to see a detailed analysis of your win rate against
        specific IDs and factions, as well as win-loss rates against other
        players. This is an ambitious goal, but I'm optimistic. I believe this
        game has longevity, and I'm committed to creating an exciting experience
        for the community to keep folks engaged and coming back for more.
        <br />
        Can you climb the Beanstalk and reach #1 next season?!
      </p>
    ),
  },
  {
    title: "Leaderboards and toxic communities",
    id: "toxicity",
    content: (
      <p>
        It's true that for some games, leaderboards can contribute to a more
        toxic gaming experience. I totally understand and acknowledge this.
        However, I believe that Netrunner is a very special community that does
        not stand for toxicity. The game is what got us all in the door, but
        it's the people that keep us all going. I am hopeful that the Beanstalk
        will be a fun energizing force in the competitive scene. One that will
        keep us all coming back season after season.
        <br />
        Please don't hesitate to share your concerns and feedback about the
        Beanstalk and how you see it shaping the competitive scene. This is our
        game, and we all want to make it the best we can.
      </p>
    ),
  },
  {
    title: "OMG this is amazing, how can I help??",
    id: "help-needed",
    content: (
      <>
        <p>
          PLEASE DO! This is an actual picture taken of me during active
          development lol
          <img
            className={"mb-8 mt-4"}
            src={doggo}
            alt={"I have no idea what I'm doing"}
          ></img>
          This is the first website I have ever made. While it's been a project
          of passion and I'v learned a ton, it's still my first, so no doubt
          many things can be improved. I would love to learn from you!!
          <br />
        </p>
        <div className={"mb-8 mt-4"}>
          <text>Here are some ways you can help</text>
          <ul className={"my-2 ml-4 list-inside list-disc"}>
            <li>
              Design - a11y, better mobile, colors, typography, etc. Let's go
              nuts on an improved design system.
            </li>
            <li>
              Copy - Writing can always be improved, if you see some things that
              should be tweaked, please feel empowered to do so.
            </li>
            <li>
              Features - I have a ton of ideas and would really like co-authors
              on the project.
            </li>
            <li>
              Testing - I don't have many automated tests yet, so I still rely
              on manual tests when rolling out large changes. It would be great
              if I could get help on testing product changes.
            </li>
            <li>
              Promotion - Share the hype and excitement over the Beanstalk!
            </li>
          </ul>
        </div>
        All of the code is open source and available at the
        <a
          className={"font-bold text-cyan-600"}
          href={"https://github.com/enkoder/beanstalk"}
        >
          {" "}
          Beanstalk Github{" "}
        </a>
        page.
      </>
    ),
  },
];

export function Faq() {
  // TODO: Figure out how to link to an anchor
  return (
    <div
      className={"mt-4 flex h-[100svh] flex-row justify-center overflow-hidden"}
    >
      <div className={"m-4 flex w-5/6 flex-col text-gray-300"}>
        <PageHeading
          includeUnderline={true}
          text={"Frequently Asked Questions"}
        />
        <div className={"overflow-auto"}>
          {QUESTIONS.map((question) => (
            <>
              <Anchor id={question.id} className={"mb-2 mt-4"}>
                {question.title}
              </Anchor>
              <p className={"pl-2 text-gray-400"}> {question.content}</p>
            </>
          ))}
        </div>
        <div className={"my-32 flex flex-row justify-center"}>
          <span className={"text-lg"}>
            Made with{" "}
            <FontAwesomeIcon
              className={"text-xl text-red-700"}
              icon={faHeart}
            />{" "}
            by{" "}
            <a className={"text-cyan-600"} href={"https://github.com/enkoder"}>
              enkoder
            </a>
          </span>
        </div>
      </div>
    </div>
  );
}
