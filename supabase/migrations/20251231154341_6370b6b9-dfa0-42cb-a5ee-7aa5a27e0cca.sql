-- Drop the existing restrictive constraint
ALTER TABLE compute_nodes DROP CONSTRAINT IF EXISTS compute_nodes_kind_check;

-- Create new constraint with all supported node kinds
ALTER TABLE compute_nodes ADD CONSTRAINT compute_nodes_kind_check 
CHECK (kind = ANY (ARRAY[
  -- Core workflow kinds (capitalized)
  'Image'::text, 
  'Text'::text, 
  'Video'::text, 
  'Prompt'::text, 
  'Model'::text, 
  'Transform'::text, 
  'Output'::text, 
  'Gateway'::text,
  'Audio'::text,
  'Upload'::text,
  'Combine'::text,
  
  -- UI/utility kinds
  'comment'::text,
  
  -- Legacy snake_case kinds (for backward compatibility)
  'upload'::text,
  'upload_image'::text,
  'upload_video'::text,
  'upload_audio'::text,
  'upload_document'::text,
  'upload_3d'::text,
  'text_to_image'::text,
  'text_to_video'::text,
  'text_to_text'::text,
  'image_to_video'::text,
  'audio_generate'::text,
  '3d_generate'::text,
  'output'::text
]));