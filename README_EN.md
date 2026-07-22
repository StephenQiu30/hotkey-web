<p align="center">
  <img src="public/brand/hotkey-mark.svg" width="72" alt="HotKey logo">
</p>

<h1 align="center">HotKey Web</h1>

<p align="center"><a href="README.md">简体中文</a> · <a href="README_EN.md">English</a></p>

<p align="center">
  <strong>An open-source AI event intelligence workspace for creators and researchers.</strong>
</p>

<p align="center">
  <a href="https://github.com/StephenQiu30/hotkey-web/actions/workflows/ci.yml"><img alt="CI" src="https://github.com/StephenQiu30/hotkey-web/actions/workflows/ci.yml/badge.svg?branch=main"></a>
  <a href="https://nextjs.org/"><img alt="Next.js 16" src="https://img.shields.io/badge/Next.js-16-black?logo=next.js"></a>
  <a href="https://www.typescriptlang.org/"><img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white"></a>
  <a href="LICENSE"><img alt="MIT License" src="https://img.shields.io/badge/license-MIT-green.svg"></a>
</p>

HotKey turns public signals from RSS, Atom, Hacker News, and other compliant sources into verifiable events, editorial ideas, and daily or weekly reports. `hotkey-web` is the desktop workspace for managing monitors and sources, reading evidence, understanding events, publishing reports, and configuring delivery.

> If this direction is useful to you, consider starring the project, sharing a real-world use case, or contributing to the UI, visualizations, accessibility, and documentation.

## What you can do

- **Find accelerating events** through heat, trend, and recency instead of browsing isolated items.
- **Inspect the evidence** through event members, timelines, entities, claims, sources, and original Markdown documents.
- **Manage long-running monitors** with multilingual rules, source configuration, previews, and explicit publishing.
- **Turn signals into output** by building and publishing daily or weekly reports to Obsidian, email, and private RSS/Atom.
- **Keep control of your data** because the browser talks to your own Next.js and [hotkey-server](https://github.com/StephenQiu30/hotkey-server) deployment.
- **Operate from one workspace** with identity, content, favorites, sources, notifications, profile, and settings screens.

## Workflow

```text
Public sources → Monitors → Evidence → Events → AI analysis → Reports and knowledge delivery
                                ↑
                         HotKey Web workspace
```

The frontend does not hand-write backend DTOs. Request functions and types are generated from the `hotkey-server` OpenAPI document.

## Stack

| Area | Technology |
|------|------------|
| Application | Next.js 16 App Router, React 19, TypeScript 5.9 |
| Styling | Tailwind CSS 4, CSS variables, dark theme |
| UI foundations | Radix UI, Lucide Icons, composed local components |
| Charts and motion | Recharts, GSAP |
| Data and state | Axios, Zustand, generated OpenAPI client |
| Testing | Vitest, Testing Library, Playwright / agent-browser |

## Quick start

### Requirements

- Node.js 22 (the CI version)
- npm
- A running [hotkey-server](https://github.com/StephenQiu30/hotkey-server), available at `http://127.0.0.1:8080` by default

### Local development

```bash
git clone https://github.com/StephenQiu30/hotkey-web.git
cd hotkey-web
npm ci
cp .env.example .env
npm run dev
```

Open <http://localhost:3000>.

The default environment sends same-origin `/api` and `/healthz` requests through the Next.js server to your backend:

```dotenv
HOTKEY_API_ORIGIN=http://127.0.0.1:8080
```

This variable is server-only and is not exposed to the browser as `NEXT_PUBLIC_*`. See [`.env.example`](.env.example) for the complete configuration.

### Docker

With the backend running on port `8080` of the host:

```bash
docker compose up --build
```

Override `HOTKEY_API_ORIGIN` when the backend uses a different address.

## Commands

```bash
npm run dev
npm run typecheck
npm run test:unit
npm run build
npm run openapi:generate
```

Only regenerate the client when the backend OpenAPI contract changes. Generated files live under `src/services/hotkey/hotkey-server/` and should not be edited manually.

## Project structure

```text
src/app/                         # Routes and pages
src/components/                  # Product and UI components
src/layouts/                     # Workspace layouts
src/lib/                         # HTTP, auth session, and utilities
src/stores/                      # Zustand stores
src/services/hotkey/             # Generated OpenAPI client
test/                            # Centralized unit tests
docs/                            # Product, design, plan, acceptance, and operations docs
```

## Project status

HotKey Web is under active development. Authentication, the main intelligence workspace, monitors, sources, content evidence, reports, favorites, notifications, profile, and settings are connected to the real backend contract. Navigation, visual details, and selected workflows will continue to evolve before 1.0.

The current version is intended for local use, self-hosted evaluation, and collaborative development.

## Contributing

Contributions to accessibility, responsive behavior, visualizations, testing, performance, documentation, and new backend-backed workflows are welcome.

Read the [contribution guide](CONTRIBUTING.md), [code of conduct](CODE_OF_CONDUCT.md), and [security policy](SECURITY.md). Please open an Issue before large changes and describe the user problem, interaction scope, and acceptance criteria.

## Related repositories

| Repository | Purpose |
|------------|---------|
| [hotkey-server](https://github.com/StephenQiu30/hotkey-server) | Backend, jobs, data model, and OpenAPI source of truth |
| [hotkey-web](https://github.com/StephenQiu30/hotkey-web) | This repository, the desktop web workspace |

## License

HotKey Web is open source under the [MIT License](LICENSE). The `private: true` field in `package.json` only prevents accidental npm publication; it does not make the GitHub project proprietary.
