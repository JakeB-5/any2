import { parse } from "csv-parse/sync";
import { stringify } from "csv-stringify/sync";
import type { FormatHandler, SerializeOptions } from "../types.js";

export const csvFormat: FormatHandler = {
  id: "csv",
  extensions: [".csv"],
  mimeTypes: ["text/csv"],

  parse(input: string): unknown {
    const records = parse(input, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });
    return records;
  },

  serialize(data: unknown, _options?: SerializeOptions): string {
    if (!Array.isArray(data)) {
      throw new Error("CSV output requires an array of objects");
    }
    if (data.length === 0) return "";

    return stringify(data, {
      header: true,
    });
  },
};
