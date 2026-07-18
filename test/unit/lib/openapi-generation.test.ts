import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

import openapiConfig, {
  DEFAULT_OPENAPI_SCHEMA_URL,
  resolveOpenAPISchemaPath,
} from "../../../openapi2ts.config";

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");

describe("Umi OpenAPI generation contract", () => {
  it("uses the running server OpenAPI document and the repository-standard output directory", () => {
    expect(DEFAULT_OPENAPI_SCHEMA_URL).toBe("http://127.0.0.1:8080/openapi.json");
    expect(openapiConfig.schemaPath).toBe(DEFAULT_OPENAPI_SCHEMA_URL);
    expect(openapiConfig.serversPath).toBe(path.resolve(repositoryRoot, "src/services/hotkey"));
    expect(openapiConfig.projectName).toBe("hotkey-server");
  });

  it("allows CI and offline generation to override the schema with a URL or local file", () => {
    expect(resolveOpenAPISchemaPath("https://api.example.test/openapi.json")).toBe(
      "https://api.example.test/openapi.json",
    );
    expect(resolveOpenAPISchemaPath("../hotkey-server/docs/openapi/swagger.json")).toBe(
      path.resolve(repositoryRoot, "../hotkey-server/docs/openapi/swagger.json"),
    );
    expect(resolveOpenAPISchemaPath("   ")).toBe(DEFAULT_OPENAPI_SCHEMA_URL);
  });

  it("routes generated requests through the shared Axios adapter", () => {
    expect(openapiConfig.requestImportStatement).toBe(
      "import { request, type RequestOptions } from '@/lib/request';",
    );
    expect(openapiConfig.requestOptionsType).toBe("RequestOptions");

    const generatedIdentityService = path.resolve(
      repositoryRoot,
      "src/services/hotkey/hotkey-server/identity.ts",
    );
    expect(fs.readFileSync(generatedIdentityService, "utf8").replaceAll('"', "'")).toContain(
      openapiConfig.requestImportStatement,
    );
  });

  it("keeps application code on the generated server client only", () => {
    const legacyServices = [
      "auth.ts",
      "content.ts",
      "health.ts",
      "hotEvents.ts",
      "monitors.ts",
      "notifications.ts",
      "reports.ts",
      "topics.ts",
      "trending.ts",
      "trends.ts",
      "typings.d.ts",
    ];

    for (const file of legacyServices) {
      expect(fs.existsSync(path.resolve(repositoryRoot, "src/services", file))).toBe(false);
    }

    const sourceRoot = path.resolve(repositoryRoot, "src");
    const queue = [sourceRoot];
    const sourceFiles: string[] = [];
    while (queue.length) {
      const current = queue.pop()!;
      for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
        const resolved = path.join(current, entry.name);
        if (entry.isDirectory()) queue.push(resolved);
        else if (/\.(ts|tsx)$/.test(entry.name)) sourceFiles.push(resolved);
      }
    }

    for (const file of sourceFiles) {
      const source = fs.readFileSync(file, "utf8");
      expect(source, file).not.toMatch(/@\/services\/(?!hotkey\/hotkey-server)/);
    }
  });
});
