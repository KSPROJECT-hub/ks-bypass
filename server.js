// KS-BYPASS backend: validates URL structure and identifies LootLabs domains.
// It deliberately does NOT resolve hidden destinations or bypass ads/verifications.
const http = require("node:http");
const { URL } = require("node:url");

const PORT = Number(process.env.PORT || 3000);
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || "*";
const LOOTLABS_HOSTS = new Set([
  "loot-link.com",
  "lootlabs.gg",
  "lootlabs.com"
]);

function send(res, status, body) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Cache-Control": "no-store"
  });
  res.end(JSON.stringify(body));
}

function inspectUrl(raw) {
  if (typeof raw !== "string" || raw.length > 2048) {
    return { ok: false, message: "URL kosong atau terlalu panjang." };
  }

  let parsed;
  try {
    parsed = new URL(raw.trim());
  } catch {
    return { ok: false, message: "Format URL tidak valid. Periksa kembali tautan." };
  }

  if (!["http:", "https:"].includes(parsed.protocol)) {
    return { ok: false, message: "Hanya URL HTTP atau HTTPS yang didukung." };
  }

  if (!parsed.hostname || parsed.username || parsed.password) {
    return { ok: false, message: "Alamat URL tidak valid atau memuat kredensial." };
  }

  const host = parsed.hostname.toLowerCase().replace(/\.$/, "");
  const isLootLabs = [...LOOTLABS_HOSTS].some(
    domain => host === domain || host.endsWith("." + domain)
  );

  return {
    ok: true,
    message: "Format URL valid.",
    result: {
      host,
      protocol: parsed.protocol.replace(":", "").toUpperCase(),
      isLootLabs,
      category: isLootLabs ? "LootLabs terdeteksi" : "Domain lain",
      submittedUrl: parsed.origin + parsed.pathname,
      queryHidden: Boolean(parsed.search),
      status: "Format diperiksa — koneksi tujuan belum diuji."
    }
  };
}

const server = http.createServer((req, res) => {
  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    });
    return res.end();
  }

  if (req.method === "GET" && req.url === "/api/health") {
    return send(res, 200, { ok: true, service: "KS-BYPASS API", version: "1.0.0" });
  }

  if (req.method === "POST" && req.url === "/api/check") {
    let body = "";
    req.on("data", chunk => {
      body += chunk;
      if (body.length > 10_000) req.destroy();
    });
    req.on("end", () => {
      try {
        const data = JSON.parse(body || "{}");
        const result = inspectUrl(data.url);
        send(res, result.ok ? 200 : 400, result);
      } catch {
        send(res, 400, { ok: false, message: "Permintaan tidak dapat dibaca." });
      }
    });
    return;
  }

  send(res, 404, { ok: false, message: "Endpoint tidak ditemukan." });
});

server.listen(PORT, () => {
  console.log(`KS-BYPASS API berjalan di port ${PORT}`);
});
