# Your Own Brain

A personal knowledge management system that captures thoughts, meetings, and insights with AI-powered semantic search.

## Features

- **Capture**: Store memories with automatic extraction of people, action items, and tags using Claude
- **Recall**: Semantic search powered by Voyage AI embeddings
- **MCP Integration**: Use directly in Claude Desktop via Model Context Protocol
- **Web Interface**: Beautiful Next.js app for capturing and searching memories

## Architecture

- **Database**: Supabase (PostgreSQL with pgvector)
- **Embeddings**: Voyage AI (voyage-3, 1024 dimensions)
- **Metadata Extraction**: Claude (Haiku 4.5)
- **Edge Functions**: Deno runtime on Supabase
- **Frontend**: Next.js 15 with TypeScript and Tailwind CSS
- **MCP Server**: Local Node.js server for Claude Desktop integration

## Deploy to Vercel

1. Visit [Vercel](https://vercel.com) and sign in
2. Click "Add New Project"
3. Import this repository: `nfrazier4/your-own-brain`
4. Configure the project:
   - **Root Directory**: `app`
   - **Framework Preset**: Next.js
5. Add environment variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   NEXT_PUBLIC_VOYAGE_API_KEY=your-voyage-key
   ```
6. Click "Deploy"

## Setup MCP Server (Claude Desktop)

The MCP server is already configured in your Claude Desktop. Restart Claude to use these tools:

- `capture` - Store a new memory
- `recall` - Search memories by semantic similarity
- `list_recent` - View recent memories

## Local Development

```bash
# Install dependencies
cd app
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your keys

# Run dev server
npm run dev
```

## Database Schema

The `memories` table includes:
- `raw_text`: Original content
- `embedding`: 1024-dimensional vector
- `context_tag`: Category (personal, work, etc.)
- `memory_type`: Type (thought, meeting, decision, etc.)
- `people`: Extracted names
- `action_items`: Extracted tasks
- `tags`: Generated topics

## API Endpoints

### Capture
```bash
POST https://your-project.supabase.co/functions/v1/capture
Content-Type: application/json
Authorization: Bearer YOUR_ANON_KEY

{
  "text": "Your memory content",
  "context": "personal",
  "type": "thought"
}
```

### Recall
Uses the `match_memories` PostgreSQL function with vector similarity search.

## License

MIT
