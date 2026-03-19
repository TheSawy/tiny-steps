import { useState, useEffect, useRef } from "react";
import { C, S } from "../styles/theme.js";
import { generateId, formatTime, formatDuration, getTimeSince, getAgeRecommendations } from "../utils/helpers.js";
import { Icon } from "./Icon.jsx";
import { Modal } from "./Modal.jsx";
import { TimerDisplay } from "./TimerDisplay.jsx";
import { NextWindowBadge } from "./NextWindowBadge.jsx";

// ============================================================
// SLEEP LOGGER (Gentle — with context notes for regressions, illness, etc.)
// ============================================================
export const SleepLogger = ({ isOpen, onClose, onSave, activeTimer, onStartTimer, onStopTimer, ageWeeks, lastSleep, contextNotes, onAddContextNote }) => {
  const [mode, setMode] = useState("timer");
  const [manualStart, setManualStart] = useState("");
  const [manualEnd, setManualEnd] = useState("");
  const [notes, setNotes] = useState("");
  const [showContext, setShowContext] = useState(false);
  const [contextText, setContextText] = useState("");
  const isTimerActive = activeTimer?.type === "sleep";
  const recs = ageWeeks !== null ? getAgeRecommendations(ageWeeks) : null;

  const activeSleepNotes = (contextNotes || []).filter((n) => n.active && (n.category === "sleep" || n.category === "general"));

  const quickContextTags = [
    { label: "Sleep regression", emoji: "🔄" },
    { label: "Teething", emoji: "🦷" },
    { label: "Growth spurt", emoji: "📈" },
    { label: "Not feeling well", emoji: "🤒" },
    { label: "Routine change", emoji: "✈️" },
    { label: "Overtired", emoji: "😫" },
  ];

  const handleAddContext = (text) => {
    if (!text.trim()) return;
    onAddContextNote({ id: generateId(), text: text.trim(), category: "sleep", active: true, createdAt: new Date().toISOString() });
    setContextText("");
    setShowContext(false);
  };

  const handleSaveTimer = () => {
    onSave({ id: generateId(), type: "sleep", timestamp: isTimerActive ? activeTimer.startTime : new Date().toISOString(), endTime: new Date().toISOString(), duration: isTimerActive ? Date.now() - new Date(activeTimer.startTime).getTime() : 0, notes });
    if (isTimerActive) onStopTimer("sleep");
    setNotes(""); onClose();
  };
  const handleSaveManual = () => {
    if (!manualStart || !manualEnd) return;
    const start = new Date(manualStart);
    const end = new Date(manualEnd);
    const dur = end.getTime() - start.getTime();
    if (dur <= 0) return;
    onSave({ id: generateId(), type: "sleep", timestamp: start.toISOString(), endTime: end.toISOString(), duration: dur, notes });
    setManualStart(""); setManualEnd(""); setNotes(""); onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Log Sleep">
      {/* Active context notes banner */}
      {activeSleepNotes.length > 0 && (
        <div style={{ padding: "10px 14px", borderRadius: 12, background: C.pri + "08", border: `1px solid ${C.pri}15`, marginBottom: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: C.pri, marginBottom: 4 }}>📌 Active Notes</div>
          {activeSleepNotes.map((n) => (
            <div key={n.id} style={{ fontSize: 12, color: C.t2, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "2px 0" }}>
              <span>{n.text}</span>
              <button onClick={() => onAddContextNote({ ...n, active: false })} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 10, color: C.t3, padding: "2px 6px" }}>dismiss</button>
            </div>
          ))}
          <div style={{ fontSize: 11, color: C.t3, marginTop: 4 }}>Recommendations are adjusted while these are active</div>
        </div>
      )}

      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <button style={S.chip(mode === "timer", C.sleep)} onClick={() => setMode("timer")}>⏱ Timer</button>
        <button style={S.chip(mode === "manual", C.sleep)} onClick={() => setMode("manual")}>✏️ Manual</button>
        <button style={{ ...S.chip(showContext, C.pri), marginLeft: "auto" }} onClick={() => setShowContext(!showContext)}>📌 Add Note</button>
      </div>

      {/* Context note input */}
      {showContext && (
        <div style={{ padding: 14, background: C.priL, borderRadius: 12, marginBottom: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: C.pri, marginBottom: 8 }}>What's happening right now?</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
            {quickContextTags.map((tag) => (
              <button key={tag.label} style={{ padding: "6px 12px", borderRadius: 16, border: `1px solid ${C.pri}30`, background: "white", fontSize: 12, cursor: "pointer", fontFamily: "inherit" }} onClick={() => handleAddContext(tag.label)}>
                {tag.emoji} {tag.label}
              </button>
            ))}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <input style={{ ...S.input, flex: 1 }} value={contextText} onChange={(e) => setContextText(e.target.value)} placeholder="Or type your own note..." onKeyDown={(e) => e.key === "Enter" && handleAddContext(contextText)} />
            <button style={{ ...S.btn("primary"), padding: "10px 16px" }} onClick={() => handleAddContext(contextText)}>Add</button>
          </div>
          <p style={{ fontSize: 11, color: C.t3, marginTop: 8 }}>
            This tells the app not to worry about unusual patterns. It'll adjust recommendations and won't show alarming alerts.
          </p>
        </div>
      )}

      {mode === "timer" && (
        <div style={{ textAlign: "center", padding: 24, background: C.sleepL, borderRadius: 16, marginBottom: 16 }}>
          <span style={{ fontSize: 32 }}>😴</span>
          <div style={{ marginTop: 12 }}>
            {isTimerActive ? <TimerDisplay startTime={activeTimer.startTime} color={C.sleep} /> : <div style={{ ...S.timer, color: C.sleep }}>00:00</div>}
          </div>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 16 }}>
            {!isTimerActive ? (
              <button style={{ ...S.btn("primary"), background: C.sleep }} onClick={() => onStartTimer("sleep")}><Icon name="play" size={16} color="white" /> Baby fell asleep</button>
            ) : (
              <button style={S.btn("danger")} onClick={handleSaveTimer}><Icon name="stop" size={16} color={C.danger} /> Baby woke up</button>
            )}
          </div>
        </div>
      )}

      {mode === "manual" && (
        <div style={{ padding: 16, background: C.sleepL, borderRadius: 16, marginBottom: 16 }}>
          <label style={S.label}>Fell Asleep</label>
          <input style={{ ...S.input, marginBottom: 12 }} type="datetime-local" value={manualStart} onChange={(e) => setManualStart(e.target.value)} />
          <label style={S.label}>Woke Up</label>
          <input style={{ ...S.input, marginBottom: 12 }} type="datetime-local" value={manualEnd} onChange={(e) => setManualEnd(e.target.value)} />
          {manualStart && manualEnd && new Date(manualEnd) > new Date(manualStart) && (
            <div style={{ textAlign: "center", padding: 8, fontSize: 20, fontWeight: 700, color: C.sleep }}>
              {formatDuration(new Date(manualEnd).getTime() - new Date(manualStart).getTime())}
            </div>
          )}
        </div>
      )}

      {/* Next Sleep Window — gentle, context-aware */}
      {recs && lastSleep && (
        <NextWindowBadge label="Sleep" lastTimestamp={lastSleep.endTime || lastSleep.timestamp} intervalMins={recs.sleepWake} contextNotes={contextNotes} />
      )}

      <label style={{ ...S.label, marginTop: 12 }}>Notes</label>
      <input style={{ ...S.input, marginBottom: 20 }} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="e.g. nap location, fussiness..." />
      {mode === "manual" && <button style={{ ...S.btn("primary"), width: "100%", background: C.sleep, opacity: manualStart && manualEnd ? 1 : 0.5 }} onClick={handleSaveManual}>Save Sleep</button>}
      {mode === "timer" && !isTimerActive && <button style={{ ...S.btn("primary"), width: "100%", background: C.sleep }} onClick={handleSaveTimer}>Save Sleep</button>}
    </Modal>
  );
};

