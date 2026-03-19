// ============================================================
// COLORS & STYLES
// ============================================================

export const C = {
  bg: "#FAF9F7", card: "#FFFFFF", text: "#1A1A2E", t2: "#6B7280", t3: "#9CA3AF",
  border: "#E8E6E1", borderL: "#F3F1ED",
  pri: "#5B7FFF", priL: "#EEF1FF", priD: "#4060E0",
  feed: "#FF8C61", feedL: "#FFF0EA",
  diaper: "#4ECDC4", diaperL: "#E8FAF8",
  sleep: "#7C6CF0", sleepL: "#F0EEFE",
  tummy: "#FF6B9D", tummyL: "#FFECF2",
  weight: "#45B7D1", weightL: "#E6F6FA",
  doctor: "#96C93D", doctorL: "#F0F9E3",
  vaccine: "#DDA0DD", vaccineL: "#F9F0F9",
  milestone: "#FFD93D", milestoneL: "#FFF9E3",
  success: "#10B981", warning: "#F59E0B", danger: "#EF4444",
  physical: "#FF6B6B", cognitive: "#4ECDC4", social: "#FFD93D", language: "#7C6CF0",
  calendar: "#6366F1", calendarL: "#EEF2FF",
  activity: "#F97316", activityL: "#FFF7ED",
};

export const S = {
  app: { fontFamily: "'DM Sans', -apple-system, sans-serif", background: C.bg, color: C.text, minHeight: "100vh", maxWidth: 480, margin: "0 auto", position: "relative", paddingBottom: 80 },
  header: { padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", background: "white", borderBottom: `1px solid ${C.border}`, position: "sticky", top: 0, zIndex: 100 },
  page: { padding: "16px 20px" },
  card: { background: C.card, borderRadius: 16, padding: 16, marginBottom: 12, border: `1px solid ${C.borderL}`, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" },
  btn: (v = "primary") => ({ padding: "12px 24px", borderRadius: 12, border: "none", fontWeight: 600, fontSize: 14, cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "all 0.15s", fontFamily: "inherit", ...(v === "primary" ? { background: C.pri, color: "white" } : v === "secondary" ? { background: C.priL, color: C.pri } : v === "danger" ? { background: "#FEE2E2", color: C.danger } : { background: "transparent", color: C.t2 }) }),
  input: { width: "100%", padding: "12px 16px", borderRadius: 12, border: `1.5px solid ${C.border}`, fontSize: 14, fontFamily: "inherit", outline: "none", boxSizing: "border-box", background: "white" },
  label: { fontSize: 12, fontWeight: 600, color: C.t2, marginBottom: 6, display: "block", textTransform: "uppercase", letterSpacing: "0.05em" },
  chip: (active, color = C.pri) => ({ padding: "8px 16px", borderRadius: 20, border: `1.5px solid ${active ? color : C.border}`, background: active ? color + "15" : "transparent", color: active ? color : C.t2, fontWeight: active ? 600 : 500, fontSize: 13, cursor: "pointer", transition: "all 0.15s", whiteSpace: "nowrap", fontFamily: "inherit" }),
  nav: { position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 480, background: "white", borderTop: `1px solid ${C.border}`, display: "flex", justifyContent: "space-around", padding: "6px 0 env(safe-area-inset-bottom, 6px)", zIndex: 200 },
  navItem: (a) => ({ display: "flex", flexDirection: "column", alignItems: "center", gap: 1, padding: "4px 4px", border: "none", background: "none", cursor: "pointer", color: a ? C.pri : C.t3, fontSize: 9, fontWeight: a ? 600 : 500, minWidth: 0 }),
  modal: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 300, backdropFilter: "blur(4px)" },
  modalC: { background: "white", borderRadius: "24px 24px 0 0", width: "100%", maxWidth: 480, maxHeight: "85vh", overflow: "auto", padding: "20px 20px 40px" },
  timer: { fontSize: 48, fontWeight: 700, fontVariantNumeric: "tabular-nums", letterSpacing: "-0.03em", textAlign: "center" },
  stat: (c) => ({ background: c + "12", borderRadius: 12, padding: "12px 14px", flex: 1, minWidth: 0 }),
  quickAct: (bg) => ({ background: bg, borderRadius: 16, padding: "14px 10px", display: "flex", flexDirection: "column", alignItems: "center", gap: 6, border: "none", cursor: "pointer", flex: 1, minWidth: 0, fontFamily: "inherit" }),
  nextWindow: (overdue) => ({ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", borderRadius: 12, background: overdue ? C.danger + "10" : C.success + "10", border: `1px solid ${overdue ? C.danger + "30" : C.success + "30"}`, marginTop: 8 }),
};
