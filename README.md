# API Mock From cURL

[![CI](https://github.com/Kkorkkk/api-mock-from-curl/actions/workflows/ci.yml/badge.svg)](https://github.com/Kkorkkk/api-mock-from-curl/actions/workflows/ci.yml)

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
