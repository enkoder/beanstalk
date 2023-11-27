import { PageHeading } from "../stories/PageHeader";
import rankings from "../../../api/src/lib/ranking";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

export function Code() {
  return (
    <div className={"mx-4 mt-4 flex h-[100svh] flex-col text-gray-400"}>
      <PageHeading text={"Code"} />
      <text>
        Below is the exact code deployed that defines the points distribution
        payout for each tournament.
      </text>
      <SyntaxHighlighter
        language="typescript"
        style={oneDark}
        customStyle={{ fontSize: "small" }}
        showLineNumbers={true}
      >
        {rankings}
      </SyntaxHighlighter>
    </div>
  );
}
