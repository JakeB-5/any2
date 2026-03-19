import type { FormatHandler, FormatId } from "../types.js";
import { jsonFormat } from "./json.js";
import { yamlFormat } from "./yaml.js";
import { tomlFormat } from "./toml.js";
import { csvFormat } from "./csv.js";
import { xmlFormat } from "./xml.js";
import { markdownFormat } from "./markdown.js";
import { htmlFormat } from "./html.js";

const formats: Map<FormatId, FormatHandler> = new Map([
  ["json", jsonFormat],
  ["yaml", yamlFormat],
  ["toml", tomlFormat],
  ["csv", csvFormat],
  ["xml", xmlFormat],
  ["markdown", markdownFormat],
  ["html", htmlFormat],
]);

export function getFormat(id: FormatId): FormatHandler {
  const handler = formats.get(id);
  if (!handler) {
    throw new Error(`Unsupported format: ${id}`);
  }
  return handler;
}

export function getFormatByExtension(ext: string): FormatHandler | undefined {
  for (const handler of formats.values()) {
    if (handler.extensions.includes(ext.toLowerCase())) {
      return handler;
    }
  }
  return undefined;
}

export function detectFormat(input: string): FormatId | undefined {
  const trimmed = input.trim();

  // XML detection
  if (trimmed.startsWith("<?xml") || trimmed.startsWith("<")) {
    try {
      getFormat("xml").parse(trimmed);
      return "xml";
    } catch { /* not xml */ }
  }

  // JSON detection
  if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
    try {
      JSON.parse(trimmed);
      return "json";
    } catch { /* not json */ }
  }

  // TOML detection (has [section] headers or key = value)
  if (/^\[[\w.-]+\]/m.test(trimmed) || /^[\w.-]+\s*=\s*/m.test(trimmed)) {
    try {
      getFormat("toml").parse(trimmed);
      return "toml";
    } catch { /* not toml */ }
  }

  // CSV detection (comma-separated with consistent columns)
  const lines = trimmed.split("\n").filter((l) => l.trim());
  if (lines.length >= 2) {
    const commas = lines.map((l) => (l.match(/,/g) || []).length);
    if (commas[0] > 0 && commas.every((c) => c === commas[0])) {
      return "csv";
    }
  }

  // YAML detection (has key: value patterns)
  if (/^[\w.-]+\s*:/m.test(trimmed)) {
    try {
      const result = getFormat("yaml").parse(trimmed);
      if (typeof result === "object" && result !== null) {
        return "yaml";
      }
    } catch { /* not yaml */ }
  }

  // Markdown detection
  if (/^#{1,6}\s/m.test(trimmed) || /^\s*[-*+]\s/m.test(trimmed)) {
    return "markdown";
  }

  return undefined;
}

export function listFormats(): FormatId[] {
  return Array.from(formats.keys());
}
