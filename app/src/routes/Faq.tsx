import "./Faq.css";

type Question = {
  title: string;
  content: string;
};

const QUESTIONS: Question[] = [
  {
    title: "Beans? What are beans?",
    content:
      "Beans are points, the unit of measurement we use here at Beanstalk. In some circles (near CTZ) people call the card Beanstalk Royalties green beans.",
  },
  {
    title: "How are Beans calculated?",
    content:
      "You can find a point simulation at https://netrunner-beanstalk.net/beans",
  },
];

export function Faq() {
  return (
    <div className={"faq-container"}>
      {QUESTIONS.map((question) => (
        <span className={"faq-item"}>
          <details>
            <summary>{question.title}</summary>
            <p>{question.content}</p>
          </details>
        </span>
      ))}
    </div>
  );
}
