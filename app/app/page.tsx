'use client';

import { useState, useEffect, useRef } from "react";
import { supabase } from '@/lib/supabase';

// ─── DESIGN TOKENS ─────────────────────────────────────────────────────────
const T = {
  sidebarBg:   "#ECEAE3",
  mainBg:      "#F5F4F0",
  cardBg:      "#FFFFFF",
  border:      "#E2DED7",
  borderLight: "#EEEBE6",
  text:        "#1C1B18",
  textSub:     "#8A8680",
  textMuted:   "#B5B1AB",
  yellow:      "#FFD60A",
  yellowDim:   "#FFF3B0",
  yellowText:  "#7A5E00",
  radius:      "11px",
  radiusSm:    "7px",
  radiusPill:  "100px",
  shadow:      "0 1px 4px rgba(0,0,0,0.07), 0 4px 16px rgba(0,0,0,0.04)",
  shadowHover: "0 2px 8px rgba(0,0,0,0.10), 0 6px 24px rgba(0,0,0,0.06)",
};

// ─── AREAS (like Things 3 Areas) ────────────────────────────────────────────
const AREAS = [
  { id: "oaia",     label: "OAIA",         dot: "#34C759", light: "#E8F8ED", text: "#1A6B34" },
  { id: "swell",    label: "Swell Studio", dot: "#007AFF", light: "#E5F1FF", text: "#0A4FA3" },
  { id: "partio",   label: "Partio Co.",   dot: "#FF9500", light: "#FFF0D9", text: "#9A4A00" },
  { id: "personal", label: "Personal",     dot: "#AF52DE", light: "#F3EAFF", text: "#6B2FA0" },
  { id: "work",     label: "Work",         dot: "#5AC8FA", light: "#E0F7FF", text: "#0A7EA3" },
];

// ─── SMART LISTS ────────────────────────────────────────────────────────────
const SMART_LISTS = [
  { id: "today",    icon: "☀️", label: "Today" },
  { id: "recent",   icon: "🕐", label: "Recent" },
  { id: "actions",  icon: "⚡", label: "Actions" },
  { id: "search",   icon: "🔍", label: "Search" },
];

// ─── CAPTURE TYPES ──────────────────────────────────────────────────────────
const TYPES = [
  { id: "thought",  emoji: "💭", label: "Thought"  },
  { id: "decision", emoji: "⚖️", label: "Decision" },
  { id: "person",   emoji: "👤", label: "Person"   },
  { id: "meeting",  emoji: "🗓", label: "Meeting"  },
  { id: "insight",  emoji: "💡", label: "Insight"  },
];

const TYPE_EMOJI = Object.fromEntries(TYPES.map(t => [t.id, t.emoji]));

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

// Helper to get relative time
function getRelativeTime(dateStr: string) {
  const now = new Date();
  const date = new Date(dateStr);
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 172800) return "Yesterday";
  if (diff < 604800) return `${Math.floor(diff / 86400)} days ago`;
  return date.toLocaleDateString();
}

// ─── MAIN APP ───────────────────────────────────────────────────────────────
export default function YourOwnBrain() {
  const [selectedList,  setSelectedList]  = useState("today");
  const [selectedArea,  setSelectedArea]  = useState<string | null>(null);
  const [captureText,   setCaptureText]   = useState("");
  const [captureType,   setCaptureType]   = useState("thought");
  const [captureArea,   setCaptureArea]   = useState("swell");
  const [memories,      setMemories]      = useState<Memory[]>([]);
  const [searchQuery,   setSearchQuery]   = useState("");
  const [captured,      setCaptured]      = useState(false);
  const [capturedId,    setCapturedId]    = useState<number | null>(null);
  const [focusCapture,  setFocusCapture]  = useState(false);
  const [loaded,        setLoaded]        = useState(false);
  const [checkedIds,    setCheckedIds]    = useState(new Set<number>());
  const [isCapturing,   setIsCapturing]   = useState(false);
  const [isSearching,   setIsSearching]   = useState(false);
  const [totalCount,    setTotalCount]    = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Nunito:wght@300;400;500;600;700&family=Nunito+Sans:ital,wght@0,300;0,400;0,600;1,300&display=swap";
    document.head.appendChild(link);
    setTimeout(() => setLoaded(true), 80);
    loadMemories();
  }, []);

  const loadMemories = async () => {
    try {
      const { data, error, count } = await supabase
        .from('memories')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setMemories(data || []);
      setTotalCount(count || 0);
    } catch (error) {
      console.error('Error loading memories:', error);
    }
  };

  const handleCapture = async () => {
    if (!captureText.trim() || isCapturing) return;

    setIsCapturing(true);
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
            context: captureArea,
            type: captureType,
            source: 'web',
          }),
        }
      );

      const result = await response.json();

      if (response.ok) {
        // Reload memories to get the new one
        await loadMemories();
        setCaptureText("");
        setCaptured(true);
        setCapturedId(result.id);
        setTimeout(() => { setCaptured(false); setCapturedId(null); }, 2500);
        textareaRef.current?.focus();
      } else {
        alert('Failed to capture: ' + (result.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Capture error:', error);
      alert('Network error during capture');
    } finally {
      setIsCapturing(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim() || isSearching) return;

    setIsSearching(true);
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
          input: searchQuery,
        }),
      });

      const voyageData = await voyageResponse.json();
      const embedding = voyageData.data?.[0]?.embedding;

      if (!embedding) throw new Error('Failed to generate embedding');

      // Search memories
      const { data, error } = await supabase.rpc('match_memories', {
        query_embedding: embedding,
        match_threshold: 0.3,
        match_count: 50,
      });

      if (error) throw error;
      setMemories(data || []);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  // Trigger search when query changes (debounced)
  useEffect(() => {
    if (selectedList === 'search' && searchQuery.trim()) {
      const timer = setTimeout(() => handleSearch(), 500);
      return () => clearTimeout(timer);
    } else if (selectedList === 'search' && !searchQuery.trim()) {
      loadMemories();
    }
  }, [searchQuery, selectedList]);

  const toggleDone = (id: number) => {
    setCheckedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const activeArea = AREAS.find(a => a.id === selectedArea);

  // Get today's date at midnight for filtering
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const visibleMemories = memories.filter(m => {
    // Area filter
    if (selectedArea && m.context_tag !== selectedArea) return false;

    // Smart list filters
    if (selectedList === "today") {
      const memDate = new Date(m.created_at);
      memDate.setHours(0, 0, 0, 0);
      return memDate.getTime() === today.getTime();
    }
    if (selectedList === "actions") return m.action_items && m.action_items.length > 0;

    return true;
  });

  const listTitle = selectedArea
    ? activeArea?.label
    : SMART_LISTS.find(l => l.id === selectedList)?.label;

  // Count memories per area
  const areaCounts = AREAS.map(area => ({
    ...area,
    count: memories.filter(m => m.context_tag === area.id).length
  }));

  // Count for smart lists
  const todayCount = memories.filter(m => {
    const memDate = new Date(m.created_at);
    memDate.setHours(0, 0, 0, 0);
    return memDate.getTime() === today.getTime();
  }).length;

  const actionsCount = memories.filter(m => m.action_items && m.action_items.length > 0).length;

  const allActions = memories
    .filter(m => m.action_items && m.action_items.length > 0)
    .flatMap(m => m.action_items.map(a => ({
      text: a,
      area: AREAS.find(area => area.id === m.context_tag)
    })))
    .slice(0, 4);

  return (
    <div style={{ fontFamily: "'Nunito', sans-serif", background: T.sidebarBg, minHeight: "100vh", display: "flex", opacity: loaded ? 1 : 0, transition: "opacity 0.3s ease" }}>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #D0CDC7; border-radius: 10px; }
        .sidebar-item { transition: background 0.12s ease; cursor: pointer; border-radius: 8px; }
        .sidebar-item:hover { background: rgba(0,0,0,0.05); }
        .sidebar-item.active { background: rgba(0,0,0,0.08); }
        .memory-row { transition: all 0.15s ease; }
        .memory-row:hover .row-actions { opacity: 1; }
        .row-actions { opacity: 0; transition: opacity 0.15s; }
        .check-circle {
          width: 22px; height: 22px; border-radius: 50%;
          border: 2px solid #D0CDC7; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: all 0.2s cubic-bezier(0.34,1.56,0.64,1);
          flex-shrink: 0;
        }
        .check-circle:hover { border-color: #34C759; transform: scale(1.1); }
        .check-circle.checked {
          background: #34C759; border-color: #34C759;
          animation: checkPop 0.3s cubic-bezier(0.34,1.56,0.64,1);
        }
        @keyframes checkPop {
          0% { transform: scale(0.8); } 60% { transform: scale(1.2); } 100% { transform: scale(1); }
        }
        .capture-input {
          width: 100%; border: none; outline: none; resize: none;
          font-family: 'Nunito', sans-serif; font-size: 15px; font-weight: 400;
          line-height: 1.55; color: ${T.text}; background: transparent;
        }
        .capture-input::placeholder { color: ${T.textMuted}; }
        .type-btn { cursor: pointer; transition: all 0.12s ease; border-radius: 20px; border: none; font-family: 'Nunito', sans-serif; }
        .type-btn:hover { transform: scale(1.04); }
        .area-btn { cursor: pointer; transition: all 0.12s ease; font-family: 'Nunito', sans-serif; }
        .send-btn {
          cursor: pointer; transition: all 0.15s ease;
          font-family: 'Nunito', sans-serif; font-weight: 600;
        }
        .send-btn:hover { transform: scale(1.03); box-shadow: 0 4px 12px rgba(255,214,10,0.4); }
        .send-btn:active { transform: scale(0.97); }
        .toast-enter { animation: toastIn 0.35s cubic-bezier(0.34,1.56,0.64,1) both; }
        @keyframes toastIn { from { opacity:0; transform: translateY(12px) scale(0.94); } to { opacity:1; transform:none; } }
        .memory-enter { animation: memIn 0.4s cubic-bezier(0.34,1.56,0.64,1) both; }
        @keyframes memIn { from { opacity:0; transform: translateX(-8px); } to { opacity:1; transform:none; } }
        .search-field { border:none; outline:none; font-family:'Nunito',sans-serif; font-size:14px; background:transparent; color:${T.text}; width:100%; }
        .search-field::placeholder { color:${T.textMuted}; }
        input { font-family:'Nunito',sans-serif; }
      `}</style>

      {/* ── SIDEBAR ── */}
      <div style={{ width: 220, background: T.sidebarBg, padding: "20px 12px", display: "flex", flexDirection: "column", gap: 24, flexShrink: 0, overflowY: "auto", height: "100vh", position: "sticky", top: 0 }}>

        {/* App wordmark */}
        <div style={{ padding: "4px 8px", display: "flex", alignItems: "center", gap: 9 }}>
          <div style={{ width: 30, height: 30, background: T.yellow, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, boxShadow: "0 2px 8px rgba(255,214,10,0.35)" }}>🧠</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: T.text, letterSpacing: "-0.01em" }}>Your Own Brain</div>
            <div style={{ fontSize: 10, color: T.textMuted, fontWeight: 400 }}>Nate · Swell Studio</div>
          </div>
        </div>

        {/* Smart Lists */}
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: T.textMuted, letterSpacing: "0.08em", textTransform: "uppercase", padding: "0 8px", marginBottom: 4 }}>Focus</div>
          <div className={`sidebar-item ${selectedList === 'today' && !selectedArea ? "active" : ""}`}
            onClick={() => { setSelectedList('today'); setSelectedArea(null); }}
            style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "7px 10px", marginBottom: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
              <span style={{ fontSize: 14, width: 18, textAlign: "center" }}>☀️</span>
              <span style={{ fontSize: 13, fontWeight: selectedList === 'today' && !selectedArea ? 600 : 400, color: selectedList === 'today' && !selectedArea ? T.text : T.textSub }}>Today</span>
            </div>
            <span style={{ fontSize: 11, color: T.textMuted, fontWeight: 500 }}>{todayCount}</span>
          </div>
          <div className={`sidebar-item ${selectedList === 'recent' && !selectedArea ? "active" : ""}`}
            onClick={() => { setSelectedList('recent'); setSelectedArea(null); }}
            style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "7px 10px", marginBottom: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
              <span style={{ fontSize: 14, width: 18, textAlign: "center" }}>🕐</span>
              <span style={{ fontSize: 13, fontWeight: selectedList === 'recent' && !selectedArea ? 600 : 400, color: selectedList === 'recent' && !selectedArea ? T.text : T.textSub }}>Recent</span>
            </div>
            <span style={{ fontSize: 11, color: T.textMuted, fontWeight: 500 }}>{totalCount}</span>
          </div>
          <div className={`sidebar-item ${selectedList === 'actions' && !selectedArea ? "active" : ""}`}
            onClick={() => { setSelectedList('actions'); setSelectedArea(null); }}
            style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "7px 10px", marginBottom: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
              <span style={{ fontSize: 14, width: 18, textAlign: "center" }}>⚡</span>
              <span style={{ fontSize: 13, fontWeight: selectedList === 'actions' && !selectedArea ? 600 : 400, color: selectedList === 'actions' && !selectedArea ? T.text : T.textSub }}>Actions</span>
            </div>
            <span style={{ fontSize: 11, color: T.textMuted, fontWeight: 500 }}>{actionsCount}</span>
          </div>
          <div className={`sidebar-item ${selectedList === 'search' && !selectedArea ? "active" : ""}`}
            onClick={() => { setSelectedList('search'); setSelectedArea(null); }}
            style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "7px 10px", marginBottom: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
              <span style={{ fontSize: 14, width: 18, textAlign: "center" }}>🔍</span>
              <span style={{ fontSize: 13, fontWeight: selectedList === 'search' && !selectedArea ? 600 : 400, color: selectedList === 'search' && !selectedArea ? T.text : T.textSub }}>Search</span>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: T.border, margin: "0 8px" }} />

        {/* Areas */}
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: T.textMuted, letterSpacing: "0.08em", textTransform: "uppercase", padding: "0 8px", marginBottom: 4 }}>Areas</div>
          {areaCounts.map(area => (
            <div key={area.id} className={`sidebar-item ${selectedArea === area.id ? "active" : ""}`}
              onClick={() => setSelectedArea(selectedArea === area.id ? null : area.id)}
              style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "7px 10px", marginBottom: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                <div style={{ width: 9, height: 9, borderRadius: "50%", background: area.dot, flexShrink: 0 }} />
                <span style={{ fontSize: 13, fontWeight: selectedArea === area.id ? 600 : 400, color: selectedArea === area.id ? T.text : T.textSub }}>{area.label}</span>
              </div>
              <span style={{ fontSize: 11, color: T.textMuted, fontWeight: 500 }}>{area.count}</span>
            </div>
          ))}
        </div>

        {/* Bottom sync status */}
        <div style={{ marginTop: "auto", padding: "10px", background: "rgba(0,0,0,0.04)", borderRadius: T.radiusSm, display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#34C759", flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: 10, fontWeight: 600, color: T.textSub }}>Synced · {totalCount} memories</div>
            <div style={{ fontSize: 9, color: T.textMuted, marginTop: 1 }}>MCP · Slack · iOS connected</div>
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div style={{ flex: 1, background: T.mainBg, display: "flex", flexDirection: "column", minHeight: "100vh" }}>

        {/* Header */}
        <div style={{ padding: "28px 32px 16px", display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 700, color: T.text, letterSpacing: "-0.02em", lineHeight: 1.1 }}>{listTitle}</h1>
            {selectedList === "today" && !selectedArea && (
              <div style={{ fontSize: 12, color: T.textSub, marginTop: 4, fontWeight: 400 }}>
                {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
              </div>
            )}
          </div>
        </div>

        {/* ── CAPTURE CARD ── */}
        <div style={{ padding: "0 32px 20px" }}>
          <div style={{
            background: T.cardBg, borderRadius: T.radius, border: `1px solid ${T.border}`,
            boxShadow: focusCapture ? `0 0 0 3px ${T.yellow}55, ${T.shadowHover}` : T.shadow,
            transition: "box-shadow 0.2s ease", overflow: "hidden",
          }}>
            {/* Type selector strip */}
            <div style={{ display: "flex", gap: 6, padding: "12px 16px 0", overflowX: "auto" }}>
              {TYPES.map(t => (
                <button key={t.id} className="type-btn"
                  onClick={() => setCaptureType(t.id)}
                  style={{
                    padding: "5px 11px", fontSize: 12, fontWeight: captureType === t.id ? 700 : 500,
                    background: captureType === t.id ? T.yellow : "transparent",
                    color: captureType === t.id ? T.yellowText : T.textSub,
                    border: captureType === t.id ? "none" : `1px solid ${T.border}`,
                    display: "flex", alignItems: "center", gap: 5, whiteSpace: "nowrap",
                  }}>
                  <span style={{ fontSize: 13 }}>{t.emoji}</span>{t.label}
                </button>
              ))}
            </div>

            {/* Text input */}
            <div style={{ padding: "10px 18px 0" }}>
              <textarea
                ref={textareaRef}
                className="capture-input"
                rows={captureText.length > 80 ? 3 : 2}
                value={captureText}
                onChange={e => setCaptureText(e.target.value)}
                onFocus={() => setFocusCapture(true)}
                onBlur={() => setFocusCapture(false)}
                onKeyDown={e => { if (e.metaKey && e.key === "Enter") handleCapture(); }}
                placeholder={
                  captureType === "thought"  ? "What's on your mind? Drop it here and move on…" :
                  captureType === "decision" ? "What did you decide, and why?" :
                  captureType === "person"   ? "Who, and what do you want to remember about them?" :
                  captureType === "meeting"  ? "Who was it with, what happened, what's next?" :
                                              "What just clicked?"
                }
              />
            </div>

            {/* Footer row */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 16px 12px" }}>
              {/* Area pills */}
              <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                {AREAS.map(a => (
                  <button key={a.id} className="area-btn"
                    onClick={() => setCaptureArea(a.id)}
                    style={{
                      padding: "3px 10px", fontSize: 11, fontWeight: captureArea === a.id ? 700 : 400,
                      background: captureArea === a.id ? a.light : "transparent",
                      color: captureArea === a.id ? a.text : T.textMuted,
                      border: `1px solid ${captureArea === a.id ? a.dot + "55" : T.border}`,
                      borderRadius: T.radiusPill, display: "flex", alignItems: "center", gap: 5,
                    }}>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: a.dot }} />
                    {a.label}
                  </button>
                ))}
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 10, color: T.textMuted }}>⌘↵</span>
                <button className="send-btn"
                  onClick={handleCapture}
                  disabled={isCapturing || !captureText.trim()}
                  style={{
                    padding: "7px 18px", fontSize: 13,
                    background: (captureText.trim() && !isCapturing) ? T.yellow : T.borderLight,
                    color: (captureText.trim() && !isCapturing) ? T.yellowText : T.textMuted,
                    border: "none", borderRadius: T.radiusPill,
                    opacity: isCapturing ? 0.6 : 1,
                  }}>
                  {isCapturing ? 'Capturing...' : 'Capture'}
                </button>
              </div>
            </div>
          </div>

          {/* Capture success toast */}
          {captured && (
            <div className="toast-enter" style={{
              marginTop: 10, padding: "10px 16px", background: "#E8F8ED",
              border: "1px solid #A3E6B8", borderRadius: T.radiusSm,
              display: "flex", alignItems: "center", gap: 10,
            }}>
              <div style={{ width: 20, height: 20, borderRadius: "50%", background: "#34C759", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "#fff", fontWeight: 700 }}>✓</div>
              <div>
                <span style={{ fontSize: 12, color: "#1A6B34", fontWeight: 600 }}>Captured & embedded</span>
                <span style={{ fontSize: 12, color: "#5BA876" }}> — filed to {AREAS.find(a=>a.id===captureArea)?.label}</span>
              </div>
            </div>
          )}
        </div>

        {/* ── SEARCH (when in Search list) ── */}
        {selectedList === "search" && !selectedArea && (
          <div style={{ padding: "0 32px 16px" }}>
            <div style={{ background: T.cardBg, borderRadius: T.radius, border: `1px solid ${T.border}`, boxShadow: T.shadow, padding: "12px 16px", display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 16, color: T.textMuted }}>🔍</span>
              <input
                className="search-field"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search your brain by meaning, not keywords…"
              />
              {searchQuery && <button onClick={() => setSearchQuery("")} style={{ background: "none", border: "none", color: T.textMuted, cursor: "pointer", fontSize: 13, padding: 0 }}>✕</button>}
              {isSearching && <span style={{ fontSize: 11, color: T.textMuted }}>Searching...</span>}
            </div>
            {!searchQuery && (
              <div style={{ marginTop: 10, display: "flex", flexWrap: "wrap", gap: 6 }}>
                {["what decisions did I make about the spring cohort?", "find everything about Dan", "open action items", "what did I learn about product strategy?"].map((s, i) => (
                  <div key={i} onClick={() => setSearchQuery(s)}
                    style={{ padding: "5px 12px", background: T.cardBg, border: `1px solid ${T.border}`, borderRadius: T.radiusPill, fontSize: 11, color: T.textSub, cursor: "pointer", fontStyle: "italic" }}
                    onMouseEnter={e => e.currentTarget.style.background = "#F0EDE8"}
                    onMouseLeave={e => e.currentTarget.style.background = T.cardBg}>
                    {s}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── MEMORY LIST ── */}
        <div style={{ flex: 1, padding: "0 32px 32px", overflowY: "auto" }}>
          {selectedList === "today" && !selectedArea && todayCount > 0 && (
            <div style={{ marginBottom: 10 }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 10px", background: T.yellowDim, borderRadius: T.radiusPill, marginBottom: 14 }}>
                <span style={{ fontSize: 12 }}>☀️</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: T.yellowText }}>{todayCount} things captured today</span>
              </div>
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {visibleMemories.map((mem, i) => {
              const area = AREAS.find(a => a.id === mem.context_tag);
              const isDone = checkedIds.has(mem.id);
              const isNew = mem.id === capturedId;
              return (
                <div key={mem.id} className={`memory-row ${isNew ? "memory-enter" : ""}`}
                  style={{
                    background: T.cardBg, borderRadius: T.radius,
                    border: `1px solid ${T.borderLight}`,
                    marginBottom: 6,
                    padding: "14px 16px",
                    boxShadow: isNew ? `0 0 0 2px ${area?.dot}44, ${T.shadow}` : T.shadow,
                    opacity: isDone ? 0.45 : 1,
                    transition: "opacity 0.3s ease, box-shadow 0.2s ease",
                    animationDelay: `${i * 0.04}s`,
                  }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                    {/* Check circle */}
                    <div className={`check-circle ${isDone ? "checked" : ""}`} onClick={() => toggleDone(mem.id)}>
                      {isDone && <span style={{ fontSize: 11, color: "#fff", fontWeight: 700 }}>✓</span>}
                    </div>

                    {/* Content */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
                        <span style={{ fontSize: 13 }}>{TYPE_EMOJI[mem.memory_type]}</span>
                        <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "2px 8px", background: area?.light, borderRadius: T.radiusPill }}>
                          <div style={{ width: 6, height: 6, borderRadius: "50%", background: area?.dot }} />
                          <span style={{ fontSize: 10, fontWeight: 700, color: area?.text }}>{area?.label}</span>
                        </div>
                        <span style={{ fontSize: 11, color: T.textMuted }}>{getRelativeTime(mem.created_at)}</span>
                        {mem.distance !== undefined && (
                          <span style={{ fontSize: 10, color: "#34C759", fontWeight: 600 }}>
                            {((1 - mem.distance) * 100).toFixed(0)}% match
                          </span>
                        )}
                      </div>

                      <p style={{ fontSize: 14, color: isDone ? T.textMuted : T.text, lineHeight: 1.55, fontWeight: 400, textDecoration: isDone ? "line-through" : "none", marginBottom: (mem.action_items?.length || mem.people?.length || mem.tags?.length) ? 8 : 0 }}>
                        {mem.raw_text}
                      </p>

                      {(mem.action_items?.length > 0 || mem.people?.length > 0 || mem.tags?.length > 0) && (
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                          {mem.action_items?.map(a => (
                            <span key={a} style={{ fontSize: 10, padding: "2px 8px", background: "#FFF3B0", border: "1px solid #FFE066", borderRadius: T.radiusPill, color: "#7A5E00", fontWeight: 600 }}>↳ {a}</span>
                          ))}
                          {mem.people?.map(p => (
                            <span key={p} style={{ fontSize: 10, padding: "2px 8px", background: "#F0EAFF", border: "1px solid #C4B5FD", borderRadius: T.radiusPill, color: "#6B2FA0", fontWeight: 600 }}>@{p}</span>
                          ))}
                          {mem.tags?.map(t => (
                            <span key={t} style={{ fontSize: 10, padding: "2px 8px", background: T.mainBg, border: `1px solid ${T.border}`, borderRadius: T.radiusPill, color: T.textSub }}># {t}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {visibleMemories.length === 0 && !isSearching && (
              <div style={{ textAlign: "center", padding: "60px 0" }}>
                <div style={{ fontSize: 36, marginBottom: 12 }}>🧘</div>
                <div style={{ fontSize: 15, fontWeight: 600, color: T.textSub, marginBottom: 4 }}>Nothing here yet</div>
                <div style={{ fontSize: 13, color: T.textMuted }}>
                  {selectedList === 'search' ? 'Try a different search query' : 'Capture a thought above to get started'}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL: Capture Channels ── */}
      <div style={{ width: 230, background: T.sidebarBg, padding: "20px 12px", display: "flex", flexDirection: "column", gap: 20, flexShrink: 0, overflowY: "auto", height: "100vh", position: "sticky", top: 0 }}>
        <div style={{ padding: "4px 8px 0" }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: T.textMuted, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10 }}>Capture From Anywhere</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {[
              { icon: "🌐", label: "Dashboard",      sub: "Right here",          status: "live",   statusC: "#34C759" },
              { icon: "💬", label: "Slack",           sub: "#brain channel",       status: "live",   statusC: "#34C759" },
              { icon: "📱", label: "iOS Shortcut",    sub: "Siri → brain",         status: "live",   statusC: "#34C759" },
              { icon: "🤖", label: "Claude MCP",      sub: "In-chat capture",      status: "live",   statusC: "#34C759" },
              { icon: "📋", label: "Gravity Forms",   sub: "Structured WP intake", status: "setup",  statusC: "#FF9500" },
              { icon: "✉️", label: "Email Forward",   sub: "forward@brain.nate",   status: "soon",   statusC: T.textMuted },
            ].map(ch => (
              <div key={ch.label} style={{ display: "flex", alignItems: "center", gap: 9, padding: "7px 8px", borderRadius: 8, background: "transparent" }}>
                <span style={{ fontSize: 14, width: 18, textAlign: "center" }}>{ch.icon}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 500, color: T.text }}>{ch.label}</div>
                  <div style={{ fontSize: 10, color: T.textMuted, marginTop: 1 }}>{ch.sub}</div>
                </div>
                <div style={{ width: 7, height: 7, borderRadius: "50%", background: ch.statusC, flexShrink: 0 }} />
              </div>
            ))}
          </div>
        </div>

        <div style={{ height: 1, background: T.border, margin: "0 8px" }} />

        {/* Open Actions */}
        <div style={{ padding: "0 8px" }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: T.textMuted, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10 }}>Open Actions</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {allActions.map((a, i) => (
              <div key={i} style={{ padding: "8px 10px", background: T.cardBg, border: `1px solid ${T.borderLight}`, borderRadius: T.radiusSm, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
                <div style={{ fontSize: 11, color: T.text, lineHeight: 1.45, fontWeight: 400, marginBottom: 5 }}>{a.text}</div>
                {a.area && (
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: a.area.dot }} />
                    <span style={{ fontSize: 10, color: a.area.text, fontWeight: 600 }}>{a.area.label}</span>
                  </div>
                )}
              </div>
            ))}
            {allActions.length === 0 && (
              <div style={{ padding: "12px", textAlign: "center", fontSize: 11, color: T.textMuted }}>
                No open actions
              </div>
            )}
          </div>
        </div>

        <div style={{ height: 1, background: T.border, margin: "0 8px" }} />

        {/* Weekly Review CTA */}
        <div style={{ padding: "0 8px" }}>
          <div style={{ padding: "12px", background: T.yellowDim, border: `1px solid ${T.yellow}88`, borderRadius: T.radius }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: T.yellowText, marginBottom: 4 }}>📊 Friday Review Ready</div>
            <div style={{ fontSize: 11, color: "#7A5E00", lineHeight: 1.5, marginBottom: 10 }}>{totalCount} captures · {actionsCount} open actions</div>
            <button style={{ width: "100%", padding: "7px", background: T.yellow, color: T.yellowText, border: "none", borderRadius: T.radiusSm, fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "Nunito, sans-serif" }}>
              Run Weekly Synthesis →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
