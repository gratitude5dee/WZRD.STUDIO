# ElevenLabs MCP Server

This package exposes a Model Context Protocol (MCP) server that wraps the [ElevenLabs text-to-speech API](https://elevenlabs.io/). It can be embedded inside MCP-aware assistants such as Claude Desktop and supports both HTTP (SSE) and stdio transports.

## Features

- Standards-compliant MCP manifest with three tools:
  - `text_to_speech` — convert text to audio with configurable voices and tuning parameters.
  - `list_voices` — enumerate voices that belong to the authenticated ElevenLabs account.
  - `get_voice_settings` — fetch the stability and similarity controls for a specific voice.
- ElevenLabs authentication via the `ELEVENLABS_API_KEY` environment variable.
- Built-in fixed-window rate limiting to help stay within your ElevenLabs quota.
- Base64 encoded audio responses so clients can save or play them directly.
- Structured logging and consistent error payloads to simplify debugging.

## Getting Started

1. Install dependencies:

   ```bash
   cd mcp/elevenlabs-server
   npm install
   ```

2. Configure the ElevenLabs API key (create one in the ElevenLabs dashboard):

   ```bash
   export ELEVENLABS_API_KEY="your-secret-key"
   ```

3. Launch the HTTP/SSE server (defaults to port 7331):

   ```bash
   npm run start:http
   ```

   The server exposes the following routes:

   - `GET /health` — readiness probe.
   - `GET /manifest.json` — MCP manifest consumed by clients.
   - `POST /invoke` — invoke a tool with JSON.
   - `POST /invoke` with `Accept: text/event-stream` — stream the invocation result over SSE.

4. Launch the stdio transport instead (useful for MCP hosts that spawn the server as a subprocess):

   ```bash
   npm run start:stdio
   ```

   Send JSON messages to stdin in the shape `{ "id": "unique", "tool": "text_to_speech", "params": { ... } }` and read newline-delimited JSON responses from stdout.

## Configuration Options

Environment variables accepted by the server:

| Variable | Default | Description |
| --- | --- | --- |
| `ELEVENLABS_API_KEY` | _required_ | API key pulled from ElevenLabs. |
| `PORT` | `7331` | Port for the HTTP/SSE transport. |
| `LOG_LEVEL` | `info` | Logging verbosity (`debug`, `info`, `warn`, `error`). |
| `RATE_LIMIT_WINDOW_MS` | `60000` | Time window for rate limiting in milliseconds. |
| `RATE_LIMIT_MAX_REQUESTS` | `60` | Number of allowed requests per window for each tool. |

## Example STDIO Session

```
$ ELEVENLABS_API_KEY=... npm run start:stdio
{"id":"1","tool":"list_voices"}
{"id":"2","tool":"text_to_speech","params":{"voice_id":"your-voice","text":"Hello world"}}
```

Each response is printed as a single JSON line containing either a `result` or an `error` key.

## Claude Desktop Integration

See [`docs/mcp/elevenlabs-claude.config.json`](../../docs/mcp/elevenlabs-claude.config.json) for an example configuration snippet that registers this server with Claude Desktop.

## Development

- TypeScript sources live in `src/`.
- Linting uses the workspace ESLint configuration (`npm run lint`).
- The HTTP handler and stdio handler share the same underlying tool implementation exposed via `createToolRouter()` in `src/service.ts`.

## License

Internal use only.
