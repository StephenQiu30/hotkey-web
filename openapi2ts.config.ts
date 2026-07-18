import path from "node:path";

const repositoryRoot = process.cwd();

export default {
  requestImportStatement:
    "import { request, type RequestOptions } from '@/lib/request';",
  requestOptionsType: "RequestOptions",
  schemaPath: "http://127.0.0.1:8080/openapi.json",
  serversPath: path.resolve(repositoryRoot, "src/services/hotkey"),
  projectName: "hotkey-server",
  namespace: "HotKeyAPI",
};
