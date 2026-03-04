// ─── DESIGN TOKENS ─────────────────────────────────────────────────────────
// Things 3-inspired design system for Chief of Staff

export const T = {
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

// Chat-specific tokens
export const CHAT_TOKENS = {
  userBubbleBg: T.yellowDim,
  userBubbleText: T.yellowText,
  assistantBubbleBg: T.cardBg,
  assistantBubbleText: T.text,
  streamingDotColor: T.textMuted,
};
