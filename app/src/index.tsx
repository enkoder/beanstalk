import { Leaderboard } from "./routes/Leaderboard";
import { Results } from "./routes/Results";
import { ErrorPage } from "./routes/Error";
import { AuthService, OpenAPI } from "./client";
import useAuth, { AuthProvider } from "./useAuth";
import { PointDistributionTable } from "./routes/Points";
import greenBeans from "../images/beanstalk_royalties.png";
import ReactDOM from "react-dom/client";
import React, { useEffect } from "react";
import "@picocss/pico/css/pico.css";
import "./index.css";
import "./theme.css";
import {
  createBrowserRouter,
  Link,
  Outlet,
  redirect,
  RouterProvider,
} from "react-router-dom";

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

export function Footer() {
  return (
    <span className={"footer-text"}>
      <small>
        Built by <a href={"https://gitub.com/enkoder"}>enkoder</a> •
        <a href="https://github.com/enkoder/beanstalk"> Source Code</a>
      </small>
    </span>
  );
}

function Layout() {
  return (
    <AuthProvider>
      <div className={"layout"}>
        <div className={"header"}>
          <Header />
        </div>
        <div className={"left-spacer"}></div>
        <div className={"content"}>
          <Outlet />
        </div>
        <div className={"right-spacer"}></div>
        <div className={"footer"}>
          <Footer />
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
      { path: "/results/:user", element: <Results /> },
      { path: "/api/oauth/callback", element: <OAuth2Callback /> },
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
