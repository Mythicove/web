# Mythicove Web

[English](./README.md) | **简体中文**

Mythicove 生态的统一前端（Next.js 16 App Router、React 19、Tailwind 4、shadcn/ui、next-intl）。一个代码库通过模块开关同时服务皮肤站和 mod 站。

## 模块开关

public/site-config.json：

```json
{ "modules": ["skin", "mods"], "theme": { "default": "default", "allowAdjust": true } }
```

- 皮肤站：["skin"]，后端为 mythic-mirror。
- mod 站：["mods"]，后端为 mythic-mirror（身份中心）和 mythic-hoard。
- 混合站：["skin", "mods"]，两个后端经同一 API 域名反代分流。

## 路由与索引策略（构建期开关）

| 变量                      | 默认                | 作用                                                                                                                             |
| ------------------------- | ------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| NEXT_PUBLIC_LOCALE_PREFIX | never               | never 表示所有语言同路径，语言由 cookie 和 Accept-Language 决定，旧前缀链接 308 兼容；always 表示 /zh-CN/…、/en/… 每语言独立 URL |
| NEXT_PUBLIC_INDEXABLE     | false               | false 时输出 meta robots noindex,nofollow,nocache（含 googleBot 细则）                                                           |
| BLOCK_BOTS                | 跟随 INDEXABLE 推导 | 非索引部署对已知抓取和 AI 训练 UA 返回 403（src/proxy.ts）；显式 true 或 false 可覆盖                                            |

自用小站保持默认即可。对外 SEO 站设 LOCALE_PREFIX=always 和 INDEXABLE=true，compose 已透传为构建参数。

## 开发

```bash
pnpm install
pnpm dev              # http://localhost:3000，API 默认 http://localhost:8080
```

环境变量：NEXT_PUBLIC_API_URL，构建期注入，指向 mirror 和 hoard 的统一 API 域名。

> 裸跑后端（不用 docker compose）时必须设置 MIRROR_CORS_ORIGINS 和 HOARD_CORS_ORIGINS
> 为本 dev server 的 origin（如 http://localhost:3000）。前端请求带凭据，浏览器禁止
> Access-Control-Allow-Origin: * 与凭据共存；未配置时后端回退 *，mods 和 SSO 等跨端调用会被拦截。
> compose 部署已由 WEB_URL 自动注入，无需手动设置。

### API 类型生成

前端类型不手写，由 api 仓库的 OpenAPI 契约生成：

```bash
pnpm gen:api   # 需要 api 仓库 checkout 在同级目录（../api/specs），或用 API_SPECS_DIR 指定
```

产物在 src/lib/api-schema/，已提交，不要手改。CI 会重新生成并用 git diff --exit-code 检查漂移。

### 命令

```bash
pnpm typecheck && pnpm lint && pnpm stylelint && pnpm build
```

## 现状与已知差距

已实现：landing、注册、登录（OAuth 按钮和忘记密码）、邮箱验证与重置密码落地页、皮肤库列表与详情（RSC SSR、搜索、排序、分页、点赞、评论读写、应用、举报）、上传皮肤与披风（profile 页，本地预览和上传进度）、3D 预览（skinview3d，响应式和减弱动效）、mods 列表与详情（RSC SSR）加上传向导和团队、PAT 管理、多主题多语言（含 CJK 字体策略）、管理后台（会话登录和救援 token，用户、登录方式、公告、邀请码、mod 审核、举报、皮肤审核、审计）、Playwright E2E 进 CI。

已知差距（详见[当前进度](https://docs.gov.skin/plans/status/)与 workspace 根目录的 FRONTEND-REMEDIATION.md）：无组件单测与视觉回归；profile、登录注册、管理后台为客户端岛（有意为之）；compass 启动器仍为原型。

## 许可证

[Elastic License 2.0 (ELv2)](./LICENSE) —— 源码可得，非 OSI 开源。许可理念与预期用法 FAQ 见文档站：[中文](https://docs.gov.skin/community/licensing/) · [English](https://docs.gov.skin/en/community/licensing/)。

自托管、修改、再分发全部免费，包括盈利性社区：在软件之上出售皮肤、披风、等级或接受赞助均可。ELv2 只限制三件事：把软件本身作为托管/管理服务提供给第三方、绕过 license key、移除版权声明。

本仓库曾以 AGPL-3.0 发布（v0.1.0 至 v0.3.0），2026-10-26 起换证为 ELv2。历史与影响见 [LICENSE.history](./LICENSE.history)。
