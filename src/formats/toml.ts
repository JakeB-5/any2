import * as TOML from "smol-toml";
import type { FormatHandler, SerializeOptions } from "../types.js";

export const tomlFormat: FormatHandler = {
  id: "toml",
  extensions: [".toml"],
  mimeTypes: ["application/toml"],

  parse(input: string): unknown {
    return TOML.parse(input);
  },

  serialize(data: unknown, _options?: SerializeOptions): string {
    if (typeof data !== "object" || data === null || Array.isArray(data)) {
      throw new Error("TOML root must be an object (table)");
    }
    return TOML.stringify(data as Record<string, unknown>) + "\n";
  },
};
