import { useState } from "react";
import { C, S } from "../styles/theme.js";
import { formatTime, formatDuration } from "../utils/helpers.js";
import { Icon } from "./Icon.jsx";

// ============================================================
// EDIT EVENT FORM
// ============================================================
export const EditEventForm = ({ event, onSave, onCancel }) => {
  const [notes, setNotes] = useState(event.notes || "");
  const [amount, setAmount] = useState(event.amount || "");
  const [side, setSide] = useState(event.side || "");
  const [content, setContent] = useState(event.content || "");
  const [stoolColor, setStoolColor] = useState(event.stoolColor || "");
  const [durationMins, setDurationMins] = useState(event.duration ? Math.round(event.duration / 60000) : "");

  return (
    <div>
      {event.type === "feed" && (
        <>
          {event.feedType === "breast" && (
            <>
              <label style={S.label}>Side</label>
              <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                {["left", "right", "both"].map((s) => (<button key={s} style={S.chip(side === s, C.feed)} onClick={() => setSide(s)}>{s}</button>))}
              </div>
            </>
          )}
          <label style={S.label}>Duration (minutes)</label>
          <input style={{ ...S.input, marginBottom: 12 }} type="number" value={durationMins} onChange={(e) => setDurationMins(e.target.value)} />
          {(event.feedType === "expression" || event.feedType === "formula") && (
            <><label style={S.label}>Amount (ml)</label><input style={{ ...S.input, marginBottom: 12 }} type="number" value={amount} onChange={(e) => setAmount(e.target.value)} /></>
          )}
        </>
      )}
      {event.type === "diaper" && (
        <>
          <label style={S.label}>Content</label>
          <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
            {["wet", "stool", "both"].map((c) => (<button key={c} style={S.chip(content === c, C.diaper)} onClick={() => setContent(c)}>{c}</button>))}
          </div>
          {content !== "wet" && (
            <>
              <label style={S.label}>Stool Color</label>
              <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
                {[["yellow","#F4D03F"],["green","#2ECC71"],["brown","#8B4513"],["black","#2C3E50"],["red","#E74C3C"],["white","#ECF0F1"]].map(([n,bg]) => (
                  <button key={n} onClick={() => setStoolColor(n)} style={{ width: 32, height: 32, borderRadius: 16, border: stoolColor === n ? `3px solid ${C.pri}` : `2px solid ${C.border}`, background: bg, cursor: "pointer" }} />
                ))}
              </div>
            </>
          )}
        </>
      )}
      {event.type === "sleep" && (
        <><label style={S.label}>Duration (minutes)</label><input style={{ ...S.input, marginBottom: 12 }} type="number" value={durationMins} onChange={(e) => setDurationMins(e.target.value)} /></>
      )}
      <label style={S.label}>Notes</label>
      <input style={{ ...S.input, marginBottom: 16 }} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Add or edit notes..." />
      <div style={{ display: "flex", gap: 8 }}>
        <button style={{ ...S.btn("primary"), flex: 1 }} onClick={() => {
          const updates = { notes };
          if (side) updates.side = side;
          if (amount) updates.amount = parseFloat(amount);
          if (content) updates.content = content;
          if (stoolColor && content !== "wet") updates.stoolColor = stoolColor;
          if (durationMins) updates.duration = parseInt(durationMins) * 60000;
          onSave(updates);
        }}>Save Changes</button>
        <button style={{ ...S.btn("secondary"), flex: 1 }} onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
};

