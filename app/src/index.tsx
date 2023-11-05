import React, { useEffect } from "react";
import ReactDOM from "react-dom/client";
import { Leaderboard, LeaderboardLoader } from "./routes/leaderboard";
import { Results } from "./routes/results";
import { ErrorPage } from "./routes/error";
import { AuthService, OpenAPI } from "./client";
import "./index.css";
import useAuth, { AuthProvider } from "./useAuth";
import {
  Link,
  Outlet,
  RouterProvider,
  createBrowserRouter,
  redirect,
} from "react-router-dom";
import { PointDistributionTable, getPointDistribution } from "./routes/points";

const getToken = async (): Promise<string> => {
  const access_token = localStorage.getItem("access_token");
  return access_token ? access_token : "";
};

OpenAPI.TOKEN = getToken;
OpenAPI.WITH_CREDENTIALS = true;
OpenAPI.BASE =
  process.env.REACT_APP_IS_LOCAL_MODE !== "1"
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

  function handlelLogout() {
    logout();
  }

  return (
    <nav>
      <ul>
        <li>
          <strong>Beanstalk</strong>
        </li>
      </ul>
      {user ? (
        <ul>
          <li>
            <Link to={`/results/${user.name}`}>
              <a>{user.name}</a>
            </Link>
          </li>
          <li>
            <a onClick={handlelLogout}>Logout</a>
          </li>
        </ul>
      ) : (
        <ul>
          <li>
            <a onClick={handleLogin}>Login</a>
          </li>
        </ul>
      )}
    </nav>
  );
}

function Layout() {
  return (
    <AuthProvider>
      <Header></Header>
      <Outlet />
    </AuthProvider>
  );
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <Leaderboard />, loader: LeaderboardLoader },
      { path: "/results/:user", element: <Results /> },
      { path: "/api/oauth/callback", element: <OAuth2Callback /> },
      {
        path: "/points",
        element: <PointDistributionTable />,
        loader: getPointDistribution,
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
      <main className="container">
        <RouterProvider router={router} />
      </main>
    </body>
  </React.StrictMode>,
);
