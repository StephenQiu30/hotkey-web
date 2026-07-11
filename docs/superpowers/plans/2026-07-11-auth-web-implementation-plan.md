# Web Email Authentication Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver secure Web registration, email/password login, password reset, in-memory access tokens, single-flight refresh, and browser-verified authentication UX against the Server contract.

**Architecture:** `hotkey-server` OpenAPI remains the contract source. A single Axios client owns envelope parsing and token refresh; Zustand owns only in-memory auth state; pages compose reusable authentication form components and never persist tokens or verification tickets.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript 5.9, Ant Design 5, Axios 1.15, Zustand 5, generated OpenAPI types, Vitest, React Testing Library.

## Global Constraints

- Complete both Server plans and freeze `docs/swagger.json` before starting this plan.
- Work in the independent `hotkey-web` Git repository and preserve unrelated changes.
- Generate types/services from the Server OpenAPI contract; do not hand-write drift-prone API response types.
- Access Token and verification Ticket remain in memory only; never use LocalStorage, SessionStorage, query strings, analytics, or logs.
- Refresh Token is an HttpOnly Cookie and is never read by JavaScript.
- Refresh is single-flight; each business request retries at most once.
- Auth status is exactly `initializing`, `authenticated`, or `unauthenticated`.
- Redirect targets accept only same-origin relative paths.
- Apply TDD and commit after every task.

---

## File Map

**Create**

- `src/lib/authSession.ts`: in-memory access token and single-flight refresh coordination.
- `src/lib/authErrors.ts`: stable ErrorCode-to-UI mapping.
- `src/components/auth/AuthShell.tsx`: shared responsive auth page shell.
- `src/components/auth/EmailVerificationStep.tsx`: send/confirm code UI.
- `src/components/auth/PasswordFields.tsx`: password policy UI.
- `src/app/register/page.tsx`: three-step registration.
- `src/app/forgot-password/page.tsx`: reset verification entry.
- `src/app/reset-password/page.tsx`: in-memory Ticket password reset.
- `src/test/setup.ts`, `vitest.config.ts`: component-test harness.
- `src/lib/__tests__/request.test.ts`, `src/stores/__tests__/authStore.test.ts`.
- `src/components/auth/__tests__/EmailVerificationStep.test.tsx`.
- `src/app/register/__tests__/page.test.tsx`.

**Modify**

- `package.json`: test dependencies and scripts.
- `src/lib/request.ts`: credentials, envelope, access token, refresh single-flight.
- `src/services/auth.ts`, `src/services/typings.d.ts`: generated contract.
- `src/stores/authStore.ts`: in-memory status machine.
- `src/components/AppProvider.tsx`: one-time auth initialization.
- `src/components/AuthGuard.tsx`: loading/auth/redirect behavior.
- `src/app/login/page.tsx`: new response and navigation behavior.
- `src/layouts/BasicLayout.tsx`: asynchronous logout.
- `src/components/welcome/WelcomeHeader.tsx`, `WelcomeCTA.tsx`: register/login links.

### Task 1: Install the Web Test Harness and Regenerate Contract

**Files:**
- Modify: `package.json`
- Create: `vitest.config.ts`
- Create: `src/test/setup.ts`
- Modify generated: `src/services/auth.ts`, `src/services/typings.d.ts`

**Interfaces:**
- Produces: `npm run test:unit`, generated auth functions/types.
- Consumers: all later Web tasks.

- [ ] **Step 1: Add exact test scripts and dependencies**

```json
{
  "scripts": {
    "test:unit": "vitest run",
    "test:unit:watch": "vitest"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.6.3",
    "@testing-library/react": "^16.3.0",
    "@testing-library/user-event": "^14.6.1",
    "jsdom": "^26.1.0",
    "vitest": "^3.2.4"
  }
}
```

Merge these keys into the existing package instead of replacing unrelated dependencies.

- [ ] **Step 2: Add Vitest configuration**

```ts
import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: { environment: "jsdom", setupFiles: ["./src/test/setup.ts"], clearMocks: true },
  resolve: { alias: { "@": path.resolve(__dirname, "./src") } },
});
```

`src/test/setup.ts` imports `@testing-library/jest-dom/vitest`.

- [ ] **Step 3: Install and prove the empty harness works**

Run: `npm install && npm run test:unit -- --passWithNoTests`

Expected: PASS.

- [ ] **Step 4: Regenerate from the running Server contract**

Keep `openapi2ts.config.ts` on its existing canonical `http://localhost:8080/swagger/doc.json` source. Start the completed Server on port 8080, verify `curl -fsS http://localhost:8080/swagger/doc.json >/dev/null`, then run: `npm run openapi:generate`

Expected: generated services contain verification send/confirm, register, login, refresh, me, logout, and password reset; generated envelopes expose `code`, `message`, `data`, and `request_id`.

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json vitest.config.ts src/test src/services
git commit -m "test: add web auth test harness and contract"
```

### Task 2: Implement In-Memory Session and Single-Flight Request Layer

**Files:**
- Create: `src/lib/authSession.ts`
- Create: `src/lib/authErrors.ts`
- Modify: `src/lib/request.ts`
- Create: `src/lib/__tests__/request.test.ts`

**Interfaces:**
- Produces: `setAccessToken`, `clearAccessToken`, `getAccessToken`, `refreshAccessToken`, `HotKeyAPIError`.
- Consumers: Zustand store and all generated services.

- [ ] **Step 1: Write failing request-layer tests**

Mock Axios adapter responses and assert Authorization injection, `withCredentials`, envelope errors, one refresh for three concurrent 401s, one retry per request, no refresh recursion for auth endpoints, and no storage writes.

```ts
it("shares one refresh across concurrent 401 responses", async () => {
  const results = await Promise.all([request("/a"), request("/b"), request("/c")]);
  expect(refreshMock).toHaveBeenCalledTimes(1);
  expect(results).toHaveLength(3);
});
```

- [ ] **Step 2: Verify RED**

Run: `npm run test:unit -- src/lib/__tests__/request.test.ts`

Expected: FAIL because the current client reads LocalStorage and has no refresh coordinator.

- [ ] **Step 3: Implement memory token and refresh Promise**

```ts
let accessToken = "";
let expiresAt = 0;
let refreshPromise: Promise<string> | null = null;

export function setAccessToken(token: string, expiresIn: number) {
  accessToken = token;
  expiresAt = Date.now() + expiresIn * 1000;
}

export function clearAccessToken() { accessToken = ""; expiresAt = 0; }

export function refreshAccessToken(): Promise<string> {
  if (!refreshPromise) refreshPromise = performRefresh().finally(() => { refreshPromise = null; });
  return refreshPromise;
}
```

Configure Axios with `withCredentials: true`; add `Authorization` from memory. Mark retried requests with an internal symbol/flag and exclude verification, register, login, refresh, logout, and reset endpoints from automatic refresh.

- [ ] **Step 4: Parse the unified envelope**

`HotKeyAPIError` exposes `code`, `message`, `status`, `requestId`, and optional `retryAfter`. Frontend behavior branches on `code`, never on localized message.

- [ ] **Step 5: Verify GREEN**

Run: `npm run test:unit -- src/lib/__tests__/request.test.ts && npm run typecheck`

Expected: PASS and `rg -n 'localStorage|sessionStorage' src/lib/request.ts src/lib/authSession.ts` returns no match.

- [ ] **Step 6: Commit**

```bash
git add src/lib
git commit -m "feat: add secure web session refresh client"
```

### Task 3: Replace Auth Store with a Status Machine

**Files:**
- Modify: `src/stores/authStore.ts`
- Modify: `src/components/AppProvider.tsx`
- Modify: `src/components/AuthGuard.tsx`
- Create: `src/stores/__tests__/authStore.test.ts`

**Interfaces:**
- Produces: `initialize`, `login`, `completeRegistration`, `logout`, `clearSession`, and state `{status,user}`.
- Consumes: generated auth service and `authSession` memory functions.

- [ ] **Step 1: Write failing store tests**

Cover initializing -> authenticated after refresh/me, initializing -> unauthenticated on missing cookie, login, registration, logout idempotency, refresh failure, and no persisted token.

- [ ] **Step 2: Verify RED**

Run: `npm run test:unit -- src/stores/__tests__/authStore.test.ts`

Expected: FAIL because the current store exposes `hydrate/isLoading/isAuthenticated` and LocalStorage.

- [ ] **Step 3: Implement the exact state machine**

```ts
type AuthStatus = "initializing" | "authenticated" | "unauthenticated";

interface AuthState {
  status: AuthStatus;
  user: HotKeyAPI.AuthenticatedUserData | null;
  initialize(): Promise<void>;
  login(input: HotKeyAPI.EmailLoginRequest): Promise<void>;
  logout(): Promise<void>;
  clearSession(): void;
}
```

Initialization calls refresh then `/auth/me`. AppProvider invokes initialize once. AuthGuard renders a centered loading indicator for `initializing`, children for authenticated, and uses `router.replace` for unauthenticated.

- [ ] **Step 4: Validate redirect input**

```ts
export function safeRedirect(value: string | null): string {
  return value && value.startsWith("/") && !value.startsWith("//") ? value : "/dashboard";
}
```

- [ ] **Step 5: Verify GREEN**

Run: `npm run test:unit -- src/stores/__tests__/authStore.test.ts && npm run typecheck`

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/stores src/components/AppProvider.tsx src/components/AuthGuard.tsx
git commit -m "feat: restore web auth from secure session"
```

### Task 4: Build Shared Verification and Password Components

**Files:**
- Create: `src/components/auth/AuthShell.tsx`
- Create: `src/components/auth/EmailVerificationStep.tsx`
- Create: `src/components/auth/PasswordFields.tsx`
- Create: `src/components/auth/__tests__/EmailVerificationStep.test.tsx`

**Interfaces:**
- Produces reusable verification and password-policy components.
- Consumers: registration and password-reset pages.

- [ ] **Step 1: Write failing component tests**

Assert generic send message, 60-second countdown, resend disabled state, six-digit-only paste/input, ErrorCode field mapping, submit loading, and password criteria.

- [ ] **Step 2: Verify RED**

Run: `npm run test:unit -- src/components/auth/__tests__/EmailVerificationStep.test.tsx`

Expected: FAIL because components do not exist.

- [ ] **Step 3: Implement accessible shared components**

Use semantic labels, `autoComplete="email"`, `inputMode="numeric"`, `maxLength={6}`, and Ant Design `Form.Item` field errors. Keep Ticket state in the parent callback only:

```ts
type Props = {
  purpose: "register" | "reset_password";
  onConfirmed(ticket: string): void;
};
```

PasswordFields uses `autoComplete="new-password"` and displays all exact policy criteria.

- [ ] **Step 4: Verify GREEN**

Run: `npm run test:unit -- src/components/auth && npm run typecheck`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/auth
git commit -m "feat: add reusable email verification forms"
```

### Task 5: Implement Register, Login, and Password Reset Pages

**Files:**
- Create: `src/app/register/page.tsx`
- Create: `src/app/forgot-password/page.tsx`
- Create: `src/app/reset-password/page.tsx`
- Modify: `src/app/login/page.tsx`
- Modify: `src/components/welcome/WelcomeHeader.tsx`
- Modify: `src/components/welcome/WelcomeCTA.tsx`
- Create: `src/app/register/__tests__/page.test.tsx`

**Interfaces:**
- Consumes shared auth components, generated services, and Auth Store.
- Produces all four public auth routes.

- [ ] **Step 1: Write failing page-flow tests**

Registration: email -> code -> password/display name -> authenticated redirect. Reset: email -> code -> new password -> login redirect. Login: ErrorCode mapping, safe redirect, password-manager attributes. Direct `/reset-password` without in-memory Ticket redirects to `/forgot-password`.

- [ ] **Step 2: Verify RED**

Run: `npm run test:unit -- src/app/register src/app/login src/app/forgot-password src/app/reset-password`

Expected: FAIL because target pages/flows are absent.

- [ ] **Step 3: Implement page-local Ticket state**

```ts
type RegisterStep = "email" | "code" | "profile";
const [step, setStep] = useState<RegisterStep>("email");
const [ticket, setTicket] = useState("");
```

Never put Ticket in router state, query string, storage, or analytics. A full reload intentionally restarts verification.

- [ ] **Step 4: Update login and navigation**

Login calls store `login`, maps `AUTH_INVALID_CREDENTIALS` to the form, adds “忘记密码” and “创建账号”, and redirects through `safeRedirect`. Welcome buttons link to `/login` and `/register`.

- [ ] **Step 5: Verify GREEN**

Run: `npm run test:unit -- src/app src/components/auth && npm run typecheck`

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/app src/components/welcome
git commit -m "feat: add web email authentication journeys"
```

### Task 6: Wire Logout and Complete Browser Acceptance

**Files:**
- Modify: `src/layouts/BasicLayout.tsx`
- Modify: files already listed in Tasks 1-5 when a verification failure proves the implementation does not match their declared interface; do not expand feature scope.

**Interfaces:**
- Produces a fully integrated authenticated Web experience.

- [ ] **Step 1: Make logout asynchronous and idempotent**

Call store `logout`, clear memory even when the network request fails, then `router.replace("/login")`. Disable repeated logout clicks while pending.

- [ ] **Step 2: Run full Web verification**

Run: `npm run test:unit && npm run typecheck && npm run build && git diff --check`

Expected: PASS.

- [ ] **Step 3: Scan browser-storage and URL leaks**

Run: `rg -n 'localStorage|sessionStorage|verification_ticket|access_token|refresh_token' src`

Expected: storage calls are absent; Ticket and token names appear only in generated transport types or in-memory code, never URL construction or logging.

- [ ] **Step 4: Run browser acceptance against real Server**

Start Server with PostgreSQL, Redis, and test/163 SMTP, then start Web with `npm run dev`. Verify one by one:

```text
new email registration and direct dashboard entry
existing email generic verification-send response
email/password login
protected-page refresh without visible logout
three concurrent API requests causing one token refresh
logout and protected-page rejection
forgot-password reset and all old refresh sessions rejected
60-second resend countdown and hourly limit error
mobile-width layout and keyboard navigation
```

Expected: every flow passes; browser storage contains no tokens; Refresh Cookie is HttpOnly/Secure/SameSite as configured; console contains no secret values.

- [ ] **Step 5: Commit**

```bash
git add src/layouts/BasicLayout.tsx
git commit -m "feat: complete secure web authentication flow"
```

### Task 7: Cross-Repository Regression Gate

**Files:**
- Modify only contract/generated files required by verified drift.

**Interfaces:**
- Produces Server + Web acceptance evidence; miniapp remains outside implementation scope.

- [ ] **Step 1: Re-run Server contract gates**

From `hotkey-server`: `make swagger && bash scripts/validate-repository.sh && go test -race ./... && git diff --check`

Expected: PASS and generated Swagger unchanged after Web implementation.

- [ ] **Step 2: Re-run Web gates from a clean install**

From `hotkey-web`: `npm ci && npm run openapi:generate && npm run test:unit && npm run typecheck && npm run build && git diff --check`

Expected: PASS; OpenAPI generation produces no unexpected drift.

- [ ] **Step 3: Confirm miniapp boundary**

Run from HotKey root: `rg -n '/api/auth/|githubLogin|miniapp/login' hotkey-miniapp/src/services/hotkey/hotkey-server/auth.ts`

Expected: old miniapp contract is documented as deferred; do not modify miniapp in this implementation.

- [ ] **Step 4: Record repo-specific commits**

Run: `git -C hotkey-server log --oneline --max-count=10 && git -C hotkey-web log --oneline --max-count=10 && git -C hotkey-server status --short && git -C hotkey-web status --short`

Expected: each repository is clean and contains only its own intentional commits.
