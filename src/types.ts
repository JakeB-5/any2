export type FormatId = "json" | "yaml" | "toml" | "csv" | "xml" | "markdown" | "html";

export interface FormatHandler {
  id: FormatId;
  extensions: string[];
  mimeTypes: string[];
  parse(input: string): unknown;
  serialize(data: unknown, options?: SerializeOptions): string;
}

export interface SerializeOptions {
  pretty?: boolean;
  indent?: number;
}

export interface ConvertOptions {
  from?: FormatId;
  to: FormatId;
  pretty?: boolean;
  indent?: number;
}
