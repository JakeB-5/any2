# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**any2** is a universal data format converter (CLI + library) built in TypeScript. It converts between JSON, YAML, TOML, CSV, XML, Markdown, and HTML using a plugin-based format handler architecture.

## Commands

```bash
npm run build        # Build with tsup (ESM output to dist/)
npm test             # Run tests with vitest (--no-cache)
npm run test:watch   # Watch mode tests
npm run lint         # Lint with Biome
npm run lint:fix     # Auto-fix lint issues
```

Run a single test file:
```bash
npx vitest run src/converter.test.ts --no-cache
```

Test the CLI manually:
```bash
echo '{"key":"value"}' | node dist/cli/index.js --to yaml
```

## Architecture

### Format Handler Pattern

All format support is implemented via the `FormatHandler` interface (`src/types.ts`):

```
FormatHandler { id, extensions, mimeTypes, parse(input) → data, serialize(data) → string }
```

Each format lives in `src/formats/<format>.ts` and is registered in `src/formats/index.ts`. To add a new format:
1. Create `src/formats/<name>.ts` implementing `FormatHandler`
2. Register it in the `formats` Map in `src/formats/index.ts`
3. Add the format ID to the `FormatId` union in `src/types.ts`

### Conversion Pipeline

`convert()` in `src/converter.ts` is the core: parse input with source handler → serialize with target handler. `convertFile()` adds file-extension-based format detection. `detectFormat()` in `src/formats/index.ts` does content-sniffing for stdin input.

### Entry Points

- `src/index.ts` — library API (convert, convertFile, detectFormat, listFormats)
- `src/cli/index.ts` — CLI entry point using commander.js

### Key Constraints

- CSV serialize requires `Array<object>` input — non-array data throws
- TOML serialize requires root-level object — arrays throw
- Markdown parse wraps content in `{ content, format: "markdown" }` to preserve raw text for HTML conversion
- Format detection order matters: XML → JSON → TOML → CSV → YAML → Markdown (most specific first)
