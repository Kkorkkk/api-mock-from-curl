#!/usr/bin/env node
import { readFileSync } from "node:fs";

export function parseCurl(text) {
  return text.split(/\n(?=curl\s)/).filter(Boolean).map((block, index) => {
    const method = block.match(/-X\s+([A-Z]+)/)?.[1] || (/-d\s+/.test(block) ? "POST" : "GET");
    const url = block.match(/https?:\/\/[^\s'"]+/)?.[0] || "/";
    const path = new URL(url, "http://local").pathname;
    const body = block.match(/-d\s+'([^']+)'/)?.[1] || block.match(/-d\s+"([^"]+)"/)?.[1] || "";
    return { id: `route${index + 1}`, method, path, sampleBody: body };
  });
}

export function generateServer(routes) {
  return `import http from "node:http";\n\nconst routes = ${JSON.stringify(routes, null, 2)};\n\nasync function readBody(req) {\n  let body = "";\n  for await (const chunk of req) body += chunk;\n  return body;\n}\n\nconst server = http.createServer(async (req, res) => {\n  const route = routes.find((item) => item.method === req.method && item.path === new URL(req.url, "http://localhost").pathname);\n  res.setHeader("content-type", "application/json");\n  if (!route) { res.statusCode = 404; res.end(JSON.stringify({ error: "No mock route" })); return; }\n  const body = await readBody(req);\n  res.end(JSON.stringify({ ok: true, route: route.id, method: route.method, path: route.path, sampleBody: route.sampleBody, receivedBody: body || null }));\n});\n\nserver.listen(process.env.PORT || 4040, () => console.log("mock server on http://localhost:" + (process.env.PORT || 4040)));\n`;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const file = process.argv[2];
  if (!file) {
    console.error("Usage: api-mock-from-curl requests.txt");
    process.exit(1);
  }
  console.log(generateServer(parseCurl(readFileSync(file, "utf8"))));
}
