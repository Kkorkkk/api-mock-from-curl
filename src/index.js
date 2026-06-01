#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

function splitCurlBlocks(text) {
  return text
    .replace(/\\\r?\n\s*/g, " ")
    .split(/\n(?=\s*curl\s)/)
    .map((block) => block.trim())
    .filter(Boolean);
}

function tokenize(command) {
  const tokens = [];
  let current = "";
  let quote = null;
  for (let index = 0; index < command.length; index++) {
    const char = command[index];
    if (quote) {
      if (char === "\\") current += command[++index] || "";
      else if (char === quote) quote = null;
      else current += char;
    } else if (char === "'" || char === "\"") {
      quote = char;
    } else if (/\s/.test(char)) {
      if (current) {
        tokens.push(current);
        current = "";
      }
    } else {
      current += char;
    }
  }
  if (current) tokens.push(current);
  return tokens;
}

function optionValue(tokens, names) {
  for (let index = 0; index < tokens.length; index++) {
    if (names.includes(tokens[index])) return tokens[index + 1] || "";
    const inline = names.find((name) => tokens[index].startsWith(`${name}=`));
    if (inline) return tokens[index].slice(inline.length + 1);
    const shortInline = names.find((name) => name.length === 2 && tokens[index].startsWith(name) && tokens[index].length > name.length);
    if (shortInline) return tokens[index].slice(shortInline.length);
  }
  return "";
}

export function parseCurl(text) {
  return splitCurlBlocks(text).map((block, index) => {
    const tokens = tokenize(block);
    const headers = {};
    for (let i = 0; i < tokens.length; i++) {
      if (["-H", "--header"].includes(tokens[i]) && tokens[i + 1]) {
        const [name, ...value] = tokens[i + 1].split(":");
        headers[name.toLowerCase()] = value.join(":").trim();
      }
    }
    const body = optionValue(tokens, ["-d", "--data", "--data-raw", "--data-binary"]);
    const explicitMethod = optionValue(tokens, ["-X", "--request"]);
    const method = (explicitMethod || (body ? "POST" : "GET")).toUpperCase();
    const url = tokens.find((token) => /^https?:\/\//.test(token)) || "/";
    const parsed = new URL(url, "http://local");
    const response = body && /^[\[{]/.test(body.trim()) ? body : JSON.stringify({ ok: true });
    return {
      id: `route${index + 1}`,
      method,
      path: parsed.pathname,
      query: Object.fromEntries(parsed.searchParams),
      headers,
      sampleBody: body,
      status: 200,
      response
    };
  });
}

export function generateServer(routes) {
  return `import http from "node:http";\n\nconst routes = ${JSON.stringify(routes, null, 2)};\n\nasync function readBody(req) {\n  let body = "";\n  for await (const chunk of req) body += chunk;\n  return body;\n}\n\nconst server = http.createServer(async (req, res) => {\n  const requestUrl = new URL(req.url, "http://localhost");\n  const route = routes.find((item) => item.method === req.method && item.path === requestUrl.pathname);\n  res.setHeader("content-type", "application/json");\n  if (!route) { res.statusCode = 404; res.end(JSON.stringify({ error: "No mock route" })); return; }\n  const body = await readBody(req);\n  res.statusCode = route.status || 200;\n  res.end(route.response || JSON.stringify({ ok: true, route: route.id, method: route.method, path: route.path, query: Object.fromEntries(requestUrl.searchParams), headers: route.headers, sampleBody: route.sampleBody, receivedBody: body || null }));\n});\n\nserver.listen(process.env.PORT || 4040, () => console.log("mock server on http://localhost:" + (process.env.PORT || 4040)));\n`;
}

export function parseCliArgs(args) {
  const file = args.find((arg) => !arg.startsWith("--"));
  if (!file) throw new Error("Usage: api-mock-from-curl requests.txt");
  return { file };
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const { file } = parseCliArgs(process.argv.slice(2));
    console.log(generateServer(parseCurl(readFileSync(file, "utf8"))));
  } catch (error) {
    console.error(`api-mock-from-curl: ${error.message}`);
    process.exit(2);
  }
}
