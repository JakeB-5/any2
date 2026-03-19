import { extname } from "node:path";
import type { ConvertOptions, FormatId } from "./types.js";
import { getFormat, getFormatByExtension, detectFormat } from "./formats/index.js";

export function convert(input: string, options: ConvertOptions): string {
  const fromFormat = resolveInputFormat(input, options.from);
  const toFormat = options.to;

  if (fromFormat === toFormat) {
    // Re-parse and re-serialize for formatting
    const handler = getFormat(fromFormat);
    const data = handler.parse(input);
    return handler.serialize(data, {
      pretty: options.pretty,
      indent: options.indent,
    });
  }

  const sourceHandler = getFormat(fromFormat);
  const targetHandler = getFormat(toFormat);

  const data = sourceHandler.parse(input);
  return targetHandler.serialize(data, {
    pretty: options.pretty,
    indent: options.indent,
  });
}

export function convertFile(
  input: string,
  filePath: string,
  options: Omit<ConvertOptions, "from"> & { from?: FormatId }
): string {
  const ext = extname(filePath);
  const fromFormat = options.from ?? getFormatByExtension(ext)?.id;

  if (!fromFormat) {
    throw new Error(
      `Cannot detect format for "${filePath}". Use --from to specify the input format.`
    );
  }

  return convert(input, { ...options, from: fromFormat });
}

function resolveInputFormat(input: string, explicitFormat?: FormatId): FormatId {
  if (explicitFormat) return explicitFormat;

  const detected = detectFormat(input);
  if (!detected) {
    throw new Error(
      "Cannot auto-detect input format. Use --from to specify the input format."
    );
  }
  return detected;
}
