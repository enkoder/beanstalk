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
];

export function Faq() {
  // TODO: Figure out how to link to an anchor
  return (
    <div className={"faq-container"}>
      {QUESTIONS.map((question) => (
        <div className={"faq-item"}>
          <details>
            <summary>{question.title}</summary>
            <article> {question.content}</article>
          </details>
        </div>
      ))}
    </div>
  );
}
