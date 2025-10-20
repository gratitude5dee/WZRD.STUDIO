import { Node, Edge } from 'reactflow';
import { supabase } from '@/integrations/supabase/client';

export interface ExecutionResult {
  runId: string;
  status: 'queued' | 'running' | 'completed' | 'failed';
}

export interface NodeExecutionStatus {
  nodeId: string;
  status: 'idle' | 'queued' | 'generating' | 'complete' | 'error';
  progress?: number;
  error?: string;
  outputs?: Record<string, any>;
}

export class GraphExecutor {
  /**
   * Execute a workflow graph
   */
  async executeGraph(
    nodes: Node[],
    edges: Edge[],
    projectId: string
  ): Promise<ExecutionResult> {
    // 1. Validate graph has no cycles and all required inputs are connected
    const validationErrors = this.validateExecutableGraph(nodes, edges);
    if (validationErrors.length > 0) {
      throw new Error(`Graph validation failed: ${validationErrors.join(', ')}`);
    }

    // 2. Perform topological sort to determine execution order
    const executionOrder = this.topologicalSort(nodes, edges);
    if (!executionOrder) {
      throw new Error('Graph contains cycles or is invalid');
    }

    // 3. Prepare execution payload
    const payload = {
      projectId,
      nodes: nodes.map(this.serializeNode),
      edges: edges.map(this.serializeEdge),
      executionOrder,
    };

    // 4. Call backend to start execution
    const { data, error } = await supabase.functions.invoke('run-graph', {
      body: payload,
    });

    if (error) {
      console.error('Execution error:', error);
      throw new Error(error.message || 'Failed to start execution');
    }

    return {
      runId: data.runId,
      status: 'queued',
    };
  }

  /**
   * Perform topological sort using Kahn's algorithm
   * Returns execution order or null if graph has cycles
   */
  private topologicalSort(nodes: Node[], edges: Edge[]): string[] | null {
    // Initialize in-degree map
    const inDegree = new Map<string, number>();
    const adjList = new Map<string, string[]>();

    // Initialize all nodes with 0 in-degree
    nodes.forEach((node) => {
      inDegree.set(node.id, 0);
      adjList.set(node.id, []);
    });

    // Build adjacency list and calculate in-degrees
    edges.forEach((edge) => {
      const neighbors = adjList.get(edge.source) || [];
      neighbors.push(edge.target);
      adjList.set(edge.source, neighbors);

      inDegree.set(edge.target, (inDegree.get(edge.target) || 0) + 1);
    });

    // Find all nodes with 0 in-degree (starting points)
    const queue: string[] = [];
    inDegree.forEach((degree, nodeId) => {
      if (degree === 0) {
        queue.push(nodeId);
      }
    });

    const result: string[] = [];

    // Process nodes in topological order
    while (queue.length > 0) {
      const current = queue.shift()!;
      result.push(current);

      // Reduce in-degree for neighbors
      const neighbors = adjList.get(current) || [];
      neighbors.forEach((neighbor) => {
        const newDegree = (inDegree.get(neighbor) || 0) - 1;
        inDegree.set(neighbor, newDegree);

        if (newDegree === 0) {
          queue.push(neighbor);
        }
      });
    }

    // If we processed all nodes, graph is valid (no cycles)
    return result.length === nodes.length ? result : null;
  }

  /**
   * Validate graph is executable
   */
  private validateExecutableGraph(nodes: Node[], edges: Edge[]): string[] {
    const errors: string[] = [];

    // Check each node has required inputs connected
    nodes.forEach((node) => {
      const requiredInputs = node.data.inputs?.filter((p: any) => !p.optional) || [];

      requiredInputs.forEach((input: any) => {
        const hasConnection = edges.some(
          (e) => e.target === node.id && e.targetHandle === input.id
        );

        if (!hasConnection) {
          errors.push(
            `Node "${node.data.label || node.id}" requires input "${input.name}"`
          );
        }
      });
    });

    // Check for isolated nodes (no inputs or outputs connected)
    nodes.forEach((node) => {
      const hasIncoming = edges.some((e) => e.target === node.id);
      const hasOutgoing = edges.some((e) => e.source === node.id);

      // Input nodes don't need incoming connections
      const isInputNode = node.data.inputs?.length === 0;

      if (!isInputNode && !hasIncoming && !hasOutgoing) {
        errors.push(`Node "${node.data.label || node.id}" is isolated`);
      }
    });

    return errors;
  }

  /**
   * Serialize node for backend execution
   */
  private serializeNode(node: Node) {
    return {
      id: node.id,
      type: node.data.type,
      label: node.data.label,
      inputs: node.data.inputs || [],
      outputs: node.data.outputs || [],
      params: node.data.params || {},
      position: node.position,
    };
  }

  /**
   * Serialize edge for backend execution
   */
  private serializeEdge(edge: Edge) {
    return {
      id: edge.id,
      source: edge.source,
      target: edge.target,
      sourceHandle: edge.sourceHandle,
      targetHandle: edge.targetHandle,
    };
  }

  /**
   * Get execution status for a node
   */
  static getNodeStatus(node: Node): 'idle' | 'queued' | 'generating' | 'complete' | 'error' {
    return node.data.status || 'idle';
  }
}
