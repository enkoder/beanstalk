import { Switch } from "@headlessui/react";
import { TrashIcon } from "@heroicons/react/24/solid";
import { useQuery } from "@tanstack/react-query";
import { clsx } from "clsx";
import { FormEvent, useEffect, useState } from "react";
import {
  AuthService,
  Tag,
  TagsService,
  TournamentTagExpanded,
  User,
  UserService,
} from "../client";
import { Input } from "../components/Input";
import { Link } from "../components/Link";
import { PageHeading } from "../components/PageHeader";
import useAuth from "../useAuth";

export function Profile() {
  const { user, loading } = useAuth();

  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [enabled, setEnabled] = useState<boolean>(false);
  const [userEmail, setUserEmail] = useState<string>(user?.email || "");
  const [hasChanged, setHasChanged] = useState<boolean>(false);

  const [tagInputString, setTagInputString] = useState<string>("");

  const { data: tags, refetch: refetch_tags } = useQuery<Tag[]>({
    staleTime: 0,
    queryKey: ["tags"],
    queryFn: () => TagsService.getGetTags(user?.id),
    enabled: false,
  });

  const { data: tournament_tags, refetch: refetch_tt } = useQuery<
    TournamentTagExpanded[]
  >({
    staleTime: 0,
    queryKey: ["tournament_tags", user],
    queryFn: () => TagsService.getGetTournamentTags(user?.id),
    enabled: false,
  });

  useEffect(() => {
    if (!loading && user) {
      refetch_tags().catch((e) => console.log(e));
      refetch_tt().catch((e) => console.log(e));
    }
  }, [user, loading]);

  const tagAlreadyExists = tournament_tags?.some(
    (tt) => tt.tag_name === tagInputString,
  );

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

  const handleCreateTag = async () => {
    await TagsService.putInsertTags({ tag_name: tagInputString });
    await refetch_tags();
    await refetch_tt();
  };

  const handleDeleteTag = async (tag_id: number) => {
    await TagsService.deleteDeleteTag({ tag_id: tag_id });
    await refetch_tags();
    await refetch_tt();
  };

  const getCountFromTag = (tag: Tag) => {
    for (const tt of tournament_tags || []) {
      if (tag.normalized === tt.tag_normalized) return tt.count;
    }
    return 0;
  };

  return (
    <div className="mx-auto flex max-w-sm flex-col text-gray-400 lg:max-w-lg">
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
              width={"w-full"}
              className={"rounded-lg"}
              label={"Email"}
              type={"email"}
              value={userEmail}
              // TODO: Add email validation
              onChange={(e) => setUserEmail(e.target.value)}
            />
          </div>
          <div className="my-4">
            <span className={"mr-4"}>User Activate</span>
            <Switch
              checked={enabled || false}
              onChange={setEnabled}
              className={
                "relative inline-flex h-6 w-12 items-center rounded-full border-2 border-gray-600 bg-gray-900"
              }
            >
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

      <PageHeading includeUnderline={true} text={"Tags"} className={"my-4"} />

      <div className={"flex flex-row gap-4"}>
        <Input
          width={"w-full"}
          className={"h-12 rounded-lg"}
          placeholder={"Tag Name"}
          onChange={(e) => setTagInputString(e.target.value)}
          value={tagInputString}
        />

        <button
          className={clsx(
            (tagInputString === "" || tagAlreadyExists) &&
              "cursor-not-allowed bg-gray-500",
            "h-12 w-full rounded-lg border border-gray-600 bg-cyan-500 px-2 py-2 text-sm text-gray-950 sm:w-36",
          )}
          type="button"
          onClick={() => handleCreateTag()}
          disabled={tagInputString === "" || tagAlreadyExists}
        >
          Create Tag
        </button>
      </div>

      <table
        className={
          "mb-1 table w-full table-fixed border-separate border-spacing-0 text-gray-300"
        }
      >
        <thead className={"sticky top-0 h-10 bg-slate-950 text-center text-lg"}>
          <tr className={"border-b"}>
            <th
              scope="col"
              className={"border-b-2 border-solid border-gray-300 px-4"}
            >
              Tag Name
            </th>
            <th
              scope="col"
              className={"border-b-2 border-solid border-gray-300"}
            >
              Tournament Count
            </th>
            <th
              scope="col"
              className={"w-6 border-b-2 border-solid border-gray-300 px-4"}
            />
          </tr>
        </thead>

        <tbody>
          {tags?.map((tag) => (
            <tr
              className={
                "text-center align-middle odd:bg-slate-900 even:bg-slate-950"
              }
            >
              <Link to={`/?tags=${tag.normalized}`}>{tag.name}</Link>
              <td className={"px-4 py-2"}>{getCountFromTag(tag)}</td>
              <td className={"w-6"}>
                <TrashIcon
                  className={"h-6 w-6 cursor-pointer text-red-800"}
                  onClick={() => handleDeleteTag(tag.id)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
