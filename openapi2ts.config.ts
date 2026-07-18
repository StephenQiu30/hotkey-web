import path from "node:path";

const repositoryRoot = process.cwd();

export const DEFAULT_OPENAPI_SCHEMA_URL = "http://127.0.0.1:8080/openapi.json";

export function resolveOpenAPISchemaPath(configuredSource = process.env.HOTKEY_OPENAPI_SCHEMA) {
  const source = configuredSource?.trim();
  if (!source) return DEFAULT_OPENAPI_SCHEMA_URL;
  if (/^https?:\/\//i.test(source)) return source;
  return path.resolve(repositoryRoot, source);
}

export default {
  requestImportStatement:
    "import { request, type RequestOptions } from '@/lib/request';",
  requestOptionsType: "RequestOptions",
  schemaPath: resolveOpenAPISchemaPath(),
  serversPath: path.resolve(repositoryRoot, "src/services/hotkey"),
  projectName: "hotkey-server",
  namespace: "HotKeyAPI",
};
