import { describe, it, expect } from "vitest";
import { convert } from "./converter.js";
import { detectFormat } from "./formats/index.js";

describe("convert", () => {
  const sampleJson = '{"name":"any2","version":"1.0.0","tags":["cli","converter"]}';
  const sampleYaml = `name: any2
version: 1.0.0
tags:
  - cli
  - converter
`;
  const sampleCsv = `name,age,city
Alice,30,Seoul
Bob,25,Tokyo
`;
  const sampleToml = `name = "any2"
version = "1.0.0"

[database]
host = "localhost"
port = 5432
`;
  const sampleXml = `<?xml version="1.0" encoding="UTF-8"?>
<root><name>any2</name><version>1.0.0</version></root>`;

  const sampleMarkdown = `# Hello World

This is a **test** document.

- Item 1
- Item 2
`;

  describe("JSON conversions", () => {
    it("json → yaml", () => {
      const result = convert(sampleJson, { to: "yaml" });
      expect(result).toContain("name: any2");
      expect(result).toContain("version: 1.0.0");
    });

    it("json → toml", () => {
      const result = convert('{"name":"any2","version":"1.0.0"}', { to: "toml" });
      expect(result).toContain('name = "any2"');
    });

    it("json → csv (array of objects)", () => {
      const input = '[{"name":"Alice","age":30},{"name":"Bob","age":25}]';
      const result = convert(input, { to: "csv" });
      expect(result).toContain("name,age");
      expect(result).toContain("Alice,30");
    });

    it("json → xml", () => {
      const result = convert('{"root":{"name":"any2"}}', { to: "xml" });
      expect(result).toContain("<?xml");
      expect(result).toContain("any2");
    });
  });

  describe("YAML conversions", () => {
    it("yaml → json", () => {
      const result = convert(sampleYaml, { from: "yaml", to: "json" });
      const parsed = JSON.parse(result);
      expect(parsed.name).toBe("any2");
      expect(parsed.tags).toEqual(["cli", "converter"]);
    });

    it("yaml → toml", () => {
      const result = convert("name: test\ncount: 42\n", { from: "yaml", to: "toml" });
      expect(result).toContain('name = "test"');
      expect(result).toContain("count = 42");
    });
  });

  describe("CSV conversions", () => {
    it("csv → json", () => {
      const result = convert(sampleCsv, { to: "json" });
      const parsed = JSON.parse(result);
      expect(parsed).toHaveLength(2);
      expect(parsed[0].name).toBe("Alice");
      expect(parsed[1].city).toBe("Tokyo");
    });

    it("csv → yaml", () => {
      const result = convert(sampleCsv, { to: "yaml" });
      expect(result).toContain("name: Alice");
    });
  });

  describe("TOML conversions", () => {
    it("toml → json", () => {
      const result = convert(sampleToml, { from: "toml", to: "json" });
      const parsed = JSON.parse(result);
      expect(parsed.name).toBe("any2");
      expect(parsed.database.port).toBe(5432);
    });

    it("toml → yaml", () => {
      const result = convert(sampleToml, { from: "toml", to: "yaml" });
      expect(result).toContain("name: any2");
      expect(result).toContain("host: localhost");
    });
  });

  describe("XML conversions", () => {
    it("xml → json", () => {
      const result = convert(sampleXml, { to: "json" });
      const parsed = JSON.parse(result);
      expect(parsed.root.name).toBe("any2");
    });
  });

  describe("Markdown conversions", () => {
    it("markdown → html", () => {
      const result = convert(sampleMarkdown, { from: "markdown", to: "html" });
      expect(result).toContain("<h1>Hello World</h1>");
      expect(result).toContain("<strong>test</strong>");
      expect(result).toContain("<li>Item 1</li>");
    });
  });

  describe("same format re-serialization", () => {
    it("json → json (reformats)", () => {
      const ugly = '{"a":1,"b":2}';
      const result = convert(ugly, { to: "json", pretty: true });
      expect(result).toContain("  ");
      const parsed = JSON.parse(result);
      expect(parsed.a).toBe(1);
    });
  });

  describe("error handling", () => {
    it("throws on invalid JSON input", () => {
      expect(() => convert("{invalid", { from: "json", to: "yaml" })).toThrow();
    });

    it("throws on CSV output from non-array", () => {
      expect(() => convert('{"key":"value"}', { to: "csv" })).toThrow(
        "CSV output requires an array"
      );
    });

    it("throws on TOML output from array", () => {
      expect(() => convert("[1,2,3]", { to: "toml" })).toThrow("TOML root must be an object");
    });
  });
});

describe("detectFormat", () => {
  it("detects JSON", () => {
    expect(detectFormat('{"key": "value"}')).toBe("json");
  });

  it("detects JSON array", () => {
    expect(detectFormat("[1, 2, 3]")).toBe("json");
  });

  it("detects XML", () => {
    expect(detectFormat('<?xml version="1.0"?><root/>')).toBe("xml");
  });

  it("detects CSV", () => {
    expect(detectFormat("a,b,c\n1,2,3\n4,5,6")).toBe("csv");
  });

  it("detects YAML", () => {
    expect(detectFormat("key: value\nother: 123")).toBe("yaml");
  });

  it("detects Markdown", () => {
    expect(detectFormat("# Title\n\nSome text")).toBe("markdown");
  });
});
