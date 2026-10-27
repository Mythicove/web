# Mythicove Web

**English** | [简体中文](./README.zh-CN.md)

The unified frontend of the Mythicove ecosystem (Next.js 16 App Router, React 19, Tailwind 4, shadcn/ui, next-intl). One codebase serves both the skin station and the mod station through module switches.

## Module switches

public/site-config.json:

```json
{ "modules": ["skin", "mods"], "theme": { "default": "default", "allowAdjust": true } }
```

- Skin station: ["skin"], backed by mythic-mirror.
- Mod station: ["mods"], backed by mythic-mirror (identity hub) and mythic-hoard.
- Combined station: ["skin", "mods"], with both backends reverse-proxied and routed under one API domain.

## Routing and indexing strategy (build-time switches)

| Variable                  | Default                | Purpose                                                                                                                                                                          |
| ------------------------- | ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| NEXT_PUBLIC_LOCALE_PREFIX | never                  | never means all locales share one path, chosen by cookie and Accept-Language, with legacy prefixed links 308-compatible; always means separate URLs per locale (/zh-CN/…, /en/…) |
| NEXT_PUBLIC_INDEXABLE     | false                  | when false, emits meta robots noindex,nofollow,nocache (including googleBot specifics)                                                                                           |
| BLOCK_BOTS                | derived from INDEXABLE | non-indexed deployments return 403 to known crawler and AI-training UAs (src/proxy.ts); an explicit true or false overrides                                                      |

The defaults are fine for a private small site. For a public SEO-facing site set LOCALE_PREFIX=always and INDEXABLE=true; compose already passes them through as build args.

## Development

```bash
pnpm install
pnpm dev              # http://localhost:3000, API defaults to http://localhost:8080
```

Environment: NEXT_PUBLIC_API_URL, injected at build time, pointing at the unified API domain for mirror and hoard.

> When running the backends bare (without docker compose) you must set MIRROR_CORS_ORIGINS and HOARD_CORS_ORIGINS
> to this dev server's origin (such as http://localhost:3000). Frontend requests carry credentials, and browsers forbid
> Access-Control-Allow-Origin: * together with credentials; when unset the backends fall back to * and cross-origin
> calls (mods, SSO) get blocked. Compose deployments inject this automatically through WEB_URL.

### API type generation

Frontend types are never hand-written; they are generated from the OpenAPI contracts in the api repository:

```bash
pnpm gen:api   # requires the api repo checked out alongside (../api/specs), or set API_SPECS_DIR
```

Output lives in src/lib/api-schema/ and is committed; do not hand-edit it. CI regenerates and checks drift with git diff --exit-code.

### Commands

```bash
pnpm typecheck && pnpm lint && pnpm stylelint && pnpm build
```

## Status and known gaps

Implemented: landing, signup, login (OAuth buttons and forgot password), email verification and password reset landing pages, skin library list and detail (RSC SSR, search, sort, pagination, likes, comment read and write, apply, report), skin and cape uploads (profile page, local preview and upload progress), 3D preview (skinview3d, responsive and reduced motion), mods list and detail (RSC SSR) with upload wizard and team and PAT management, multi-theme and multi-locale (including the CJK font strategy), admin console (session login and rescue token: users, login methods, announcements, invite codes, mod review, reports, skin review, audit), Playwright E2E in CI.

Known gaps (see the [status page](https://docs.gov.skin/plans/status/) and FRONTEND-REMEDIATION.md at the workspace root): no component unit tests or visual regression; profile, auth and admin are client islands (intentional); the compass launcher is still a prototype.

## License

[Elastic License 2.0 (ELv2)](./LICENSE) — source-available, not OSI open source. The licensing philosophy and intended-use FAQ live on the docs site: [English](https://docs.gov.skin/en/community/licensing/) · [中文](https://docs.gov.skin/community/licensing/).

Self-hosting, modifying and redistributing are all free, including for a monetized community: selling skins, capes or ranks, or taking donations on top of the software, is fine. ELv2 only restricts offering this software itself to third parties as a hosted/managed service, circumventing license keys, and removing notices.

The repository was released under AGPL-3.0 (v0.1.0 to v0.3.0) and moved to ELv2 on 2026-10-26. See [LICENSE.history](./LICENSE.history) for the history and what it means.
