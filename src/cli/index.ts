#!/usr/bin/env node

import { readFileSync } from "node:fs";
import { Command } from "commander";
import { convert, convertFile, listFormats } from "../index.js";
import type { FormatId } from "../types.js";

const program = new Command();

program
  .name("any2")
  .description("Universal data format converter - convert anything to anything")
  .version("1.0.0")
  .argument("[input]", "Input file path (reads from stdin if omitted)")
  .requiredOption("-t, --to <format>", `Target format (${listFormats().join(", ")})`)
  .option("-f, --from <format>", "Source format (auto-detected if omitted)")
  .option("--no-pretty", "Disable pretty printing")
  .option("-i, --indent <number>", "Indentation level", "2")
  .addHelpText(
    "after",
    `
Examples:
  $ any2 data.json --to yaml
  $ any2 config.yaml --to toml
  $ any2 data.csv --to json
  $ cat data.json | any2 --to yaml
  $ any2 README.md --to html
  $ any2 data.xml --to json --no-pretty
`
  );

program.parse();

const opts = program.opts<{
  to: string;
  from?: string;
  pretty: boolean;
  indent: string;
}>();

const formats = listFormats();
const toFormat = opts.to as FormatId;
const fromFormat = opts.from as FormatId | undefined;

if (!formats.includes(toFormat)) {
  console.error(`Error: Unknown target format "${opts.to}". Supported: ${formats.join(", ")}`);
  process.exit(1);
}

if (fromFormat && !formats.includes(fromFormat)) {
  console.error(`Error: Unknown source format "${opts.from}". Supported: ${formats.join(", ")}`);
  process.exit(1);
}

const inputFile = program.args[0];

try {
  let result: string;

  if (inputFile) {
    const content = readFileSync(inputFile, "utf-8");
    result = convertFile(content, inputFile, {
      to: toFormat,
      from: fromFormat,
      pretty: opts.pretty,
      indent: parseInt(opts.indent, 10),
    });
  } else {
    // Read from stdin
    const content = readFileSync(0, "utf-8");
    result = convert(content, {
      to: toFormat,
      from: fromFormat,
      pretty: opts.pretty,
      indent: parseInt(opts.indent, 10),
    });
  }

  process.stdout.write(result);
} catch (err) {
  const message = err instanceof Error ? err.message : String(err);
  console.error(`Error: ${message}`);
  process.exit(1);
}
