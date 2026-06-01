import test from "node:test";
import assert from "node:assert/strict";
import { parseCurl, generateServer } from "../src/index.js";

test("turns curl into mock routes", () => {
  const routes = parseCurl("curl -X POST https://api.example.com/users?role=admin -H 'Authorization: Bearer demo' --data-raw '{\"name\":\"Ada\"}'");
  assert.equal(routes[0].method, "POST");
  assert.equal(routes[0].path, "/users");
  assert.deepEqual(routes[0].query, { role: "admin" });
  assert.equal(routes[0].headers.authorization, "Bearer demo");
  assert.equal(routes[0].sampleBody, "{\"name\":\"Ada\"}");
  assert.match(generateServer(routes), /createServer/);
  assert.match(generateServer(routes), /requestUrl/);
});

test("handles multiline browser curl blocks", () => {
  const routes = parseCurl("curl 'https://api.example.com/projects' \\\n  -H 'accept: application/json'\n");
  assert.equal(routes[0].method, "GET");
  assert.equal(routes[0].headers.accept, "application/json");
});
