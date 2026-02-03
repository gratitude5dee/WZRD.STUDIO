# Agent Architecture & Cognitive Design Patterns

## Table of Contents
1. [Overview](#overview)
2. [Cognitive Architecture Principles](#cognitive-architecture-principles)
3. [Agent Classification](#agent-classification)
4. [Memory Systems](#memory-systems)
5. [Decision-Making Framework](#decision-making-framework)
6. [Multi-Agent Orchestration](#multi-agent-orchestration)
7. [Tool Use & Reasoning](#tool-use--reasoning)
8. [Error Handling & Recovery](#error-handling--recovery)
9. [Performance Optimization](#performance-optimization)
10. [Implementation Patterns](#implementation-patterns)

## Overview

WZRDFLOW implements a sophisticated multi-agent system designed around proven cognitive architecture principles. This document captures three decades of agent engineering wisdom applied to generative AI workflows.

### Core Principles

**Cognitive Fidelity**: Agents mirror human cognitive processes with distinct memory systems, attention mechanisms, and reasoning patterns.

**Bounded Rationality**: Agents make optimal decisions within computational and informational constraints, not globally optimal decisions.

**Emergent Intelligence**: Complex behaviors emerge from simple rules and multi-agent interactions rather than centralized control.

**Graceful Degradation**: System maintains functionality with reduced capabilities when components fail.

## Cognitive Architecture Principles

### The SOAR Paradigm

Our agents implement a modernized SOAR (State, Operator, And Result) cognitive cycle:

```typescript
interface CognitiveAgent {
  // Perception: Input from environment
  perceive(context: WorkflowContext): Percept[];

  // Working Memory: Active information processing
  maintainWorkingMemory(percepts: Percept[]): WorkingMemory;

  // Decision: Select operator based on current state
  decide(workingMemory: WorkingMemory): Operator;

  // Action: Execute selected operator
  execute(operator: Operator): Result;

  // Learning: Update long-term memory
  learn(result: Result): void;
}
```

### Attention Mechanisms

Agents implement selective attention to manage cognitive load:

- **Bottom-up attention**: Event-driven responses to environment changes
- **Top-down attention**: Goal-directed focus on relevant information
- **Inhibition of return**: Avoid re-processing recent stimuli
- **Attention budget**: Limit concurrent focus areas to prevent thrashing

```typescript
interface AttentionSystem {
  salienceMap: Map<string, number>;  // What demands attention
  focusQueue: PriorityQueue<Task>;   // What gets processed next
  inhibitionSet: Set<string>;        // Recently processed items

  allocateAttention(budget: number): Task[];
  updateSalience(event: Event): void;
}
```

### Metacognition

Agents monitor and regulate their own cognitive processes:

```typescript
interface MetacognitiveLayer {
  // Monitor performance
  assessPerformance(): PerformanceMetrics;

  // Detect cognitive failures
  detectImpasse(): ImpasseType | null;

  // Adjust strategies
  selectStrategy(context: Context): Strategy;

  // Confidence estimation
  estimateConfidence(result: Result): number;
}
```

## Agent Classification

### Reactive Agents

**Purpose**: Immediate response to environmental stimuli without internal state.

**Use Cases**:
- Input validation
- Format transformation
- Event routing
- Health checks

**Example**: Media type detector
```typescript
class MediaTypeAgent implements ReactiveAgent {
  process(input: unknown): MediaType {
    if (this.isImage(input)) return MediaType.Image;
    if (this.isVideo(input)) return MediaType.Video;
    if (this.isAudio(input)) return MediaType.Audio;
    throw new UnknownMediaTypeError();
  }
}
```

### Deliberative Agents

**Purpose**: Goal-oriented planning and reasoning with explicit internal state.

**Use Cases**:
- Workflow planning
- Resource allocation
- Multi-step generation tasks
- Constraint satisfaction

**Example**: Shot sequence planner
```typescript
class ShotPlannerAgent implements DeliberativeAgent {
  private beliefs: BeliefSet;
  private goals: GoalStack;
  private plans: PlanLibrary;

  async plan(objective: Objective): Promise<Plan> {
    // Means-ends analysis
    const gaps = this.analyzeGaps(this.beliefs, objective);
    const operators = this.selectOperators(gaps);
    const plan = this.assemblePlan(operators);

    return this.validate(plan) ? plan : this.replan(objective);
  }
}
```

### Hybrid Agents

**Purpose**: Combine reactive and deliberative capabilities with layered architecture.

**Use Cases**:
- Real-time workflow execution
- Adaptive generation
- Interactive editing
- Dynamic resource management

**Architecture**:
```
┌─────────────────────────────┐
│  Deliberative Layer         │ ← Long-term planning
│  (Goal reasoning, planning) │
└─────────────┬───────────────┘
              │
┌─────────────┴───────────────┐
│  Executive Layer            │ ← Strategy selection
│  (Plan execution, monitor)  │
└─────────────┬───────────────┘
              │
┌─────────────┴───────────────┐
│  Reactive Layer             │ ← Fast responses
│  (Reflexes, event handling) │
└─────────────────────────────┘
```

**Example**: Streaming generation agent
```typescript
class StreamingGenerationAgent implements HybridAgent {
  // Reactive layer: Handle streaming events
  @reactive
  onChunk(chunk: StreamChunk): void {
    this.emit('progress', chunk);
  }

  // Executive layer: Manage generation flow
  @executive
  async executeGeneration(plan: GenerationPlan): AsyncIterator<Result> {
    for (const step of plan.steps) {
      yield await this.processStep(step);
      this.updateProgress();
    }
  }

  // Deliberative layer: Plan generation strategy
  @deliberative
  async planGeneration(prompt: Prompt): Promise<GenerationPlan> {
    const strategy = await this.selectStrategy(prompt);
    const steps = await this.decomposeIntoSteps(strategy);
    return new GenerationPlan(steps);
  }
}
```

## Memory Systems

Multi-tiered memory architecture based on cognitive science:

### Working Memory

**Characteristics**:
- Limited capacity (7±2 items)
- Fast access (< 1ms)
- Volatile
- Active processing space

**Implementation**:
```typescript
class WorkingMemory {
  private slots: Array<MemorySlot> = new Array(7);
  private lru: LRUCache<string, any>;

  store(key: string, value: any, priority: number): void {
    if (this.isFull()) {
      this.evictLowestPriority();
    }
    this.slots[this.findFreeSlot()] = { key, value, priority };
  }

  recall(key: string): any | null {
    return this.lru.get(key);
  }
}
```

### Episodic Memory

**Characteristics**:
- Event sequences
- Temporal context
- Personal experiences
- Case-based reasoning

**Implementation**:
```typescript
interface Episode {
  id: string;
  timestamp: number;
  context: Context;
  actions: Action[];
  outcome: Outcome;
  lessons: Lesson[];
}

class EpisodicMemory {
  private episodes: TimeSeriesDB<Episode>;
  private index: SpatialIndex<Episode>;

  store(episode: Episode): void {
    this.episodes.insert(episode);
    this.index.add(this.vectorize(episode), episode);
  }

  recallSimilar(context: Context, k: number): Episode[] {
    const query = this.vectorize({ context });
    return this.index.knn(query, k);
  }

  extractPattern(episodes: Episode[]): Pattern {
    // Temporal pattern mining
    return this.mineSequentialPatterns(episodes);
  }
}
```

### Semantic Memory

**Characteristics**:
- Factual knowledge
- Conceptual relationships
- Domain models
- Ontologies

**Implementation**:
```typescript
class SemanticMemory {
  private kg: KnowledgeGraph;
  private embeddings: VectorStore;

  learn(fact: Fact): void {
    this.kg.addTriple(fact.subject, fact.predicate, fact.object);
    this.embeddings.upsert(fact.id, this.embed(fact));
  }

  query(question: Query): Answer {
    // Symbolic reasoning over knowledge graph
    const paths = this.kg.findPaths(question);

    // Neural retrieval for fuzzy matching
    const similar = this.embeddings.search(question.embedding);

    // Hybrid reasoning
    return this.synthesize(paths, similar);
  }
}
```

### Procedural Memory

**Characteristics**:
- Skill knowledge
- Automated routines
- Compiled procedures
- Motor programs

**Implementation**:
```typescript
class ProceduralMemory {
  private procedures: Map<string, Procedure>;
  private compilationCache: Map<string, CompiledProcedure>;

  compile(procedure: Procedure): CompiledProcedure {
    // Knowledge compilation: Convert declarative → procedural
    const optimized = this.optimize(procedure);
    const compiled = this.generateCode(optimized);
    this.compilationCache.set(procedure.id, compiled);
    return compiled;
  }

  execute(name: string, args: any[]): Result {
    const proc = this.compilationCache.get(name)
      ?? this.compile(this.procedures.get(name));
    return proc.execute(args);
  }
}
```

## Decision-Making Framework

### Utility Theory

Agents make decisions by maximizing expected utility:

```typescript
interface UtilityFunction {
  evaluate(state: State, action: Action): number;
}

class DecisionMaker {
  constructor(
    private utility: UtilityFunction,
    private worldModel: WorldModel
  ) {}

  selectAction(state: State, actions: Action[]): Action {
    return actions.reduce((best, action) => {
      const expectedUtility = this.computeExpectedUtility(state, action);
      return expectedUtility > best.utility
        ? { action, utility: expectedUtility }
        : best;
    }, { action: null, utility: -Infinity }).action;
  }

  private computeExpectedUtility(state: State, action: Action): number {
    // Project possible futures
    const outcomes = this.worldModel.predict(state, action);

    // Weight by probability
    return outcomes.reduce((sum, outcome) =>
      sum + outcome.probability * this.utility.evaluate(outcome.state, action),
      0
    );
  }
}
```

### Bounded Rationality

Real agents operate under constraints:

```typescript
interface RationalityBounds {
  timeLimit: number;        // Computational time budget
  memoryLimit: number;      // Working memory capacity
  uncertaintyTolerance: number;  // Acceptable confidence threshold
}

class BoundedRationalAgent {
  decide(
    state: State,
    actions: Action[],
    bounds: RationalityBounds
  ): Action {
    const startTime = Date.now();
    let bestAction = this.defaultAction;
    let bestUtility = -Infinity;

    // Anytime algorithm: Improve solution until time runs out
    for (const action of this.prioritize(actions)) {
      if (Date.now() - startTime > bounds.timeLimit) break;

      const utility = this.estimateUtility(action, bounds.uncertaintyTolerance);
      if (utility > bestUtility) {
        bestAction = action;
        bestUtility = utility;
      }

      // Satisficing: Good enough beats perfect
      if (utility > this.aspirationLevel) break;
    }

    return bestAction;
  }
}
```

### Decision Trees with Pruning

```typescript
class DecisionTree {
  private root: DecisionNode;
  private pruningThreshold: number;

  search(state: State, depth: number): Action {
    return this.minimax(state, depth, -Infinity, Infinity);
  }

  private minimax(
    state: State,
    depth: number,
    alpha: number,
    beta: number
  ): Action {
    if (depth === 0 || this.isTerminal(state)) {
      return this.evaluate(state);
    }

    const actions = this.generateActions(state);
    for (const action of actions) {
      const nextState = this.worldModel.transition(state, action);
      const value = -this.minimax(nextState, depth - 1, -beta, -alpha);

      alpha = Math.max(alpha, value);

      // Alpha-beta pruning
      if (alpha >= beta) break;
    }

    return alpha;
  }
}
```

## Multi-Agent Orchestration

### Coordination Patterns

#### Hierarchical Coordination

```typescript
class HierarchicalCoordinator {
  private managers: Map<string, ManagerAgent>;
  private workers: Map<string, WorkerAgent>;

  async executeWorkflow(workflow: Workflow): Promise<Result> {
    // Decompose into tasks
    const tasks = this.decompose(workflow);

    // Assign to managers
    const assignments = this.assignToManagers(tasks);

    // Managers delegate to workers
    const results = await Promise.all(
      assignments.map(({ manager, tasks }) =>
        manager.coordinate(tasks, this.workers)
      )
    );

    // Aggregate results
    return this.synthesize(results);
  }
}
```

#### Contract Net Protocol

```typescript
class ContractNetCoordinator {
  async allocateTask(task: Task, agents: Agent[]): Promise<Agent> {
    // Announce task
    const announcement = new TaskAnnouncement(task);

    // Collect bids
    const bids = await Promise.all(
      agents.map(agent => agent.bid(announcement))
    );

    // Award contract to best bid
    const winner = this.selectWinner(bids);
    await winner.agent.award(task);

    return winner.agent;
  }

  private selectWinner(bids: Bid[]): Bid {
    return bids.reduce((best, bid) =>
      this.evaluateBid(bid) > this.evaluateBid(best) ? bid : best
    );
  }

  private evaluateBid(bid: Bid): number {
    return (
      bid.quality * 0.5 +
      (1 / bid.cost) * 0.3 +
      (1 / bid.time) * 0.2
    );
  }
}
```

#### Blackboard Architecture

```typescript
class Blackboard {
  private knowledge: Map<string, KnowledgeSource>;
  private controlStrategy: ControlStrategy;

  async solve(problem: Problem): Promise<Solution> {
    this.initialize(problem);

    while (!this.isSolved()) {
      // Knowledge sources monitor blackboard
      const triggers = this.detectTriggers();

      // Control strategy selects which KS to activate
      const ks = this.controlStrategy.select(triggers);

      // Execute knowledge source
      const contribution = await ks.contribute(this.state);

      // Update shared state
      this.update(contribution);
    }

    return this.extractSolution();
  }
}
```

### Communication Protocols

#### FIPA ACL (Agent Communication Language)

```typescript
enum Performative {
  INFORM,      // Share information
  REQUEST,     // Ask for action
  QUERY,       // Ask for information
  PROPOSE,     // Suggest action
  ACCEPT,      // Agree to proposal
  REJECT,      // Decline proposal
  CONFIRM,     // Verify truth
  DISCONFIRM   // Deny truth
}

interface Message {
  performative: Performative;
  sender: AgentID;
  receiver: AgentID;
  content: any;
  ontology: string;
  language: string;
  protocol: string;
  conversationId: string;
}

class AgentCommunicator {
  async send(message: Message): Promise<void> {
    // Validate message semantics
    this.validate(message);

    // Serialize using ontology
    const payload = this.serialize(message);

    // Deliver through transport
    await this.transport.deliver(payload, message.receiver);
  }

  async receive(): Promise<Message> {
    const payload = await this.transport.receive();
    return this.deserialize(payload);
  }
}
```

## Tool Use & Reasoning

### Tool Selection Heuristics

```typescript
class ToolSelector {
  select(goal: Goal, tools: Tool[]): Tool[] {
    // Precondition matching
    const applicable = tools.filter(tool =>
      tool.preconditions.every(pre => pre.isSatisfied(this.state))
    );

    // Effects-based selection
    const relevant = applicable.filter(tool =>
      this.contributesToGoal(tool.effects, goal)
    );

    // Cost-benefit analysis
    const ranked = relevant.sort((a, b) =>
      this.expectedBenefit(b, goal) - this.expectedBenefit(a, goal)
    );

    // Select top-k for exploration
    return ranked.slice(0, this.explorationWidth);
  }

  private contributesToGoal(effects: Effect[], goal: Goal): boolean {
    return effects.some(effect =>
      this.reduces(effect, this.distance(this.state, goal))
    );
  }
}
```

### Compositional Tool Use

```typescript
class ToolComposer {
  async compose(goal: Goal): Promise<ComposedTool> {
    // Forward chaining: Start from current state
    const forwardPlan = this.forwardSearch(this.state, goal);

    // Backward chaining: Start from goal
    const backwardPlan = this.backwardSearch(goal, this.state);

    // Bidirectional search: Meet in middle
    const plan = this.merge(forwardPlan, backwardPlan);

    // Create composite tool
    return new ComposedTool(plan.steps);
  }

  private forwardSearch(state: State, goal: Goal): Plan {
    const frontier = new PriorityQueue<State>();
    frontier.push(state, 0);

    while (!frontier.isEmpty()) {
      const current = frontier.pop();

      if (this.satisfies(current, goal)) {
        return this.extractPlan(current);
      }

      for (const tool of this.getApplicableTools(current)) {
        const next = tool.apply(current);
        const cost = this.estimateCost(current, next, goal);
        frontier.push(next, cost);
      }
    }

    throw new PlanningFailureError();
  }
}
```

### Tool Learning & Adaptation

```typescript
class ToolLearner {
  private performanceHistory: Map<Tool, PerformanceStats>;

  async learnFromExperience(
    tool: Tool,
    context: Context,
    outcome: Outcome
  ): Promise<void> {
    // Update performance statistics
    this.updateStats(tool, outcome);

    // Learn precondition refinements
    if (!outcome.succeeded) {
      await this.refine Preconditions(tool, context);
    }

    // Discover new tool compositions
    if (outcome.exceptional) {
      await this.abstract Pattern(tool, context, outcome);
    }

    // Update tool selection policy
    this.updatePolicy(tool, context, outcome);
  }

  private updatePolicy(
    tool: Tool,
    context: Context,
    outcome: Outcome
  ): void {
    // Reinforcement learning update
    const reward = this.computeReward(outcome);
    const state = this.featurize(context);
    const action = tool.id;

    this.qTable.update(state, action, reward);
  }
}
```

## Error Handling & Recovery

### Error Taxonomy

```typescript
enum ErrorSeverity {
  RECOVERABLE,      // Can fix automatically
  DEGRADED,         // Partial functionality remains
  CRITICAL,         // Requires intervention
  FATAL             // Unrecoverable
}

enum ErrorCategory {
  TRANSIENT,        // Temporary, retry may succeed
  PERMANENT,        // Will fail again, need different approach
  ENVIRONMENTAL,    // External system issue
  SEMANTIC,         // Logic or constraint violation
  RESOURCE          // Insufficient resources
}

interface AgentError {
  severity: ErrorSeverity;
  category: ErrorCategory;
  context: Context;
  cause: Error;
  recoveryStrategies: RecoveryStrategy[];
}
```

### Recovery Strategies

```typescript
class ErrorRecoverySystem {
  async recover(error: AgentError): Promise<Result> {
    // Select recovery strategy
    const strategy = this.selectStrategy(error);

    // Execute with fallback chain
    for (const approach of strategy.approaches) {
      try {
        return await approach.execute(error.context);
      } catch (e) {
        // Log and continue to next approach
        this.log.warn(`Recovery approach ${approach.name} failed`, e);
      }
    }

    // All recovery attempts exhausted
    throw new UnrecoverableError(error);
  }

  private selectStrategy(error: AgentError): RecoveryStrategy {
    switch (error.category) {
      case ErrorCategory.TRANSIENT:
        return new RetryStrategy({
          maxAttempts: 3,
          backoff: 'exponential'
        });

      case ErrorCategory.PERMANENT:
        return new ReplanningstStrategy();

      case ErrorCategory.ENVIRONMENTAL:
        return new FallbackStrategy();

      case ErrorCategory.SEMANTIC:
        return new ConstraintRelaxationStrategy();

      case ErrorCategory.RESOURCE:
        return new ResourceAcquisitionStrategy();
    }
  }
}
```

### Circuit Breaker Pattern

```typescript
class CircuitBreaker {
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';
  private failureCount: number = 0;
  private lastFailureTime: number = 0;

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (this.shouldAttemptReset()) {
        this.state = 'HALF_OPEN';
      } else {
        throw new CircuitOpenError();
      }
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    this.failureCount = 0;
    this.state = 'CLOSED';
  }

  private onFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();

    if (this.failureCount >= this.threshold) {
      this.state = 'OPEN';
    }
  }

  private shouldAttemptReset(): boolean {
    return Date.now() - this.lastFailureTime > this.timeout;
  }
}
```

## Performance Optimization

### Cognitive Load Management

```typescript
class CognitiveLoadManager {
  private currentLoad: number = 0;
  private maxLoad: number = 100;

  async execute<T>(
    task: Task,
    estimatedLoad: number
  ): Promise<T> {
    // Wait for capacity
    await this.acquireCapacity(estimatedLoad);

    try {
      // Monitor actual load during execution
      const monitor = this.startMonitoring();
      const result = await task.execute();
      const actualLoad = monitor.stop();

      // Update load estimation model
      this.updateEstimator(task, estimatedLoad, actualLoad);

      return result;
    } finally {
      this.releaseCapacity(estimatedLoad);
    }
  }

  private async acquireCapacity(load: number): Promise<void> {
    while (this.currentLoad + load > this.maxLoad) {
      await this.sleep(100);

      // Optionally trigger load shedding
      if (this.shouldShedLoad()) {
        await this.shedLoad();
      }
    }
    this.currentLoad += load;
  }
}
```

### Incremental Processing

```typescript
class IncrementalProcessor<T, R> {
  async *process(items: T[]): AsyncIterator<R> {
    const batchSize = this.computeOptimalBatchSize();

    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);

      // Process batch
      const results = await this.processBatch(batch);

      // Yield incrementally
      for (const result of results) {
        yield result;
      }

      // Allow interleaving with other tasks
      await this.yield();
    }
  }

  private computeOptimalBatchSize(): number {
    // Balance throughput vs latency
    const availableMemory = this.getAvailableMemory();
    const itemSize = this.estimateItemSize();
    return Math.floor(availableMemory * 0.8 / itemSize);
  }
}
```

### Caching Strategies

```typescript
class MultiLevelCache {
  private l1: LRUCache;     // Hot data, < 1ms
  private l2: RedisCache;   // Warm data, < 10ms
  private l3: DatabaseCache; // Cold data, < 100ms

  async get<T>(key: string): Promise<T | null> {
    // L1: In-memory
    let value = await this.l1.get(key);
    if (value) return value;

    // L2: Distributed cache
    value = await this.l2.get(key);
    if (value) {
      this.l1.set(key, value); // Promote to L1
      return value;
    }

    // L3: Persistent storage
    value = await this.l3.get(key);
    if (value) {
      this.l2.set(key, value); // Promote to L2
      this.l1.set(key, value); // Promote to L1
      return value;
    }

    return null;
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    // Write-through strategy
    await Promise.all([
      this.l1.set(key, value, ttl),
      this.l2.set(key, value, ttl),
      this.l3.set(key, value, ttl)
    ]);
  }
}
```

## Implementation Patterns

### Agent Lifecycle

```typescript
interface AgentLifecycle {
  // Initialization
  initialize(config: AgentConfig): Promise<void>;

  // Activation
  activate(): Promise<void>;

  // Main loop
  run(): Promise<void>;

  // Suspension
  suspend(): Promise<void>;

  // Resumption
  resume(): Promise<void>;

  // Termination
  terminate(): Promise<void>;
}

class BaseAgent implements AgentLifecycle {
  private state: AgentState = AgentState.CREATED;

  async run(): Promise<void> {
    this.state = AgentState.RUNNING;

    while (this.state === AgentState.RUNNING) {
      try {
        // Perception
        const percepts = await this.perceive();

        // Cognition
        const decision = await this.decide(percepts);

        // Action
        await this.act(decision);

        // Learning
        await this.learn();

      } catch (error) {
        await this.handleError(error);
      }
    }
  }
}
```

### Observable Agents

```typescript
class ObservableAgent extends BaseAgent {
  private observers: Set<AgentObserver> = new Set();

  subscribe(observer: AgentObserver): Unsubscribe {
    this.observers.add(observer);
    return () => this.observers.delete(observer);
  }

  protected async act(decision: Decision): Promise<void> {
    this.notify('beforeAction', decision);

    try {
      const result = await super.act(decision);
      this.notify('afterAction', { decision, result });
      return result;
    } catch (error) {
      this.notify('actionError', { decision, error });
      throw error;
    }
  }

  private notify(event: string, data: any): void {
    for (const observer of this.observers) {
      observer.onEvent(event, data);
    }
  }
}
```

### Agent Factory

```typescript
class AgentFactory {
  private registry: Map<string, AgentConstructor> = new Map();
  private pool: Map<string, Agent[]> = new Map();

  register(type: string, constructor: AgentConstructor): void {
    this.registry.set(type, constructor);
  }

  async create(type: string, config: AgentConfig): Promise<Agent> {
    // Try to reuse from pool
    const pooled = this.pool.get(type)?.pop();
    if (pooled) {
      await pooled.reset(config);
      return pooled;
    }

    // Create new instance
    const constructor = this.registry.get(type);
    if (!constructor) {
      throw new UnknownAgentTypeError(type);
    }

    const agent = new constructor(config);
    await agent.initialize(config);

    return agent;
  }

  async release(agent: Agent): Promise<void> {
    const type = agent.type;
    if (!this.pool.has(type)) {
      this.pool.set(type, []);
    }

    await agent.cleanup();
    this.pool.get(type).push(agent);
  }
}
```

## Best Practices

### 1. Separation of Concerns

- **Perception**: Isolate sensor/input handling
- **Cognition**: Separate reasoning from I/O
- **Action**: Decouple decision-making from execution
- **Learning**: Treat learning as cross-cutting concern

### 2. Composability

- Design agents as reusable components
- Use dependency injection for flexibility
- Prefer composition over inheritance
- Define clear interfaces and contracts

### 3. Observability

- Emit structured logs at decision points
- Track performance metrics (latency, throughput, errors)
- Provide introspection into internal state
- Support debugging and replay

### 4. Robustness

- Validate inputs at boundaries
- Implement timeouts for all async operations
- Use circuit breakers for external dependencies
- Gracefully degrade when components fail

### 5. Scalability

- Design for horizontal scaling
- Minimize shared state
- Use async/await for I/O
- Implement backpressure mechanisms

### 6. Testability

- Mock external dependencies
- Provide deterministic test modes
- Separate business logic from infrastructure
- Write property-based tests for reasoning

---

## References

- Laird, J. E. (2012). *The Soar Cognitive Architecture*. MIT Press.
- Russell, S., & Norvig, P. (2020). *Artificial Intelligence: A Modern Approach* (4th ed.).
- Wooldridge, M. (2009). *An Introduction to MultiAgent Systems* (2nd ed.).
- Anderson, J. R. (2007). *How Can the Human Mind Occur in the Physical Universe?*
- Brooks, R. A. (1991). Intelligence without representation. *Artificial Intelligence*, 47(1-3).
