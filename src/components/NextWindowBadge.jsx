import { useState, useEffect } from "react";
import { C, S } from "../styles/theme.js";
import { getNextWindow, formatTime } from "../utils/helpers.js";
import { Icon } from "./Icon.jsx";

// ============================================================
// NEXT WINDOW BADGE (Gentle — no alarming red for parents)
// ============================================================
export const NextWindowBadge = ({ label, lastTimestamp, intervalMins, contextNotes = [] }) => {
  const [, setTick] = useState(0);
  useEffect(() => { const id = setInterval(() => setTick((t) => t + 1), 30000); return () => clearInterval(id); }, []);
  const win = getNextWindow(lastTimestamp, intervalMins);
  if (!win) return null;

  // Check if there's an active context note that explains irregular patterns
  const activeNotes = contextNotes.filter((n) => {
    if (!n.active) return false;
    if (n.category === "sleep" && label === "Sleep") return true;
    if (n.category === "feed" && label === "Feed") return true;
    if (n.category === "general") return true;
    return false;
  });
  const hasContext = activeNotes.length > 0;

  // Gentle overdue messaging — never alarming
  if (win.overdue) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", borderRadius: 12, background: hasContext ? C.pri + "08" : C.warning + "10", border: `1px solid ${hasContext ? C.pri + "20" : C.warning + "25"}`, marginTop: 8 }}>
        <span style={{ fontSize: 16 }}>{label === "Feed" ? "🍼" : label === "Sleep" ? "😴" : "🧷"}</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: hasContext ? C.t2 : C.warning }}>
            {hasContext
              ? `${label} window passed · That's okay`
              : win.overdueBy < 30
                ? `${label} window coming up`
                : `Might be time for a ${label.toLowerCase()} check`}
          </div>
          {hasContext && <div style={{ fontSize: 11, color: C.pri, marginTop: 2 }}>📌 {activeNotes[0].text}</div>}
          {!hasContext && <div style={{ fontSize: 11, color: C.t3 }}>Every baby has their own rhythm</div>}
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", borderRadius: 12, background: C.success + "08", border: `1px solid ${C.success + "20"}`, marginTop: 8 }}>
      <span style={{ fontSize: 16 }}>{label === "Feed" ? "🍼" : label === "Sleep" ? "😴" : "🧷"}</span>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: C.success }}>Next {label.toLowerCase()} in ~{win.minsUntil}m</div>
        <div style={{ fontSize: 11, color: C.t3 }}>Around {formatTime(win.time)}</div>
      </div>
    </div>
  );
};
