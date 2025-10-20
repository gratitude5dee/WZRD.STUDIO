# Execution Engine

This directory contains the complete reactive flow execution system.

## Components

### GraphExecutor (`graphExecutor.ts`)
- **Topological Sort**: Orders nodes for sequential execution using Kahn's algorithm
- **Validation**: Validates graph structure (no cycles, required inputs connected)
- **Execution Trigger**: Initiates backend execution via `run-graph` edge function

### NodeExecutor (`nodeExecutor.ts`)
- **Client-side Validation**: Validates node inputs before execution
- **Local Execution**: Handles immediate input node execution

### Realtime Hook (`useRealtimeExecution.ts`)
- **Status Updates**: Subscribes to node and workflow status via Supabase Realtime
- **Visual Feedback**: Updates node UI with progress, completion, and errors
- **Toast Notifications**: Provides user feedback for execution events

## Architecture

```
User clicks "Run Workflow"
  ↓
GraphExecutor.validateGraph()
  ↓
GraphExecutor.executeGraph()
  ↓
Calls run-graph edge function
  ↓
Backend executes nodes sequentially
  ↓
Updates execution_node_status table
  ↓
Realtime pushes updates to client
  ↓
useRealtimeExecution updates UI
  ↓
Node visuals update in real-time
```

## Node Execution Flow

1. **Input Nodes**: Execute immediately (passthrough)
2. **Generation Nodes**: 
   - Text: Uses Lovable AI (Gemini Flash)
   - Image: Uses FAL.ai (Flux Schnell)
   - Video: Uses FAL.ai (Luma Dream Machine)

## Error Handling

- Connection validation before execution
- Node input validation
- Real-time error display on nodes
- Toast notifications for user feedback
- Failed run tracking in database

## Database Schema

### execution_runs
- Tracks workflow executions
- Status: queued → running → completed/failed
- Progress tracking (completed_nodes/total_nodes)

### execution_node_status
- Tracks individual node status
- Progress percentage
- Outputs (generated content)
- Error messages

## Usage Example

```typescript
import { GraphExecutor } from '@/lib/execution/graphExecutor';
import { useRealtimeExecution } from '@/hooks/useRealtimeExecution';

// In component
const executor = new GraphExecutor();
const [runId, setRunId] = useState(null);

// Subscribe to updates
useRealtimeExecution(runId, onComplete, onFailed);

// Execute
const result = await executor.executeGraph(nodes, edges, projectId);
setRunId(result.runId);
```
