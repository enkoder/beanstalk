import { Leaderboard } from "./routes/leaderboard";
import { Results } from "./routes/results";
import { AuthService, OpenAPI } from "./client";
import useAuth, { AuthProvider } from "./useAuth";
import { PointDistributionTable } from "./routes/Points";
import { Faq } from "./routes/Faq";
import { Beans } from "./routes/Beans";
import { Seasons, SeasonsLoader } from "./routes/Seasons";
import greenBeans from "../images/beanstalk_royalties.png";
import ReactDOM from "react-dom/client";
import React, { MouseEventHandler, useEffect, useState } from "react";
import "@picocss/pico/css/pico.css";
import "@picocss/pico/css/pico.colors.css";
import "./index.css";
import "./theme.css";
import {
  createBrowserRouter,
  Link,
  Outlet,
  redirect,
  RouterProvider,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowsSpin,
  faBars,
  faCaretDown,
  faCaretUp,
  faCoins,
  faElevator,
  faLock,
  faQuestion,
  faRightFromBracket,
  faRightToBracket,
  faUser,
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
const SIDEBAR_FOOTER_MIN_HEIGHT = "56px";

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

interface SidebarProps {
  toggleOpen: boolean;
  onMenuClick: () => void;
  onButtonClick: MouseEventHandler<HTMLDivElement>;
  activeButton: number;
}

function getSidebarWidth(isOpen: boolean) {
  return isOpen ? SIDEBAR_WIDTH : SIDEBAR_MIN_WIDTH;
}

export function Sidebar({
  toggleOpen,
  onMenuClick,
  onButtonClick,
  activeButton,
}: SidebarProps) {
  const { user, logout } = useAuth();
  const [footerOpen, setFooterOpen] = useState<boolean>(false);

  const isActive = (i: number) => {
    return activeButton === i;
  };

  const toggleSidebarFooter = () => {
    setFooterOpen(!footerOpen);
  };

  const getFooterHeight = () => {
    return footerOpen ? "fit-content" : SIDEBAR_FOOTER_MIN_HEIGHT;
  };

  function handleLogin() {
    AuthService.getGetLoginUrl()
      .then(({ auth_url }) => {
        window.location.assign(auth_url);
      })
      .catch((error) => {
        console.log(error);
      });
    return () => {};
  }

  function handleLogout() {
    logout();
  }

  return (
    <div
      className="sidebar"
      style={{ width: `${getSidebarWidth(toggleOpen)}px` }}
    >
      <div className="sidebar-header">
        {toggleOpen && (
          <Link to={"/"}>
            <img src={greenBeans} alt="logo" id={"sidebar-image"} />
            <strong>Beanstalk</strong>
          </Link>
        )}
        <FontAwesomeIcon icon={faBars} id={"menu-icon"} onClick={onMenuClick} />
      </div>
      <div className="sidebar-content">
        {SidebarButtons.filter(
          (sb) => !sb.requiresAdmin || (user && !user.is_admin),
        ).map((sb, i) => (
          <>
            {sb.selectionStarter && <hr />}
            <div
              className={`sidebar-button ${
                isActive(i) && "sidebar-button-active"
              }`}
              onClick={onButtonClick}
              button-id={i}
            >
              <FontAwesomeIcon icon={sb.icon} className={"fai"} />
              {toggleOpen && <span>{sb.label}</span>}
            </div>
          </>
        ))}
      </div>

      <div className={"sidebar-footer"} style={{ height: getFooterHeight() }}>
        <div className={"sidebar-footer-heading"}>
          <div className="sidebar-footer-avatar">
            <FontAwesomeIcon icon={faUser} />
          </div>
          {toggleOpen && (
            <div className={"sidebar-footer-name"}>
              {user ? (
                <Link to={`/results/${user.name}`}>{user.name} </Link>
              ) : (
                <h6>Profile</h6>
              )}
            </div>
          )}
          <div
            className={"sidebar-footer-toggle"}
            onClick={toggleSidebarFooter}
          >
            {footerOpen ? (
              <FontAwesomeIcon icon={faCaretDown} />
            ) : (
              <FontAwesomeIcon icon={faCaretUp} />
            )}
          </div>
        </div>

        <div className={"sidebar-footer-content"}>
          <hr />
          {footerOpen && !user ? (
            <div className={`sidebar-button`} onClick={handleLogin}>
              <FontAwesomeIcon icon={faRightToBracket} className={"fai"} />
              {toggleOpen && <span>Login</span>}
            </div>
          ) : (
            <div className={`sidebar-button`} onClick={handleLogout}>
              <FontAwesomeIcon icon={faRightFromBracket} className={"fai"} />
              {toggleOpen && <span>Logout</span>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
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
      <div className={"layout"}>
        <Sidebar
          toggleOpen={sidebarOpen}
          onMenuClick={toggleNav}
          onButtonClick={nav}
          activeButton={activeButton}
        />
        <div
          className={"content"}
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
    <body>
      <RouterProvider router={router} />
    </body>
  </React.StrictMode>,
);
