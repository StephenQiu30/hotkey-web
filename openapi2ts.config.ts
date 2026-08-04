import path from "node:path";
import type { GenerateServiceProps } from "@umijs/openapi";

const repositoryRoot = process.cwd();

const openapiConfig = {
  requestImportStatement:
    "import { request, type RequestOptions } from '@/lib/request';",
  requestOptionsType: "RequestOptions",
  schemaPath: "http://127.0.0.1:8080/openapi.json",
  serversPath: path.resolve(repositoryRoot, "src/services/hotkey"),
  projectName: "hotkey-server",
  namespace: "HotKeyAPI",
  enumStyle: "string-literal",
  declareType: "type",
  nullable: false,
  isCamelCase: true,
} satisfies GenerateServiceProps;

export default openapiConfig;
