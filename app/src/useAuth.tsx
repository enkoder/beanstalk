import { AuthService, TokenResponse, User, UserService } from "./client";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AxiosError } from "axios";

interface AuthContextType {
  user?: User | null;
  loading: boolean;
  error?: any;
  login: (code: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

// Export the provider as we need to wrap the entire app with it
export function AuthProvider({
  children,
}: {
  children: ReactNode;
}): JSX.Element {
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<any>();
  const [loading, setLoading] = useState<boolean>(false);

  const navigate = useNavigate();
  const location = useLocation();

  const _storeTokens = (tokenResponse: TokenResponse) => {
    localStorage.setItem("access_token", tokenResponse.access_token);
    localStorage.setItem("refresh_token", tokenResponse.refresh_token);
  };

  const fetchUser = useCallback(async () => {
    try {
      const user = await UserService.getMe();
      setUser(user);
    } catch (e) {
      const error = e as AxiosError;
      // Token is expired, let's try to refresh the token
      if (error.status == 401) {
        const refresh_token = localStorage.getItem("refresh_token");
        if (refresh_token) {
          const tokenResponse =
            await AuthService.getRefreshToken(refresh_token);
          _storeTokens(tokenResponse);

          // one more attempt
          const user = await UserService.getMe();
          setUser(user);
        }
      }
    }
  }, []);

  // on first attempt, try to load the user or refresh the token
  useEffect(() => {
    setLoading(true);
    fetchUser().catch((e) => {
      setError(e);
    });
    return () => {
      setLoading(false);
    };
  }, []);

  // if the cookies change, store them in the local storage
  // Reset the error state if we change page
  useEffect(() => {
    if (error) setError(undefined);
    return () => {};
  }, [location.pathname]);

  // Flags the component loading state and posts the login data to the server.
  // An error means that the email/password combination is not valid.
  // Finally, just signal the component that loading the loading state is over.
  function login(code: string) {
    setLoading(true);

    AuthService.getGetTokenFromCode(code)
      .then((tokenResponse) => {
        _storeTokens(tokenResponse);
        navigate("/");
        fetchUser().catch((e) => {
          setError(e);
        });
      })
      .catch((error) => {
        setError(error);
      })
      .finally(() => setLoading(false));
  }

  function logout() {
    localStorage.clear();
    setUser(null);
  }

  const memoedValue = useMemo(
    () => ({
      user,
      loading,
      error,
      login,
      logout,
    }),
    [user, loading, error],
  );

  // We only want to render the underlying app after we assert for the presence of a current user.
  return (
    <AuthContext.Provider value={memoedValue}>{children}</AuthContext.Provider>
  );
}

export default function useAuth() {
  return useContext(AuthContext);
}
