import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const repositoryRoot = process.cwd();
const readRepositoryFile = (path: string) =>
  readFileSync(join(repositoryRoot, path), "utf8");

describe("Docker Compose environment configuration", () => {
  it("uses one docker-compose.yml and defaults deployment values to prod", () => {
    const compose = readRepositoryFile("docker-compose.yml");

    expect(compose).not.toMatch(/^version:/m);
    expect(compose).toContain("name: hotkey-web-${HOTKEY_DEPLOY_ENV:-prod}");
    expect(compose).toContain("image: hotkey-web:${HOTKEY_DEPLOY_ENV:-prod}");
    expect(compose).toContain("HOTKEY_DEPLOY_ENV: ${HOTKEY_DEPLOY_ENV:-prod}");
  });

  it("provides a production env template for --env-file .env.prod", () => {
    const prodExample = readRepositoryFile(".env.prod.example");

    expect(prodExample).toContain("HOTKEY_DEPLOY_ENV=prod");
    expect(prodExample).toContain(
      "HOTKEY_API_ORIGIN=http://host.docker.internal:8080"
    );
    expect(prodExample).toContain("WEB_PORT=3000");
    expect(prodExample).not.toContain("COMPOSE_PROJECT_NAME");
  });

  it("documents the direct Docker Compose production command", () => {
    const readme = readRepositoryFile("README.md");
    const packageJson = JSON.parse(readRepositoryFile("package.json")) as {
      scripts: Record<string, string>;
    };

    expect(readme).toContain(
      "docker compose --env-file .env.prod -f docker-compose.yml up --build"
    );
    expect(Object.keys(packageJson.scripts)).not.toContain("docker:up");
    expect(Object.keys(packageJson.scripts)).not.toContain("docker:config");
  });
});
