-- Drop the existing restrictive check constraint
ALTER TABLE public.studio_blocks DROP CONSTRAINT IF EXISTS studio_blocks_block_type_check;

-- Add a more permissive check constraint that allows more block types (case-insensitive matching)
ALTER TABLE public.studio_blocks ADD CONSTRAINT studio_blocks_block_type_check 
  CHECK (lower(block_type) IN ('text', 'image', 'video', 'audio', 'prompt', 'upload', 'output', 'combine', 'transform'));