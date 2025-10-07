-- Add image status tracking to characters table
ALTER TABLE public.characters 
ADD COLUMN IF NOT EXISTS image_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS image_generation_error TEXT;

-- Add check constraint for valid status values
ALTER TABLE public.characters 
ADD CONSTRAINT characters_image_status_check 
CHECK (image_status IN ('pending', 'generating', 'completed', 'failed'));

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_characters_image_status 
ON public.characters(image_status) 
WHERE image_status IN ('pending', 'generating');