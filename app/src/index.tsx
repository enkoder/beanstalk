import { Leaderboard } from "./routes/leaderboard";
import { Results } from "./routes/results";
import { OpenAPI } from "./client";
import useAuth, { AuthProvider } from "./useAuth";
import { PointDistributionTable } from "./routes/Points";
import { Faq } from "./routes/Faq";
import { Beans } from "./routes/Beans";
import { Seasons, SeasonsLoader } from "./routes/Seasons";
import { getSidebarWidth, Sidebar, SidebarButtons } from "./stories/Sidebar";
import { Sim } from "./routes/Sim";
import { Code } from "./routes/Code";
import ReactDOM from "react-dom/client";
import React, { MouseEventHandler, useEffect, useState } from "react";
import "./output.css";
import {
  createBrowserRouter,
  Outlet,
  redirect,
  RouterProvider,
  useLocation,
  useNavigate,
  useOutletContext,
} from "react-router-dom";
import { Stars } from "./stories/Stars";

const getToken = async (): Promise<string> => {
  const access_token = localStorage.getItem("access_token");
  return access_token ? access_token : "";
};

OpenAPI.TOKEN = getToken;
OpenAPI.WITH_CREDENTIALS = true;
OpenAPI.BASE =
  process.env.NODE_ENV !== "development"
    ? "https://beanstalk-api.enkoder.workers.dev"
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
    <main className="container">
      <hgroup>
        <h1>404!</h1>
        <h6>Do something cool with a 404 page</h6>
      </hgroup>
    </main>
  );
}

export type OutletContextType = {
  contentWidth: number;
};

export function useContentWidth() {
  return useOutletContext<OutletContextType>();
}

function Layout() {
  const navigate = useNavigate();
  const { pathname, hash, key } = useLocation();
  const [activeButton, setActiveButton] = useState<number>(0);

  const [screenWidth, setScreenWidth] = useState(window.innerWidth);
  const isMobile = screenWidth <= 768;
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(!isMobile);
  const [contentWidth, setContentWidth] = useState<number>(
    screenWidth - getSidebarWidth(sidebarOpen),
  );

  function handleWindowSizeChange() {
    setScreenWidth(window.innerWidth);
    setContentWidth(window.innerWidth - getSidebarWidth(sidebarOpen));
  }

  useEffect(() => {
    window.addEventListener("resize", handleWindowSizeChange);
    return () => {
      window.removeEventListener("resize", handleWindowSizeChange);
    };
  }, []);

  useEffect(() => {
    for (let i = 0; i < SidebarButtons.length; i++) {
      const sb = SidebarButtons[i];
      if (sb.to === pathname) {
        setActiveButton(i);
      }
    }
  }, [pathname]);

  useEffect(() => {
    // https://stackoverflow.com/questions/40280369/use-anchors-with-react-router
    if (hash === "") {
      window.scrollTo(0, 0);
    } else {
      setTimeout(() => {
        const id = hash.replace("#", "");
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView();
        }
      }, 0);
    }
  }, [pathname, hash, key]); // do this on route change

  const toggleNav = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const nav: MouseEventHandler<HTMLDivElement> = (e) => {
    const buttonId = Number(e.currentTarget.getAttribute("button-id"));
    const button = SidebarButtons[buttonId];

    setActiveButton(buttonId);
    navigate(button.to);
  };

  return (
    <AuthProvider>
      <Stars count={100} />
      <div
        className={
          "z-1 relative flex h-[100svh] w-[100svw] flex-row bg-gray-950 opacity-80"
        }
      >
        <Sidebar
          isOpen={sidebarOpen}
          onMenuClick={toggleNav}
          onButtonClick={nav}
          activeButton={activeButton}
        />
        <div
          className={"w-full overflow-hidden duration-500"}
          style={{ marginLeft: getSidebarWidth(sidebarOpen) }}
        >
          <Outlet context={{ contentWidth: contentWidth }} />
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
      { path: "/api/oauth/callback", element: <OAuth2Callback /> },
      { path: "/beans", element: <Beans /> },
      { path: "/sim", element: <Sim /> },
      { path: "/code", element: <Code /> },
      { path: "/seasons", element: <Seasons />, loader: SeasonsLoader },
      {
        path: "/points",
        element: <PointDistributionTable />,
      },
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
