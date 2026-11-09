// External identity-provider boundary for the standalone Isles browser scenario.
// Production Web and Isles remain real processes; no owned modules are mocked.
import { createServer } from "node:http";

createServer((req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:19185");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  if (req.url === "/healthz") return res.end("{}");
  if (req.url === "/api/admin/site") {
    res.statusCode = req.headers.authorization === "Bearer scenario-mirror-admin" ? 200 : 403;
    return res.end("{}");
  }
  if (req.url === "/account/me" || req.url === "/account/players") {
    if (!req.headers.cookie?.includes("mythic_session=website-session")) {
      res.statusCode = 401;
      return res.end("{}");
    }
    return res.end(
      req.url === "/account/players"
        ? '[{"id":"owned-player","name":"Alice"}]'
        : '{"email":"alice@example.org","nickname":"Alice","verified":true}',
    );
  }
  if (req.url === "/api/site") return res.end('{"name":"Test community"}');
  if (req.url === "/api/brand") return res.end('{"light":false,"dark":false,"version":0}');
  if (req.url === "/api/announcement") return res.end('{"enabled":false,"title":"","body":""}');
  res.statusCode = 404;
  res.end("{}");
}).listen(19186, "127.0.0.1");
