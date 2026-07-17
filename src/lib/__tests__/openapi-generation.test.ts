import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

import openapiConfig from "../../../openapi2ts.config";

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");

describe("Umi OpenAPI generation contract", () => {
  it("uses the server OpenAPI document and the repository-standard output directory", () => {
    const schemaPath = path.resolve(repositoryRoot, "../hotkey-server/docs/openapi/swagger.json");

    expect(fs.existsSync(schemaPath)).toBe(true);
    expect(openapiConfig.schemaPath).toBe(schemaPath);
    expect(openapiConfig.serversPath).toBe(path.resolve(repositoryRoot, "src/services/hotkey"));
    expect(openapiConfig.projectName).toBe("hotkey-server");
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
});
