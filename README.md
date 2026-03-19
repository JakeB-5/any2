# any2

Universal data format converter — convert anything to anything.

A fast, lightweight CLI tool and library that converts between JSON, YAML, TOML, CSV, XML, and Markdown/HTML formats with automatic input detection.

## Install

```bash
npm install -g any2
```

## Usage

### CLI

```bash
# File conversion
any2 data.json --to yaml
any2 config.yaml --to toml
any2 data.csv --to json
any2 README.md --to html

# Pipe from stdin
cat data.json | any2 --to yaml
echo '{"key": "value"}' | any2 --to toml

# Specify input format explicitly
any2 data.txt --from json --to yaml

# Control formatting
any2 data.json --to xml --no-pretty
any2 data.json --to json --indent 4
```

### Library

```typescript
import { convert, convertFile, detectFormat } from "any2";

// Convert a string
const yaml = convert('{"name": "any2"}', { to: "yaml" });

// Convert with explicit source format
const json = convert("name: any2\nversion: 1.0.0", {
  from: "yaml",
  to: "json",
});

// Convert a file (auto-detects format from extension)
import { readFileSync } from "fs";
const content = readFileSync("data.csv", "utf-8");
const result = convertFile(content, "data.csv", { to: "json" });

// Auto-detect format
const format = detectFormat('{"key": "value"}'); // "json"
```

## Supported Formats

| Format   | Extensions         | Parse | Serialize |
| -------- | ------------------ | ----- | --------- |
| JSON     | `.json`, `.jsonl`  | ✅    | ✅        |
| YAML     | `.yaml`, `.yml`    | ✅    | ✅        |
| TOML     | `.toml`            | ✅    | ✅        |
| CSV      | `.csv`, `.tsv`     | ✅    | ✅        |
| XML      | `.xml`             | ✅    | ✅        |
| Markdown | `.md`, `.markdown` | ✅    | ✅        |
| HTML     | `.html`, `.htm`    | ✅    | ✅        |

### Conversion Notes

- **CSV** output requires array-of-objects input
- **TOML** output requires an object (table) at root level
- **Markdown → HTML** converts using the `marked` library
- **Structured data → Markdown** renders as a markdown table
- **Structured data → HTML** renders as an HTML table

## Format Auto-Detection

When no `--from` flag is provided, any2 detects the input format by:

1. **File extension** (when converting files)
2. **Content sniffing** (when reading from stdin):
   - XML: starts with `<?xml` or `<`
   - JSON: starts with `{` or `[`
   - TOML: contains `[section]` or `key = value` patterns
   - CSV: consistent comma-separated columns
   - YAML: contains `key: value` patterns
   - Markdown: contains `# heading` or list patterns

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Run tests
npm test

# Watch mode
npm run dev
npm run test:watch

# Lint
npm run lint
npm run lint:fix
```

## License

MIT
