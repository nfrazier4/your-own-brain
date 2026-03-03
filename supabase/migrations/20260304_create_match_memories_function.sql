-- Create function for semantic similarity search
CREATE OR REPLACE FUNCTION match_memories(
  query_embedding vector(1024),
  match_threshold float DEFAULT 0.5,
  match_count int DEFAULT 5
)
RETURNS TABLE (
  id bigint,
  raw_text text,
  context_tag text,
  memory_type text,
  people text[],
  action_items text[],
  tags text[],
  created_at timestamptz,
  distance float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    memories.id,
    memories.raw_text,
    memories.context_tag,
    memories.memory_type,
    memories.people,
    memories.action_items,
    memories.tags,
    memories.created_at,
    (memories.embedding <=> query_embedding) AS distance
  FROM memories
  WHERE (memories.embedding <=> query_embedding) < (1 - match_threshold)
  ORDER BY memories.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
