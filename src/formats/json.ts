import type { FormatHandler, SerializeOptions } from "../types.js";

export const jsonFormat: FormatHandler = {
  id: "json",
  extensions: [".json", ".jsonl"],
  mimeTypes: ["application/json"],

  parse(input: string): unknown {
    return JSON.parse(input);
  },

  serialize(data: unknown, options?: SerializeOptions): string {
    const indent = options?.pretty !== false ? (options?.indent ?? 2) : undefined;
    return JSON.stringify(data, null, indent) + "\n";
  },
};
