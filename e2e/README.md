# E2E（Playwright）

全链路冒烟：注册 → mailpit 收验证邮件 → 邮箱验证 → 登录 → 上传皮肤 → 发布到皮肤库 → 皮肤库搜索（SSR）→ 详情点赞/评论/应用到我的皮肤。

## 本地运行

需要 Docker。编排与 CI（`.github/workflows/e2e.yml`）一致：

```powershell
// 1. 依赖服务
docker run -d --name mythic-e2e-pg -e POSTGRES_USER=mirror -e POSTGRES_PASSWORD=mirror -e POSTGRES_DB=mirror_e2e -p 55442:5432 postgres:17-alpine
docker run -d --name mythic-e2e-mail -p 8025:8025 -p 1025:1025 axllent/mailpit

// 2. mirror（workspace 根目录构建）
go build -o $env:TEMP\mirror-e2e.exe .\mythic-mirror\cmd\server
$env:MIRROR_LISTEN_ADDR=':18080'
$env:MIRROR_DATABASE_URL='postgres://mirror:mirror@localhost:55442/mirror_e2e?sslmode=disable'
$env:MIRROR_KEY_PATH="$env:TEMP\e2e-key.pem"; $env:MIRROR_TEXTURES_DIR="$env:TEMP\e2e-tex"
$env:MIRROR_MAIL_DRIVER='smtp'; $env:MIRROR_SMTP_ADDR='localhost:1025'; $env:MIRROR_SMTP_FROM='mirror@e2e.local'
$env:MIRROR_WEB_URL='http://localhost:3110'; $env:MIRROR_BASE_URL='http://localhost:18080'
Start-Process $env:TEMP\mirror-e2e.exe   // 或前台运行

// 3. web（本目录）
$env:NEXT_PUBLIC_API_URL='http://localhost:18080'; pnpm build
$env:API_URL_INTERNAL='http://localhost:18080'; pnpm start -- -p 3110

// 4. 跑测试
pnpm exec playwright install chromium   // 首次
pnpm e2e
```

环境变量：`E2E_BASE_URL`（默认 `http://localhost:3110`）、`MAILPIT_URL`（默认 `http://localhost:8025`）。
