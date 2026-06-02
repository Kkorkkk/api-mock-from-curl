# API Mock From cURL

[![CI](https://github.com/Kkorkkk/api-mock-from-curl/actions/workflows/ci.yml/badge.svg)](https://github.com/Kkorkkk/api-mock-from-curl/actions/workflows/ci.yml)

## Overview / 项目说明

English: API Mock From cURL converts browser-style cURL snippets into a small local mock server. It is built for quickly preserving API examples, redacting sensitive headers and JSON secrets, and creating dependency-free fixtures for frontend or integration tests.

中文：API Mock From cURL 会把浏览器里复制出来的 cURL 片段转换成一个小型本地 mock server。它适合快速保留 API 示例、自动遮蔽敏感 header 和 JSON 密钥字段，并生成无依赖的前端或集成测试 fixture。

Paste cURL commands and generate a local mock server.

## Install

```bash
npx api-mock-from-curl examples/requests.txt
npm install -g api-mock-from-curl
api-mock-from-curl examples/requests.txt
```

## Quick start

```bash
npm install
npm test
node src/index.js examples/requests.txt > mock-server.js
node mock-server.js
```

## Better cURL support

The parser accepts browser-style multiline cURL snippets with `\` continuations, `-H`/`--header`, `-X`/`--request`, `-d`, `--data`, `--data-raw`, query strings, and quoted JSON bodies.

It also handles compact method flags such as `-XPOST` and escaped quotes inside quoted arguments.

Sensitive headers such as `Authorization`, cookies, and API keys are redacted in generated fixtures. JSON body fields with names like `password`, `token`, `secret`, or `apiKey` are redacted too. Review generated mocks before committing them.

## Limits

Generated mocks stay dependency-free and use Node's built-in HTTP server. For production API simulation, move the generated routes into your preferred server framework.

## Status

Experimental 0.1 CLI. The tool is small on purpose, with no runtime dependencies. Review generated commands, code, and reports before using them in production workflows.
