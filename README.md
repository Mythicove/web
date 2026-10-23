# Mythicove Web

Mythicove 生态的统一前端（Next.js 16 App Router + React 19 + Tailwind 4 + shadcn/ui + next-intl）。一个代码库通过模块开关同时服务皮肤站与 mod 站。

## 模块开关

`public/site-config.json`：

```json
{ "modules": ["skin", "mods"], "theme": { "default": "default", "allowAdjust": true } }
```

- 皮肤站：`["skin"]` + `mythic-mirror`
- mod 站：`["mods"]` + `mythic-hoard`
- 混合站：`["skin", "mods"]`（两个后端经同一 API 域名反代分流）

## 开发

```bash
pnpm install
pnpm dev              # http://localhost:3000，API 默认 http://localhost:8080
```

环境变量：`NEXT_PUBLIC_API_URL`（构建期注入，指向 mirror+hoard 的统一 API 域名）。

### API 类型生成

前端类型**不手写**，由 `api` 仓库的 OpenAPI 契约生成：

```bash
pnpm gen:api   # 需要 api 仓库 checkout 在同级目录（../api/specs），或用 API_SPECS_DIR 指定
```

产物在 `src/lib/api-schema/`（已提交，勿手改）。CI 会重新生成并 `git diff --exit-code` 检查漂移。

### 命令

```bash
pnpm typecheck && pnpm lint && pnpm stylelint && pnpm build
```

## 现状与已知差距

已实现：landing / 注册 / 登录（OAuth 按钮 + 忘记密码）/ 邮箱验证与重置密码落地页 / 皮肤库列表与详情（点赞、评论提交）/ 上传皮肤与披风（profile 页）/ 3D 预览（skinview3d）/ 多主题多语言 / 管理后台（用户、登录方式、公告、邀请码、mod 审核）。

已知差距（详见 `docs/plans/status.md`）：全客户端渲染（无 SSR/RSC 数据获取）、皮肤库无分页/搜索 UI、评论不可读、无 mod 详情页、token 存 localStorage、管理后台靠手贴 admin token、零前端测试。

## 许可证

[AGPL-3.0](./LICENSE)
