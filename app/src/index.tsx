import React, { useEffect } from "react";
import ReactDOM from "react-dom/client";
import {
  Outlet,
  RouterProvider,
  createBrowserRouter,
  redirect,
  useLocation,
  useOutletContext,
} from "react-router-dom";
import doggo from "../assets/doggo.png";
import { OpenAPI } from "./client";
import { Navbar } from "./components/Navbar";
import { PageHeading } from "./components/PageHeader";
import { Stars } from "./components/Stars";
import { BlogPage } from "./routes/Blog";
import { Sim } from "./routes/Sim";
import { TagsPage } from "./routes/TagsPage";
import { TournamentPage } from "./routes/TournamentPage";
import { Leaderboard } from "./routes/leaderboard";
import { Results } from "./routes/results";
import useAuth, { AuthProvider } from "./useAuth";

import "@fontsource/inter/400.css";
import "@fontsource/jetbrains-mono/400.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./output.css";
import { Profile } from "./routes/Profile";
import Stats from "./routes/Stats";

// biome-ignore lint/nursery/useAwait: needs to be async
const getToken = async (): Promise<string> => {
  const access_token = localStorage.getItem("access_token");
  return access_token ? access_token : "";
};

const getAPIBase = () => {
  const branch = process.env.GIT_BRANCH;
  const env = process.env.NODE_ENV;
  console.log("GIT_COMMIT_HASH", process.env.GIT_COMMIT_HASH);
  console.log("GIT_BRANCH", process.env.GIT_BRANCH);

  if (branch === "preview" && env !== "development") {
    return "https://beanstalk-api-preview.enkoder.workers.dev";
  }

  if (env === "development") {
    return "http://localhost:8787";
  }

  return "https://netrunner-beanstalk.net";
};

OpenAPI.TOKEN = getToken;
OpenAPI.WITH_CREDENTIALS = true;
OpenAPI.BASE = getAPIBase();

export function OAuth2Callback() {
  const { login } = useAuth();

  useEffect(() => {
    const code = new URLSearchParams(location.search).get("code");
    if (code) {
      login(code);
      redirect("/");
    }
    return () => {};
  }, [login]);

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
  const { hash } = useLocation();

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
  }, [hash]); // do this on route change

  return (
    <AuthProvider>
      <div
        className={
          "scrollbar scrollbar-thumb-cyan-600 scrollbar-track-gray-900 h-screen w-screen overflow-y-auto bg-gray-950 opacity-95"
        }
      >
        <Navbar />
        <div className={"mx-auto max-w-7xl px-2 pt-4 duration-500 md:px-4"}>
          <Outlet />
        </div>
      </div>
    </AuthProvider>
  );
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <Leaderboard /> },
      {
        path: "/blog",
        children: [
          { index: true, element: <BlogPage /> },
          { path: ":postId", element: <BlogPage /> },
        ],
      },
      { path: "/results/:user", element: <Results /> },
      { path: "/tournament/:tournament", element: <TournamentPage /> },
      { path: "/oauth/callback", element: <OAuth2Callback /> },
      { path: "/sim", element: <Sim /> },
      { path: "/stats", element: <Stats /> },
      //{ path: "/seasons", element: <Seasons /> },
      { path: "/tags", element: <TagsPage /> },
      { path: "/@me", element: <Profile /> },
    ],
  },
]);

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement,
);

root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </React.StrictMode>,
);
