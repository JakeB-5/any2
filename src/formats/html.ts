import { marked } from "marked";
import type { FormatHandler, SerializeOptions } from "../types.js";

export const htmlFormat: FormatHandler = {
  id: "html",
  extensions: [".html", ".htm"],
  mimeTypes: ["text/html"],

  parse(input: string): unknown {
    // Return raw HTML content
    return { content: input, format: "html" };
  },

  serialize(data: unknown, _options?: SerializeOptions): string {
    // If data came from markdown, convert to HTML
    if (
      typeof data === "object" &&
      data !== null &&
      "format" in data &&
      (data as { format: string }).format === "markdown"
    ) {
      const content = (data as { content: string }).content;
      return marked.parse(content) as string;
    }

    // If data is already HTML
    if (
      typeof data === "object" &&
      data !== null &&
      "format" in data &&
      (data as { format: string }).format === "html"
    ) {
      return (data as { content: string }).content;
    }

    // Convert structured data to HTML table
    if (Array.isArray(data)) {
      return arrayToHtmlTable(data);
    }

    // Fallback: wrap in pre tag
    return `<pre>${escapeHtml(JSON.stringify(data, null, 2))}</pre>\n`;
  },
};

function arrayToHtmlTable(data: unknown[]): string {
  if (data.length === 0) return "<table></table>\n";
  if (typeof data[0] !== "object" || data[0] === null) {
    const items = data.map((d) => `  <li>${escapeHtml(String(d))}</li>`).join("\n");
    return `<ul>\n${items}\n</ul>\n`;
  }

  const records = data as Record<string, unknown>[];
  const keys = Object.keys(records[0]);
  const headerCells = keys.map((k) => `      <th>${escapeHtml(k)}</th>`).join("\n");
  const rows = records
    .map((row) => {
      const cells = keys
        .map((k) => `      <td>${escapeHtml(String(row[k] ?? ""))}</td>`)
        .join("\n");
      return `    <tr>\n${cells}\n    </tr>`;
    })
    .join("\n");

  return `<table>\n  <thead>\n    <tr>\n${headerCells}\n    </tr>\n  </thead>\n  <tbody>\n${rows}\n  </tbody>\n</table>\n`;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
