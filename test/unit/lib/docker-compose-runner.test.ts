import { execFileSync, spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const repositoryRoot = process.cwd();
const runnerPath = join(repositoryRoot, "scripts", "docker-compose.mjs");

const preview = (args: string[]) =>
  execFileSync(process.execPath, [runnerPath, ...args, "--dry-run"], {
    cwd: repositoryRoot,
    encoding: "utf8",
  });

describe("Docker Compose environment runner", () => {
  it("uses .env.prod as the default Docker environment", () => {
    const output = preview([]);

    expect(output).toContain("environment=prod");
    expect(output).toContain("env-file=.env.prod");
    expect(output).toContain("docker compose --env-file .env.prod up --build");
  });

  it("selects another named environment without leaking the option to Compose", () => {
    const output = preview(["--env", "staging", "config"]);

    expect(output).toContain("environment=staging");
    expect(output).toContain("env-file=.env.staging");
    expect(output).toContain("docker compose --env-file .env.staging config");
    expect(output).not.toContain("--env staging config");
  });

  it("accepts the -env alias and rejects unsafe environment names", () => {
    expect(preview(["-env", "dev", "config"])).toContain("env-file=.env.dev");

    const result = spawnSync(
      process.execPath,
      [runnerPath, "--env", "../prod", "config", "--dry-run"],
      { cwd: repositoryRoot, encoding: "utf8" }
    );

    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain(
      "环境名称只能包含字母、数字、短横线和下划线"
    );
  });

  it("keeps Compose resources isolated by deployment environment", () => {
    const compose = readFileSync(
      join(repositoryRoot, "docker-compose.yml"),
      "utf8"
    );
    const prodExample = readFileSync(
      join(repositoryRoot, ".env.prod.example"),
      "utf8"
    );

    expect(compose).not.toMatch(/^version:/m);
    expect(compose).toContain("name: ${COMPOSE_PROJECT_NAME:-hotkey-web-prod}");
    expect(compose).toContain("image: hotkey-web:${HOTKEY_DEPLOY_ENV:-prod}");
    expect(compose).toContain("HOTKEY_DEPLOY_ENV: ${HOTKEY_DEPLOY_ENV:-prod}");
    expect(prodExample).toContain("HOTKEY_DEPLOY_ENV=prod");
    expect(prodExample).toContain("COMPOSE_PROJECT_NAME=hotkey-web-prod");
  });
});
