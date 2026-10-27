# Changelog

**English** | [简体中文](./CHANGELOG.zh-CN.md)

This project follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and semantic versioning.

## [Unreleased]

### Added

- **Account page "Launcher login" section** ([ADR-0012](https://mythicove.github.io/docs/architecture/adr-0012-credential-separation/)): create/view/revoke independent per-player passwords (name + created time + last used); revocation requires confirmation and explains that launchers signed in with it disconnect immediately; when no credential exists yet, explicitly warns that launcher login will not be possible
- **Account page "Third-party accounts" section**: lists bound providers and emails; when the site enforces binding and the account is unbound, shows a warning with per-provider bind buttons. No unbinding (under an enforced-binding policy, unbinding equals locking yourself out)
- **Admin console "Login methods" panel extensions**: enforce-third-party-binding switch, per-account player cap, and after disabling primary-password login a "N password-only accounts remain" counter hint (with an explanation of why it naturally decays to zero)
- Stable backend error codes `binding_required` / `password_login_disabled` mapped to `errors.*` localized copy (previously `ApiError.code` was only used for network/contract)
- New e2e `launcher-auth.spec.ts`: register → verify → login → account page creates an independent password → launcher auth (player name + independent password 200, primary password 403, email 403) → after revocation auth returns 403 and old game sessions die while website sessions are unaffected

### Changed (breaking)

- **Player selection moved to the browser**: the server-side "current player" is deleted; after login `AuthProvider` fills the selection from `GET /account/players` and persists it in localStorage, following renames/deletions automatically; the account page's upload target changed from a free-text input to a dropdown **restricted to the user's own players** (typing someone else's name used to just 404)
- The login page no longer renders the password form when admins have disabled password login (previously rendered unconditionally and the backend always rejected it); it now shows a hint + third-party buttons. Under the same condition the register page guides users to third-party login (account auto-created on first login); the IdP login page `/oauth/login` no longer dead-ends either and guides users to the site login page
- BFF `/api/auth/login` and `/api/auth/oauth-code` responses no longer include `playerName`/`playerId` (a website session represents no player); `AuthState` drops `playerId`
- Account page drops the "Set as current player" button (`activatePlayer` client method and `profile.playerActivated` copy removed as well)

### Added (earlier rounds, still unreleased)

- CAPTCHA scopes (`captchaScopes`): the login page renders the CAPTCHA widget and submits its token when the scope includes `login`; the register page widget renders only when the scope includes `register` (matching backend enforcement). BFF `/api/auth/login` now calls the new mirror endpoint `POST /account/login` and passes through backend localized error copy (CAPTCHA failure 400 distinguishable from bad credentials 403)
- Admin console adds a "Brand" panel: upload/reset custom light & dark logos (mirror storage). Logos are injected server-side by the layout via SiteConfig.brand so the first HTML frame already carries the correct src, keeping flicker-free dark/light CSS switching; falls back to built-in `/brand/*.png` when not customized
- Admin console adds a "Site" panel: site name/description/copyright/filing and custom CSS/JS (mirror storage). The layout overrides metadata with site name/description, the footer renders copyright/filing, and the head injects custom CSS/JS as same-origin `<link>/<script>` (CSP-compatible); all ISR-cached for 60s
- Register page CAPTCHA supports [Cap](https://github.com/tiagozip/cap) (self-hosted PoW CAPTCHA): with driver=cap the widget renders via the npm package `cap-widget` as `<cap-widget>` (widget JS does not depend on the jsdelivr CDN); the instance URL comes from the new `captchaCapUrl` in `/api/register-requirements`; the widget's WASM still defaults to jsdelivr, and when the instance enables `ENABLE_ASSETS_SERVER=true` it is auto-detected and switched to the self-hosted copy (recommended for deployments where jsdelivr is unreachable)

### Fixed

- CSP allows the Cap CAPTCHA: `CAPTCHA_CAP_URL` env var (keep identical to mirror's `MIRROR_CAPTCHA_CAP_URL` at deploy time) added to `connect-src`, plus `'wasm-unsafe-eval'`, `worker-src 'self' blob:`, blob iframes — previously Cap's challenge/WASM/worker were all blocked by our own CSP
- Cap's instrumentation probe needs `'unsafe-eval'`: the probe runs `new Function`/`eval` inside a sandboxed srcdoc iframe (the iframe inherits the page CSP and cannot be exempted separately); without it the probe always timed out and **real humans could not pass verification either**; now appended only in deployments that configure `CAPTCHA_CAP_URL` (production default still excludes it). `frame-src` gains `'self'` to allow srcdoc iframes
- Dockerfile: `CAPTCHA_CAP_URL` build arg (CSP is baked at build time; runtime-only env has no effect); deps/build stages set `NODE_USE_ENV_PROXY=1` so corepack/pnpm/font fetches honor the `HTTP(S)_PROXY` build args (required for image builds behind restricted networks)

## [0.3.0] - 2026-10-23

Phase 3 (Hoard user-system frontend).

### Added

- mods module **SSO login** (OIDC redirect + `useHoardUser` session state, coexisting with the skins Yggdrasil session)
- **Mod detail page** `/mods/[id]`: icon/license/metadata conflict flags, version list (changelog/file download/.mrpack), dependency list, inline releases for team members, admin delete
- **Upload wizard** `/mods/upload`: create projects (jar metadata auto-fills missing fields)
- **Team & token management** `/mods/settings`: create teams, add/remove members, PAT creation (plaintext once) / revocation
- New E2E `mods-sso.spec.ts` (SSO authorization-code flow + consent + upload + metadata assertions + team/PAT), CI orchestration upgrade (caddy single-domain reverse proxy + hoard + OIDC client registration)

## [0.2.0] - 2026-10-23

Phase 2 (production readiness & ops baseline).

### Added

- **Session hardening (breaking)**: access token moved out of localStorage → httpOnly cookie (BFF: `/api/auth/login|logout|session` route handlers manage tokens server-side; localStorage keeps only non-sensitive meta; `AuthState` no longer contains `accessToken`; API calls carry the cookie via `credentials`)
- Report button on skin detail (`POST /reports`)
- New admin console tabs: audit log, reports (dismiss / delete-and-resolve), skin review (approve / delist / return, paired with `MIRROR_SKIN_REVIEW`)
- New E2E session-hardening assertions (no token in localStorage, httpOnly cookie unreadable from JS)

## [0.1.0] - 2026-10-23

First usable version: complete skin-station frontend loop.

### Added

- Skin library: list/detail **RSC server rendering** (`API_URL_INTERNAL` for in-container fetching), search, sorting (newest/most liked), pagination, comments (read+write), likes, "apply to my skin"
- Accounts: register, login (OAuth buttons + forgot password), email verification & password reset landing pages (fixed broken email links)
- Uploads: skin/cape upload (profile page) + **publish to skin library**, skinview3d 3D preview
- Admin console: **session login** (role=admin, replacing hand-pasted tokens; token demoted to rescue channel), users/login methods/announcements/invite codes/mod review, componentized Tabs/Table/Toast
- UX infrastructure: sonner toasts, skins route error.tsx (retry) / loading.tsx (skeletons), `ApiError(status)`
- Engineering: API types generated from OpenAPI contracts (openapi-typescript, CI drift check), multi-theme/multi-locale (zh-CN/en)

### Known limitations

- mods/login/register pages still client-rendered; no mod detail page (Phase 3 with the Hoard user system)
- Token stored in localStorage (Phase 2 switches to httpOnly cookie + CSRF)
- E2E in `e2e/` (Playwright; CI runs the full stack: register → verify → login → upload → publish → comment)
