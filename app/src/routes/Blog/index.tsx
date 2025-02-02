import { faHeart } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { BlogService } from "../../client/services/BlogService";
import { PageHeading } from "../../components/PageHeader";
import useAuth from "../../useAuth";
import { TableOfContents } from "./components/TableOfContents";
import { posts } from "./posts";
import type { BlogPost, Section } from "./types";

// New component for the pinned pages header
function PinnedPagesHeader() {
  const pinnedPages = [
    {
      title: "Understanding Beans",
      description: "Learn how tournament points are calculated",
      path: "/blog/beans",
      icon: "🌱",
    },
    {
      title: "FAQ",
      description: "Frequently asked questions about Beanstalk",
      path: "/blog/faq",
      icon: "❓",
    },
    {
      title: "Code",
      description: "View the ranking algorithm implementation",
      path: "/blog/code",
      icon: "💻",
    },
  ];

  return (
    <div className="my-8">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {pinnedPages.map((page) => (
          <Link
            key={page.path}
            to={page.path}
            className="block rounded-lg bg-gray-800 p-4 transition-colors hover:bg-gray-700"
          >
            <div className="mb-2 flex items-center gap-3">
              <span className="text-2xl">{page.icon}</span>
              <h3 className="font-medium text-gray-200">{page.title}</h3>
            </div>
            <p className="text-gray-400 text-sm">{page.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

function BlogPostList() {
  return (
    <>
      <PinnedPagesHeader />
      <h1 className="font-bold text-2xl text-gray-300">Blog Posts</h1>
      {posts
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .filter((post) => post.showInList !== false)
        .map((post) => (
          <article key={post.id} className="p-2 py-4">
            <Link to={`/blog/${post.id}`}>
              <h2 className="mb-2 font-semibold text-cyan-600 text-xl hover:text-cyan-400">
                {post.title}
              </h2>
              <div className="text-gray-400 text-sm">
                {new Date(post.date).toLocaleDateString()}
              </div>
            </Link>
          </article>
        ))}
    </>
  );
}

function Blog({ post }: { post: BlogPost }) {
  const [sections, setSections] = useState<Section[]>([]);
  const PostComponent = post.component;
  const { user } = useAuth();

  useEffect(() => {
    if (user?.id) {
      BlogService.postViewBlogPost({
        blogDate: post.date,
      });
    }
  }, [post.date, user?.id]);

  return (
    <div className="flex max-w-7xl gap-8 pt-4">
      <div className="mb-8 grow text-gray-400">
        <PageHeading text={post.title} />
        <div className="mb-8 text-gray-400">
          {new Date(post.date).toLocaleDateString()}
        </div>
        <PostComponent onSectionsChange={setSections} />
      </div>
      {post.showTOC && <TableOfContents sections={sections} />}
    </div>
  );
}

export function BlogPage() {
  const { postId } = useParams<{ postId?: string }>();

  if (!postId) {
    return <BlogPostList />;
  }

  const currentPost = posts.find((post) => post.id === postId);

  if (!currentPost) {
    return <div>Post not found</div>;
  }

  return (
    <div className="text-gray-400">
      <Blog post={currentPost} />
      <div className={"my-32 flex flex-row justify-center"}>
        <span className={"text-lg"}>
          Made with{" "}
          <FontAwesomeIcon className={"text-red-700 text-xl"} icon={faHeart} />{" "}
          by <Link to={"https://github.com/enkoder/beanstalk"}>enkoder</Link>
        </span>
      </div>
    </div>
  );
}
