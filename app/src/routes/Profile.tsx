import { Switch } from "@headlessui/react";
import { TrashIcon } from "@heroicons/react/24/solid";
import { useQuery } from "@tanstack/react-query";
import { clsx } from "clsx";
import { FormEvent, useEffect, useState } from "react";
import {
  AuthService,
  GetTagsResponse,
  TagTournament,
  TagsService,
  Tournament,
  TournamentService,
  User,
  UserService,
} from "../client";
import ComboBox from "../components/ComboBox";
import { Input } from "../components/Input";
import { Link } from "../components/Link";
import { Modal } from "../components/Modal";
import { PageHeading } from "../components/PageHeader";
import { Sep } from "../components/Sep";
import { Tooltip, TooltipContent, TooltipTrigger } from "../components/Tooltip";
import useAuth from "../useAuth";
import { setDiff } from "../util";

type TagTournamentsModalProps = {
  tagResponse: GetTagsResponse | null;
  onClose: () => void;
};

export function TagTournamentsModal({
  tagResponse,
  onClose,
}: TagTournamentsModalProps) {
  const { data: tournaments } = useQuery<Tournament[]>({
    queryKey: ["tournaments"],
    queryFn: () => TournamentService.getGetTournaments(),
    enabled: tagResponse !== null,
  });

  const { data: tagTournaments, refetch: refetchTagTournaments } = useQuery<
    TagTournament[]
  >({
    queryKey: ["tag_tournaments", tagResponse?.id],
    queryFn: () => TagsService.getGetTagTournaments(tagResponse?.id || -1),
    enabled: tagResponse !== null,
  });

  const taggedTournaments: Tournament[] = [];
  for (const tt of tagTournaments || []) {
    for (const tournament of tournaments || []) {
      if (tournament.id === tt.tournament_id)
        taggedTournaments.push(tournament);
    }
  }

  const [selectedTournaments, setSelectedTournaments] = useState<Tournament[]>(
    [],
  );

  useEffect(() => {
    setSelectedTournaments(taggedTournaments);
  }, [tagTournaments]);

  const newTournaments = Array.from(
    setDiff(selectedTournaments, taggedTournaments).values(),
  );
  console.log(newTournaments);

  const description =
    newTournaments === null
      ? `Select tournament below to add ${tagResponse?.name} tag to`
      : newTournaments.map((t: Tournament) => t.name).join(",");

  const handleDeleteTagTournament = async (t: Tournament) => {
    if (tagResponse) {
      await TagsService.deleteDeleteTagTournament(tagResponse.id, t.id);
      await refetchTagTournaments();
    }
  };

  const handleAddTagTournament = async () => {
    if (tagResponse && newTournaments && newTournaments.length) {
      await Promise.all(
        newTournaments.map((t) =>
          TagsService.putInsertTagTournament(tagResponse.id, {
            tournament_id: t.id,
          }),
        ),
      );
      await refetchTagTournaments();
    }
  };

  return (
    <Modal
      title={`Tag: ${tagResponse?.name}`}
      description={description}
      isOpen={tagResponse !== null}
      onClose={onClose}
    >
      <div className={"flex flex-col text-gray-400"}>
        <div className={"flex flex-row gap-2"}>
          <ComboBox
            placeholder={"Tournament Name"}
            width={"w-full"}
            items={tournaments || []}
            onChange={(t) => setSelectedTournaments(t)}
            renderItem={(t) => t?.name}
            selected={selectedTournaments}
            preProcess={(items, query) =>
              items
                .sort((a, b) => (a.name < b.name ? -1 : 1))
                .filter((t) =>
                  t?.name.toLowerCase().includes(query.toLowerCase()),
                )
            }
            multiple={true}
            nullable={true}
          />
          <button
            type={"submit"}
            className={clsx(
              newTournaments.length > 0
                ? "bg-cyan-500 text-gray-950"
                : "bg-gray-900 text-gray-400",
              "w-28 rounded-lg border border-gray-600 px-2 py-2 font-bold",
            )}
            onClick={async () => await handleAddTagTournament()}
            disabled={newTournaments.length === 0}
          >
            Add Tags
          </button>
        </div>
        <Sep className={"my-2"} />
        <ul className={"my-2 ml-4 list-inside list-none"}>
          {taggedTournaments.map((t) => (
            <li>
              <div className={"flex flex-row"}>
                <span>
                  <Link to={`/tournament/${t.id}`}>{t.name}</Link>
                </span>
                <TrashIcon
                  className={"h-6 w-6 cursor-pointer text-red-800 ml-auto"}
                  onClick={async () => await handleDeleteTagTournament(t)}
                />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </Modal>
  );
}

export function Profile() {
  const { user, loading } = useAuth();

  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [enabled, setEnabled] = useState<boolean>(false);
  const [userEmail, setUserEmail] = useState<string>(user?.email || "");
  const [hasChanged, setHasChanged] = useState<boolean>(false);

  const [tagInputString, setTagInputString] = useState<string>("");

  const { data: tags, refetch } = useQuery<GetTagsResponse[]>({
    staleTime: 0,
    queryKey: ["tags"],
    queryFn: () => TagsService.getGetTags(user?.id),
    enabled: false,
  });

  useEffect(() => {
    if (!loading && user) {
      refetch().catch((e) => console.log(e));
    }
  }, [user, loading]);

  const tagAlreadyExists = tags?.some((tag) => tag.name === tagInputString);

  const [clickedTag, setClickedTag] = useState<GetTagsResponse | undefined>();

  // Login state
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
    await TagsService.putInsertTags({ name: tagInputString });
    await refetch();
  };

  const handleDeleteTag = async (tag_id: number) => {
    await TagsService.deleteDeleteTag(tag_id);
    await refetch();
  };

  const handleCloseModal = async () => {
    setClickedTag(undefined);
    await refetch();
  };

  const handleTagSwitchChange = async (tag: GetTagsResponse) => {
    await TagsService.postUpdateTag(tag.id, {
      use_tournament_limits: !tag.use_tournament_limits,
    });
    await refetch();
  };

  return (
    <div className="mx-auto flex max-w-xl flex-col text-gray-400">
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

      <PageHeading
        includeUnderline={true}
        text={"Your Tags"}
        className={"my-4"}
      />

      <div className={"mt-4 flex flex-row gap-4"}>
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
              Use Tournament Limits
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
              <td>
                <button
                  className={"w-24 rounded-lg bg-cyan-600 p-1 text-gray-950"}
                  type={"button"}
                  onClick={() => setClickedTag(tag)}
                >
                  {tag.name}
                </button>
              </td>
              <td>
                <div className={"text-xg mb-4 ml-auto flex flex-row pt-4 pl-4"}>
                  {tag.use_tournament_limits ? (
                    <span className={"pr-4"}>Use Limits</span>
                  ) : (
                    <span className={"pr-4"}>No Limits</span>
                  )}
                  <Switch
                    checked={tag.use_tournament_limits || false}
                    onChange={() => handleTagSwitchChange(tag)}
                    className={
                      "relative mr-4 inline-flex h-6 w-12 items-center rounded-full border-2 border-gray-600 bg-gray-900"
                    }
                    disabled={user === null}
                  >
                    <span
                      className={clsx(
                        tag.use_tournament_limits
                          ? "translate-x-6 bg-cyan-500"
                          : "translate-x-1 bg-gray-400",
                        "inline-block h-4 w-4 transform rounded-full transition",
                      )}
                    />
                  </Switch>
                </div>
              </td>
              <td className={"px-4 py-2"}>{tag.count}</td>
              <td className={"w-6"}>
                <Tooltip placement={"bottom"}>
                  <TooltipTrigger className={"w-full"}>
                    <TrashIcon
                      className={clsx(
                        tag.count === 0
                          ? "cursor-pointer text-red-800"
                          : "cursor-default text-gray-400",
                        "h-6 w-6",
                      )}
                      onClick={
                        tag.count === 0
                          ? async () => await handleDeleteTag(tag.id)
                          : undefined
                      }
                    />
                  </TooltipTrigger>
                  {tag.count !== 0 && (
                    <TooltipContent
                      className={
                        "rounded-lg border border-gray-600 bg-gray-950 p-2 text-sm text-cyan-500 shadow-lg"
                      }
                      arrowClassName={
                        "fill-gray-950 [&>path:first-of-type]:stroke-gray-600"
                      }
                    >
                      Delete tagged tournaments by clicking the button to the
                      left
                    </TooltipContent>
                  )}
                </Tooltip>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {clickedTag && (
        <TagTournamentsModal
          tagResponse={clickedTag}
          onClose={async () => await handleCloseModal()}
        />
      )}
    </div>
  );
}
