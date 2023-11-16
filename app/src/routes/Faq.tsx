import "./Faq.css";
import { Link } from "react-router-dom";

type Question = {
  title: string;
  content: JSX.Element;
};

const QUESTIONS: Question[] = [
  {
    title: "Beans? What are beans?",
    content: (
      <p>
        Beans are points, the unit of measurement we use here at the Beanstalk.
        In some circles, primarily close to{" "}
        <a href={"https://netrunnerdb.com/en/profile/6502/ctz"}>CTZ</a>, people
        call the card Beanstalk Royalties "green beans". Count up those beans,
        because you're going to need them in order to climb the rankings to the
        top of the Beanstalk.
      </p>
    ),
  },
  {
    title: "How are Beans calculated?",
    content: (
      <p>
        We've got a great page that goes deep on how beans are calculated, shows
        the full algorithm, and has a tool to simulate the payout based upon a
        few inputs sources. We want to be as transparent as possible so everyone
        knows how to climb the beanstalk. Check it out!
        <hr />
        <div style={{ display: "flex", justifyContent: "center" }}>
          <Link to={"/beans"}>https://netrunner-beanstalk.net/beans</Link>
        </div>
      </p>
    ),
  },
  {
    title: "What's the origin story of Beanstalk",
    content: (
      <p>
        During discussions about starting a pro-circuit for Netrunner, my
        <a href={"https://netrunnerdb.com/en/card/34008"}> wheels</a> got
        spinning. The ideas of building a global leaderboard complete with
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
    content: (
      <p>
        My dream is to create a comprehensive seasonal ranking leaderboard for
        all online games played on
        <a href={"https//jinteki.net"}> jinteki.net</a>, independent of
        tournaments. The ranking would be based on an ELO-like system. Both
        ranked and unranked games would be recorded and logged, affecting your
        current season ranking. I also envision access to seasonal stats,
        all-time stats, and analytical tools for evaluating data. This includes
        not just your win/loss rate, but also a detailed analysis of your win
        rate against specific runners and corporations, as well as win-loss
        rates against other players. This is an ambitious goal, but I'm
        optimistic. I believe this game has longevity, and I'm committed to
        creating an exciting experience for the community.
      </p>
    ),
  },
];

export function Faq() {
  // TODO: Figure out how to link to an anchor
  return (
    <div className={"faq-container"}>
      <article>
        <header>
          <hgroup>
            <h2>Frequently Asked Questions</h2>
            <small>
              Reach out to enkoder if your question isn't answered here
            </small>
          </hgroup>
        </header>
        {QUESTIONS.map((question) => (
          <div className={"faq-item"}>
            <details>
              <summary role={"button"} class={"outline"}>
                {question.title}
              </summary>
              <article> {question.content}</article>
            </details>
          </div>
        ))}
      </article>
    </div>
  );
}
