-- Schema Update for Figma Plugin Integration
-- Run this in Supabase SQL Editor to add the missing columns

-- Add figma_url column if it doesn't exist
ALTER TABLE components 
ADD COLUMN IF NOT EXISTS figma_url text;

-- Add figma_id column if it doesn't exist (for upsert)
ALTER TABLE components 
ADD COLUMN IF NOT EXISTS figma_id text UNIQUE;

-- Add snapshot_url column if it doesn't exist
ALTER TABLE components 
ADD COLUMN IF NOT EXISTS snapshot_url text;

-- Add prop_types column if it doesn't exist
ALTER TABLE components 
ADD COLUMN IF NOT EXISTS prop_types jsonb DEFAULT '[]'::jsonb;

-- Add tokens_used column if it doesn't exist
ALTER TABLE components 
ADD COLUMN IF NOT EXISTS tokens_used text[] DEFAULT '{}';

-- Add variants column if it doesn't exist (might already exist)
ALTER TABLE components 
ADD COLUMN IF NOT EXISTS variants jsonb DEFAULT '[]'::jsonb;

-- Create index on figma_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_components_figma_id ON components(figma_id);

-- Verify the columns were added
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'components'
ORDER BY ordinal_position;

