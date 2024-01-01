import { Switch } from "@headlessui/react";
import { useQuery } from "@tanstack/react-query";
import { clsx } from "clsx";
import { FormEvent, useEffect, useState } from "react";
import { AuthService, User, UserService } from "../client";
import { Input } from "../components/Input";
import { PageHeading } from "../components/PageHeader";
import useAuth from "../useAuth";

export function Profile() {
  const { user, loading } = useAuth();

  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [enabled, setEnabled] = useState<boolean>(false);
  const [userEmail, setUserEmail] = useState<string>(user?.email || "");
  const [hasChanged, setHasChanged] = useState<boolean>(false);

  const { data: authUrl } = useQuery<string>({
    queryKey: ["authUrl"],
    queryFn: () => AuthService.getGetLoginUrl(),
  });

  useEffect(() => {
    if (user) {
      setUserEmail(user?.email || "");
      setEnabled(!user?.disabled);
      setUserProfile(user);
    }
  }, [user]);

  useEffect(() => {
    if (
      userProfile &&
      (userEmail !== userProfile.email || !enabled !== userProfile.disabled)
    ) {
      setHasChanged(true);
    } else {
      setHasChanged(false);
    }
  }, [userEmail, enabled]);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    UserService.patchPatchMe({
      email: userEmail,
      disabled: !enabled,
    })
      .then((u) => {
        setUserProfile(u);
        setHasChanged(false);
      })
      .catch((e) => console.log(e));
  };

  function handleLogin() {
    if (authUrl) window.location.assign(authUrl);
  }

  // TODO: loading spinner
  if (loading) {
    return <></>;
  }

  return (
    <div className="mx-auto flex max-w-sm flex-col text-gray-400">
      <PageHeading includeUnderline={true} text={"Profile"} />

      {!user && !loading ? (
        <>
          <button
            type="submit"
            className={
              "my-4 w-full rounded-lg border-2 border-gray-900 bg-cyan-500 px-2 py-2 font-bold text-gray-900"
            }
            onClick={() => handleLogin()}
          >
            Login
          </button>
        </>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="my-4">
            <text className={"text-xl"}>{user?.name}</text>
          </div>
          <div className="my-4">
            <Input
              className={"rounded-lg"}
              label={"Email"}
              type={"email"}
              value={userEmail}
              // TODO: Add email validation
              onChange={(e) => setUserEmail(e.target.value)}
            />
          </div>
          <div className="my-4">
            <span className={"mr-4"}>Enabled</span>
            <Switch
              checked={enabled || false}
              onChange={setEnabled}
              className={
                "relative inline-flex h-6 w-12 items-center rounded-full border-2 border-gray-600 bg-gray-900"
              }
            >
              <span className="sr-only">Enable notifications</span>
              <span
                className={clsx(
                  enabled
                    ? "translate-x-6 bg-cyan-500"
                    : "translate-x-1 bg-gray-400",
                  "inline-block h-4 w-4 transform rounded-full transition",
                )}
              />
            </Switch>
          </div>

          <button
            type="submit"
            className={clsx(
              hasChanged
                ? "bg-cyan-500 text-gray-950"
                : "bg-gray-900 text-gray-400",
              "w-full rounded-lg border border-gray-600 px-2 py-2 font-bold",
            )}
            disabled={!hasChanged}
          >
            Submit
          </button>
        </form>
      )}
    </div>
  );
}
