import path from "node:path";

const repositoryRoot = process.cwd();

export default {
  requestImportStatement:
    "import { request, type RequestOptions } from '@/lib/request';",
  requestOptionsType: "RequestOptions",
  schemaPath: path.resolve(repositoryRoot, "../hotkey-server/docs/openapi/swagger.json"),
  serversPath: path.resolve(repositoryRoot, "src/services/hotkey"),
  projectName: "hotkey-server",
  namespace: "HotKeyAPI",
};
