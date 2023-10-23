import * as React from "react";
import { OpenAPI } from "../client";
import "./root.css";
import { Outlet } from "react-router-dom";

OpenAPI.BASE = process.env.REACT_APP_IS_LOCAL_MODE
  ? "http://0.0.0.0:8787"
  : "https://anrpc-api.enkoder.workers.dev";

export default function Root() {
  return (
    <body>
      <main className="container">
        <div id="detail">
          <Outlet />
        </div>
      </main>
    </body>
  );
}
