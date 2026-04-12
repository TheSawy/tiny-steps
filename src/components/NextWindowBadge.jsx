import { useState, useEffect } from "react";
import { C } from "../styles/theme.js";
import { getNextWindow, formatTime } from "../utils/helpers.js";

// ============================================================
// NEXT WINDOW BADGE — Compact square, emoji, countdown + clock time
// Red shades: light red (just overdue), red (30min+), deep red (2h+)
// ============================================================
export const NextWindowBadge = ({ label, lastTimestamp, intervalMins }) => {
  const [, setTick] = useState(0);
  useEffect(() => { const id = setInterval(() => setTick((t) => t + 1), 30000); return () => clearInterval(id); }, []);
  const win = getNextWindow(lastTimestamp, intervalMins);
  if (!win) return null;

  const fmtMins = (m) => {
    if (m < 60) return `${m}m`;
    const h = Math.floor(m / 60);
    const rem = m % 60;
    return rem > 0 ? `${h}h ${rem}m` : `${h}h`;
  };

  const emoji = label === "Feed" ? "🍼" : label === "Sleep" ? "😴" : "🧷";

  if (win.overdue) {
    const bg = win.overdueBy >= 120 ? "#EF444430" : win.overdueBy >= 30 ? "#EF444420" : "#EF444415";
    const border = win.overdueBy >= 120 ? "#EF444460" : win.overdueBy >= 30 ? "#EF444440" : "#EF444430";
    const color = win.overdueBy >= 120 ? "#DC2626" : win.overdueBy >= 30 ? "#EF4444" : "#F87171";
    return (
      <div style={{ flex: 1, padding: "12px 8px", borderRadius: 14, background: bg, border: `1.5px solid ${border}`, textAlign: "center", minWidth: 0 }}>
        <div style={{ fontSize: 22, marginBottom: 2 }}>{emoji}</div>
        <div style={{ fontSize: 13, fontWeight: 700, color }}>{fmtMins(win.overdueBy)}</div>
        <div style={{ fontSize: 9, color, fontWeight: 600 }}>overdue</div>
        <div style={{ fontSize: 10, color: C.t3, marginTop: 2 }}>was {formatTime(win.time)}</div>
      </div>
    );
  }

  return (
    <div style={{ flex: 1, padding: "12px 8px", borderRadius: 14, background: "#10B98110", border: "1.5px solid #10B98130", textAlign: "center", minWidth: 0 }}>
      <div style={{ fontSize: 22, marginBottom: 2 }}>{emoji}</div>
      <div style={{ fontSize: 13, fontWeight: 700, color: "#10B981" }}>{fmtMins(win.minsUntil)}</div>
      <div style={{ fontSize: 10, color: C.t3 }}>{formatTime(win.time)}</div>
    </div>
  );
};
