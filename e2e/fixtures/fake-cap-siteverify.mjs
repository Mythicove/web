// 假的 Cap Standalone siteverify，用于 e2e：
// - 只接受 JSON 请求体（与 cap 官方文档一致；mirror 的 cap driver 必须走 jsonBody 分支）
// - secret 必须匹配、response 必须等于约定 token，否则 success:false
// 这样既验证了"验证码真的被强制校验"，也验证了请求体形态与 secret 传递。
import { createServer } from "node:http";

const PORT = Number(process.env.FAKE_CAP_PORT ?? 18099);
const SECRET = process.env.FAKE_CAP_SECRET ?? "e2e-cap-secret";
const GOOD_TOKEN = process.env.FAKE_CAP_TOKEN ?? "e2e-cap-token";

createServer((req, res) => {
  const send = (obj, status = 200) => {
    res.writeHead(status, { "content-type": "application/json" });
    res.end(JSON.stringify(obj));
  };
  if (req.method !== "POST") {
    send({ success: false, error: "method not allowed" }, 405);
    return;
  }
  let body = "";
  req.on("data", (chunk) => {
    body += chunk;
  });
  req.on("end", () => {
    const ct = req.headers["content-type"] ?? "";
    if (!ct.includes("application/json")) {
      send({ success: false, error: "expected a JSON body" });
      return;
    }
    let payload;
    try {
      payload = JSON.parse(body);
    } catch {
      send({ success: false, error: "malformed json" });
      return;
    }
    if (payload.secret !== SECRET) {
      send({ success: false, error: "bad secret" });
      return;
    }
    send({ success: payload.response === GOOD_TOKEN });
  });
}).listen(PORT, () => {
  console.log(`fake cap siteverify listening on :${PORT}`);
});
