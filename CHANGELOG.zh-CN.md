# Changelog

[English](./CHANGELOG.md) | **简体中文**

本项目遵循 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/) 与语义化版本。

## [Unreleased]

### 新增

- **账号页「启动器登录」区**（[ADR-0012](https://mythicove.github.io/docs/architecture/adr-0012-credential-separation/)）：为选中玩家创建/查看/撤销独立密码（名称 + 创建时间 + 最近使用），撤销前二次确认并说明"用它登录的启动器会立刻掉线"；尚无凭证时明确提示"将无法从启动器登录"
- **账号页「第三方账号」区**：列出已绑定的 provider 与邮箱；站点强制绑定而未绑定时给出告警与逐个 provider 的绑定按钮。不提供解绑（强制绑定策略下解绑等于自锁）
- **管理后台「登录方式」面板扩展**：强制绑定第三方开关、每账号玩家数上限，以及关闭主密码登录后的"还有 N 个纯密码账号"计数提示（含它为何会自然归零的说明）
- 后端稳定错误码 `binding_required` / `password_login_disabled` 映射到 `errors.*` 本地化文案（此前 `ApiError.code` 只用于 network/contract）
- e2e 新增 `launcher-auth.spec.ts`：注册→验证→登录→账号页建独立密码→启动器认证（玩家名+独立密码 200、主密码 403、邮箱 403）→撤销后认证 403 且旧游戏会话失效、网站会话不受影响

### 变更（破坏性）

- **玩家选择改为浏览器本地**：服务端"当前玩家"已删除，登录后由 `AuthProvider` 从 `GET /account/players` 补齐选择并存 localStorage，改名/删除后自动跟随；账号页的上传目标从可自由输入的文本框改为**只能选自己已有玩家**的下拉（此前填别人的名字只会 404）
- 登录页在管理员关闭「密码登录」后不再渲染密码表单（此前无条件渲染，提交必然被后端拒绝），改为提示 + 第三方按钮；注册页同条件下改为引导第三方登录（首次登录自动建号）；IdP 登录页 `/oauth/login` 同样不再给死路，改为引导去站点登录页
- BFF `/api/auth/login` 与 `/api/auth/oauth-code` 的响应不再包含 `playerName`/`playerId`（网站会话不代表任何玩家）；`AuthState` 去掉 `playerId`
- 账号页去掉「设为当前玩家」按钮（`activatePlayer` 客户端方法与 `profile.playerActivated` 文案一并删除）

### 新增（此前轮次，仍未发布）

- 验证码保护范围（`captchaScopes`）：登录页在 scope 含 `login` 时渲染验证码控件并随登录提交 token；注册页控件改为仅当 scope 含 `register` 时渲染（与后端强制点一致）。BFF `/api/auth/login` 改调 mirror 新端点 `POST /account/login` 并透传后端本地化错误文案（验证码失败 400 与凭据错误 403 可区分展示）
- 管理后台新增「品牌」面板：上传/重置明暗自定义 logo（mirror 存储）。Logo 经 SiteConfig.brand 由 layout 服务端注入、首帧 HTML 即含正确 src，保持明暗双图 CSS 切换不闪烁；未自定义时回落内置 `/brand/*.png`
- 管理后台新增「站点」面板：站点名/描述/版权/备案与自定义 CSS/JS（mirror 存储）。layout 用站点名/描述覆盖 metadata、页脚渲染版权/备案、head 以同源 `<link>/<script>` 注入自定义 CSS/JS（CSP 兼容）；均 ISR 缓存 60s
- 注册页验证码支持 [Cap](https://github.com/tiagozip/cap)（自托管 PoW 验证码）：driver=cap 时经 npm 包 `cap-widget` 渲染 `<cap-widget>`（控件 JS 不依赖 jsdelivr CDN），实例地址来自 `/api/register-requirements` 新增的 `captchaCapUrl`；widget 所需 WASM 默认仍走 jsdelivr，实例开启 `ENABLE_ASSETS_SERVER=true` 时自动探测并改用自托管副本（jsdelivr 不可达地区的部署建议开启）

### 修复

- CSP 放行 cap 验证码：`CAPTCHA_CAP_URL` 环境变量（部署时与 mirror `MIRROR_CAPTCHA_CAP_URL` 保持一致）加入 `connect-src`，并补 `'wasm-unsafe-eval'`、`worker-src 'self' blob:`、blob iframe——此前 cap 的 challenge/WASM/worker 全被自家 CSP 拦截
- cap instrumentation 探针需要 `'unsafe-eval'`：探针在 sandboxed srcdoc iframe 里执行 `new Function`/`eval`（iframe 继承页面 CSP，无法单独放行），缺它则探针恒超时、**真人也无法通过验证**；现仅在配置了 `CAPTCHA_CAP_URL` 的部署里追加（生产默认仍不含）。`frame-src` 补 `'self'` 放行 srcdoc iframe
- Dockerfile：`CAPTCHA_CAP_URL` 构建参数（CSP 为构建期烘焙，仅运行时 env 不生效）；deps/build 阶段设 `NODE_USE_ENV_PROXY=1`，使 corepack/pnpm/字体拉取遵循 `HTTP(S)_PROXY` 构建参数（受限网络下构建镜像必需）

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
