import { Beans } from "./posts/beans";
import { Code } from "./posts/code";
import { FAQ } from "./posts/faq";
import { HelloWorld } from "./posts/hello-world";
import type { BlogPost } from "./types";

export const posts: BlogPost[] = [HelloWorld, Beans, FAQ, Code];
