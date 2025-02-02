import { useEffect, useState } from "react";
// @ts-ignore
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
// @ts-ignore
import rankings from "../../../../../api/src/lib/ranking.ts";
import { Select } from "../../../components/Select";
import { BlogContent, Section } from "../components/BlogSections";
import type { BlogPost } from "../types";

export const Code: BlogPost = {
  id: "code",
  title: "Code: The Beanstalk Algorithm",
  date: "2024-01-01",
  showTOC: false,
  showInList: false,
  component: ({ onSectionsChange }) => {
    const [loading, setLoading] = useState<boolean>(true);
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    const [themes, setThemes] = useState<any[]>([]);
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    const [selectedTheme, setSelectedTheme] = useState<any>();

    useEffect(() => {
      setLoading(true);
      // @ts-ignore
      import("react-syntax-highlighter/dist/esm/styles/prism").then(
        (styles) => {
          const themes = [];
          for (const name in styles) {
            const theme = styles[name];
            theme.name = name;
            themes.push(theme);
          }
          setThemes(themes);
          setSelectedTheme(styles.vscDarkPlus);
          setLoading(false);
        },
      );
    }, []);

    // @ts-ignore
    return (
      <BlogContent onSectionsChange={onSectionsChange}>
        <Section title="The Algorithm">
          <p>
            Below you can find the exact code currently deployed that defines
            the points distribution payout for each tournament. Feel free to
            explore different syntax highlighting themes using the selector
            below.
          </p>

          {!loading && (
            <div className={"flex flex-col"}>
              <Select
                label={"Theme Picker"}
                width={"w-64"}
                items={themes}
                selected={selectedTheme}
                renderItem={(t) => t.name}
                onChange={(t) => setSelectedTheme(t)}
              />

              <SyntaxHighlighter
                language="typescript"
                style={selectedTheme}
                customStyle={{ fontSize: "small" }}
                showLineNumbers={true}
              >
                {rankings}
              </SyntaxHighlighter>
            </div>
          )}
        </Section>
      </BlogContent>
    );
  },
};
