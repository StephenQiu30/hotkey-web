import path from "node:path";

export default {
  requestImportStatement: "import { request } from '@/lib/request';",
  schemaPath: path.resolve(__dirname, "../hotkey-server/docs/swagger.json"),
  serversPath: ".",
  projectName: "src/services",
  namespace: "HotKeyAPI",
};
