import { Switch } from "@headlessui/react";
import { useQuery } from "@tanstack/react-query";
import clsx from "clsx";
import { useEffect, useState } from "react";
import { TagsService, TournamentTagExpanded } from "../client";
import { Input } from "../components/Input";
import { Link } from "../components/Link";
import { PageHeading } from "../components/PageHeader";
import { Sep } from "../components/Sep";
import { Tooltip, TooltipContent, TooltipTrigger } from "../components/Tooltip";
import useAuth from "../useAuth";

export function TagsPage() {
  const [switchEnabled, setSwitchEnabled] = useState<boolean>(false);
  const [tagInputString, setTagInputString] = useState<string>("");

  const { user, loading } = useAuth();

  const { data: tournament_tags, refetch } = useQuery<TournamentTagExpanded[]>({
    staleTime: 0,
    queryKey: ["tournament_tags", user, switchEnabled],
    queryFn: () =>
      TagsService.getGetTournamentTags(switchEnabled ? user?.id : undefined),
    enabled: false,
  });

  const filteredTournamentTags =
    tournament_tags?.filter(
      (tt) =>
        tt.tag_name.includes(tagInputString) ||
        tt.tag_normalized.includes(tagInputString),
    ) || [];

  useEffect(() => {
    console.log("user", user, loading, switchEnabled);
    refetch().catch((e) => console.log(e));
  }, [user, loading, switchEnabled]);

  return (
    <div className={"text-gray-400"}>
      <PageHeading includeUnderline={true} text={"Tags"} />
      <small className={"text-lg"}>
        Tags are a feature that enables users to create custom leaderboards. See
        the <Link to={"/faq#tags"}>FAQ</Link> for more information on how to use
        tags.
      </small>

      <Sep className="mt-4" />

      <div className={"flex flex-col items-center gap-4 sm:flex-row"}>
        <Input
          width={"w-full sm:w-80"}
          type={"search"}
          className={"h-12 rounded-lg"}
          placeholder={"Tag Name"}
          onChange={(e) => setTagInputString(e.target.value)}
          value={tagInputString}
        />
        <Tooltip placement={"top"}>
          {user === null && (
            <TooltipContent
              className={
                "rounded-lg border border-gray-600 bg-gray-950 p-2 text-sm text-cyan-500 shadow-lg"
              }
              arrowClassName={
                "fill-gray-950 [&>path:first-of-type]:stroke-gray-600"
              }
            >
              Log in to create tags
            </TooltipContent>
          )}
        </Tooltip>
        <Tooltip placement={"top"}>
          <TooltipTrigger asChild={true}>
            <div className={"text-xg mb-4 ml-auto flex flex-row"}>
              {switchEnabled ? (
                <span className={"pr-4"}>Tags owned by you</span>
              ) : (
                <span className={"pr-4"}>All Tags</span>
              )}
              <Switch
                checked={switchEnabled || false}
                onChange={setSwitchEnabled}
                className={
                  "relative mr-4 inline-flex h-6 w-12 items-center rounded-full border-2 border-gray-600 bg-gray-900"
                }
                disabled={user === null}
              >
                <span
                  className={clsx(
                    switchEnabled
                      ? "translate-x-6 bg-cyan-500"
                      : "translate-x-1 bg-gray-400",
                    "inline-block h-4 w-4 transform rounded-full transition",
                  )}
                />
              </Switch>
            </div>
          </TooltipTrigger>
          {user === null && (
            <TooltipContent
              className={
                "rounded-lg border border-gray-600 bg-gray-950 p-2 text-sm text-cyan-500 shadow-lg"
              }
              arrowClassName={
                "fill-gray-950 [&>path:first-of-type]:stroke-gray-600"
              }
            >
              Log in to see your tags
            </TooltipContent>
          )}
        </Tooltip>
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
              Owner
            </th>
            <th
              scope="col"
              className={"border-b-2 border-solid border-gray-300"}
            >
              Tournament Count
            </th>
          </tr>
        </thead>

        <tbody>
          {filteredTournamentTags?.map((tt) => (
            <tr
              className={
                "text-center align-middle odd:bg-slate-900 even:bg-slate-950"
              }
            >
              <td>
                <Link to={`/?tags=${tt.tag_normalized}`}>{tt.tag_name}</Link>
              </td>
              <td className={"px-4 py-2"}>
                <Link to={`/results/${tt.owner_name}`}>{tt.owner_name}</Link>
              </td>
              <td className={"px-4 py-2"}>{tt.count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
