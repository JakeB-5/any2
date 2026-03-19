import { marked } from "marked";
import type { FormatHandler, SerializeOptions } from "../types.js";

export const markdownFormat: FormatHandler = {
  id: "markdown",
  extensions: [".md", ".markdown", ".mdx"],
  mimeTypes: ["text/markdown"],

  parse(input: string): unknown {
    // Markdown is parsed as-is; conversion to HTML happens in serialize when target is HTML
    return { content: input, format: "markdown" };
  },

  serialize(data: unknown, _options?: SerializeOptions): string {
    if (typeof data === "object" && data !== null && "content" in data) {
      return (data as { content: string }).content;
    }
    // Convert structured data to markdown table if array of objects
    if (Array.isArray(data) && data.length > 0 && typeof data[0] === "object") {
      return arrayToMarkdownTable(data as Record<string, unknown>[]);
    }
    // Fallback: serialize as YAML-like markdown code block
    return "```\n" + JSON.stringify(data, null, 2) + "\n```\n";
  },
};

function arrayToMarkdownTable(data: Record<string, unknown>[]): string {
  const keys = Object.keys(data[0]);
  const header = "| " + keys.join(" | ") + " |";
  const separator = "| " + keys.map(() => "---").join(" | ") + " |";
  const rows = data.map(
    (row) => "| " + keys.map((k) => String(row[k] ?? "")).join(" | ") + " |"
  );
  return [header, separator, ...rows].join("\n") + "\n";
}
