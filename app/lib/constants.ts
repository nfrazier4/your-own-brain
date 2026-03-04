// ─── AREAS (like Things 3 Areas) ────────────────────────────────────────────
export const AREAS = [
  { id: "oaia",     label: "OAIA",         dot: "#34C759", light: "#E8F8ED", text: "#1A6B34" },
  { id: "swell",    label: "Swell Studio", dot: "#007AFF", light: "#E5F1FF", text: "#0A4FA3" },
  { id: "partio",   label: "Partio Co.",   dot: "#FF9500", light: "#FFF0D9", text: "#9A4A00" },
  { id: "personal", label: "Personal",     dot: "#AF52DE", light: "#F3EAFF", text: "#6B2FA0" },
  { id: "work",     label: "Work",         dot: "#5AC8FA", light: "#E0F7FF", text: "#0A7EA3" },
];

// ─── SMART LISTS ────────────────────────────────────────────────────────────
export const SMART_LISTS = [
  { id: "today",    icon: "☀️", label: "Today" },
  { id: "recent",   icon: "🕐", label: "Recent" },
  { id: "actions",  icon: "⚡", label: "Actions" },
  { id: "search",   icon: "🔍", label: "Search" },
  { id: "archive",  icon: "📦", label: "Archive" },
];

// ─── CAPTURE TYPES ──────────────────────────────────────────────────────────
export const TYPES = [
  { id: "thought",  emoji: "💭", label: "Thought"  },
  { id: "decision", emoji: "⚖️", label: "Decision" },
  { id: "person",   emoji: "👤", label: "Person"   },
  { id: "meeting",  emoji: "🗓", label: "Meeting"  },
  { id: "insight",  emoji: "💡", label: "Insight"  },
];

export const TYPE_EMOJI = Object.fromEntries(TYPES.map(t => [t.id, t.emoji]));

// ─── NATE'S PROFILE (for Claude context) ───────────────────────────────────
export const NATE_PROFILE = {
  name: 'Nate Frazier',
  role: 'Founder/CEO of Swell Studio, Community Liaison & Mentor Partner at OAIA, Co-owner of Partio Co.',
  context: 'Has ADHD, manages 4 distinct areas simultaneously, needs ADHD-friendly workflows',
  areas: {
    oaia: 'Oregon AI Accelerator at PSU - Spring 2026 cohort ops, mentor coordination, founder support',
    swell: 'Swell Studio web dev agency in Beaverton OR - WordPress, Gravity Forms, GravityKit. Active client: Silver Line Electric (dev partner: Dan)',
    partio: 'The Partio Collective ecommerce - WooCommerce rebuild, working with son Luca',
    personal: 'Family (Michele, Luca), home, health',
  },
  preferences: 'Concise responses (1-2 sentences unless asked for more), action-oriented, Things 3 aesthetic, reduce cognitive load',
  tools: {
    oaia: 'Google Workspace (oaia account), Notion, Slack (#oaia channels)',
    swell: 'Swell Google Workspace, Gmail, Slack',
  },
};
