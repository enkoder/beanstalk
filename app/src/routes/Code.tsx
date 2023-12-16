import { useEffect, useState } from "react";
// @ts-ignore
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
// @ts-ignore
import rankings from "../../../api/src/lib/ranking.ts";
import { PageHeading } from "../stories/PageHeader";
import { Select } from "../stories/Select";

export function Code() {
  const [loading, setLoading] = useState<boolean>(true);
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  const [themes, setThemes] = useState<any[]>([]);
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  const [selectedTheme, setSelectedTheme] = useState<any>();

  useEffect(() => {
    setLoading(true);
    // @ts-ignore
    import("react-syntax-highlighter/dist/esm/styles/prism").then((styles) => {
      const themes = [];
      for (const name in styles) {
        const theme = styles[name];
        theme.name = name;
        themes.push(theme);
      }
      setThemes(themes);
      setSelectedTheme(styles.vscDarkPlus);
      setLoading(false);
    });
  }, []);

  // @ts-ignore
  return (
    <>
      <PageHeading text={"Code"} includeUnderline={true} className={"mb-8"} />
      {!loading && (
        <div className={"flex flex-col"}>
          <Select
            label={"Theme Picker"}
            width={"w-64"}
            items={themes}
            selected={selectedTheme}
            renderItem={(t) => {
              return t.name;
            }}
            onChange={(t) => setSelectedTheme(t)}
          />
          <text className={"my-2 text-gray-400"}>
            Below is the exact code currently deployed that defines the points
            distribution payout for each tournament.
          </text>

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
    </>
  );
}
