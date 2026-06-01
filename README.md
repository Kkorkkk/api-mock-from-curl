# API Mock From cURL

Paste cURL commands and generate a local mock server.

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

## Limits

Generated mocks stay dependency-free and use Node's built-in HTTP server. For production API simulation, move the generated routes into your preferred server framework.
