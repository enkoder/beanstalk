// @ts-ignore
import rankings from "./../../../api/src/lib/ranking.ts";
import {
  GetPointDistributionResponse,
  LeaderboardService,
  Tier,
} from "../client";
// @ts-ignore
import { PageHeading } from "../stories/PageHeader";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
// @ts-ignore
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { FormEvent, useEffect, useState } from "react";

function PointsSimulation() {
  const [selectedTier, setSelectedTier] = useState<number>(0);
  const [tiers, setTiers] = useState<Tier[]>([]);
  const [numPlayers, setNumPlayers] = useState<number>(32);
  const [pointsDistributionResponse, setPointsDistributionResponse] =
    useState<GetPointDistributionResponse>();

  useEffect(() => {
    LeaderboardService.getGetTiers().then((tiers) => {
      setTiers(tiers);
      console.log(tiers);
    });
  }, []);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (tiers) {
      LeaderboardService.getGetPointDistribution(
        tiers[selectedTier].points,
        numPlayers,
      ).then((response) => {
        setPointsDistributionResponse(response);
      });
    }
  };

  return (
    <div className={"flex flex-col"}>
      <div className="filters">
        <form onSubmit={handleSubmit} role={"group"}>
          <select onChange={(e) => setSelectedTier(Number(e.target.value))}>
            {tiers &&
              tiers.map((tier, index) => (
                <option value={index}>{tier.name}</option>
              ))}
          </select>

          <input
            type="number"
            disabled
            value={tiers.length ? tiers[selectedTier].points : 0}
          />
          <input
            type="number"
            placeholder={"Num Players"}
            value={numPlayers}
            onChange={(e) => setNumPlayers(Number(e.target.value))}
          />
          <input type="submit" value="Run" />
        </form>
      </div>
      <div className={"leaderboard"}>
        <table className={"striped"}>
          <thead>
            <tr>
              <th scope="col">Placement</th>
              <th scope="col">Beans</th>
              <th scope="col">
                Cumulative (
                {pointsDistributionResponse &&
                  pointsDistributionResponse.adjustedTotalPoints}
                )
              </th>
            </tr>
          </thead>
          <tbody>
            {pointsDistributionResponse &&
              pointsDistributionResponse.pointDistribution.map((row) => (
                <tr key={row.placement}>
                  <td>{row.placement}</td>
                  <td>{row.points}</td>
                  <td>{row.cumulative}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function Beans() {
  return (
    <div className={"flex flex-col"}>
      <PageHeading text={"Beans"} />
      <div>
        <article className={"text-gray-400"}>
          <header>
            <hgroup>
              <h2>How are beans calculated?</h2>
              <small> expand each section below to find out</small>
            </hgroup>
          </header>

          <details>
            <summary role={"button"} className={"outline"}>
              Exponential decaying distribution
            </summary>
            The{" "}
            <a href={"https://en.wikipedia.org/wiki/Pareto_principle"}>
              Pareto Principle
            </a>{" "}
            states that 20% of the input yields 80% of the output. This is also
            known as the 80/20 rule and it can be found in a number of places.
            Leveraging the ideas behind this principle, it led me to lean
            towards a power law function and not pursue linear or some other
            scaling method.
            <hr /> This led me to{" "}
            <a href={"https://arxiv.org/pdf/1601.04203.pdf"}>
              research various fantasy and poker tournament payout systems.
            </a>{" "}
            The challenge with these systems is the need to set a decay rate
            value, represented by alpha (α). This rate ultimately determines the
            point distribution across the tournament. Rather than setting a
            constant alpha value for all tournaments, we calculate it in real
            time. This method allows us to allocate a targeted percentage of
            points to the top percentage of players in any tournament. The
            flexibility of these values facilitates iterative adjustments to
            find the optimal balance.
            <hr />
            After plenty of tuning and looking at tournament payouts, I landed
            on top 33% receiving 66% of the points. 80/20 ended up being too top
            heavy and lowering the curve felt right.
          </details>

          <details>
            <summary role={"button"} className={"outline"}>
              Points for the top %
            </summary>
            Of course, everyone want's to win the tournament, but for many,
            making the cut is their goal for the tournament the tournament. It's
            exciting to make the cut and I wanted to create a similar experience
            for winning any amount of points. In a poker tournament, a common
            term is used is "in the money", meaning you're going to be getting
            something back for your performance in the tournament. It's an
            important mechanic that creates excitement when you receive any
            points, and we wanted to incorporate that at Beanstalk.
            <hr />
            This value is configurable, but currently the cutoff for being in
            the points is set to 50%, meaning the top half of the tournament
            will receive some amount of points. Everyone else will receive 0
            points.
          </details>

          <details>
            <summary role={"button"} className={"outline"}>
              Tiered tournament point values{" "}
            </summary>
            Clearly, the winner of the Worlds tournament (read: Sokka) should
            receive more points than someone who won a Nationals tournament. We
            can achieve this by implementing a tiered point system where the
            baseline points correspond to the various tournament types. Expand
            the Coder section below to view the tiered point configuration per
            tournament type
          </details>

          <details>
            <summary role={"button"} className={"outline"}>
              Points scale by tournament size
            </summary>
            Winning a Nationals tournament with 100 players should award more
            points than a 16-person Nationals. The algorithm should scale
            automatically based on the number of players. It should also
            distribute points fairly, with adjustments based solely on the
            number of players and the baseline points for each tournament type.
            <hr />
            After several trials, I settled on a simple Log(Log(numPlayer))
            function. This seemed to scale well for the typical number of
            tournament players. Below are some example multiplier values:
            <ul>
              <li>8 players ={">"} .73</li>
              <li>100 players ={">"} 1.52</li>
              <li>256 players ={">"} 1.71</li>
            </ul>
          </details>

          <details>
            <summary role={"button"} className={"outline"}>
              Expand to run a simulation
            </summary>
            <PointsSimulation />
          </details>

          <details>
            <summary role={"button"} class={"outline"}>
              Expand to see the code!
            </summary>
            <SyntaxHighlighter
              language="typescript"
              style={oneDark}
              customStyle={{ fontSize: "small" }}
              showLineNumbers={true}
            >
              {rankings}
            </SyntaxHighlighter>
          </details>
        </article>
      </div>
    </div>
  );
}
