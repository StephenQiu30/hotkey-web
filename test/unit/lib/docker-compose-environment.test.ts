import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const repositoryRoot = process.cwd();
const readRepositoryFile = (path: string) =>
  readFileSync(join(repositoryRoot, path), "utf8");

describe("Docker Compose environment configuration", () => {
  it("uses separate env and prod Compose files", () => {
    const envCompose = readRepositoryFile("docker-compose-env.yml");
    const prodCompose = readRepositoryFile("docker-compose-prod.yml");

    expect(existsSync(join(repositoryRoot, "docker-compose.yml"))).toBe(false);
    expect(envCompose).toContain("name: hotkey-web-env");
    expect(envCompose).toContain("image: hotkey-web:env");
    expect(envCompose).toContain("HOTKEY_DEPLOY_ENV: env");
    expect(prodCompose).toContain("name: hotkey-web-prod");
    expect(prodCompose).toContain("image: hotkey-web:prod");
    expect(prodCompose).toContain("HOTKEY_DEPLOY_ENV: prod");
  });

  it("keeps production values in docker-compose-prod.yml", () => {
    const prodExample = readRepositoryFile(".env.prod.example");

    expect(prodExample).toContain(
      "HOTKEY_API_ORIGIN=http://host.docker.internal:8080"
    );
    expect(prodExample).toContain("WEB_PORT=3000");
    expect(prodExample).not.toContain("HOTKEY_DEPLOY_ENV");
  });

  it("documents the direct Docker Compose production command", () => {
    const readme = readRepositoryFile("README.md");
    const packageJson = JSON.parse(readRepositoryFile("package.json")) as {
      scripts: Record<string, string>;
    };

    expect(readme).toContain(
      "docker compose -f docker-compose-env.yml up --build"
    );
    expect(readme).toContain(
      "docker compose --env-file .env.prod -f docker-compose-prod.yml up --build"
    );
    expect(Object.keys(packageJson.scripts)).not.toContain("docker:up");
    expect(Object.keys(packageJson.scripts)).not.toContain("docker:config");
  });
});
