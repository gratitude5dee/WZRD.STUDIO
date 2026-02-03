
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Node, Edge } from 'reactflow';

export const useWorkflow = () => {
  const { toast } = useToast();

  const saveWorkflow = async (nodes: Node[], edges: Edge[]) => {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please log in to save workflows",
          variant: "destructive"
        });
        return;
      }

      // Create or update workflow
      const { data: workflow, error: workflowError } = await supabase
        .from('workflows')
        .upsert({
          name: 'My Workflow',
          user_id: user.id,
        })
        .select()
        .single();

      if (workflowError || !workflow) throw workflowError;

      // Save nodes
      const nodesToSave = nodes.map(node => ({
        workflow_id: workflow.id,
        type: node.type || 'default',
        position_x: node.position.x,
        position_y: node.position.y,
        data: node.data,
        id: node.id
      }));

      const { error: nodesError } = await supabase
        .from('nodes')
        .upsert(nodesToSave);

      if (nodesError) throw nodesError;

      // Save edges
      const edgesToSave = edges.map(edge => ({
        workflow_id: workflow.id,
        source_node_id: edge.source,
        target_node_id: edge.target,
        data: edge.data || {},
        id: edge.id
      }));

      const { error: edgesError } = await supabase
        .from('edges')
        .upsert(edgesToSave);

      if (edgesError) throw edgesError;

      toast({
        title: "Success",
        description: "Workflow saved successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error saving workflow",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const loadWorkflow = async (workflowId: string) => {
    try {
      // Fetch nodes
      const { data: nodesData, error: nodesError } = await supabase
        .from('nodes')
        .select('*')
        .eq('workflow_id', workflowId);

      if (nodesError) throw nodesError;

      // Fetch edges
      const { data: edgesData, error: edgesError } = await supabase
        .from('edges')
        .select('*')
        .eq('workflow_id', workflowId);

      if (edgesError) throw edgesError;

      // Transform nodes to ReactFlow format
      const flowNodes = nodesData.map((node) => ({
        id: node.id,
        type: node.type,
        position: { x: node.position_x, y: node.position_y },
        data: node.data,
      }));

      // Transform edges to ReactFlow format
      const flowEdges = edgesData.map((edge) => ({
        id: edge.id,
        source: edge.source_node_id,
        target: edge.target_node_id,
        type: 'custom',
        data: edge.data,
      }));

      return { nodes: flowNodes, edges: flowEdges };
    } catch (error: any) {
      toast({
        title: "Error loading workflow",
        description: error.message,
        variant: "destructive"
      });
      return null;
    }
  };

  return {
    saveWorkflow,
    loadWorkflow,
  };
};
