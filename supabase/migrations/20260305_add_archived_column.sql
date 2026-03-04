-- Add archived column to memories table
ALTER TABLE memories
ADD COLUMN archived boolean DEFAULT false;

-- Add index for archived queries
CREATE INDEX idx_memories_archived ON memories(archived);

-- Add index for archived + created_at for efficient Archive view queries
CREATE INDEX idx_memories_archived_created_at ON memories(archived, created_at DESC);
