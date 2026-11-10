// External identity-provider boundary for the standalone Isles browser scenario.
// Production Web and Isles remain real processes; no owned modules are mocked.
import { createServer } from "node:http";

createServer((req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:19185");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  if (req.url === "/healthz") return res.end("{}");
  const url = new URL(req.url, "http://127.0.0.1:19186");
  if (url.pathname === "/modrinth/search") {
    if (url.searchParams.get("query") !== "Fabric") {
      res.statusCode = 400;
      return res.end("{}");
    }
    return res.end(
      JSON.stringify({
        hits: [
          {
            project_id: "fabric-api",
            slug: "fabric-api",
            title: "Fabric API",
            description: "Client and server components",
            project_type: "mod",
            categories: ["fabric"],
            versions: ["1.21.1"],
          },
        ],
      }),
    );
  }
  if (url.pathname === "/modrinth/project/fabric-api/version") {
    return res.end(
      JSON.stringify([
        {
          id: "fabric-release",
          name: "Fabric 1.21.1 release",
          version_number: "1.0",
          version_type: "release",
          game_versions: ["1.21.1"],
          loaders: ["fabric"],
          files: [
            {
              filename: "fabric.jar",
              url: "https://cdn.modrinth.com/test/fabric.jar",
              size: 1234,
              hashes: { sha512: "abcdef0123456789" },
            },
          ],
        },
      ]),
    );
  }
  if (url.pathname === "/hangar/projects") {
    return res.end(
      JSON.stringify({
        result: [
          {
            name: "ViaVersion",
            namespace: { owner: "ViaVersion", slug: "ViaVersion" },
            description: "Protocol compatibility",
            category: "admin_tools",
            supportedPlatforms: { PAPER: ["1.21.1"] },
          },
        ],
      }),
    );
  }
  if (url.pathname === "/hangar/projects/ViaVersion/ViaVersion/versions") {
    return res.end(
      JSON.stringify({
        result: [
          {
            name: "5.0",
            channel: { name: "Release" },
            platformDependencies: { PAPER: ["1.21.1"] },
            downloads: {
              PAPER: {
                fileInfo: {
                  name: "ViaVersion.jar",
                  sizeBytes: 2000,
                  sha256Hash: "fedcba9876543210",
                },
                downloadUrl: "https://hangarcdn.papermc.io/test/ViaVersion.jar",
              },
            },
          },
        ],
      }),
    );
  }
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
