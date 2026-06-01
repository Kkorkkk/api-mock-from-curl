import test from "node:test";
import assert from "node:assert/strict";
import { parseCurl, generateServer } from "../src/index.js";

test("turns curl into mock routes", () => {
  const routes = parseCurl("curl -X POST https://api.example.com/users -d '{\"name\":\"Ada\"}'");
  assert.equal(routes[0].method, "POST");
  assert.equal(routes[0].path, "/users");
  assert.equal(routes[0].sampleBody, "{\"name\":\"Ada\"}");
  assert.match(generateServer(routes), /createServer/);
  assert.match(generateServer(routes), /receivedBody/);
});
