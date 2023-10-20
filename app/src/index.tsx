import React from "react";
import ReactDOM from "react-dom/client";
import Root from "./routes/root";
import Error from "./routes/error";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { Leaderboard } from "./routes/leaderboard";
import { Results } from "./routes/results";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    errorElement: <Error />,
    children: [
      { path: "", element: <Leaderboard /> },
      { path: "/results/:user", element: <Results /> },
    ],
  },
]);

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement,
);

root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);
