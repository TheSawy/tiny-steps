import { useState } from "react";
import { C, S } from "../styles/theme.js";
import { generateId } from "../utils/helpers.js";
import { Icon } from "./Icon.jsx";
import { Modal } from "./Modal.jsx";

// ============================================================
// DIAPER LOGGER
// ============================================================
export const DiaperLogger = ({ isOpen, onClose, onSave }) => {
  const [content, setContent] = useState("wet");
  const [stoolColor, setStoolColor] = useState("");
  const [notes, setNotes] = useState("");
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Log Diaper">
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
      <button style={{ ...S.btn("primary"), width: "100%" }} onClick={() => { onSave({ id: generateId(), type: "diaper", timestamp: new Date().toISOString(), content, stoolColor: content !== "wet" ? stoolColor : "", notes }); setContent("wet"); setStoolColor(""); setNotes(""); onClose(); }}>Save Diaper</button>
    </Modal>
  );
};

