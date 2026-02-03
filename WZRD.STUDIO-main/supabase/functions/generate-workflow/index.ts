import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders, handleCors, errorResponse } from '../_shared/response.ts';

// Workflow templates with node configurations
const WORKFLOW_TEMPLATES: Record<string, {
  nodes: Array<{
    kind: string;
    label: string;
    model: string;
    prompt?: string;
  }>;
  edges: Array<{
    sourceIndex: number;
    targetIndex: number;
    sourceHandle: string;
    targetHandle: string;
  }>;
  layout: 'horizontal' | 'vertical' | 'tree';
}> = {
  marketing: {
    nodes: [
      { kind: 'Text', label: 'Brand Copy', model: 'llama-3.3-70b-versatile', prompt: '' },
      { kind: 'Image', label: 'Visual Design', model: 'flux-dev', prompt: '' },
      { kind: 'Video', label: 'Promo Video', model: 'kling-2-1', prompt: '' },
    ],
    edges: [
      { sourceIndex: 0, targetIndex: 1, sourceHandle: 'text', targetHandle: 'prompt' },
      { sourceIndex: 1, targetIndex: 2, sourceHandle: 'image', targetHandle: 'image' },
    ],
    layout: 'horizontal',
  },
  'content-creation': {
    nodes: [
      { kind: 'Text', label: 'Script', model: 'llama-3.3-70b-versatile', prompt: '' },
      { kind: 'Image', label: 'Thumbnails', model: 'flux-dev', prompt: '' },
      { kind: 'Text', label: 'Captions', model: 'llama-3.3-70b-versatile', prompt: '' },
    ],
    edges: [
      { sourceIndex: 0, targetIndex: 1, sourceHandle: 'text', targetHandle: 'prompt' },
      { sourceIndex: 0, targetIndex: 2, sourceHandle: 'text', targetHandle: 'input' },
    ],
    layout: 'tree',
  },
  'video-production': {
    nodes: [
      { kind: 'Text', label: 'Storyboard', model: 'llama-3.3-70b-versatile', prompt: '' },
      { kind: 'Image', label: 'Key Frames', model: 'flux-dev', prompt: '' },
      { kind: 'Video', label: 'Final Video', model: 'kling-2-1', prompt: '' },
    ],
    edges: [
      { sourceIndex: 0, targetIndex: 1, sourceHandle: 'text', targetHandle: 'prompt' },
      { sourceIndex: 1, targetIndex: 2, sourceHandle: 'image', targetHandle: 'image' },
    ],
    layout: 'horizontal',
  },
  'image-generation': {
    nodes: [
      { kind: 'Image', label: 'Generated Image', model: 'flux-dev', prompt: '' },
    ],
    edges: [],
    layout: 'horizontal',
  },
  'text-processing': {
    nodes: [
      { kind: 'Text', label: 'Text Generation', model: 'llama-3.3-70b-versatile', prompt: '' },
    ],
    edges: [],
    layout: 'horizontal',
  },
};

// System prompt for workflow analysis
const SYSTEM_PROMPT = `You are a workflow analysis AI. Given a user request, determine:
1. The best workflow template to use (marketing, content-creation, video-production, image-generation, text-processing)
2. Specific prompts to fill into each node based on the user's request
3. Any customizations needed

Return a JSON object with this exact structure:
{
  "template": "template-name",
  "nodePrompts": {
    "0": "prompt for first node",
    "1": "prompt for second node"
  },
  "customizations": {
    "0": { "label": "optional custom label" }
  }
}

CRITICAL RULES FOR IMAGE NODES:
- For Image nodes: The "prompt" field MUST be a detailed VISUAL DESCRIPTION suitable for AI image generation.
- DO NOT use task instructions like "Create a content calendar" or "Generate ideas".
- Instead, describe what the image should VISUALLY depict.
- Example of WRONG prompt: "Create marketing content for coffee shop"
- Example of CORRECT prompt: "A cozy artisan coffee shop interior with warm lighting, latte art on a marble counter, steam rising from cups, rustic wooden tables, plants in the background, professional photography, warm color palette"
- Transform every Image node's purpose into a rich visual scene description with details about: setting, lighting, colors, composition, style, and mood.

CRITICAL RULES FOR VIDEO NODES:
- For Video nodes: The prompt should describe visual motion and cinematic elements.
- Include camera movement, action, and dynamic elements.
- Example: "Smooth dolly shot through a bustling coffee shop, customers chatting, barista pouring latte art, steam rising, warm ambient lighting, cinematic 4K quality"

RULES FOR TEXT NODES:
- For Text nodes: Use clear task instructions for content generation.
- These can be task-oriented prompts like "Write compelling marketing copy..." or "Generate social media captions..."

General Rules:
- For single node requests (like "add a text node"), use text-processing or image-generation
- For multi-step requests, use marketing, content-creation, or video-production
- Always return valid JSON only, no explanation text`;

serve(async (req) => {
  if (req.method === 'OPTIONS') return handleCors();

  try {
    const { prompt } = await req.json();
    
    if (!prompt) {
      return errorResponse('Prompt is required', 400);
    }

    const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY");
    if (!GROQ_API_KEY) {
      return errorResponse('GROQ_API_KEY is not configured', 500);
    }

    console.log(`Generating workflow for prompt: ${prompt}`);

    // Call Groq API to analyze the prompt
    const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 1024,
        response_format: { type: "json_object" },
      }),
    });

    if (!groqResponse.ok) {
      const errorText = await groqResponse.text();
      console.error(`Groq API error: ${groqResponse.status} - ${errorText}`);
      
      // Fallback to default template
      return generateFallbackWorkflow(prompt);
    }

    const groqData = await groqResponse.json();
    const analysisText = groqData.choices?.[0]?.message?.content;
    
    if (!analysisText) {
      return generateFallbackWorkflow(prompt);
    }

    let analysis;
    try {
      analysis = JSON.parse(analysisText);
    } catch (e) {
      console.error('Failed to parse Groq response:', analysisText);
      return generateFallbackWorkflow(prompt);
    }

    console.log('Analysis result:', analysis);

    // Get the template
    const templateName = analysis.template || 'marketing';
    const template = WORKFLOW_TEMPLATES[templateName] || WORKFLOW_TEMPLATES['marketing'];

    // Build nodes with positions and IDs
    const SPACING = { x: 400, y: 200 };
    const START = { x: 100, y: 100 };

    const nodes = template.nodes.map((node, index) => {
      const nodeId = crypto.randomUUID();
      
      // Calculate position based on layout
      let position;
      switch (template.layout) {
        case 'horizontal':
          position = { x: START.x + (index * SPACING.x), y: START.y };
          break;
        case 'vertical':
          position = { x: START.x, y: START.y + (index * SPACING.y) };
          break;
        case 'tree':
          if (index === 0) {
            position = { x: START.x + SPACING.x, y: START.y };
          } else {
            const row = Math.ceil(index / 2);
            const col = (index - 1) % 2;
            position = { 
              x: START.x + (col * SPACING.x * 1.5), 
              y: START.y + (row * SPACING.y) 
            };
          }
          break;
        default:
          position = { x: START.x + (index * SPACING.x), y: START.y };
      }

      // Get customizations
      const customLabel = analysis.customizations?.[index.toString()]?.label;
      const nodePrompt = analysis.nodePrompts?.[index.toString()] || '';

      // Build port configurations based on node kind
      const ports = getPortsForKind(node.kind, nodeId);

      return {
        id: nodeId,
        kind: node.kind,
        version: '1.0.0',
        label: customLabel || node.label,
        position,
        size: { w: 420, h: 300 },
        inputs: ports.inputs,
        outputs: ports.outputs,
        params: {
          model: node.model,
          prompt: nodePrompt,
        },
        status: 'idle',
        progress: 0,
      };
    });

    // Build edges with proper IDs
    const edges = template.edges.map((edge, index) => {
      const sourceNode = nodes[edge.sourceIndex];
      const targetNode = nodes[edge.targetIndex];
      
      if (!sourceNode || !targetNode) return null;

      const sourcePort = sourceNode.outputs.find((p: any) => p.name === edge.sourceHandle);
      const targetPort = targetNode.inputs.find((p: any) => p.name === edge.targetHandle);

      return {
        id: crypto.randomUUID(),
        source: { nodeId: sourceNode.id, portId: sourcePort?.id || `${sourceNode.id}-output-0` },
        target: { nodeId: targetNode.id, portId: targetPort?.id || `${targetNode.id}-input-0` },
        dataType: sourcePort?.datatype || 'text',
        status: 'idle',
      };
    }).filter(Boolean);

    console.log(`Generated workflow: ${nodes.length} nodes, ${edges.length} edges`);

    return new Response(
      JSON.stringify({ nodes, edges, layout: template.layout }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Workflow generation error:', error);
    return errorResponse(error.message || 'Internal server error', 500);
  }
});

function getPortsForKind(kind: string, nodeId: string) {
  const configs: Record<string, { inputs: any[]; outputs: any[] }> = {
    Image: {
      inputs: [
        { id: `${nodeId}-input-0`, name: 'prompt', datatype: 'text', cardinality: '1', optional: true, position: 'left' },
        { id: `${nodeId}-input-1`, name: 'reference', datatype: 'image', cardinality: '1', optional: true, position: 'top' }
      ],
      outputs: [
        { id: `${nodeId}-output-0`, name: 'image', datatype: 'image', cardinality: 'n', position: 'right' },
        { id: `${nodeId}-output-1`, name: 'metadata', datatype: 'json', cardinality: 'n', position: 'bottom' }
      ]
    },
    Text: {
      inputs: [
        { id: `${nodeId}-input-0`, name: 'input', datatype: 'text', cardinality: '1', optional: true, position: 'left' },
        { id: `${nodeId}-input-1`, name: 'context', datatype: 'any', cardinality: 'n', optional: true, position: 'top' }
      ],
      outputs: [
        { id: `${nodeId}-output-0`, name: 'text', datatype: 'text', cardinality: 'n', position: 'right' }
      ]
    },
    Video: {
      inputs: [
        { id: `${nodeId}-input-0`, name: 'prompt', datatype: 'text', cardinality: '1', optional: true, position: 'left' },
        { id: `${nodeId}-input-1`, name: 'image', datatype: 'image', cardinality: '1', optional: true, position: 'top' }
      ],
      outputs: [
        { id: `${nodeId}-output-0`, name: 'video', datatype: 'video', cardinality: 'n', position: 'right' }
      ]
    },
  };

  return configs[kind] || configs['Text'];
}

function generateFallbackWorkflow(prompt: string) {
  // Simple fallback - create a single text node
  const nodeId = crypto.randomUUID();
  
  const nodes = [{
    id: nodeId,
    kind: 'Text',
    version: '1.0.0',
    label: 'Text Generation',
    position: { x: 100, y: 100 },
    size: { w: 420, h: 300 },
    inputs: [
      { id: `${nodeId}-input-0`, name: 'input', datatype: 'text', cardinality: '1', optional: true, position: 'left' },
    ],
    outputs: [
      { id: `${nodeId}-output-0`, name: 'text', datatype: 'text', cardinality: 'n', position: 'right' }
    ],
    params: {
      model: 'llama-3.3-70b-versatile',
      prompt: prompt,
    },
    status: 'idle',
    progress: 0,
  }];

  return new Response(
    JSON.stringify({ nodes, edges: [], layout: 'horizontal' }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}
