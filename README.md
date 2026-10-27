# Mythicove Web

**English** | [简体中文](./README.zh-CN.md)

Unified frontend for the Mythicove ecosystem (Next.js 16 App Router + React 19 + Tailwind 4 + shadcn/ui + next-intl). One codebase serves both the skin station and the mod station via module switches.

## Module switches

`public/site-config.json`:

```json
{ "modules": ["skin", "mods"], "theme": { "default": "default", "allowAdjust": true } }
```

- Skin station: `["skin"]` + `mythic-mirror`
- Mod station: `["mods"]` + `mythic-mirror` (identity hub) + `mythic-hoard`
- Combined station: `["skin", "mods"]` (both backends reverse-proxied and routed under one API domain)

## Routing & indexing strategy (build-time switches)

| Variable                    | Default                  | Purpose                                                                                                                       |
| --------------------------- | ------------------------ | ------------------------------------------------------------------------------------------------------------------------------ |
| `NEXT_PUBLIC_LOCALE_PREFIX` | `never`                  | `never` = all locales share one path (locale from cookie + Accept-Language, legacy prefixed links 308-compatible); `always` = separate URLs per locale (`/zh-CN/…`, `/en/…`) |
| `NEXT_PUBLIC_INDEXABLE`     | `false`                  | When `false`, emits `meta robots noindex,nofollow,nocache` (incl. googleBot specifics)                                          |
| `BLOCK_BOTS`                | Derived from INDEXABLE   | Non-indexed deployments return 403 to known crawler/AI-training UAs (`src/proxy.ts`); explicit `true/false` overrides           |

Defaults are fine for a private small site; for a public SEO-facing site set `LOCALE_PREFIX=always` + `INDEXABLE=true` (compose already passes them through as build args).

## Development

```bash
pnpm install
pnpm dev              # http://localhost:3000, API defaults to http://localhost:8080
```

Environment: `NEXT_PUBLIC_API_URL` (injected at build time, pointing at the unified API domain for mirror+hoard).

> When running the backends bare (without docker compose) you must set `MIRROR_CORS_ORIGINS` / `HOARD_CORS_ORIGINS`
> to this dev server's origin (e.g. `http://localhost:3000`). Frontend requests carry credentials, and browsers forbid
> `Access-Control-Allow-Origin: *` together with credentials; when unset the backends fall back to `*` and cross-origin
> calls (mods/SSO etc.) get blocked. Compose deployments inject this automatically via `WEB_URL`.

### API type generation

Frontend types are **never hand-written**; they are generated from the `api` repository's OpenAPI contracts:

```bash
pnpm gen:api   # requires the api repo checked out alongside (../api/specs), or set API_SPECS_DIR
```

Output lives in `src/lib/api-schema/` (committed; do not hand-edit). CI regenerates and checks drift with `git diff --exit-code`.

### Commands

```bash
pnpm typecheck && pnpm lint && pnpm stylelint && pnpm build
```

## Status & known gaps

Implemented: landing / signup / login (OAuth buttons + forgot password) / email verification & password reset landing pages / skin library list & detail (RSC SSR, search/sort/pagination, likes, comment read+write, apply, report) / skin & cape uploads (profile page, local preview + upload progress) / 3D preview (skinview3d, responsive + reduced motion) / mods list & detail (RSC SSR) + upload wizard + team/PAT management / multi-theme multi-locale (incl. CJK font strategy) / admin console (session login + rescue token: users, login methods, announcements, invite codes, mod review, reports, skin review, audit) / Playwright E2E in CI.

Known gaps (see `docs/plans/status.md` and root `FRONTEND-REMEDIATION.md`): no component unit tests or visual regression; profile/auth/admin are client islands (intentional); the compass launcher is still a prototype.

## License

[Elastic License 2.0 (ELv2)](./LICENSE)

This repository was previously released under AGPL-3.0 (v0.1.0–v0.3.0) and relicensed to ELv2 on 2026-10-26; see [LICENSE.history](./LICENSE.history) for details.
