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

export function Header() {
  const { logout } = useAuth();
  const { user } = useAuth();

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
    <nav>
      <ul>
        <li>
          <Link to={"/"}>
            <img
              src={greenBeans}
              alt="logo"
              style={{ height: 50, padding: 5 }}
            />
            <strong>Beanstalk</strong>
          </Link>
        </li>
      </ul>
      <ul>
        <li>
          <Link to={"/faq"}>
            <a>FAQ</a>
          </Link>
        </li>
        {user ? (
          <>
            <li>
              <Link to={`/results/${user.name}`}>
                <a>{user.name}</a>
              </Link>
            </li>
            <li>
              <a onClick={handleLogout}>Logout</a>
            </li>
          </>
        ) : (
          <li>
            <a onClick={handleLogin}>Login</a>
          </li>
        )}
      </ul>
    </nav>
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

interface SidebarProps {
  width: number;
  onMenuClick: () => void;
  onButtonClick: MouseEventHandler<HTMLDivElement>;
  activeButton: number;
}
export function Sidebar({
  width,
  onMenuClick,
  onButtonClick,
  activeButton,
}: SidebarProps) {
  const { user } = useAuth();

  const isOpen = () => {
    return width == SIDEBAR_WIDTH;
  };

  const isActive = (i: number) => {
    return activeButton === i;
  };

  return (
    <div className="sidebar" style={{ width: `${width}px` }}>
      <div className="sidebar-header">
        {isOpen() && (
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
              <FontAwesomeIcon icon={sb.icon} className={"fas"} />
              {isOpen() && <span>{sb.label}</span>}
            </div>
          </>
        ))}
      </div>
    </div>
  );
}

export function Footer() {
  return (
    <div className={"footer-text-container"}>
      <small style={{ paddingBottom: "10px" }}>
        Built by <a href={"https://gitub.com/enkoder"}>enkoder</a> •
        <a href="https://github.com/enkoder/beanstalk"> Source Code</a>
      </small>
    </div>
  );
}

function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarWidth, setSidebarWidth] = useState<number>(SIDEBAR_WIDTH);
  const [activeButton, setActiveButton] = useState<number>(0);

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
    if (sidebarWidth > SIDEBAR_MIN_WIDTH) {
      setSidebarWidth(SIDEBAR_MIN_WIDTH);
    } else {
      setSidebarWidth(SIDEBAR_WIDTH);
    }
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
          width={sidebarWidth}
          onMenuClick={toggleNav}
          onButtonClick={nav}
          activeButton={activeButton}
        />
        <div className={"content"} style={{ marginLeft: sidebarWidth }}>
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
