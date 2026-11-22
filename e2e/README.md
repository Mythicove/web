# E2E（Playwright）

两条全链路冒烟：

- `skin-flow.spec.ts`：注册 → mailpit 收验证邮件 → 邮箱验证 → 登录 → 上传皮肤 → 发布到皮肤库 → 皮肤库搜索（SSR）→ 详情点赞/评论/应用；含会话加固断言（token 不落 localStorage、httpOnly cookie 对 JS 不可读）。
- `mods-sso.spec.ts`（Phase 3 验收链路）：mirror 注册/验证 → mods 页 **SSO 登录**（OIDC 授权码流 + consent）→ 上传 jar（**fabric 元数据自动填充**：license/loader/game_versions/version）→ 详情页断言 → 建团队 → 建 PAT（明文仅一次）。

## 本地运行

需要 Docker。编排与 CI（`.github/workflows/e2e.yml`）一致：

```powershell
// 1. 依赖服务
docker run -d --name mythic-e2e-pg -e POSTGRES_USER=mirror -e POSTGRES_PASSWORD=mirror -e POSTGRES_DB=mirror_e2e -p 55442:5432 postgres:17-alpine
docker run -d --name mythic-e2e-mail -p 8025:8025 -p 1025:1025 axllent/mailpit
docker exec mythic-e2e-pg psql -U mirror -d postgres -c "CREATE DATABASE hoard_e2e OWNER mirror;"

// 2. mirror（IdP；MIRROR_BASE_URL 必须是对外统一 API 域名 = caddy）
go build -o $env:TEMP\mirror-e2e.exe .\mythic-mirror\cmd\server
$env:MIRROR_LISTEN_ADDR=':18080'
$env:MIRROR_DATABASE_URL='postgres://mirror:mirror@localhost:55442/mirror_e2e?sslmode=disable'
$env:MIRROR_KEY_PATH="$env:TEMP\e2e-key.pem"; $env:MIRROR_TEXTURES_DIR="$env:TEMP\e2e-tex"
$env:MIRROR_MAIL_DRIVER='smtp'; $env:MIRROR_SMTP_ADDR='localhost:1025'; $env:MIRROR_SMTP_FROM='mirror@e2e.local'
$env:MIRROR_WEB_URL='http://localhost:3110'; $env:MIRROR_BASE_URL='http://localhost:8090'
$env:MIRROR_ADMIN_TOKEN='e2e-admin'
Start-Process $env:TEMP\mirror-e2e.exe

// 3. 单域名反代（hoard/mirror 按路径分流；Linux 需 --add-host host.docker.internal:host-gateway）
docker run -d --name mythic-e2e-caddy -p 8090:8090 -v ${PWD}\web\e2e\Caddyfile:/etc/caddy/Caddyfile:ro caddy:2-alpine

// 4. 注册 hoard 的 OIDC 客户端（secret_hash = sha256("hoard-e2e-secret")）
//    POST http://localhost:18080/api/admin/oauth-clients（Bearer e2e-admin）
//    {"id":"hoard-e2e","secret_hash":"<sha256>","redirect_uris":["http://localhost:8090/auth/oidc/callback"],
//     "grant_types":["authorization_code","refresh_token"],"scopes":["openid","profile","email"]}

// 5. hoard（RP；issuer = caddy 对外地址）
go build -o $env:TEMP\hoard-e2e.exe .\mythic-hoard\cmd\server
$env:HOARD_LISTEN_ADDR=':18081'; $env:HOARD_BASE_URL='http://localhost:8090'
$env:HOARD_DATABASE_URL='postgres://mirror:mirror@localhost:55442/hoard_e2e?sslmode=disable'
$env:HOARD_DATA_DIR="$env:TEMP\e2e-hoard-files"; $env:HOARD_ADMIN_TOKEN='e2e-hoard-admin'
$env:HOARD_OIDC_ISSUER='http://localhost:8090'; $env:HOARD_OIDC_CLIENT_ID='hoard-e2e'
$env:HOARD_OIDC_CLIENT_SECRET='hoard-e2e-secret'
$env:HOARD_OIDC_REDIRECT_URL='http://localhost:8090/auth/oidc/callback'
$env:HOARD_CORS_ORIGINS='http://localhost:3110'
Start-Process $env:TEMP\hoard-e2e.exe   // 须在 caddy 之后启动（discovery 依赖）

// 6. web（本目录）
$env:NEXT_PUBLIC_API_URL='http://localhost:8090'; pnpm build
$env:API_URL_INTERNAL='http://localhost:8090'; pnpm exec next start -p 3110

// 7. 跑测试
pnpm exec playwright install chromium   // 首次
pnpm e2e
```

环境变量：`E2E_BASE_URL`（默认 `http://localhost:3110`）、`MAILPIT_URL`（默认 `http://localhost:8025`）。

fixtures：`fixtures/test-mod.jar`（含 fabric.mod.json 的最小 jar，用于元数据自动填充断言）。

## Windows Compass 原生桌面

`compass-desktop-live.mjs` 由相邻 Isles 仓库的 `scripts/compass-pack-live.mjs`
在设置 `COMPASS_EXE` 时调用。先在 Compass 仓库执行 `pnpm tauri build --no-bundle`，
再从 Isles 仓库运行：

```powershell
$env:COMPASS_EXE='D:\Caches\.cargo\target\release\compass.exe'
$env:PAPER_SERVER_JAR='/absolute/path/to/paper-compatible-1.21.1.jar'
$env:MAVEN_COMMAND='/absolute/path/to/mvn.cmd'
node scripts/compass-pack-live.mjs /absolute/path/to/compass /absolute/path/to/mythic-mirror
```

需要本仓库已安装 Playwright 依赖，以及 Windows WebView2、Rust、Go、JDK 21 和 Maven。
场景先完成真实发布与原生核心验收，再启动空缓存、空实例的隔离便携版 Compass。
通过 `.mrpack` 文件启动确认页，用 CDP 点击安装、配置直连、验证主密码拒绝、
独立密码登录、重启恢复、皮肤预览、连续两次在线进服、停止和退出登录。
启动器子进程清空 `JAVA_HOME`、隔离 `LOCALAPPDATA`，PATH 仅保留 Windows System32；
只读 `instance_java` 确认无匹配 Java，随后验证点击启动时自动下载并使用官方 Java 21。
第二次启动覆盖客户端已写入 Quick Play 日志后的文件语义回归。
操作走真实 Tauri IPC、Mirror 与客户端；只读 `paths_info` 确认便携目录。

运行目录中的 `desktop-result.json` 保留 exe SHA-256 与结果，`desktop-*` 子目录
保留截图和服务端观察。皮肤 canvas 截图需人工确认纹理。首次游戏窗口出现后，
stdout 输出 `gameWindowReady`；场景等待实际进服，游戏首次提示需在此期间操作。
`native-session.json` 记录本轮 Compass PID，`compass-game-window.ps1` 仅捕获或点击
其子进程中唯一的 Java 窗口；点击坐标以该窗口客户区为准，PNG 与同名 JSON 留证：

```powershell
./e2e/compass-game-window.ps1 -RootProcessId <PID> -Screenshot <absolute-existing-directory>/prompt.png
./e2e/compass-game-window.ps1 -RootProcessId <PID> -Screenshot <absolute-existing-directory>/prompt-click.png -Action click -X <x> -Y <y>
```

失败时保存 `failure.png`、`failure-ui.txt` 与脱敏的 `auth-errors.json`。
认证观察仅记录真实 IPC 返回的错误码和信息，不记录调用参数或成功响应中的令牌。
`game-driver-error.txt` 保留窗口等待中最近一次未就绪的原因。账号使用隔离内存 Mirror
和开发邮件日志。验收发布资产时，将 `COMPASS_EXE` 指向该安装包内的可执行文件。
