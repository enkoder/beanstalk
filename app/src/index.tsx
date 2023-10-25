import React from "react";
import ReactDOM from "react-dom/client";
import Error from "./routes/error";
import { Leaderboard } from "./routes/leaderboard";
import { Results } from "./routes/results";
import { Route, Switch } from "wouter";
import { OpenAPI } from "./client";
import "./index.css";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement,
);

OpenAPI.BASE =
  process.env.REACT_APP_IS_LOCAL_MODE !== "1"
    ? "https://anrpc-api.enkoder.workers.dev"
    : "http://0.0.0.0:8787";

root.render(
  <React.StrictMode>
    <body>
      <main className="container">
        <Switch>
          <Route path="/" component={Leaderboard} />
          <Route path="/results/:user" component={Results} />
          <Route component={Error}></Route>
        </Switch>
      </main>
    </body>
    ;
  </React.StrictMode>,
);
