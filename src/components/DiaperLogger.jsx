import { useState } from "react";
import { C, S } from "../styles/theme.js";
import { generateId } from "../utils/helpers.js";
import { Modal } from "./Modal.jsx";

// ============================================================
// DIAPER LOGGER — with manual time option
// ============================================================
export const DiaperLogger = ({ isOpen, onClose, onSave }) => {
  const [content, setContent] = useState("wet");
  const [stoolColor, setStoolColor] = useState("");
  const [notes, setNotes] = useState("");
  const [timeMode, setTimeMode] = useState("now");
  const [manualTime, setManualTime] = useState("");

  const nowTime = () => {
    const d = new Date();
    return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  };

  const getTimestamp = () => {
    if (timeMode === "now" || !manualTime) return new Date().toISOString();
    const [h, m] = manualTime.split(":").map(Number);
    const d = new Date();
    d.setHours(h, m, 0, 0);
    if (d > new Date()) d.setDate(d.getDate() - 1);
    return d.toISOString();
  };

  const handleSave = () => {
    onSave({
      id: generateId(),
      type: "diaper",
      timestamp: getTimestamp(),
      content,
      stoolColor: content !== "wet" ? stoolColor : "",
      notes,
    });
    setContent("wet"); setStoolColor(""); setNotes(""); setTimeMode("now"); setManualTime("");
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Log Diaper">
      {/* Time selection */}
      <label style={S.label}>Time</label>
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <button style={{ ...S.chip(timeMode === "now", C.diaper), flex: 1 }} onClick={() => setTimeMode("now")}>🕐 Now</button>
        <button style={{ ...S.chip(timeMode === "manual", C.diaper), flex: 1 }} onClick={() => { setTimeMode("manual"); if (!manualTime) setManualTime(nowTime()); }}>✏️ Set Time</button>
      </div>
      {timeMode === "manual" && (
        <input type="time" style={{ ...S.input, marginBottom: 16 }} value={manualTime} onChange={(e) => setManualTime(e.target.value)} />
      )}

      <label style={S.label}>Content</label>
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {["wet", "stool", "both"].map((c) => (
          <button key={c} style={{ ...S.chip(content === c, C.diaper), flex: 1 }} onClick={() => setContent(c)}>
            {c === "wet" ? "💧 Wet" : c === "stool" ? "💩 Stool" : "💧💩 Both"}
          </button>
        ))}
      </div>

      {content !== "wet" && (
        <>
          <label style={S.label}>Stool Color</label>
          <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
            {[["yellow", "#F4D03F"], ["green", "#2ECC71"], ["brown", "#8B4513"], ["black", "#2C3E50"], ["red", "#E74C3C"], ["white", "#ECF0F1"]].map(([n, bg]) => (
              <button key={n} onClick={() => setStoolColor(n)} style={{ width: 36, height: 36, borderRadius: 18, border: stoolColor === n ? `3px solid ${C.pri}` : `2px solid ${C.border}`, background: bg, cursor: "pointer" }} />
            ))}
          </div>
        </>
      )}

      <label style={S.label}>Notes</label>
      <input style={{ ...S.input, marginBottom: 20 }} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional notes..." />
      <button style={{ ...S.btn("primary"), width: "100%" }} onClick={handleSave}>Save Diaper</button>
    </Modal>
  );
};
