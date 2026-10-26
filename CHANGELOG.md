# Changelog

本项目遵循 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/) 与语义化版本。

## [Unreleased]

### 新增

- 注册页验证码支持 [Cap](https://github.com/tiagozip/cap)（自托管 PoW 验证码）：driver=cap 时经 npm 包 `cap-widget` 渲染 `<cap-widget>`（控件 JS 不依赖 jsdelivr CDN），实例地址来自 `/api/register-requirements` 新增的 `captchaCapUrl`；widget 所需 WASM 默认仍走 jsdelivr，实例开启 `ENABLE_ASSETS_SERVER=true` 时自动探测并改用自托管副本（jsdelivr 不可达地区的部署建议开启）

### 修复

- CSP 放行 cap 验证码：`CAPTCHA_CAP_URL` 环境变量（部署时与 mirror `MIRROR_CAPTCHA_CAP_URL` 保持一致）加入 `connect-src`，并补 `'wasm-unsafe-eval'`、`worker-src 'self' blob:`、blob iframe——此前 cap 的 challenge/WASM/worker 全被自家 CSP 拦截

## [0.3.0] - 2026-10-23

Phase 3（Hoard 用户体系前端）。

### 新增

- mods 模块 **SSO 登录**（OIDC 跳转 + `useHoardUser` 登录态，与 skins 的 Yggdrasil 会话并存）
- **mod 详情页** `/mods/[id]`：icon/license/元数据冲突旗标、版本列表（changelog/文件下载/.mrpack）、依赖列表、团队成员内联发版、admin 删除
- **上传向导** `/mods/upload`：创建项目（jar 元数据自动填充缺失字段）
- **团队与令牌管理** `/mods/settings`：建团队、成员增删、PAT 创建（明文仅一次）/撤销
- E2E 新增 `mods-sso.spec.ts`（SSO 授权码流 + consent + 上传 + 元数据断言 + 团队/PAT），CI 编排升级（caddy 单域名反代 + hoard + OIDC client 注册）

## [0.2.0] - 2026-10-23

Phase 2（生产化与运维基线）。

### 新增

- **会话加固（破坏性）**：access token 移出 localStorage → httpOnly cookie（BFF：`/api/auth/login|logout|session` route handler 服务端经手 token；localStorage 仅存非敏感 meta；`AuthState` 不再含 `accessToken`，API 调用凭 `credentials` 携带 cookie）
- 皮肤详情举报按钮（`POST /reports`）
- 管理后台新页签：审计日志、举报（驳回/删除并结案）、皮肤审核（批准/下架/退回，配合 `MIRROR_SKIN_REVIEW`）
- E2E 新增会话加固断言（localStorage 无 token、httpOnly cookie 对 JS 不可读）

## [0.1.0] - 2026-10-23

首个可用版本：皮肤站前端完整闭环。

### 新增

- 皮肤库：列表/详情 **RSC 服务端渲染**（`API_URL_INTERNAL` 支持容器内取数）、搜索、排序（最新/最多点赞）、分页、评论区（读写）、点赞、"应用到我的皮肤"
- 账号：注册、登录（OAuth 按钮 + 忘记密码）、邮箱验证与密码重置落地页（修复邮件链接断链）
- 上传：皮肤/披风上传（profile 页）+ **发布到皮肤库**、skinview3d 3D 预览
- 管理后台：**会话登录**（role=admin，替代手贴 token；token 降级为救援通道）、用户/登录方式/公告/邀请码/mod 审核，Tabs/Table/Toast 组件化
- 体验基建：sonner toast、skins 路由 error.tsx（重试）/loading.tsx（骨架）、`ApiError(status)`
- 工程化：API 类型由 OpenAPI 契约生成（openapi-typescript，CI 漂移检查）、多主题/多语言（zh-CN/en）

### 已知限制

- mods/登录注册等页面仍为客户端渲染；无 mod 详情页（Phase 3 随 Hoard 用户体系）
- token 存 localStorage（Phase 2 换 httpOnly cookie + CSRF）
- E2E 见 `e2e/`（Playwright，CI 全栈跑通注册→验证→登录→上传→发布→评论）
