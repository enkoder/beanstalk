import { Beans } from "./posts/beans";
import { CBI2024Post } from "./posts/cbi-2024";
import { Code } from "./posts/code";
import { FAQ } from "./posts/faq";
import { HelloWorld } from "./posts/hello-world";
import { SeasonReflectionsPost } from "./posts/season-reflections";
import type { BlogPost } from "./types";

export const posts: BlogPost[] = [
  HelloWorld,
  Beans,
  FAQ,
  Code,
  SeasonReflectionsPost,
  CBI2024Post,
];
