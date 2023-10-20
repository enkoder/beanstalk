import * as React from "react";
import { OpenAPI } from "../client";
import "./root.css";
import { Outlet } from "react-router-dom";

OpenAPI.BASE = "http://0.0.0.0:8787";

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
