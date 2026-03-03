-- Update embedding column from 1536 to 1024 dimensions
ALTER TABLE memories
ALTER COLUMN embedding TYPE vector(1024);
