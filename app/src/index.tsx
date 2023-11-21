import { Leaderboard } from "./routes/leaderboard";
import { Results } from "./routes/results";
import { OpenAPI } from "./client";
import useAuth, { AuthProvider } from "./useAuth";
import { PointDistributionTable } from "./routes/Points";
import { Faq } from "./routes/Faq";
import { Beans } from "./routes/Beans";
import { Seasons, SeasonsLoader } from "./routes/Seasons";
import { Sidebar } from "./stories/Sidebar";
import ReactDOM from "react-dom/client";
import React, { MouseEventHandler, useEffect, useState } from "react";
import "./tailwind.css";
import {
  createBrowserRouter,
  Outlet,
  redirect,
  RouterProvider,
  useLocation,
  useNavigate,
} from "react-router-dom";
import {
  faArrowsSpin,
  faCoins,
  faElevator,
  faLock,
  faQuestion,
} from "@fortawesome/free-solid-svg-icons";
import { IconDefinition } from "@fortawesome/fontawesome-svg-core";

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

const SIDEBAR_WIDTH = 250;
const SIDEBAR_MIN_WIDTH = 80;

interface SidebarButtonType {
  icon: IconDefinition;
  label: string;
  selectionStarter: boolean;
  requiresAdmin?: boolean;
  to: string;
}
const SidebarButtons: SidebarButtonType[] = [
  {
    icon: faElevator,
    label: "Leaderboard",
    selectionStarter: true,
    to: "/",
  },
  {
    icon: faArrowsSpin,
    label: "Seasons",
    selectionStarter: false,
    to: "/seasons",
  },
  {
    icon: faCoins,
    label: "Beans",
    selectionStarter: true,
    to: "/beans",
  },
  {
    icon: faQuestion,
    label: "FAQ",
    selectionStarter: false,
    to: "/faq",
  },
  {
    icon: faLock,
    label: "Admin",
    selectionStarter: true,
    requiresAdmin: true,
    to: "/admin",
  },
];

function getSidebarWidth(isOpen: boolean) {
  return isOpen ? SIDEBAR_WIDTH : SIDEBAR_MIN_WIDTH;
}

function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeButton, setActiveButton] = useState<number>(0);

  const [screenWidth, setScreenWidth] = useState(window.innerWidth);
  const isMobile = screenWidth <= 768;
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(!isMobile);

  function handleWindowSizeChange() {
    setScreenWidth(window.innerWidth);
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
      if (sb.to === location.pathname) {
        setActiveButton(i);
      }
    }
    console.log(location);
  }, [location]);

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
      <div className={"flex h-[100svh] w-[100svw] flex-row"}>
        <Sidebar
          isOpen={sidebarOpen}
          onMenuClick={toggleNav}
          onButtonClick={nav}
          activeButton={activeButton}
        />
        <div
          className={"h-[100svh] flex-1 scroll-auto p-8 duration-500"}
          style={{ marginLeft: getSidebarWidth(sidebarOpen) }}
        >
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
      { path: "/api/oauth/callback", element: <OAuth2Callback /> },
      { path: "/beans", element: <Beans /> },
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
    <body className={"h-full"}>
      <RouterProvider router={router} />
    </body>
  </React.StrictMode>,
);
