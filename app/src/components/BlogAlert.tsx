import { BellIcon } from "@heroicons/react/24/outline";
import moment from "moment";
import { useNavigate } from "react-router-dom";
import { posts } from "../routes/Blog/posts";
import useAuth from "../useAuth";
import { Tooltip, TooltipContent, TooltipTrigger } from "./Tooltip";

export function BlogAlert() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Get the most recent blog post date
  const latestPost = posts
    .filter((post) => post.showInList)
    .sort((a, b) => moment(b.date).diff(moment(a.date)))[0];

  const hasNewPost = Boolean(
    user &&
      (!user.oldest_blog_post_date ||
        moment(latestPost?.date).isAfter(moment(user.oldest_blog_post_date))),
  );

  const button = (
    <button
      type="button"
      onClick={() => navigate(`/blog/${latestPost?.id}`)}
      className="relative rounded-full bg-gray-800 p-1 text-gray-400 hover:text-white focus:outline-none"
    >
      <span className="-inset-1.5 absolute" />
      <span className="sr-only">View blog updates</span>
      <BellIcon className="h-6 w-6" aria-hidden="true" />
      {hasNewPost && (
        <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-600 ring-1 ring-gray-400" />
      )}
    </button>
  );

  if (!user) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{button}</TooltipTrigger>
        <TooltipContent
          className="mt-2 rounded-lg border border-gray-600 bg-gray-950 p-2 text-cyan-500 text-sm shadow-lg"
          arrowClassName={
            "fill-gray-950 [&>path:first-of-type]:stroke-gray-600"
          }
        >
          Log in to get notified when new blog posts are published
        </TooltipContent>
      </Tooltip>
    );
  }

  return button;
}
