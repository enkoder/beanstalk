import { BellIcon } from "@heroicons/react/24/outline";
import { Sep } from "../../../components/Sep";
import { BlogContent, Section } from "../components/BlogSections";
import type { BlogPost } from "../types";

export const HelloWorld: BlogPost = {
  id: "hello-world",
  title: "Hello World",
  date: "2024-01-13",
  showTOC: true,
  showInList: true,
  component: ({ onSectionsChange }) => {
    return (
      <BlogContent onSectionsChange={onSectionsChange}>
        <Section title="Hello World">
          I'm glad you're here! This is the first ever post to the Beanstalk
          blog. I'll use these blog pages as a way to share context about any
          changes made to the Beanstalk. Additionally, I'm going to explore
          writing more throughout the competitive season as interesting
          observations come up. Stay tuned for more updates!
        </Section>
        <Section title="Changes">
          Starting with this post, let's talk about the new blog post and the
          supporting changes. Whats common for many websites is to have the blog
          be separate from the main app/website. I decided to do this all within
          in the Beanstalk website because frankly I have never done it before
          and I like the idea of forcing myself to interact with the codebase
          more. Having to open the codebase to make a change is a good way to
          force myself to be more hands on. I suspect more positive changes will
          come from this.
          <Sep className="mt-4" />
          Additionally, I really wanted to have a way to notify logged in users
          that a new blog post has been posted. You'll now find a bell icon{" "}
          <BellIcon className="inline h-4 w-4" /> in the top right corner of the
          screen that will notify you when a new blog post has been posted. In
          the future I'd like to improve that UI element to show a modal of the
          blog titles and maybe some images, but for now clicking the bell will
          link you to the most recent article. I hope adding the bell icon will
          also have a positive side effect of more people signing in to create
          accounts. We'll see about that though.
          <Sep className="mt-4" />I didn't love continuing to slap more
          non-beanstalk pages on the navbar, so I moved the FAQ, Beans, and Code
          pages under the Blog page as "Featured Guides" in a pinned section on
          the top of the page. As the blog list grows, this page will no doubt
          get some love from a design perspective.
          <Sep className="mt-4" />
          That's all for now! I'm excited to start writing more - stay tuned for
          my next post when I share my 2024 observations and goals for the next
          season.
        </Section>
      </BlogContent>
    );
  },
};
