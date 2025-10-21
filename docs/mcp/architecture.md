# MCP Server Architecture & Agent Integration

## Table of Contents
1. [Overview](#overview)
2. [MCP Protocol Fundamentals](#mcp-protocol-fundamentals)
3. [Server Architecture Patterns](#server-architecture-patterns)
4. [Agent-Oriented Design](#agent-oriented-design)
5. [Context Management](#context-management)
6. [State Synchronization](#state-synchronization)
7. [Error Recovery Patterns](#error-recovery-patterns)
8. [Performance Optimization](#performance-optimization)
9. [Security & Isolation](#security--isolation)
10. [Telemetry & Observability](#telemetry--observability)

## Overview

The Model Context Protocol (MCP) provides a standardized interface for AI agents to interact with external tools and services. This document synthesizes 30+ years of agent engineering wisdom to create robust, scalable, and intelligent MCP server implementations.

### Design Philosophy

**Cognitive Augmentation**: MCP servers extend agent capabilities while maintaining cognitive coherence.

**Contextual Awareness**: Servers maintain rich context to enable intelligent decision-making.

**Adaptive Behavior**: Implementations adjust to agent needs and environmental conditions.

**Defensive Design**: Systems anticipate failures and degrade gracefully.

## MCP Protocol Fundamentals

### Protocol Stack

```
┌─────────────────────────────────────┐
│     Agent Cognitive Layer           │  ← Reasoning & Decision Making
├─────────────────────────────────────┤
│     MCP Application Layer           │  ← Tools, Resources, Prompts
├─────────────────────────────────────┤
│     MCP Protocol Layer              │  ← JSON-RPC 2.0
├─────────────────────────────────────┤
│     Transport Layer                 │  ← HTTP/SSE, stdio, WebSocket
├─────────────────────────────────────┤
│     Network Layer                   │  ← TCP/IP, IPC
└─────────────────────────────────────┘
```

### Core Primitives

```typescript
// Tools: Executable functions
interface Tool {
  name: string;
  description: string;
  inputSchema: JSONSchema;
  execute: (params: unknown) => Promise<ToolResult>;
}

// Resources: Readable data sources
interface Resource {
  uri: string;
  mimeType: string;
  description?: string;
  read: () => Promise<ResourceContent>;
}

// Prompts: Templated instructions
interface Prompt {
  name: string;
  description: string;
  arguments: PromptArgument[];
  render: (args: Record<string, unknown>) => Promise<PromptMessage[]>;
}

// Sampling: Agent-initiated generation
interface SamplingRequest {
  messages: Message[];
  modelPreferences?: ModelPreferences;
  systemPrompt?: string;
  maxTokens?: number;
}
```

### Message Flow

```typescript
interface MCPMessage {
  jsonrpc: "2.0";
  id?: string | number;
  method?: string;
  params?: unknown;
  result?: unknown;
  error?: {
    code: number;
    message: string;
    data?: unknown;
  };
}

class MCPConnection {
  async request(method: string, params?: unknown): Promise<unknown> {
    const id = this.generateId();
    const message: MCPMessage = { jsonrpc: "2.0", id, method, params };

    await this.send(message);

    return new Promise((resolve, reject) => {
      this.pendingRequests.set(id, { resolve, reject });
    });
  }

  async notify(method: string, params?: unknown): Promise<void> {
    const message: MCPMessage = { jsonrpc: "2.0", method, params };
    await this.send(message);
  }

  private async handleMessage(message: MCPMessage): Promise<void> {
    if (message.id !== undefined) {
      // Response to our request
      if (message.error) {
        this.pendingRequests.get(message.id)?.reject(message.error);
      } else {
        this.pendingRequests.get(message.id)?.resolve(message.result);
      }
      this.pendingRequests.delete(message.id);
    } else {
      // Request from peer
      const result = await this.handleRequest(message.method, message.params);
      if (message.id !== undefined) {
        await this.send({ jsonrpc: "2.0", id: message.id, result });
      }
    }
  }
}
```

## Server Architecture Patterns

### Layered Architecture

```typescript
class MCPServer {
  // Layer 1: Transport (stdio, HTTP, WebSocket)
  private transport: Transport;

  // Layer 2: Protocol (JSON-RPC handling)
  private protocol: ProtocolHandler;

  // Layer 3: Routing (method dispatch)
  private router: Router;

  // Layer 4: Business Logic (tool implementations)
  private toolRegistry: ToolRegistry;

  // Layer 5: Integration (external services)
  private integrations: Map<string, Integration>;

  async start(): Promise<void> {
    // Initialize from bottom up
    await this.integrations.initialize();
    await this.toolRegistry.register();
    this.router.configure();
    this.protocol.attach(this.router);
    await this.transport.listen();
  }
}
```

### Hexagonal Architecture (Ports & Adapters)

```typescript
// Core domain: Tool business logic
interface ToolPort {
  execute(params: ToolParams): Promise<ToolResult>;
}

// Adapters: Connect to external systems
class ElevenLabsAdapter implements ToolPort {
  constructor(
    private client: ElevenLabsClient,
    private rateLimiter: RateLimiter,
    private cache: Cache
  ) {}

  async execute(params: TextToSpeechParams): Promise<AudioResult> {
    // Rate limiting
    await this.rateLimiter.acquire();

    try {
      // Check cache
      const cached = await this.cache.get(this.cacheKey(params));
      if (cached) return cached;

      // External call
      const audio = await this.client.textToSpeech(params);

      // Cache result
      await this.cache.set(this.cacheKey(params), audio, 3600);

      return audio;

    } finally {
      this.rateLimiter.release();
    }
  }
}

// MCP adapter: Expose via protocol
class MCPToolAdapter {
  constructor(private tool: ToolPort) {}

  toMCPTool(): Tool {
    return {
      name: "text_to_speech",
      description: "Convert text to speech using ElevenLabs",
      inputSchema: this.generateSchema(),
      execute: async (params) => {
        const result = await this.tool.execute(params as ToolParams);
        return this.formatResult(result);
      }
    };
  }
}
```

### Event-Driven Architecture

```typescript
enum ServerEvent {
  ConnectionOpened = "connection:opened",
  ConnectionClosed = "connection:closed",
  ToolInvoked = "tool:invoked",
  ToolCompleted = "tool:completed",
  ToolFailed = "tool:failed",
  ResourceRead = "resource:read",
  PromptRendered = "prompt:rendered"
}

class EventDrivenMCPServer extends EventEmitter {
  private handlers: Map<ServerEvent, Handler[]> = new Map();

  async invoke(tool: string, params: unknown): Promise<ToolResult> {
    // Emit before event
    await this.emit(ServerEvent.ToolInvoked, { tool, params });

    try {
      const result = await this.executeTool(tool, params);

      // Emit success event
      await this.emit(ServerEvent.ToolCompleted, { tool, params, result });

      return result;

    } catch (error) {
      // Emit failure event
      await this.emit(ServerEvent.ToolFailed, { tool, params, error });

      throw error;
    }
  }

  on(event: ServerEvent, handler: Handler): void {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, []);
    }
    this.handlers.get(event)!.push(handler);
  }
}

// Usage: Attach cross-cutting concerns
server.on(ServerEvent.ToolInvoked, async (data) => {
  await logger.info("Tool invoked", data);
  await metrics.increment("tool.invocations", { tool: data.tool });
});

server.on(ServerEvent.ToolFailed, async (data) => {
  await alerting.sendAlert({
    severity: "warning",
    message: `Tool ${data.tool} failed`,
    error: data.error
  });
});
```

### Plugin Architecture

```typescript
interface MCPPlugin {
  name: string;
  version: string;
  install(server: MCPServer): Promise<void>;
  uninstall(server: MCPServer): Promise<void>;
}

class MCPServer {
  private plugins: Map<string, MCPPlugin> = new Map();

  async use(plugin: MCPPlugin): Promise<void> {
    await plugin.install(this);
    this.plugins.set(plugin.name, plugin);
  }

  async unuse(pluginName: string): Promise<void> {
    const plugin = this.plugins.get(pluginName);
    if (plugin) {
      await plugin.uninstall(this);
      this.plugins.delete(pluginName);
    }
  }
}

// Example: Authentication plugin
class AuthPlugin implements MCPPlugin {
  name = "auth";
  version = "1.0.0";

  async install(server: MCPServer): Promise<void> {
    server.use(async (req, next) => {
      const token = req.headers.authorization;
      if (!this.validateToken(token)) {
        throw new UnauthorizedError();
      }
      req.user = await this.getUser(token);
      return next(req);
    });
  }

  async uninstall(server: MCPServer): Promise<void> {
    // Remove middleware
  }
}
```

## Agent-Oriented Design

### Capability Advertising

Intelligent agents need to discover and understand server capabilities:

```typescript
interface ServerCapabilities {
  // What can this server do?
  tools: ToolCapability[];
  resources: ResourceCapability[];
  prompts: PromptCapability[];

  // How should agents use this server?
  recommendations: UsageGuideline[];

  // What are the constraints?
  limits: CapabilityLimits;
}

interface ToolCapability {
  name: string;
  description: string;

  // Semantic metadata for agent reasoning
  category: string;  // e.g., "text_processing", "media_generation"
  tags: string[];    // e.g., ["async", "cacheable", "expensive"]

  // Usage hints
  estimatedLatency: number;  // milliseconds
  costEstimate: number;      // arbitrary units
  reliability: number;       // 0.0 - 1.0

  // Preconditions & effects for planning
  requires: Condition[];
  produces: Effect[];

  // Schema for validation
  inputSchema: JSONSchema;
  outputSchema: JSONSchema;

  // Examples for few-shot learning
  examples: ToolExample[];
}

class CapabilityAdvertiser {
  async advertise(): Promise<ServerCapabilities> {
    return {
      tools: await this.discoverTools(),
      resources: await this.discoverResources(),
      prompts: await this.discoverPrompts(),
      recommendations: this.generateGuidelines(),
      limits: this.describeLimits()
    };
  }

  private generateGuidelines(): UsageGuideline[] {
    return [
      {
        pattern: "For voice generation, call list_voices before text_to_speech",
        rationale: "Enables voice selection and caching"
      },
      {
        pattern: "Batch similar requests within 1-second windows",
        rationale: "Improves cache hit rate and reduces API costs"
      },
      {
        pattern: "Use get_voice_settings to preview before generation",
        rationale: "Prevents costly failed generations"
      }
    ];
  }
}
```

### Context Preservation

Agents operate in rich contexts that servers should preserve:

```typescript
interface AgentContext {
  // Identity
  agentId: string;
  sessionId: string;

  // Cognitive state
  goals: Goal[];
  beliefs: BeliefSet;
  intentions: Intention[];

  // Conversation history
  messages: Message[];
  turnNumber: number;

  // Task context
  currentTask?: Task;
  taskHistory: Task[];

  // Environmental context
  timestamp: number;
  location?: string;
  user?: User;

  // Metadata
  tags: Record<string, string>;
}

class ContextualMCPServer {
  private contexts: Map<string, AgentContext> = new Map();

  async invoke(
    tool: string,
    params: unknown,
    context: AgentContext
  ): Promise<ToolResult> {
    // Store context
    this.contexts.set(context.sessionId, context);

    // Contextualize execution
    const result = await this.executeWithContext(tool, params, context);

    // Update context with results
    await this.updateContext(context.sessionId, result);

    return result;
  }

  private async executeWithContext(
    tool: string,
    params: unknown,
    context: AgentContext
  ): Promise<ToolResult> {
    // Inject context into tool execution
    const enrichedParams = {
      ...params,
      _context: {
        goals: context.goals,
        history: context.taskHistory,
        user: context.user
      }
    };

    return this.executeTool(tool, enrichedParams);
  }
}
```

### Intelligent Parameter Defaults

Help agents by providing smart defaults:

```typescript
class SmartDefaultProvider {
  async getDefaults(
    tool: string,
    partialParams: Partial<ToolParams>,
    context: AgentContext
  ): Promise<ToolParams> {
    // Learn from history
    const historicalDefaults = await this.learnFromHistory(
      context.sessionId,
      tool
    );

    // Infer from context
    const contextualDefaults = this.inferFromContext(
      tool,
      context
    );

    // Apply heuristics
    const heuristicDefaults = this.applyHeuristics(
      tool,
      partialParams
    );

    // Merge strategies (partial params take precedence)
    return {
      ...heuristicDefaults,
      ...contextualDefaults,
      ...historicalDefaults,
      ...partialParams
    };
  }

  private async learnFromHistory(
    sessionId: string,
    tool: string
  ): Promise<Partial<ToolParams>> {
    const history = await this.db.query(
      `SELECT params FROM tool_invocations
       WHERE session_id = ? AND tool = ?
       ORDER BY timestamp DESC LIMIT 10`,
      [sessionId, tool]
    );

    // Find most common parameter values
    return this.extractCommonParams(history);
  }

  private inferFromContext(
    tool: string,
    context: AgentContext
  ): Partial<ToolParams> {
    if (tool === "text_to_speech") {
      // Infer voice from user preferences or previous selections
      return {
        voice_id: context.user?.preferredVoice ?? "default",
        model_id: context.user?.subscription === "premium"
          ? "eleven_turbo_v2"
          : "eleven_monolingual_v1"
      };
    }

    return {};
  }
}
```

### Proactive Suggestions

Servers can guide agents toward optimal usage:

```typescript
class ProactiveMCPServer {
  async invoke(
    tool: string,
    params: unknown,
    context: AgentContext
  ): Promise<ToolResult & { suggestions?: Suggestion[] }> {
    const result = await this.executeTool(tool, params);

    // Generate suggestions based on usage patterns
    const suggestions = await this.generateSuggestions(
      tool,
      params,
      result,
      context
    );

    return { ...result, suggestions };
  }

  private async generateSuggestions(
    tool: string,
    params: unknown,
    result: ToolResult,
    context: AgentContext
  ): Promise<Suggestion[]> {
    const suggestions: Suggestion[] = [];

    // Suggest related tools
    const related = await this.findRelatedTools(tool, context.goals);
    if (related.length > 0) {
      suggestions.push({
        type: "tool",
        message: `Consider using ${related[0]} to achieve ${context.goals[0]}`,
        confidence: 0.8
      });
    }

    // Suggest optimization
    if (this.canOptimize(params)) {
      suggestions.push({
        type: "optimization",
        message: "You can reduce latency by caching this result",
        action: "enable_caching",
        confidence: 0.9
      });
    }

    // Suggest alternative approaches
    if (result.quality < 0.7) {
      const alternative = this.findAlternative(tool, params);
      suggestions.push({
        type: "alternative",
        message: `Try ${alternative.tool} with these params for better results`,
        params: alternative.params,
        confidence: 0.75
      });
    }

    return suggestions;
  }
}
```

## Context Management

### Context Windows

```typescript
class ContextWindow {
  private maxSize: number;
  private items: ContextItem[] = [];

  add(item: ContextItem): void {
    this.items.push(item);

    // Eviction strategies
    while (this.exceedsLimit()) {
      this.evict();
    }
  }

  private exceedsLimit(): boolean {
    const totalSize = this.items.reduce((sum, item) => sum + item.size, 0);
    return totalSize > this.maxSize;
  }

  private evict(): void {
    // Strategy 1: FIFO
    // this.items.shift();

    // Strategy 2: LRU
    const lru = this.findLRU();
    const index = this.items.indexOf(lru);
    this.items.splice(index, 1);

    // Strategy 3: Importance-based
    // const leastImportant = this.findLeastImportant();
    // this.items.splice(this.items.indexOf(leastImportant), 1);
  }

  private findLRU(): ContextItem {
    return this.items.reduce((oldest, item) =>
      item.lastAccessed < oldest.lastAccessed ? item : oldest
    );
  }
}
```

### Semantic Context Compression

```typescript
class SemanticCompressor {
  async compress(context: AgentContext): Promise<CompressedContext> {
    // Extract key points from conversation
    const summary = await this.summarize(context.messages);

    // Identify important entities
    const entities = await this.extractEntities(context);

    // Compress goals into compact representation
    const goalEmbeddings = await this.embedGoals(context.goals);

    // Retain critical facts
    const facts = await this.extractFacts(context.beliefs);

    return {
      summary,
      entities,
      goalEmbeddings,
      facts,
      metadata: {
        originalSize: this.calculateSize(context),
        compressedSize: this.calculateSize({ summary, entities, facts }),
        compressionRatio: this.calculateRatio(context, { summary, entities, facts })
      }
    };
  }

  async decompress(compressed: CompressedContext): Promise<AgentContext> {
    // Reconstruct approximate context
    return {
      messages: await this.expandSummary(compressed.summary),
      goals: await this.reconstructGoals(compressed.goalEmbeddings),
      beliefs: this.factsToBeliefs(compressed.facts),
      // ... other fields with reduced fidelity
    };
  }
}
```

### Contextual Caching

```typescript
class ContextualCache {
  private cache: Map<string, CacheEntry> = new Map();

  async get(
    key: string,
    context: AgentContext
  ): Promise<any | null> {
    const entry = this.cache.get(key);
    if (!entry) return null;

    // Validate context compatibility
    if (!this.isContextCompatible(entry.context, context)) {
      return null;
    }

    // Check freshness
    if (this.isStale(entry)) {
      this.cache.delete(key);
      return null;
    }

    entry.hits++;
    entry.lastAccessed = Date.now();
    return entry.value;
  }

  async set(
    key: string,
    value: any,
    context: AgentContext,
    ttl?: number
  ): Promise<void> {
    this.cache.set(key, {
      value,
      context: this.extractRelevantContext(context),
      createdAt: Date.now(),
      lastAccessed: Date.now(),
      ttl,
      hits: 0
    });
  }

  private isContextCompatible(
    cached: Partial<AgentContext>,
    current: AgentContext
  ): boolean {
    // Same user
    if (cached.user?.id !== current.user?.id) return false;

    // Compatible goals
    if (!this.goalsOverlap(cached.goals, current.goals)) return false;

    // Similar conversation topics
    if (!this.topicSimilarity(cached.messages, current.messages)) return false;

    return true;
  }

  private goalsOverlap(
    cached: Goal[] = [],
    current: Goal[] = []
  ): boolean {
    return cached.some(cg =>
      current.some(cur => this.similarity(cg, cur) > 0.7)
    );
  }
}
```

## State Synchronization

### Optimistic Updates

```typescript
class OptimisticStateManager {
  private optimisticState: Map<string, any> = new Map();
  private committedState: Map<string, any> = new Map();

  async update(key: string, updater: (current: any) => any): Promise<void> {
    // Apply optimistically
    const current = this.optimisticState.get(key) ?? this.committedState.get(key);
    const optimistic = updater(current);
    this.optimisticState.set(key, optimistic);

    try {
      // Commit to backend
      await this.backend.update(key, optimistic);

      // Commit locally
      this.committedState.set(key, optimistic);
      this.optimisticState.delete(key);

    } catch (error) {
      // Rollback on failure
      this.optimisticState.delete(key);
      throw error;
    }
  }

  get(key: string): any {
    // Optimistic state takes precedence
    return this.optimisticState.get(key) ?? this.committedState.get(key);
  }
}
```

### Eventual Consistency

```typescript
class EventuallyConsistentStore {
  private localState: Map<string, VersionedValue> = new Map();
  private pendingWrites: Map<string, VersionedValue> = new Map();

  async set(key: string, value: any): Promise<void> {
    const version = this.generateVersion();
    const versionedValue = { value, version, timestamp: Date.now() };

    // Update local state immediately
    this.localState.set(key, versionedValue);

    // Queue for eventual persistence
    this.pendingWrites.set(key, versionedValue);

    // Async sync (fire and forget)
    this.sync();
  }

  private async sync(): Promise<void> {
    for (const [key, versionedValue] of this.pendingWrites) {
      try {
        await this.backend.write(key, versionedValue);
        this.pendingWrites.delete(key);
      } catch (error) {
        // Retry later
        this.scheduleRetry(key);
      }
    }
  }

  async reconcile(remote: Map<string, VersionedValue>): Promise<void> {
    for (const [key, remoteValue] of remote) {
      const localValue = this.localState.get(key);

      if (!localValue || remoteValue.version > localValue.version) {
        // Remote is newer
        this.localState.set(key, remoteValue);
      } else if (remoteValue.version < localValue.version) {
        // Local is newer, push to remote
        await this.backend.write(key, localValue);
      } else {
        // Conflict: same version, different values
        const resolved = await this.resolveConflict(localValue, remoteValue);
        this.localState.set(key, resolved);
        await this.backend.write(key, resolved);
      }
    }
  }

  private async resolveConflict(
    local: VersionedValue,
    remote: VersionedValue
  ): Promise<VersionedValue> {
    // Last-write-wins
    return local.timestamp > remote.timestamp ? local : remote;

    // Or: Semantic merge
    // return this.merge(local, remote);
  }
}
```

### CRDT-Based Synchronization

```typescript
// Conflict-free Replicated Data Type
class GCounter {
  private counts: Map<string, number> = new Map();

  increment(nodeId: string, delta: number = 1): void {
    const current = this.counts.get(nodeId) ?? 0;
    this.counts.set(nodeId, current + delta);
  }

  value(): number {
    return Array.from(this.counts.values()).reduce((sum, count) => sum + count, 0);
  }

  merge(other: GCounter): void {
    for (const [nodeId, count] of other.counts) {
      const current = this.counts.get(nodeId) ?? 0;
      this.counts.set(nodeId, Math.max(current, count));
    }
  }
}

class ORSet<T> {
  private elements: Map<T, Set<string>> = new Map();

  add(element: T, uniqueId: string): void {
    if (!this.elements.has(element)) {
      this.elements.set(element, new Set());
    }
    this.elements.get(element)!.add(uniqueId);
  }

  remove(element: T): void {
    this.elements.delete(element);
  }

  has(element: T): boolean {
    return this.elements.has(element) && this.elements.get(element)!.size > 0;
  }

  merge(other: ORSet<T>): void {
    for (const [element, ids] of other.elements) {
      if (!this.elements.has(element)) {
        this.elements.set(element, new Set());
      }
      for (const id of ids) {
        this.elements.get(element)!.add(id);
      }
    }
  }

  values(): T[] {
    return Array.from(this.elements.keys());
  }
}
```

## Error Recovery Patterns

### Transient Fault Handling

```typescript
class TransientFaultHandler {
  async executeWithRetry<T>(
    operation: () => Promise<T>,
    config: RetryConfig = {}
  ): Promise<T> {
    const {
      maxAttempts = 3,
      initialDelay = 100,
      maxDelay = 10000,
      backoffMultiplier = 2,
      jitter = true
    } = config;

    let lastError: Error;
    let delay = initialDelay;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;

        // Don't retry non-transient errors
        if (!this.isTransient(error)) {
          throw error;
        }

        // Don't retry on last attempt
        if (attempt === maxAttempts) {
          throw error;
        }

        // Calculate next delay
        const nextDelay = Math.min(delay * backoffMultiplier, maxDelay);
        const actualDelay = jitter
          ? nextDelay * (0.5 + Math.random() * 0.5)
          : nextDelay;

        await this.sleep(actualDelay);
        delay = nextDelay;
      }
    }

    throw lastError!;
  }

  private isTransient(error: Error): boolean {
    // Network errors
    if (error.name === "NetworkError") return true;

    // HTTP 5xx errors
    if (error instanceof HttpError && error.status >= 500) return true;

    // Timeout errors
    if (error.name === "TimeoutError") return true;

    // Rate limiting (should retry with backoff)
    if (error instanceof HttpError && error.status === 429) return true;

    return false;
  }
}
```

### Bulkhead Pattern

Isolate failures to prevent cascading:

```typescript
class Bulkhead {
  private semaphores: Map<string, Semaphore> = new Map();

  constructor(
    private limits: Map<string, number>
  ) {
    for (const [partition, limit] of limits) {
      this.semaphores.set(partition, new Semaphore(limit));
    }
  }

  async execute<T>(
    partition: string,
    operation: () => Promise<T>
  ): Promise<T> {
    const semaphore = this.semaphores.get(partition);
    if (!semaphore) {
      throw new Error(`Unknown partition: ${partition}`);
    }

    await semaphore.acquire();

    try {
      return await operation();
    } finally {
      semaphore.release();
    }
  }
}

// Usage
const bulkhead = new Bulkhead(new Map([
  ["elevenlabs", 5],  // Max 5 concurrent ElevenLabs calls
  ["dedalus", 10],    // Max 10 concurrent Dedalus calls
  ["default", 20]     // Max 20 concurrent calls to other services
]));

await bulkhead.execute("elevenlabs", async () => {
  return await elevenLabs.textToSpeech(params);
});
```

### Fallback Strategies

```typescript
class FallbackChain<T> {
  constructor(
    private strategies: (() => Promise<T>)[]
  ) {}

  async execute(): Promise<T> {
    const errors: Error[] = [];

    for (const strategy of this.strategies) {
      try {
        return await strategy();
      } catch (error) {
        errors.push(error);
        // Continue to next strategy
      }
    }

    // All strategies failed
    throw new AllStrategiesFailedError(errors);
  }
}

// Usage: Voice generation with fallbacks
const result = await new FallbackChain([
  // Primary: ElevenLabs premium
  () => elevenLabs.generate({ model: "premium", ...params }),

  // Fallback 1: ElevenLabs standard
  () => elevenLabs.generate({ model: "standard", ...params }),

  // Fallback 2: Local TTS
  () => localTTS.generate(params),

  // Fallback 3: Cached result
  () => cache.getAny(params.text)
]).execute();
```

### Compensating Transactions

For complex multi-step operations:

```typescript
class Saga {
  private steps: SagaStep[] = [];
  private completed: SagaStep[] = [];

  add(step: SagaStep): this {
    this.steps.push(step);
    return this;
  }

  async execute(): Promise<void> {
    try {
      for (const step of this.steps) {
        await step.forward();
        this.completed.push(step);
      }
    } catch (error) {
      // Compensate in reverse order
      await this.compensate();
      throw error;
    }
  }

  private async compensate(): Promise<void> {
    for (const step of this.completed.reverse()) {
      try {
        await step.compensate();
      } catch (error) {
        // Log but continue compensating
        console.error(`Compensation failed for ${step.name}`, error);
      }
    }
  }
}

// Usage: Complex workflow with rollback
await new Saga()
  .add({
    name: "create_project",
    forward: () => db.projects.create(data),
    compensate: () => db.projects.delete(data.id)
  })
  .add({
    name: "upload_media",
    forward: () => storage.upload(media),
    compensate: () => storage.delete(media.key)
  })
  .add({
    name: "generate_shots",
    forward: () => ai.generateShots(prompt),
    compensate: () => ai.cancelGeneration(prompt.id)
  })
  .execute();
```

## Performance Optimization

### Connection Pooling

```typescript
class ConnectionPool {
  private available: Connection[] = [];
  private inUse: Set<Connection> = new Set();
  private waiting: ((conn: Connection) => void)[] = [];

  constructor(
    private factory: () => Promise<Connection>,
    private minSize: number,
    private maxSize: number
  ) {
    this.initialize();
  }

  private async initialize(): Promise<void> {
    for (let i = 0; i < this.minSize; i++) {
      const conn = await this.factory();
      this.available.push(conn);
    }
  }

  async acquire(): Promise<Connection> {
    // Reuse available connection
    if (this.available.length > 0) {
      const conn = this.available.pop()!;
      this.inUse.add(conn);
      return conn;
    }

    // Create new connection if under limit
    if (this.inUse.size < this.maxSize) {
      const conn = await this.factory();
      this.inUse.add(conn);
      return conn;
    }

    // Wait for connection to become available
    return new Promise((resolve) => {
      this.waiting.push(resolve);
    });
  }

  release(conn: Connection): void {
    this.inUse.delete(conn);

    // Give to waiting requester
    const waiter = this.waiting.shift();
    if (waiter) {
      this.inUse.add(conn);
      waiter(conn);
      return;
    }

    // Return to pool
    this.available.push(conn);

    // Trim pool if oversized
    if (this.available.length > this.minSize) {
      const excess = this.available.pop();
      excess?.close();
    }
  }
}
```

### Request Coalescing

Merge identical concurrent requests:

```typescript
class RequestCoalescer {
  private pending: Map<string, Promise<any>> = new Map();

  async execute<T>(
    key: string,
    operation: () => Promise<T>
  ): Promise<T> {
    // Check if identical request is already in flight
    if (this.pending.has(key)) {
      return this.pending.get(key) as Promise<T>;
    }

    // Execute and cache promise
    const promise = operation().finally(() => {
      this.pending.delete(key);
    });

    this.pending.set(key, promise);

    return promise;
  }
}

// Usage
const coalescer = new RequestCoalescer();

// Multiple concurrent calls to same voice will share single API request
const voice = await coalescer.execute(
  `voice:${voiceId}`,
  () => elevenLabs.getVoice(voiceId)
);
```

### Adaptive Rate Limiting

```typescript
class AdaptiveRateLimiter {
  private tokens: number;
  private lastRefill: number;
  private successRate: number = 1.0;
  private dynamicLimit: number;

  constructor(
    private baseLimit: number,
    private window: number
  ) {
    this.tokens = baseLimit;
    this.lastRefill = Date.now();
    this.dynamicLimit = baseLimit;
  }

  async acquire(): Promise<void> {
    this.refill();

    while (this.tokens < 1) {
      await this.sleep(100);
      this.refill();
    }

    this.tokens--;
  }

  reportSuccess(): void {
    this.successRate = this.successRate * 0.9 + 0.1;
    this.adjustLimit();
  }

  reportFailure(): void {
    this.successRate = this.successRate * 0.9;
    this.adjustLimit();
  }

  private refill(): void {
    const now = Date.now();
    const elapsed = now - this.lastRefill;
    const tokensToAdd = (elapsed / this.window) * this.dynamicLimit;

    this.tokens = Math.min(this.dynamicLimit, this.tokens + tokensToAdd);
    this.lastRefill = now;
  }

  private adjustLimit(): void {
    if (this.successRate > 0.95) {
      // Increase limit if performing well
      this.dynamicLimit = Math.min(
        this.baseLimit * 2,
        this.dynamicLimit * 1.1
      );
    } else if (this.successRate < 0.8) {
      // Decrease limit if errors occurring
      this.dynamicLimit = Math.max(
        this.baseLimit * 0.5,
        this.dynamicLimit * 0.9
      );
    }
  }
}
```

## Security & Isolation

### Capability-Based Security

```typescript
interface Capability {
  resource: string;
  actions: string[];
  constraints?: Constraint[];
  expiresAt?: number;
}

class CapabilityManager {
  private capabilities: Map<string, Capability[]> = new Map();

  grant(principal: string, capability: Capability): void {
    if (!this.capabilities.has(principal)) {
      this.capabilities.set(principal, []);
    }
    this.capabilities.get(principal)!.push(capability);
  }

  check(
    principal: string,
    resource: string,
    action: string
  ): boolean {
    const caps = this.capabilities.get(principal) ?? [];

    return caps.some(cap =>
      cap.resource === resource &&
      cap.actions.includes(action) &&
      (!cap.expiresAt || cap.expiresAt > Date.now()) &&
      (!cap.constraints || cap.constraints.every(c => c.satisfied()))
    );
  }

  revoke(principal: string, resource: string): void {
    const caps = this.capabilities.get(principal) ?? [];
    this.capabilities.set(
      principal,
      caps.filter(cap => cap.resource !== resource)
    );
  }
}
```

### Resource Quotas

```typescript
class QuotaManager {
  private usage: Map<string, ResourceUsage> = new Map();

  async checkAndConsume(
    principal: string,
    resource: string,
    amount: number
  ): Promise<void> {
    const key = `${principal}:${resource}`;
    const usage = this.usage.get(key) ?? this.createUsage(principal, resource);

    if (usage.consumed + amount > usage.limit) {
      throw new QuotaExceededError({
        principal,
        resource,
        limit: usage.limit,
        requested: amount,
        available: usage.limit - usage.consumed
      });
    }

    usage.consumed += amount;
    this.usage.set(key, usage);
  }

  refill(principal: string, resource: string): void {
    const key = `${principal}:${resource}`;
    const usage = this.usage.get(key);

    if (usage) {
      usage.consumed = 0;
      usage.lastRefill = Date.now();
    }
  }

  private createUsage(principal: string, resource: string): ResourceUsage {
    return {
      principal,
      resource,
      limit: this.getLimit(principal, resource),
      consumed: 0,
      lastRefill: Date.now()
    };
  }
}
```

### Sandboxing

```typescript
class SandboxedExecutor {
  async execute<T>(
    code: () => Promise<T>,
    sandbox: SandboxConfig
  ): Promise<T> {
    const {
      timeoutMs,
      memoryLimitMb,
      allowedAPIs
    } = sandbox;

    // Isolate execution context
    const context = this.createIsolatedContext(allowedAPIs);

    // Apply resource limits
    const monitor = this.createResourceMonitor({
      timeout: timeoutMs,
      memoryLimit: memoryLimitMb * 1024 * 1024
    });

    try {
      monitor.start();
      return await context.run(code);
    } catch (error) {
      if (error instanceof TimeoutError) {
        throw new SandboxViolationError("Execution timeout exceeded");
      }
      if (error instanceof MemoryError) {
        throw new SandboxViolationError("Memory limit exceeded");
      }
      throw error;
    } finally {
      monitor.stop();
      context.destroy();
    }
  }

  private createIsolatedContext(allowedAPIs: string[]): IsolatedContext {
    // Create restricted global scope
    const restrictedGlobal = {
      ...this.safeBuiltins,
      ...this.filterAPIs(globalThis, allowedAPIs)
    };

    return new IsolatedContext(restrictedGlobal);
  }
}
```

## Telemetry & Observability

### Structured Logging

```typescript
class StructuredLogger {
  async log(
    level: LogLevel,
    event: string,
    data: Record<string, any>
  ): Promise<void> {
    const entry = {
      timestamp: new Date().toISOString(),
      level,
      event,
      ...data,
      // Contextual enrichment
      sessionId: this.context.sessionId,
      requestId: this.context.requestId,
      principal: this.context.principal,
      // Runtime metadata
      hostname: os.hostname(),
      pid: process.pid,
      version: this.version
    };

    await this.sink.write(JSON.stringify(entry) + '\n');
  }

  // Convenience methods
  info(event: string, data?: Record<string, any>) {
    return this.log('info', event, data ?? {});
  }

  error(event: string, error: Error, data?: Record<string, any>) {
    return this.log('error', event, {
      ...data,
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      }
    });
  }
}
```

### Distributed Tracing

```typescript
class Tracer {
  private activeSpans: Map<string, Span> = new Map();

  startSpan(name: string, parent?: Span): Span {
    const span: Span = {
      traceId: parent?.traceId ?? this.generateId(),
      spanId: this.generateId(),
      parentSpanId: parent?.spanId,
      name,
      startTime: Date.now(),
      attributes: {},
      events: []
    };

    this.activeSpans.set(span.spanId, span);

    return span;
  }

  endSpan(span: Span): void {
    span.endTime = Date.now();
    span.duration = span.endTime - span.startTime;

    this.activeSpans.delete(span.spanId);

    // Export to backend
    this.exporter.export(span);
  }

  async trace<T>(
    name: string,
    operation: (span: Span) => Promise<T>,
    parent?: Span
  ): Promise<T> {
    const span = this.startSpan(name, parent);

    try {
      const result = await operation(span);
      span.status = 'ok';
      return result;
    } catch (error) {
      span.status = 'error';
      span.events.push({
        timestamp: Date.now(),
        name: 'exception',
        attributes: {
          'exception.type': error.name,
          'exception.message': error.message,
          'exception.stacktrace': error.stack
        }
      });
      throw error;
    } finally {
      this.endSpan(span);
    }
  }
}

// Usage
const result = await tracer.trace('text_to_speech', async (span) => {
  span.setAttribute('voice_id', params.voice_id);
  span.setAttribute('text_length', params.text.length);

  const audio = await elevenLabs.generate(params);

  span.setAttribute('audio_duration', audio.duration);
  span.setAttribute('audio_size', audio.data.length);

  return audio;
});
```

### Metrics Collection

```typescript
class MetricsCollector {
  private counters: Map<string, number> = new Map();
  private gauges: Map<string, number> = new Map();
  private histograms: Map<string, number[]> = new Map();

  increment(metric: string, tags?: Tags): void {
    const key = this.makeKey(metric, tags);
    this.counters.set(key, (this.counters.get(key) ?? 0) + 1);
  }

  gauge(metric: string, value: number, tags?: Tags): void {
    const key = this.makeKey(metric, tags);
    this.gauges.set(key, value);
  }

  histogram(metric: string, value: number, tags?: Tags): void {
    const key = this.makeKey(metric, tags);
    if (!this.histograms.has(key)) {
      this.histograms.set(key, []);
    }
    this.histograms.get(key)!.push(value);
  }

  timing(metric: string, durationMs: number, tags?: Tags): void {
    this.histogram(`${metric}.duration`, durationMs, tags);
  }

  async flush(): Promise<void> {
    const snapshot = this.createSnapshot();
    await this.backend.send(snapshot);
    this.reset();
  }

  private createSnapshot(): MetricsSnapshot {
    return {
      timestamp: Date.now(),
      counters: Object.fromEntries(this.counters),
      gauges: Object.fromEntries(this.gauges),
      histograms: this.computeHistogramStats()
    };
  }

  private computeHistogramStats(): Record<string, HistogramStats> {
    const stats: Record<string, HistogramStats> = {};

    for (const [key, values] of this.histograms) {
      values.sort((a, b) => a - b);

      stats[key] = {
        count: values.length,
        min: values[0],
        max: values[values.length - 1],
        mean: values.reduce((a, b) => a + b, 0) / values.length,
        p50: this.percentile(values, 50),
        p95: this.percentile(values, 95),
        p99: this.percentile(values, 99)
      };
    }

    return stats;
  }
}
```

### Health Checks

```typescript
interface HealthCheck {
  name: string;
  check(): Promise<HealthStatus>;
}

class HealthChecker {
  private checks: Map<string, HealthCheck> = new Map();

  register(check: HealthCheck): void {
    this.checks.set(check.name, check);
  }

  async checkAll(): Promise<HealthReport> {
    const results = await Promise.all(
      Array.from(this.checks.values()).map(async (check) => {
        const start = Date.now();
        try {
          const status = await check.check();
          return {
            name: check.name,
            status,
            duration: Date.now() - start
          };
        } catch (error) {
          return {
            name: check.name,
            status: HealthStatus.Unhealthy,
            error: error.message,
            duration: Date.now() - start
          };
        }
      })
    );

    const overall = results.every(r => r.status === HealthStatus.Healthy)
      ? HealthStatus.Healthy
      : results.some(r => r.status === HealthStatus.Unhealthy)
      ? HealthStatus.Unhealthy
      : HealthStatus.Degraded;

    return {
      status: overall,
      checks: results,
      timestamp: Date.now()
    };
  }
}

// Example checks
const healthChecker = new HealthChecker();

healthChecker.register({
  name: "elevenlabs_api",
  async check() {
    const start = Date.now();
    await elevenLabs.ping();
    const latency = Date.now() - start;
    return latency < 1000 ? HealthStatus.Healthy : HealthStatus.Degraded;
  }
});

healthChecker.register({
  name: "database",
  async check() {
    await db.query('SELECT 1');
    return HealthStatus.Healthy;
  }
});

healthChecker.register({
  name: "cache",
  async check() {
    const testKey = '__health__';
    await cache.set(testKey, 'ok');
    const value = await cache.get(testKey);
    return value === 'ok' ? HealthStatus.Healthy : HealthStatus.Unhealthy;
  }
});
```

---

## Best Practices Summary

### 1. Design for Agents
- Advertise capabilities with semantic metadata
- Preserve and utilize agent context
- Provide intelligent defaults and suggestions
- Support compositional tool use

### 2. Build for Reliability
- Implement comprehensive error recovery
- Use circuit breakers and bulkheads
- Design idempotent operations
- Plan for graceful degradation

### 3. Optimize Performance
- Pool connections and resources
- Coalesce identical requests
- Implement multi-level caching
- Use adaptive rate limiting

### 4. Ensure Security
- Apply capability-based access control
- Enforce resource quotas
- Sandbox untrusted execution
- Validate all inputs

### 5. Maintain Observability
- Emit structured logs
- Trace distributed operations
- Collect meaningful metrics
- Provide health endpoints

### 6. Enable Evolution
- Version all protocols and schemas
- Support backward compatibility
- Design extensible architectures
- Document behavioral contracts

---

## References

- [Model Context Protocol Specification](https://spec.modelcontextprotocol.io/)
- Hohpe, G., & Woolf, B. (2003). *Enterprise Integration Patterns*
- Newman, S. (2021). *Building Microservices* (2nd ed.)
- Richardson, C. (2018). *Microservices Patterns*
- Nygard, M. (2018). *Release It!* (2nd ed.)
