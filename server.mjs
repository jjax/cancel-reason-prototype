// Minimal server: serves the prototype and proxies the retention-offer
// judgment to TypeSafe so the API key never reaches the browser.
//
//   TYPESAFE_API_KEY=... node server.mjs      # then open http://localhost:3000
//
// Without a key the page still works: /api/offer answers 503 and the page
// falls back to its rule-based decision.

import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { APIError, APIConnectionError } from "@typesafe-ai/sdk";
import { judgeOffer } from "./offer-judgment.mjs";

const ROOT = dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT) || 3000;
const HAS_KEY = Boolean(process.env.TYPESAFE_API_KEY?.trim());
const MAX_BODY = 16 * 1024;

const json = (res, status, body) => {
  res.writeHead(status, { "content-type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(body));
};

const readJson = (req) =>
  new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on("data", (c) => {
      size += c.length;
      if (size > MAX_BODY) {
        reject(new Error("body too large"));
        req.destroy();
        return;
      }
      chunks.push(c);
    });
    req.on("end", () => {
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}"));
      } catch (e) {
        reject(e);
      }
    });
    req.on("error", reject);
  });

const server = createServer(async (req, res) => {
  const url = new URL(req.url, "http://localhost");

  if (req.method === "GET" && url.pathname === "/api/health") {
    return json(res, 200, { ok: true, engine: HAS_KEY ? "jev" : "fallback" });
  }

  if (req.method === "POST" && url.pathname === "/api/offer") {
    if (!HAS_KEY) return json(res, 503, { error: "no_api_key" });
    let payload;
    try {
      payload = await readJson(req);
    } catch {
      return json(res, 400, { error: "bad_json" });
    }
    try {
      return json(res, 200, await judgeOffer(payload));
    } catch (e) {
      if (e instanceof TypeError) return json(res, 400, { error: e.message });
      if (e instanceof APIError) {
        console.error("TypeSafe API error", e.status, e.requestId, e.body);
        return json(res, 502, { error: "upstream", status: e.status });
      }
      if (e instanceof APIConnectionError) {
        console.error("TypeSafe connection error", e.message);
        return json(res, 502, { error: "upstream_unreachable" });
      }
      console.error(e);
      return json(res, 500, { error: "internal" });
    }
  }

  if (req.method === "GET" && (url.pathname === "/" || url.pathname === "/index.html")) {
    const html = await readFile(join(ROOT, "index.html"));
    res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
    return res.end(html);
  }

  res.writeHead(404);
  res.end();
});

server.listen(PORT, () => {
  console.log(`prototype: http://localhost:${PORT}  (offer engine: ${HAS_KEY ? "jev" : "rule-based fallback, set TYPESAFE_API_KEY"})`);
});
