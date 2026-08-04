#!/usr/bin/env node

import { existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const DEFAULT_ENVIRONMENT = "prod";
const ENVIRONMENT_PATTERN = /^[a-z0-9][a-z0-9_-]*$/i;
const ENVIRONMENT_FLAGS = new Set(["--env", "-e", "-env"]);
const repositoryRoot = join(dirname(fileURLToPath(import.meta.url)), "..");

const help = `HotKey Docker Compose 启动器

用法：
  npm run docker:up                         # 默认加载 .env.prod
  npm run docker:up -- --env staging -d    # 加载 .env.staging
  npm run docker:config -- -env dev         # -env 是 --env 的兼容别名

选项：
  --env, -e, -env <name>  选择 .env.<name>，默认 prod
  --dry-run                只打印最终命令，不调用 Docker
  --help, -h               显示帮助
`;

const fail = (message) => {
  console.error(`[HotKey Docker] ${message}`);
  process.exit(1);
};

const shellValue = (value) =>
  /^[a-z0-9_./:=@-]+$/i.test(value) ? value : `'${value.replaceAll("'", "'\\''")}'`;

let environment = DEFAULT_ENVIRONMENT;
let dryRun = false;
let showHelp = false;
const composeArguments = [];
const rawArguments = process.argv.slice(2);

for (let index = 0; index < rawArguments.length; index += 1) {
  const argument = rawArguments[index];

  if (ENVIRONMENT_FLAGS.has(argument)) {
    const value = rawArguments[index + 1];
    if (!value) fail(`${argument} 缺少环境名称。`);
    environment = value;
    index += 1;
    continue;
  }

  if (argument.startsWith("--env=")) {
    environment = argument.slice("--env=".length);
    continue;
  }

  if (argument === "--dry-run") {
    dryRun = true;
    continue;
  }

  if (argument === "--help" || argument === "-h") {
    showHelp = true;
    continue;
  }

  composeArguments.push(argument);
}

if (showHelp) {
  console.log(help);
  process.exit(0);
}

if (!ENVIRONMENT_PATTERN.test(environment)) {
  fail("环境名称只能包含字母、数字、短横线和下划线，且必须以字母或数字开头。");
}

if (composeArguments.length === 0) {
  composeArguments.push("up", "--build");
}

const envFile = `.env.${environment}`;
const envFilePath = join(repositoryRoot, envFile);
const dockerArguments = ["compose", "--env-file", envFile, ...composeArguments];
const commandPreview = ["docker", ...dockerArguments].map(shellValue).join(" ");

console.log(`[HotKey Docker] environment=${environment}`);
console.log(`[HotKey Docker] env-file=${envFile}`);

if (dryRun) {
  console.log(commandPreview);
  process.exit(0);
}

if (!existsSync(envFilePath)) {
  const exampleFile = `${envFile}.example`;
  const initializationHint = existsSync(join(repositoryRoot, exampleFile))
    ? `请先执行：cp ${exampleFile} ${envFile}`
    : `请先创建 ${envFile}。可从 .env.prod.example 复制后修改。`;
  fail(`${envFile} 不存在。${initializationHint}`);
}

console.log(`[HotKey Docker] ${commandPreview}`);
const result = spawnSync("docker", dockerArguments, {
  cwd: repositoryRoot,
  env: process.env,
  stdio: "inherit",
});

if (result.error) {
  fail(`Docker Compose 启动失败：${result.error.message}`);
}

process.exit(result.status ?? 1);
