# Model Context Protocol (MCP) Documentation

World-class MCP server implementations for WZRDFLOW, applying 30+ years of cognitive architecture and agent engineering expertise.

## 📚 Documentation

### Core Documents

- **[Architecture Guide](./architecture.md)** - Deep dive into MCP server patterns, agent-oriented design, and production best practices
- **[Agent Integration](../agents.md)** - Cognitive architecture principles for building intelligent agents
- **[Streaming API](./wzrd-studio.yaml)** - WZRD Studio streaming shot generation specification
- **[Server Configurations](./elevenlabs-claude.config.json)** - Claude Desktop MCP server configuration examples

## 🎯 Quick Start

### Current MCP Servers

#### 1. ElevenLabs Text-to-Speech

High-performance TTS integration with intelligent caching and rate limiting.

**Location**: `mcp/elevenlabs-server/`

**Capabilities**:
- `text_to_speech` - Convert text to lifelike audio
- `list_voices` - Enumerate available voices
- `get_voice_settings` - Retrieve voice configuration parameters

**Quick Start**:
```bash
cd mcp/elevenlabs-server
npm install
export ELEVENLABS_API_KEY="your-api-key"
npm run start:stdio
```

**Claude Desktop Integration**:
```json
{
  "mcpServers": {
    "wzrd-elevenlabs": {
      "command": "node",
      "args": ["./node_modules/tsx/dist/cli.mjs", "mcp/elevenlabs-server/src/transports/stdio.ts"],
      "env": {
        "ELEVENLABS_API_KEY": "${ELEVENLABS_API_KEY}"
      }
    }
  }
}
```

#### 2. Dedalus Labs Workflow Runner

Multi-MCP server orchestration for complex research workflows.

**Location**: `mcp/dedalus-server/`

**Capabilities**:
- Execute composite workflows across multiple MCP servers
- Coordinate research and data gathering tasks
- Integrate with search APIs (Exa, Brave)

**Quick Start**:
```bash
cd mcp/dedalus-server
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
export DEDALUS_API_KEY="your-api-key"
python main.py
```

## 🏗️ Architecture Principles

Our MCP implementations follow cognitive architecture best practices:

### 1. Agent-Centric Design

**Context Preservation**: Servers maintain rich agent context including goals, beliefs, and conversation history.

```typescript
interface AgentContext {
  agentId: string;
  sessionId: string;
  goals: Goal[];
  beliefs: BeliefSet;
  messages: Message[];
  currentTask?: Task;
}
```

**Intelligent Defaults**: Servers learn from usage patterns to provide smart parameter defaults.

**Proactive Guidance**: Servers suggest optimal usage patterns and related tools.

### 2. Robust Error Handling

**Multi-Level Recovery**:
- Transient faults: Exponential backoff retry
- Permanent errors: Alternative strategy selection
- Resource exhaustion: Graceful degradation

**Circuit Breakers**: Prevent cascading failures in distributed systems.

**Compensating Transactions**: Rollback complex multi-step operations on failure.

### 3. Performance Optimization

**Multi-Level Caching**:
- L1: In-memory LRU (< 1ms)
- L2: Distributed cache (< 10ms)
- L3: Persistent storage (< 100ms)

**Request Coalescing**: Merge identical concurrent requests.

**Adaptive Rate Limiting**: Dynamically adjust limits based on success rates.

**Connection Pooling**: Reuse expensive connections.

### 4. Security & Isolation

**Capability-Based Security**: Fine-grained access control with time-limited capabilities.

**Resource Quotas**: Prevent abuse with per-principal limits.

**Sandboxing**: Isolated execution environments for untrusted code.

### 5. Observability

**Structured Logging**: Rich contextual information in every log entry.

**Distributed Tracing**: End-to-end request tracking across services.

**Metrics Collection**: Counters, gauges, histograms for performance monitoring.

**Health Checks**: Continuous system health validation.

## 🔧 Implementation Patterns

### Tool Implementation Template

```typescript
import { Tool, ToolResult } from '@modelcontextprotocol/sdk';

export class MyTool implements Tool {
  name = "my_tool";
  description = "Clear description for agent understanding";

  inputSchema = {
    type: "object",
    properties: {
      param1: {
        type: "string",
        description: "Detailed parameter documentation"
      }
    },
    required: ["param1"]
  };

  async execute(params: unknown): Promise<ToolResult> {
    // 1. Validate inputs
    const validated = this.validate(params);

    // 2. Check cache
    const cached = await this.cache.get(this.cacheKey(validated));
    if (cached) return cached;

    // 3. Rate limiting
    await this.rateLimiter.acquire();

    try {
      // 4. Execute with retry
      const result = await this.retryable(async () => {
        return await this.performOperation(validated);
      });

      // 5. Cache result
      await this.cache.set(this.cacheKey(validated), result, 3600);

      // 6. Emit metrics
      this.metrics.increment('tool.success', { tool: this.name });

      return result;

    } catch (error) {
      // 7. Handle errors
      this.metrics.increment('tool.error', { tool: this.name });
      throw this.handleError(error);

    } finally {
      // 8. Release resources
      this.rateLimiter.release();
    }
  }
}
```

### Transport Patterns

#### stdio Transport

Best for Claude Desktop and subprocess-based integrations:

```typescript
import { Server } from '@modelcontextprotocol/sdk/server';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio';

const server = new Server({
  name: "my-mcp-server",
  version: "1.0.0"
});

// Register tools
server.setRequestHandler('tools/list', async () => ({
  tools: [myTool.toMCPTool()]
}));

server.setRequestHandler('tools/call', async (request) => {
  const { name, arguments: args } = request.params;
  return await myTool.execute(args);
});

// Start stdio transport
const transport = new StdioServerTransport();
await server.connect(transport);
```

#### HTTP/SSE Transport

Best for web-based integrations and streaming:

```typescript
import express from 'express';

const app = express();

app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

app.get('/manifest.json', (req, res) => {
  res.json({
    name: "my-mcp-server",
    version: "1.0.0",
    tools: [myTool.toManifest()]
  });
});

app.post('/invoke', async (req, res) => {
  const { tool, params } = req.body;

  if (req.headers.accept === 'text/event-stream') {
    // Streaming response
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const stream = await myTool.executeStream(params);
    for await (const chunk of stream) {
      res.write(`data: ${JSON.stringify(chunk)}\n\n`);
    }
    res.write('data: [DONE]\n\n');
    res.end();

  } else {
    // Standard JSON response
    const result = await myTool.execute(params);
    res.json(result);
  }
});

app.listen(7331);
```

## 📊 Telemetry & Monitoring

### Structured Logging

All servers emit structured JSON logs:

```json
{
  "timestamp": "2025-01-15T10:30:45.123Z",
  "level": "info",
  "event": "tool.invoked",
  "tool": "text_to_speech",
  "sessionId": "sess_abc123",
  "requestId": "req_xyz789",
  "params": {
    "voice_id": "premium_voice",
    "text_length": 150
  },
  "hostname": "mcp-server-01",
  "version": "1.2.3"
}
```

### Metrics

Track key performance indicators:

**Tool Invocations**:
- `tool.invocations` (counter) - Total calls per tool
- `tool.success` (counter) - Successful executions
- `tool.error` (counter) - Failed executions
- `tool.duration` (histogram) - Execution time in ms

**Caching**:
- `cache.hits` (counter) - Cache hit count
- `cache.misses` (counter) - Cache miss count
- `cache.size` (gauge) - Current cache size

**Rate Limiting**:
- `ratelimit.acquired` (counter) - Tokens acquired
- `ratelimit.rejected` (counter) - Requests rejected
- `ratelimit.wait_time` (histogram) - Wait time in ms

### Distributed Tracing

Example trace for text-to-speech operation:

```
Trace ID: 7f3c8a2e-4b5d-6c7e-8f9a-0b1c2d3e4f5g

Span: text_to_speech [150ms]
  ├─ Span: validate_params [2ms]
  ├─ Span: check_cache [5ms]
  ├─ Span: acquire_rate_limit [10ms]
  ├─ Span: elevenlabs_api_call [120ms]
  │  ├─ Span: http_request [115ms]
  │  └─ Span: parse_response [5ms]
  └─ Span: cache_result [3ms]
```

### Health Checks

**Liveness**: Is the server running?
```bash
curl http://localhost:7331/health
```

**Readiness**: Can the server handle requests?
```bash
curl http://localhost:7331/health/ready
```

**Dependencies**: Are external services available?
```bash
curl http://localhost:7331/health/dependencies
```

Example health response:
```json
{
  "status": "healthy",
  "checks": [
    {
      "name": "elevenlabs_api",
      "status": "healthy",
      "latency_ms": 45
    },
    {
      "name": "cache",
      "status": "healthy",
      "latency_ms": 2
    },
    {
      "name": "database",
      "status": "degraded",
      "latency_ms": 1250,
      "warning": "High latency detected"
    }
  ],
  "timestamp": "2025-01-15T10:30:45.123Z"
}
```

## 🔐 Security Best Practices

### 1. API Key Management

**Never commit API keys**:
```bash
# Use environment variables
export ELEVENLABS_API_KEY="sk_..."

# Or use .env files (add to .gitignore)
echo "ELEVENLABS_API_KEY=sk_..." > .env
```

**Key rotation**:
- Rotate keys regularly (every 90 days minimum)
- Use separate keys for dev/staging/prod
- Implement key expiration and renewal

### 2. Input Validation

```typescript
class InputValidator {
  validate(params: unknown): ValidatedParams {
    // Type checking
    if (typeof params !== 'object' || params === null) {
      throw new ValidationError('Params must be an object');
    }

    // Schema validation
    const result = this.schema.safeParse(params);
    if (!result.success) {
      throw new ValidationError(result.error.message);
    }

    // Sanitization
    return this.sanitize(result.data);
  }

  private sanitize(params: any): any {
    // Remove dangerous characters
    // Limit string lengths
    // Validate URLs
    // etc.
  }
}
```

### 3. Rate Limiting

Protect against abuse:

```typescript
const rateLimiter = new RateLimiter({
  windowMs: 60_000,        // 1 minute window
  maxRequests: 60,         // 60 requests per window
  keyGenerator: (ctx) => ctx.agentId,  // Per-agent limits
  onLimitExceeded: async (ctx) => {
    await alerting.notify({
      severity: 'warning',
      message: `Rate limit exceeded for agent ${ctx.agentId}`
    });
  }
});
```

### 4. Resource Quotas

Prevent resource exhaustion:

```typescript
const quotas = new QuotaManager();

quotas.set('audio_generation', {
  perAgent: {
    daily: 1000,      // 1000 generations per day
    monthly: 10000    // 10000 generations per month
  },
  perServer: {
    concurrent: 50    // Max 50 concurrent generations
  }
});
```

## 🧪 Testing

### Unit Tests

```typescript
import { describe, it, expect } from 'vitest';

describe('TextToSpeechTool', () => {
  it('should generate audio for valid input', async () => {
    const tool = new TextToSpeechTool();
    const result = await tool.execute({
      voice_id: 'test_voice',
      text: 'Hello, world!'
    });

    expect(result.audio).toBeDefined();
    expect(result.contentType).toBe('audio/mpeg');
  });

  it('should handle rate limiting', async () => {
    const tool = new TextToSpeechTool({ maxRate: 1 });

    // First request succeeds
    await tool.execute({ text: 'Test' });

    // Second immediate request throws
    await expect(tool.execute({ text: 'Test' }))
      .rejects.toThrow(RateLimitError);
  });

  it('should use cached results', async () => {
    const tool = new TextToSpeechTool();
    const spy = vi.spyOn(tool.client, 'generate');

    // First call
    await tool.execute({ text: 'Test' });
    expect(spy).toHaveBeenCalledTimes(1);

    // Second call uses cache
    await tool.execute({ text: 'Test' });
    expect(spy).toHaveBeenCalledTimes(1);
  });
});
```

### Integration Tests

```typescript
describe('ElevenLabs MCP Server', () => {
  let server: MCPServer;
  let client: MCPClient;

  beforeAll(async () => {
    server = await startServer();
    client = await connectClient(server);
  });

  it('should list available tools', async () => {
    const response = await client.request('tools/list');

    expect(response.tools).toContainEqual(
      expect.objectContaining({
        name: 'text_to_speech',
        description: expect.any(String)
      })
    );
  });

  it('should invoke text_to_speech tool', async () => {
    const response = await client.request('tools/call', {
      name: 'text_to_speech',
      arguments: {
        voice_id: 'test_voice',
        text: 'Integration test'
      }
    });

    expect(response.content).toBeDefined();
    expect(response.isError).toBe(false);
  });
});
```

## 🚀 Deployment

### Docker

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

ENV NODE_ENV=production
ENV PORT=7331

HEALTHCHECK --interval=30s --timeout=3s \
  CMD node healthcheck.js

EXPOSE 7331

CMD ["node", "dist/index.js"]
```

### Kubernetes

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: elevenlabs-mcp-server
spec:
  replicas: 3
  selector:
    matchLabels:
      app: elevenlabs-mcp
  template:
    metadata:
      labels:
        app: elevenlabs-mcp
    spec:
      containers:
      - name: server
        image: wzrdflow/elevenlabs-mcp:1.0.0
        ports:
        - containerPort: 7331
        env:
        - name: ELEVENLABS_API_KEY
          valueFrom:
            secretKeyRef:
              name: api-keys
              key: elevenlabs
        resources:
          requests:
            memory: "128Mi"
            cpu: "100m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 7331
          initialDelaySeconds: 10
          periodSeconds: 30
        readinessProbe:
          httpGet:
            path: /health/ready
            port: 7331
          initialDelaySeconds: 5
          periodSeconds: 10
---
apiVersion: v1
kind: Service
metadata:
  name: elevenlabs-mcp
spec:
  selector:
    app: elevenlabs-mcp
  ports:
  - port: 7331
    targetPort: 7331
  type: LoadBalancer
```

## 📈 Performance Benchmarks

### Latency Targets

| Operation | Target (p50) | Target (p95) | Target (p99) |
|-----------|--------------|--------------|--------------|
| Tool list | < 5ms | < 10ms | < 20ms |
| Cache hit | < 1ms | < 2ms | < 5ms |
| Cache miss (API call) | < 500ms | < 1000ms | < 2000ms |
| Health check | < 10ms | < 25ms | < 50ms |

### Throughput Targets

| Server | Requests/sec | Concurrent Connections |
|--------|--------------|----------------------|
| ElevenLabs | 100 | 50 |
| Dedalus | 50 | 25 |

### Resource Usage

| Metric | Idle | Load (p95) | Limit |
|--------|------|-----------|-------|
| CPU | < 5% | < 50% | 500m |
| Memory | < 50MB | < 256MB | 512MB |
| Disk I/O | < 1MB/s | < 10MB/s | N/A |

## 🤝 Contributing

### Adding a New MCP Server

1. **Create server directory**:
   ```bash
   mkdir -p mcp/my-server/src
   cd mcp/my-server
   ```

2. **Initialize project**:
   ```bash
   npm init -y
   npm install @modelcontextprotocol/sdk
   npm install -D typescript @types/node tsx
   ```

3. **Implement server** following architecture patterns in `architecture.md`

4. **Add documentation**:
   - README.md with usage instructions
   - Configuration example in `docs/mcp/`
   - Update this file with server details

5. **Add tests**:
   ```bash
   npm install -D vitest
   # Write unit and integration tests
   ```

6. **Submit PR** with:
   - Server implementation
   - Tests (>80% coverage)
   - Documentation
   - Configuration examples

### Code Standards

- **TypeScript**: Use strict mode, full type coverage
- **Error Handling**: Comprehensive try/catch, typed errors
- **Logging**: Structured JSON logs with context
- **Testing**: Unit tests (>80% coverage), integration tests
- **Documentation**: JSDoc comments, README, examples

## 📚 Additional Resources

- [MCP Specification](https://spec.modelcontextprotocol.io/)
- [Architecture Guide](./architecture.md) - Deep technical patterns
- [Agent Integration](../agents.md) - Cognitive architecture principles
- [ElevenLabs API Docs](https://elevenlabs.io/docs)
- [Dedalus Labs Docs](https://docs.dedaluslabs.ai/)

## 📝 License

Internal use only. See root LICENSE file for details.

---

**Maintained by**: WZRDFLOW Engineering Team
**Last Updated**: 2025-01-15
**Version**: 1.0.0
