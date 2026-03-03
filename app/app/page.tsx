'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

interface Memory {
  id: number;
  raw_text: string;
  context_tag: string;
  memory_type: string;
  people: string[];
  action_items: string[];
  tags: string[];
  created_at: string;
  distance?: number;
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<'capture' | 'recall' | 'recent'>('capture');

  // Capture state
  const [captureText, setCaptureText] = useState('');
  const [captureContext, setCaptureContext] = useState('personal');
  const [captureType, setCaptureType] = useState('thought');
  const [captureStatus, setCaptureStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  // Recall state
  const [recallQuery, setRecallQuery] = useState('');
  const [recallResults, setRecallResults] = useState<Memory[]>([]);
  const [isRecalling, setIsRecalling] = useState(false);

  // Recent state
  const [recentMemories, setRecentMemories] = useState<Memory[]>([]);
  const [isLoadingRecent, setIsLoadingRecent] = useState(false);

  const handleCapture = async () => {
    if (!captureText.trim()) return;

    setIsCapturing(true);
    setCaptureStatus(null);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/capture`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text: captureText,
            context: captureContext,
            type: captureType,
            source: 'web',
          }),
        }
      );

      const result = await response.json();

      if (response.ok) {
        setCaptureStatus({
          type: 'success',
          message: `Memory captured! ${result.people?.length ? `Found: ${result.people.join(', ')}` : ''}`,
        });
        setCaptureText('');
      } else {
        setCaptureStatus({ type: 'error', message: result.error || 'Failed to capture' });
      }
    } catch (error) {
      setCaptureStatus({ type: 'error', message: 'Network error' });
    } finally {
      setIsCapturing(false);
    }
  };

  const handleRecall = async () => {
    if (!recallQuery.trim()) return;

    setIsRecalling(true);
    setRecallResults([]);

    try {
      // Generate embedding for query
      const voyageResponse = await fetch('https://api.voyageai.com/v1/embeddings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_VOYAGE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'voyage-3',
          input: recallQuery,
        }),
      });

      const voyageData = await voyageResponse.json();
      const embedding = voyageData.data?.[0]?.embedding;

      if (!embedding) throw new Error('Failed to generate embedding');

      // Search memories
      const { data, error } = await supabase.rpc('match_memories', {
        query_embedding: embedding,
        match_threshold: 0.5,
        match_count: 10,
      });

      if (error) throw error;
      setRecallResults(data || []);
    } catch (error) {
      console.error('Recall error:', error);
    } finally {
      setIsRecalling(false);
    }
  };

  const loadRecentMemories = async () => {
    setIsLoadingRecent(true);
    try {
      const { data, error } = await supabase
        .from('memories')
        .select('id, raw_text, context_tag, memory_type, people, action_items, tags, created_at')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setRecentMemories(data || []);
    } catch (error) {
      console.error('Error loading recent:', error);
    } finally {
      setIsLoadingRecent(false);
    }
  };

  // Load recent when tab changes
  if (activeTab === 'recent' && recentMemories.length === 0 && !isLoadingRecent) {
    loadRecentMemories();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-3">
            Your Own Brain
          </h1>
          <p className="text-gray-600 text-lg">
            Capture thoughts. Recall insights. Build your knowledge.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 bg-white rounded-lg p-1 shadow-sm">
          {(['capture', 'recall', 'recent'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 px-6 py-3 rounded-md font-medium transition-all ${
                activeTab === tab
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          {activeTab === 'capture' && (
            <div className="space-y-6">
              <textarea
                value={captureText}
                onChange={(e) => setCaptureText(e.target.value)}
                placeholder="What's on your mind? Capture a thought, meeting note, or insight..."
                className="w-full h-40 px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
              />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Context
                  </label>
                  <select
                    value={captureContext}
                    onChange={(e) => setCaptureContext(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="personal">Personal</option>
                    <option value="work">Work</option>
                    <option value="swell">Swell</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type
                  </label>
                  <select
                    value={captureType}
                    onChange={(e) => setCaptureType(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="thought">Thought</option>
                    <option value="meeting">Meeting</option>
                    <option value="decision">Decision</option>
                    <option value="person">Person</option>
                    <option value="insight">Insight</option>
                  </select>
                </div>
              </div>

              <button
                onClick={handleCapture}
                disabled={isCapturing || !captureText.trim()}
                className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isCapturing ? 'Capturing...' : 'Capture Memory'}
              </button>

              {captureStatus && (
                <div
                  className={`p-4 rounded-lg ${
                    captureStatus.type === 'success'
                      ? 'bg-green-50 text-green-800'
                      : 'bg-red-50 text-red-800'
                  }`}
                >
                  {captureStatus.message}
                </div>
              )}
            </div>
          )}

          {activeTab === 'recall' && (
            <div className="space-y-6">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={recallQuery}
                  onChange={(e) => setRecallQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleRecall()}
                  placeholder="What are you trying to remember?"
                  className="flex-1 px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <button
                  onClick={handleRecall}
                  disabled={isRecalling || !recallQuery.trim()}
                  className="px-8 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                >
                  {isRecalling ? 'Searching...' : 'Recall'}
                </button>
              </div>

              <div className="space-y-4">
                {recallResults.map((memory) => (
                  <MemoryCard key={memory.id} memory={memory} showSimilarity />
                ))}
                {!isRecalling && recallResults.length === 0 && recallQuery && (
                  <p className="text-center text-gray-500 py-8">No memories found</p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'recent' && (
            <div className="space-y-4">
              {isLoadingRecent ? (
                <p className="text-center text-gray-500 py-8">Loading...</p>
              ) : (
                recentMemories.map((memory) => (
                  <MemoryCard key={memory.id} memory={memory} />
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MemoryCard({ memory, showSimilarity }: { memory: Memory; showSimilarity?: boolean }) {
  return (
    <div className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex gap-2">
          <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium">
            {memory.context_tag}
          </span>
          <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
            {memory.memory_type}
          </span>
        </div>
        {showSimilarity && memory.distance !== undefined && (
          <span className="text-sm font-medium text-green-600">
            {((1 - memory.distance) * 100).toFixed(0)}% match
          </span>
        )}
      </div>

      <p className="text-gray-800 mb-3">{memory.raw_text}</p>

      <div className="flex flex-wrap gap-3 text-sm text-gray-600">
        {memory.people?.length > 0 && (
          <div>
            <span className="font-medium">People:</span> {memory.people.join(', ')}
          </div>
        )}
        {memory.tags?.length > 0 && (
          <div className="flex gap-2">
            {memory.tags.map((tag) => (
              <span key={tag} className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {memory.action_items?.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <p className="text-sm font-medium text-gray-700 mb-2">Action Items:</p>
          <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
            {memory.action_items.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      <p className="text-xs text-gray-400 mt-3">
        {new Date(memory.created_at).toLocaleString()}
      </p>
    </div>
  );
}
