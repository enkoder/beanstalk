import { Leaderboard } from "./routes/leaderboard";
import { Results } from "./routes/results";
import { AuthService, OpenAPI } from "./client";
import useAuth, { AuthProvider } from "./useAuth";
import { PointDistributionTable } from "./routes/Points";
import { Faq } from "./routes/Faq";
import { Beans } from "./routes/Beans";
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
      { path: "/faq", element: <Faq /> },
      { path: "/results/:user", element: <Results /> },
      { path: "/api/oauth/callback", element: <OAuth2Callback /> },
      { path: "/beans", element: <Beans /> },
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
