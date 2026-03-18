// ============================================================
// FEED LOGGER (Breast, Expression, Formula with side-aware emoji)
// ============================================================
const FeedLogger = ({ isOpen, onClose, onSave, activeTimer, onStartTimer, onStopTimer, ageWeeks, lastFeed }) => {
  const [feedType, setFeedType] = useState("breast");
  const [breastSide, setBreastSide] = useState("left");
  const [expressionSide, setExpressionSide] = useState("left");
  const [amount, setAmount] = useState("");
  const [formulaBrand, setFormulaBrand] = useState("");
  const [notes, setNotes] = useState("");
  const [mode, setMode] = useState("timer"); // timer | manual
  const [manualTime, setManualTime] = useState("");
  const [manualDuration, setManualDuration] = useState("");
  const isTimerActive = activeTimer?.type === "feed";
  const [stoppedDuration, setStoppedDuration] = useState(0);
  const recs = ageWeeks !== null ? getAgeRecommendations(ageWeeks) : null;

  const handleSave = () => {
    const isManual = mode === "manual" && feedType === "breast";
    const timestamp = isManual && manualTime ? new Date(manualTime).toISOString() : isTimerActive ? activeTimer.startTime : new Date().toISOString();
    const duration = isManual ? (parseInt(manualDuration) || 0) * 60000 : isTimerActive ? Date.now() - new Date(activeTimer.startTime).getTime() : stoppedDuration;

    onSave({
      id: generateId(), type: "feed", timestamp, duration,
      feedType, ...(feedType === "breast" ? { side: breastSide } : {}),
      ...(feedType === "expression" ? { side: expressionSide, amount: parseFloat(amount) || 0 } : {}),
      ...(feedType === "formula" ? { amount: parseFloat(amount) || 0, brand: formulaBrand } : {}),
      notes,
    });
    if (isTimerActive) onStopTimer("feed");
    setFeedType("breast"); setBreastSide("left"); setAmount(""); setNotes(""); setManualTime(""); setManualDuration(""); setMode("timer"); onClose();
  };

  const BreastCircle = ({ side, selected, onClick, label }) => (
    <button onClick={onClick} style={{ width: 80, height: 80, borderRadius: 40, background: selected ? C.feed + "25" : C.borderL, border: `3px solid ${selected ? C.feed : C.border}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all 0.2s", fontFamily: "inherit" }}>
      <span style={{ fontSize: 28, transform: side === "right" ? "scaleX(-1)" : "none", display: "inline-block" }}>🤱</span>
      <span style={{ fontSize: 10, fontWeight: 700, color: selected ? C.feed : C.t3, marginTop: 2 }}>{label}</span>
    </button>
  );

  const ExpressionCircle = ({ side, selected, onClick, label }) => (
    <button onClick={onClick} style={{ width: 80, height: 80, borderRadius: 40, background: selected ? C.feed + "25" : C.borderL, border: `3px solid ${selected ? C.feed : C.border}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all 0.2s", fontFamily: "inherit" }}>
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

      {feedType === "breast" && (
        <>
          <label style={S.label}>Which Side</label>
          <div style={{ display: "flex", gap: 20, justifyContent: "center", marginBottom: 16 }}>
            <BreastCircle side="left" selected={breastSide === "left" || breastSide === "both"} onClick={() => setBreastSide(breastSide === "right" ? "both" : "left")} label="LEFT" />
            <BreastCircle side="right" selected={breastSide === "right" || breastSide === "both"} onClick={() => setBreastSide(breastSide === "left" ? "both" : "right")} label="RIGHT" />
          </div>
          <div style={{ textAlign: "center", fontSize: 12, color: C.t3, marginBottom: 12 }}>Selected: <strong style={{ color: C.feed }}>{breastSide}</strong></div>

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
              <label style={S.label}>When</label>
              <input style={{ ...S.input, marginBottom: 12 }} type="datetime-local" value={manualTime} onChange={(e) => setManualTime(e.target.value)} />
              <label style={S.label}>Duration (minutes)</label>
              <input style={{ ...S.input }} type="number" value={manualDuration} onChange={(e) => setManualDuration(e.target.value)} placeholder="e.g. 15" />
            </div>
          )}
        </>
      )}

      {feedType === "expression" && (
        <>
          <label style={S.label}>Expressed From</label>
          <div style={{ display: "flex", gap: 20, justifyContent: "center", marginBottom: 16 }}>
            <ExpressionCircle side="left" selected={expressionSide === "left" || expressionSide === "both"} onClick={() => setExpressionSide(expressionSide === "right" ? "both" : "left")} label="LEFT" />
            <ExpressionCircle side="right" selected={expressionSide === "right" || expressionSide === "both"} onClick={() => setExpressionSide(expressionSide === "left" ? "both" : "right")} label="RIGHT" />
          </div>
          <div style={{ textAlign: "center", fontSize: 12, color: C.t3, marginBottom: 12 }}>Expressed from: <strong style={{ color: C.feed }}>{expressionSide}</strong></div>
          <label style={S.label}>Amount (ml)</label>
          <input style={{ ...S.input, marginBottom: 16 }} type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="e.g. 120" />
        </>
      )}

      {feedType === "formula" && (
        <>
          <label style={S.label}>Amount (ml)</label>
          <input style={{ ...S.input, marginBottom: 12 }} type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="e.g. 120" />
          <label style={S.label}>Brand</label>
          <input style={{ ...S.input, marginBottom: 16 }} value={formulaBrand} onChange={(e) => setFormulaBrand(e.target.value)} placeholder="e.g. Similac, Aptamil, Hero" />
        </>
      )}

      {/* Next Feed Window */}
      {recs && lastFeed && (
        <NextWindowBadge label="Feed" lastTimestamp={lastFeed.timestamp} intervalMins={recs.feedInterval} />
      )}

      <label style={{ ...S.label, marginTop: 16 }}>Notes</label>
      <input style={{ ...S.input, marginBottom: 20 }} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional notes..." />
      <button style={{ ...S.btn("primary"), width: "100%" }} onClick={handleSave}>Save Feeding</button>
    </Modal>
  );
};

// ============================================================
// DIAPER LOGGER
// ============================================================
