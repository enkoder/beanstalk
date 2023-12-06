import { Leaderboard } from "./routes/leaderboard";
import { Results } from "./routes/results";
import { OpenAPI } from "./client";
import useAuth, { AuthProvider } from "./useAuth";
import { Faq } from "./routes/Faq";
import { Beans } from "./routes/Beans";
import { Seasons, SeasonsLoader } from "./routes/Seasons";
import { Sim } from "./routes/Sim";
import { Code } from "./routes/Code";
import { Stars } from "./stories/Stars";
import { PageHeading } from "./stories/PageHeader";
import { Tournament } from "./routes/Tournament";
import { Navbar } from "./stories/Navbar";
import doggo from "../assets/doggo.png";
import ReactDOM from "react-dom/client";
import React, { useEffect } from "react";
import {
  createBrowserRouter,
  Outlet,
  redirect,
  RouterProvider,
  useLocation,
  useOutletContext,
} from "react-router-dom";

import "@fontsource/inter/400.css";
import "@fontsource/jetbrains-mono/400.css";
import "./output.css";

const getToken = async (): Promise<string> => {
  const access_token = localStorage.getItem("access_token");
  return access_token ? access_token : "";
};

OpenAPI.TOKEN = getToken;
OpenAPI.WITH_CREDENTIALS = true;
OpenAPI.BASE =
  process.env.NODE_ENV !== "development"
    ? "https://netrunner-beanstalk.net"
    : "http://0.0.0.0:8787";

export function OAuth2Callback() {
  const { login } = useAuth();

  useEffect(() => {
    const code = new URLSearchParams(location.search).get("code");
    if (code) {
      login(code);
      redirect("/");
    }
    return () => {};
  }, [location.search]);

  return <></>;
}

function ErrorPage() {
  return (
    <div
      className={"mt-4 flex h-[100svh] flex-row justify-center overflow-auto"}
    >
      <Stars count={100} />
      <div className={"m-4 flex w-5/6 flex-col text-gray-300"}>
        <PageHeading text={"404!"} />
        <text className={"my-4 text-lg"}>Something went wrong...</text>
        <img className={"w-64"} src={doggo} alt="logo" />
      </div>
    </div>
  );
}

export type OutletContextType = {
  contentWidth: number;
};

export function useContentWidth() {
  return useOutletContext<OutletContextType>();
}

function Layout() {
  const { pathname, hash, key } = useLocation();

  useEffect(() => {
    // https://stackoverflow.com/questions/40280369/use-anchors-with-react-router
    if (hash === "") {
      window.scrollTo(0, 0);
    } else {
      setTimeout(() => {
        const id = hash.replace("#", "");
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ block: "start", behavior: "smooth" });
        }
      }, 0);
    }
  }, [pathname, hash, key]); // do this on route change

  return (
    <AuthProvider>
      <div className={"h-screen w-screen bg-gray-950 opacity-80"}>
        <Navbar />
        <div className={"w-full px-4 pt-20 duration-500"}>
          <Outlet />
        </div>
      </div>
    </AuthProvider>
  );
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <Leaderboard /> },
      { path: "/faq", element: <Faq /> },
      { path: "/results/:user", element: <Results /> },
      { path: "/tournament/:tournament", element: <Tournament /> },
      { path: "/oauth/callback", element: <OAuth2Callback /> },
      { path: "/beans", element: <Beans /> },
      { path: "/sim", element: <Sim /> },
      { path: "/code", element: <Code /> },
      { path: "/seasons", element: <Seasons />, loader: SeasonsLoader },
    ],
  },
]);

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement,
);

root.render(
  <React.StrictMode>
    <body>
      <RouterProvider router={router} />
    </body>
  </React.StrictMode>,
);
