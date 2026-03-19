import yaml from "js-yaml";
import type { FormatHandler, SerializeOptions } from "../types.js";

export const yamlFormat: FormatHandler = {
  id: "yaml",
  extensions: [".yaml", ".yml"],
  mimeTypes: ["application/x-yaml", "text/yaml"],

  parse(input: string): unknown {
    return yaml.load(input);
  },

  serialize(data: unknown, options?: SerializeOptions): string {
    const indent = options?.indent ?? 2;
    return yaml.dump(data, {
      indent,
      lineWidth: options?.pretty !== false ? 80 : -1,
      noRefs: true,
      sortKeys: false,
    });
  },
};
