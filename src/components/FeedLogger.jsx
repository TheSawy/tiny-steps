import { useState } from "react";
import { C, S } from "../styles/theme.js";
import { generateId, formatTime, formatDuration, getAgeRecommendations } from "../utils/helpers.js";
import { Icon } from "./Icon.jsx";
import { Modal } from "./Modal.jsx";
import { TimerDisplay } from "./TimerDisplay.jsx";
import { NextWindowBadge } from "./NextWindowBadge.jsx";

export const FeedLogger = ({ isOpen, onClose, onSave, activeTimer, onStartTimer, onStopTimer, ageWeeks, lastFeed, weightContext }) => {
  const [feedType, setFeedType] = useState("breast");
  const [breastSide, setBreastSide] = useState("left");
  const [expressionSide, setExpressionSide] = useState("left");
  const [amount, setAmount] = useState("");
  const [formulaBrand, setFormulaBrand] = useState("");
  const [notes, setNotes] = useState("");
  const [mode, setMode] = useState("timer"); // timer | manual
  const [manualStart, setManualStart] = useState("");
  const [manualEnd, setManualEnd] = useState("");
  const [manualDurationMins, setManualDurationMins] = useState("");
  const [manualMode, setManualMode] = useState("start_end"); // start_end | start_duration
  const isTimerActive = activeTimer?.type === "feed";
  const [stoppedDuration, setStoppedDuration] = useState(0);
  const recs = ageWeeks !== null ? getAgeRecommendations(ageWeeks, weightContext) : null;

  const calcEnd = () => {
    if (manualMode === "start_duration" && manualStart && manualDurationMins) {
      return new Date(new Date(manualStart).getTime() + parseInt(manualDurationMins) * 60000).toISOString();
    }
    return manualEnd ? new Date(manualEnd).toISOString() : null;
  };

  const calcDuration = () => {
    if (manualMode === "start_duration" && manualDurationMins) return parseInt(manualDurationMins) * 60000;
    if (manualStart && manualEnd) {
      const dur = new Date(manualEnd).getTime() - new Date(manualStart).getTime();
      return dur > 0 ? dur : 0;
    }
    return 0;
  };

  const handleSave = () => {
    const timestamp = isTimerActive ? activeTimer.startTime : new Date().toISOString();
    const duration = isTimerActive ? Date.now() - new Date(activeTimer.startTime).getTime() : stoppedDuration;
    onSave({
      id: generateId(), type: "feed", timestamp, endTime: new Date().toISOString(), duration,
      feedType, ...(feedType === "breast" ? { side: breastSide } : {}),
      ...(feedType === "expression" ? { side: expressionSide, amount: parseFloat(amount) || 0 } : {}),
      ...(feedType === "formula" ? { amount: parseFloat(amount) || 0, brand: formulaBrand } : {}),
      notes,
    });
    if (isTimerActive) onStopTimer("feed");
    resetForm();
  };

  const handleSaveManual = () => {
    if (!manualStart) return;
    const dur = calcDuration();
    const end = calcEnd();
    if (!dur && !end) return;
    onSave({
      id: generateId(), type: "feed",
      timestamp: new Date(manualStart).toISOString(),
      endTime: end || new Date(new Date(manualStart).getTime() + dur).toISOString(),
      duration: dur,
      feedType, ...(feedType === "breast" ? { side: breastSide } : {}),
      ...(feedType === "expression" ? { side: expressionSide, amount: parseFloat(amount) || 0 } : {}),
      ...(feedType === "formula" ? { amount: parseFloat(amount) || 0, brand: formulaBrand } : {}),
      notes,
    });
    resetForm();
  };

  const resetForm = () => {
    setFeedType("breast"); setBreastSide("left"); setAmount(""); setFormulaBrand("");
    setNotes(""); setManualStart(""); setManualEnd(""); setManualDurationMins(""); setMode("timer"); setStoppedDuration(0);
    onClose();
  };

  const BreastCircle = ({ side, selected, onClick, label }) => (
    <button onClick={onClick} style={{ width: 80, height: 80, borderRadius: 40, background: selected ? C.feed + "25" : C.borderL, border: `3px solid ${selected ? C.feed : C.border}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", fontFamily: "inherit" }}>
      <span style={{ fontSize: 28, transform: side === "right" ? "scaleX(-1)" : "none", display: "inline-block" }}>🤱</span>
      <span style={{ fontSize: 10, fontWeight: 700, color: selected ? C.feed : C.t3, marginTop: 2 }}>{label}</span>
    </button>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Log Feeding">
      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        {["breast", "expression", "formula"].map((t) => (
          <button key={t} style={S.chip(feedType === t, C.feed)} onClick={() => setFeedType(t)}>
            {t === "breast" ? "🤱 Breast" : t === "expression" ? "🤱 Expression" : "🥛 Formula"}
          </button>
        ))}
      </div>

      {(feedType === "breast" || feedType === "expression") && (
        <>
          <label style={S.label}>{feedType === "breast" ? "Which Side" : "Expressed From"}</label>
          <div style={{ display: "flex", gap: 20, justifyContent: "center", marginBottom: 16 }}>
            <BreastCircle side="left" selected={(feedType === "breast" ? breastSide : expressionSide) === "left" || (feedType === "breast" ? breastSide : expressionSide) === "both"} onClick={() => feedType === "breast" ? setBreastSide(breastSide === "right" ? "both" : "left") : setExpressionSide(expressionSide === "right" ? "both" : "left")} label="LEFT" />
            <BreastCircle side="right" selected={(feedType === "breast" ? breastSide : expressionSide) === "right" || (feedType === "breast" ? breastSide : expressionSide) === "both"} onClick={() => feedType === "breast" ? setBreastSide(breastSide === "left" ? "both" : "right") : setExpressionSide(expressionSide === "left" ? "both" : "right")} label="RIGHT" />
          </div>
        </>
      )}

      {feedType === "expression" && (
        <><label style={S.label}>Amount (ml)</label><input style={{ ...S.input, marginBottom: 16 }} type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="e.g. 120" /></>
      )}
      {feedType === "formula" && (
        <>
          <label style={S.label}>Amount (ml)</label>
          <input style={{ ...S.input, marginBottom: 12 }} type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="e.g. 120" />
          <label style={S.label}>Brand</label>
          <input style={{ ...S.input, marginBottom: 16 }} value={formulaBrand} onChange={(e) => setFormulaBrand(e.target.value)} placeholder="e.g. Similac, Aptamil" />
        </>
      )}

      {/* Timer / Manual toggle */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <button style={S.chip(mode === "timer", C.feed)} onClick={() => setMode("timer")}>⏱ Timer</button>
        <button style={S.chip(mode === "manual", C.feed)} onClick={() => setMode("manual")}>✏️ Manual</button>
      </div>

      {mode === "timer" && (
        <div style={{ textAlign: "center", padding: 20, background: C.feedL, borderRadius: 16, marginBottom: 16 }}>
          {isTimerActive ? <TimerDisplay startTime={activeTimer.startTime} color={C.feed} /> : <div style={{ ...S.timer, color: C.feed }}>00:00</div>}
          <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 16 }}>
            {!isTimerActive ? (
              <button style={S.btn("primary")} onClick={() => onStartTimer("feed")}><Icon name="play" size={16} color="white" /> Start</button>
            ) : (
              <button style={S.btn("danger")} onClick={() => { setStoppedDuration(Date.now() - new Date(activeTimer.startTime).getTime()); onStopTimer("feed"); }}><Icon name="stop" size={16} color={C.danger} /> Stop</button>
            )}
          </div>
        </div>
      )}

      {mode === "manual" && (
        <div style={{ padding: 16, background: C.feedL, borderRadius: 16, marginBottom: 16 }}>
          {/* Sub-mode toggle: start+end or start+duration */}
          <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
            <button style={{ ...S.chip(manualMode === "start_end", C.feed), flex: 1, fontSize: 11 }} onClick={() => setManualMode("start_end")}>Start & End</button>
            <button style={{ ...S.chip(manualMode === "start_duration", C.feed), flex: 1, fontSize: 11 }} onClick={() => setManualMode("start_duration")}>Start & Duration</button>
          </div>
          <label style={S.label}>Started</label>
          <input style={{ ...S.input, marginBottom: 12 }} type="datetime-local" value={manualStart} onChange={(e) => setManualStart(e.target.value)} />
          {manualMode === "start_end" ? (
            <>
              <label style={S.label}>Ended</label>
              <input style={{ ...S.input, marginBottom: 8 }} type="datetime-local" value={manualEnd} onChange={(e) => setManualEnd(e.target.value)} />
            </>
          ) : (
            <>
              <label style={S.label}>Duration (minutes)</label>
              <input style={{ ...S.input, marginBottom: 8 }} type="number" value={manualDurationMins} onChange={(e) => setManualDurationMins(e.target.value)} placeholder="e.g. 20" />
            </>
          )}
          {calcDuration() > 0 && (
            <div style={{ textAlign: "center", fontSize: 14, fontWeight: 600, color: C.feed, marginTop: 4 }}>
              Duration: {formatDuration(calcDuration())}
            </div>
          )}
        </div>
      )}

      {recs && lastFeed && <div style={{ marginBottom: 12 }}><NextWindowBadge label="Feed" lastTimestamp={lastFeed.timestamp} intervalMins={recs.feedInterval} /></div>}

      <label style={{ ...S.label, marginTop: 8 }}>Notes</label>
      <input style={{ ...S.input, marginBottom: 20 }} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional notes..." />

      {mode === "timer" && <button style={{ ...S.btn("primary"), width: "100%" }} onClick={handleSave}>Save Feeding</button>}
      {mode === "manual" && <button style={{ ...S.btn("primary"), width: "100%", background: C.feed, opacity: manualStart && calcDuration() > 0 ? 1 : 0.5 }} onClick={handleSaveManual}>Save Feeding</button>}
    </Modal>
  );
};
