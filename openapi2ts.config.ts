import path from "node:path";

const serverSchemaPath = "../hotkey-server/docs/openapi.json";

export default {
  requestImportStatement: "import { request } from '@/lib/request';",
  schemaPath: path.resolve(__dirname, serverSchemaPath),
  serversPath: "./src/services/hotkey",
  projectName: "hotkey-server",
  namespace: "HotKeyAPI",
};
