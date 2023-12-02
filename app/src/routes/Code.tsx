import { PageHeading } from "../stories/PageHeader";
// @ts-ignore
import rankings from "../../../api/src/lib/ranking";
import { Select } from "../stories/Select";
// @ts-ignore
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { useEffect, useState } from "react";

export function Code() {
  const [loading, setLoading] = useState<boolean>(true);
  const [themeNames, setThemeNames] = useState<string[]>([]);
  const [themes, setThemes] = useState<any[]>([]);
  const [selectedTheme, setSelectedTheme] = useState<string>("vscDarkPlus");

  useEffect(() => {
    setLoading(true);
    // @ts-ignore
    import("react-syntax-highlighter/dist/esm/styles/prism").then((styles) => {
      const themeNames = [];
      for (const style in styles) {
        themeNames.push(style);
      }
      setThemeNames(themeNames);
      setThemes(styles);
      setLoading(false);
    });
  }, []);

  return (
    <div
      className={"mt-4 flex h-[100svh] flex-row justify-center overflow-auto"}
    >
      <div className={"m-4 flex w-full flex-col text-gray-300 sm:w-5/6"}>
        <PageHeading text={"Code"} includeUnderline={true} className={"mb-8"} />
        <Select
          label={"Theme Picker"}
          className={"mb-4 w-64 rounded-3xl"}
          onChange={(e) => setSelectedTheme(e.target.value)}
        >
          {themeNames.map((themeName) => (
            <option value={themeName} selected={themeName == selectedTheme}>
              {themeName}
            </option>
          ))}
        </Select>
        <text>
          Below is the exact code deployed that defines the points distribution
          payout for each tournament.
        </text>

        {!loading && (
          <SyntaxHighlighter
            language="typescript"
            style={themes ? themes[selectedTheme] : false}
            customStyle={{ fontSize: "small" }}
            showLineNumbers={true}
          >
            {rankings}
          </SyntaxHighlighter>
        )}
      </div>
    </div>
  );
}
