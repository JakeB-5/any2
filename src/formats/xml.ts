import { XMLParser, XMLBuilder } from "fast-xml-parser";
import type { FormatHandler, SerializeOptions } from "../types.js";

export const xmlFormat: FormatHandler = {
  id: "xml",
  extensions: [".xml"],
  mimeTypes: ["application/xml", "text/xml"],

  parse(input: string): unknown {
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: "@_",
      textNodeName: "#text",
    });
    return parser.parse(input);
  },

  serialize(data: unknown, options?: SerializeOptions): string {
    if (typeof data !== "object" || data === null) {
      throw new Error("XML output requires an object");
    }
    const builder = new XMLBuilder({
      ignoreAttributes: false,
      attributeNamePrefix: "@_",
      textNodeName: "#text",
      format: options?.pretty !== false,
      indentBy: " ".repeat(options?.indent ?? 2),
      suppressEmptyNode: true,
    });
    const xml = builder.build(data) as string;
    return '<?xml version="1.0" encoding="UTF-8"?>\n' + xml + "\n";
  },
};
