/**
 * Unified Canvas Type System
 * 
 * Type-safe definitions for TapCanvas + Studio integration
 * Supports workflow nodes, content generation nodes, and hybrid features
 */

import type { Node, Edge, XYPosition } from '@xyflow/react';

// ============================================================================
// Node Types & Kinds
// ============================================================================

/**
 * All supported node types in the unified canvas
 */
export type NodeKind = 
  // TapCanvas workflow nodes
  | 'task'        // Generic workflow task
  | 'group'       // Container for multiple nodes
  | 'io'          // Input/Output node
  | 'subflow'     // Reference to another flow
  
  // Studio content nodes
  | 'text'        // AI text generation
  | 'image'       // AI image generation
  | 'video'       // AI video generation
  | 'audio'       // AI audio generation
  
  // Hybrid/advanced nodes
  | 'composite'   // Multi-output processor
  | 'conditional' // Conditional branching
  | 'loop'        // Iteration/batching
  | 'transform';  // Data transformation

/**
 * Node execution status
 */
export type NodeStatus = 
  | 'idle'      // Not executed yet
  | 'queued'    // Waiting to execute
  | 'running'   // Currently executing
  | 'success'   // Completed successfully
  | 'error'     // Failed with error
  | 'cancelled' // Execution cancelled
  | 'skipped'   // Skipped due to conditions
  | 'dirty';    // Needs re-execution

/**
 * Edge status
 */
export type EdgeStatus = 
  | 'idle'
  | 'running'
  | 'success'
  | 'error';

/**
 * Data types for edges
 */
export type DataType = 
  | 'image' 
  | 'text' 
  | 'video' 
  | 'audio'
  | 'tensor' 
  | 'json' 
  | 'any';

/**
 * Cardinality for connections
 */
export type Cardinality = '1' | 'n'; // 1 = single connection, n = multiple

// ============================================================================
// Base Node Data
// ============================================================================

/**
 * Common fields for all node types
 */
export interface BaseNodeData {
  /** Display label */
  label: string;
  
  /** Node type/kind */
  kind: NodeKind;
  
  /** Schema version for migrations */
  version?: number;
  
  /** Arbitrary metadata */
  metadata?: Record<string, unknown>;
  
  /** Visual styling overrides */
  style?: {
    color?: string;
    borderColor?: string;
    backgroundColor?: string;
    icon?: string;
  };
  
  /** Validation errors */
  errors?: string[];
  
  /** Warnings */
  warnings?: string[];
}

// ============================================================================
// TapCanvas Node Data Types
// ============================================================================

/**
 * Generic task/workflow node
 */
export interface TaskNodeData extends BaseNodeData {
  kind: 'task';
  
  /** Task type identifier */
  taskType?: string;
  
  /** Task parameters */
  params?: Record<string, any>;
  
  /** Execution status */
  status?: NodeStatus;
  
  /** Execution logs */
  logs?: string[];
  
  /** Start time */
  startedAt?: string;
  
  /** End time */
  completedAt?: string;
  
  /** Execution duration in ms */
  duration?: number;
  
  /** Error details */
  error?: {
    message: string;
    stack?: string;
    code?: string;
  };
  
  /** Retry configuration */
  retry?: {
    maxAttempts: number;
    currentAttempt: number;
    backoffMs: number;
  };
}

/**
 * Group/container node for organizing workflows
 */
export interface GroupNodeData extends BaseNodeData {
  kind: 'group';
  
  /** IDs of child nodes */
  childrenIds?: string[];
  
  /** Whether group is collapsed */
  collapsed?: boolean;
  
  /** Group color/theme */
  color?: string;
  
  /** Group description */
  description?: string;
}

/**
 * Input/Output node for workflow boundaries
 */
export interface IONodeData extends BaseNodeData {
  kind: 'io';
  
  /** Is this an input or output node */
  ioType: 'input' | 'output';
  
  /** Data types this IO handles */
  dataTypes?: DataType[];
  
  /** Schema for validation */
  schema?: Record<string, any>;
  
  /** Default values for inputs */
  defaultValues?: Record<string, any>;
}

/**
 * Reference to another flow (sub-workflow)
 */
export interface SubflowNodeData extends BaseNodeData {
  kind: 'subflow';
  
  /** Referenced flow ID */
  subflowRef: string;
  
  /** Flow name for display */
  flowName?: string;
  
  /** Input mappings */
  inputMappings?: Record<string, string>;
  
  /** Output mappings */
  outputMappings?: Record<string, string>;
}

// ============================================================================
// Studio Content Node Data Types
// ============================================================================

/**
 * Base for all AI content generation nodes
 */
export interface ContentNodeData extends BaseNodeData {
  kind: 'text' | 'image' | 'video' | 'audio';
  
  /** User prompt/input */
  prompt?: string;
  
  /** Selected AI model ID */
  modelId?: string;
  
  /** Model-specific parameters */
  modelParams?: Record<string, any>;
  
  /** Generation status */
  generationStatus?: 'idle' | 'generating' | 'completed' | 'failed';
  
  /** Generated output URL */
  generatedUrl?: string;
  
  /** Alternative outputs */
  alternatives?: Array<{
    url: string;
    score?: number;
    metadata?: Record<string, any>;
  }>;
  
  /** Generation metadata */
  generationMetadata?: {
    time: number;
    cost?: number;
    modelVersion?: string;
    seed?: number;
  };
}

/**
 * Text generation node
 */
export interface TextNodeData extends ContentNodeData {
  kind: 'text';
  
  /** Generated text content */
  generatedText?: string;
  
  /** Max length in tokens */
  maxTokens?: number;
  
  /** Temperature for randomness */
  temperature?: number;
  
  /** System prompt */
  systemPrompt?: string;
}

/**
 * Image generation node
 */
export interface ImageNodeData extends ContentNodeData {
  kind: 'image';
  
  /** Aspect ratio (16:9, 1:1, etc) */
  aspectRatio?: string;
  
  /** Generation mode */
  mode?: 'text-to-image' | 'image-to-image' | 'inpainting' | 'outpainting';
  
  /** Reference image for img2img */
  referenceImageUrl?: string;
  
  /** Reference image prompt */
  referenceImagePrompt?: string;
  
  /** Strength/influence of reference (0-1) */
  strength?: number;
  
  /** Negative prompt */
  negativePrompt?: string;
  
  /** Guidance scale */
  guidanceScale?: number;
  
  /** Number of inference steps */
  steps?: number;
}

/**
 * Video generation node
 */
export interface VideoNodeData extends ContentNodeData {
  kind: 'video';
  
  /** Video duration in seconds */
  duration?: number;
  
  /** Frame rate */
  fps?: number;
  
  /** Video resolution */
  resolution?: string;
  
  /** Motion/camera settings */
  motion?: {
    type?: 'static' | 'pan' | 'zoom' | 'rotate';
    intensity?: number;
  };
  
  /** Keyframes for animation */
  keyframes?: Array<{
    time: number;
    prompt: string;
    imageUrl?: string;
  }>;
}

/**
 * Audio generation node
 */
export interface AudioNodeData extends ContentNodeData {
  kind: 'audio';
  
  /** Audio duration in seconds */
  duration?: number;
  
  /** Voice ID for TTS */
  voiceId?: string;
  
  /** Audio format */
  format?: 'mp3' | 'wav' | 'ogg';
  
  /** Sample rate */
  sampleRate?: number;
}

// ============================================================================
// Hybrid Node Data Types
// ============================================================================

/**
 * Conditional branching node
 */
export interface ConditionalNodeData extends BaseNodeData {
  kind: 'conditional';
  
  /** Condition expression */
  condition?: string;
  
  /** Condition type */
  conditionType?: 'simple' | 'script';
  
  /** Last evaluation result */
  lastResult?: boolean;
}

/**
 * Loop/iteration node
 */
export interface LoopNodeData extends BaseNodeData {
  kind: 'loop';
  
  /** Loop type */
  loopType?: 'for' | 'while' | 'foreach';
  
  /** Iteration count or array */
  iterations?: number | any[];
  
  /** Current iteration */
  currentIteration?: number;
  
  /** Break condition */
  breakCondition?: string;
}

/**
 * Data transformation node
 */
export interface TransformNodeData extends BaseNodeData {
  kind: 'transform';
  
  /** Transform type */
  transformType?: 'map' | 'filter' | 'reduce' | 'custom';
  
  /** Transform function/expression */
  transform?: string;
  
  /** Input schema */
  inputSchema?: Record<string, any>;
  
  /** Output schema */
  outputSchema?: Record<string, any>;
}

/**
 * Composite node with multiple outputs
 */
export interface CompositeNodeData extends BaseNodeData {
  kind: 'composite';
  
  /** Sub-nodes within composite */
  subNodes?: UnifiedNode[];
  
  /** Internal edges */
  internalEdges?: TypedEdge[];
}

// ============================================================================
// Unified Node Data Type
// ============================================================================

/**
 * Union of all node data types
 */
export type UnifiedNodeData =
  | TaskNodeData
  | GroupNodeData
  | IONodeData
  | SubflowNodeData
  | TextNodeData
  | ImageNodeData
  | VideoNodeData
  | AudioNodeData
  | ConditionalNodeData
  | LoopNodeData
  | TransformNodeData
  | CompositeNodeData;

/**
 * Unified node type (ReactFlow node + typed data)
 */
export interface UnifiedNode extends Omit<Node, 'data'> {
  data: UnifiedNodeData;
}

// ============================================================================
// Edge Types
// ============================================================================

/**
 * Edge data types
 */
export type EdgeDataType = 
  | 'text'
  | 'image'
  | 'video'
  | 'audio'
  | 'data'
  | 'control'
  | 'any';

/**
 * Enhanced edge with type information
 */
export interface TypedEdge extends Edge {
  data?: {
    /** Data type flowing through this edge */
    dataType?: EdgeDataType;
    
    /** Edge label */
    label?: string;
    
    /** Validation errors */
    errors?: string[];
    
    /** Edge color override */
    color?: string;
    
    /** Whether edge is animated */
    animated?: boolean;
    
    /** Edge status */
    status?: EdgeStatus;
  };
}

// ============================================================================
// Port & Handle Types
// ============================================================================

/**
 * Port definition for nodes
 */
export interface Port {
  id: string;
  name: string;
  datatype: DataType;
  cardinality: Cardinality;
  optional?: boolean;
  position: 'top' | 'right' | 'bottom' | 'left';
}

/**
 * Node handle definition
 */
export interface HandleDefinition {
  /** Handle ID */
  id: string;
  
  /** Handle type */
  type: 'source' | 'target';
  
  /** Data type */
  dataType: EdgeDataType;
  
  /** Display label */
  label?: string;
  
  /** Whether handle is required */
  required?: boolean;
  
  /** Maximum connections (undefined = unlimited) */
  maxConnections?: number;
  
  /** Position on node */
  position?: 'top' | 'right' | 'bottom' | 'left';
}

// ============================================================================
// Canvas State
// ============================================================================

/**
 * Complete canvas state snapshot
 */
export interface CanvasSnapshot {
  /** All nodes */
  nodes: UnifiedNode[];
  
  /** All edges */
  edges: TypedEdge[];
  
  /** Next available node ID */
  nextId: number;
  
  /** Viewport position and zoom */
  viewport?: {
    x: number;
    y: number;
    zoom: number;
  };
  
  /** Schema version */
  version?: string;
  
  /** Creation timestamp */
  createdAt?: string;
  
  /** Last modified timestamp */
  updatedAt?: string;
  
  /** Metadata */
  metadata?: {
    name?: string;
    description?: string;
    author?: string;
    tags?: string[];
  };
}

// ============================================================================
// Execution Types
// ============================================================================

/**
 * Node execution context
 */
export interface ExecutionContext {
  /** Node being executed */
  nodeId: string;
  
  /** Input values from connected edges */
  inputs: Map<string, any>;
  
  /** Execution metadata */
  metadata: {
    /** Execution ID */
    executionId: string;
    
    /** Timestamp */
    timestamp: number;
    
    /** User ID */
    userId?: string;
    
    /** Project ID */
    projectId?: string;
  };
  
  /** Cancellation token */
  cancelled?: boolean;
  
  /** Logger function */
  log?: (message: string) => void;
}

/**
 * Node execution result
 */
export interface ExecutionResult {
  /** Success flag */
  success: boolean;
  
  /** Output values */
  outputs: Map<string, any>;
  
  /** Error if failed */
  error?: Error;
  
  /** Execution logs */
  logs?: string[];
  
  /** Duration in ms */
  duration?: number;
  
  /** Additional metadata */
  metadata?: Record<string, any>;
}

/**
 * Node execution status tracking
 */
export interface NodeExecutionStatus {
  /** Current status */
  status: NodeStatus;
  
  /** Start timestamp */
  startedAt?: number;
  
  /** Completion timestamp */
  completedAt?: number;
  
  /** Progress percentage (0-100) */
  progress?: number;
  
  /** Error if failed */
  error?: Error;
  
  /** Execution logs */
  logs?: Array<{
    timestamp: number;
    message: string;
    level: 'info' | 'warn' | 'error';
  }>;
}

/**
 * DAG execution options
 */
export interface DAGExecutionOptions {
  /** Max concurrent node executions */
  concurrency?: number;
  
  /** Specific nodes to start from */
  startNodes?: string[];
  
  /** Whether to skip already-successful nodes */
  skipSuccessful?: boolean;
  
  /** Timeout in ms */
  timeout?: number;
  
  /** Callback for progress */
  onProgress?: (completed: number, total: number) => void;
  
  /** Callback for node completion */
  onNodeComplete?: (nodeId: string, result: ExecutionResult) => void;
  
  /** Callback for node error */
  onNodeError?: (nodeId: string, error: Error) => void;
}

// ============================================================================
// Validation Types
// ============================================================================

/**
 * Connection validation result
 */
export interface ConnectionValidation {
  /** Is connection valid */
  valid: boolean;
  
  /** Error/warning message */
  message?: string;
  
  /** Severity level */
  severity?: 'error' | 'warning' | 'info';
}

/**
 * Node validation result
 */
export interface NodeValidation {
  /** Is node valid */
  valid: boolean;
  
  /** Validation errors */
  errors?: string[];
  
  /** Validation warnings */
  warnings?: string[];
}

/**
 * Connection validation rule
 */
export interface ConnectionRule {
  sourceKind: NodeKind;
  targetKind: NodeKind;
  sourceHandle?: string;
  targetHandle?: string;
  validate?: (source: UnifiedNode, target: UnifiedNode) => boolean;
  message?: string;
}

// ============================================================================
// Template Types
// ============================================================================

/**
 * Canvas template
 */
export interface CanvasTemplate {
  /** Template ID */
  id: string;
  
  /** Template name */
  name: string;
  
  /** Description */
  description?: string;
  
  /** Category */
  category: 'workflow' | 'content' | 'utility' | 'example';
  
  /** Thumbnail URL */
  thumbnail?: string;
  
  /** Template nodes */
  nodes: UnifiedNode[];
  
  /** Template edges */
  edges: TypedEdge[];
  
  /** Template metadata */
  metadata?: {
    author?: string;
    version?: string;
    tags?: string[];
    difficulty?: 'beginner' | 'intermediate' | 'advanced';
  };
}

// ============================================================================
// Artifact Types
// ============================================================================

/**
 * Reference to generated artifact
 */
export interface ArtifactRef {
  id: string;
  type: 'image' | 'video' | 'text' | 'audio' | 'json';
  url?: string;
  data?: any;
  metadata?: Record<string, unknown>;
}

/**
 * Run event for execution tracking
 */
export interface RunEvent {
  runId: string;
  nodeId: string;
  status: NodeStatus;
  progress?: number;
  logs?: Array<{ 
    timestamp: string; 
    message: string; 
    level: 'info' | 'warn' | 'error' 
  }>;
  artifacts?: ArtifactRef[];
  startedAt?: string;
  finishedAt?: string;
  error?: string;
}

// ============================================================================
// Export all types
// ============================================================================

export type {
  Node,
  Edge,
  XYPosition
};
