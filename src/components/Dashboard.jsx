// ============================================================
// DASHBOARD
// ============================================================
const Dashboard = ({ state, onOpenLogger, onStartTimer, onStopTimer, onAddContextNote, onDeleteEvent, onEditEvent }) => {
  const { baby, events, activeTimers, appointments } = state;
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editNotes, setEditNotes] = useState("");
  const ageWeeks = baby?.birthDate ? getBabyAgeWeeks(baby.birthDate) : null;
  const recs = ageWeeks !== null ? getAgeRecommendations(ageWeeks) : null;
  const lastFeed = getLastEvent(events, "feed");
  const lastSleep = getLastEvent(events, "sleep");
  const lastDiaper = getLastEvent(events, "diaper");
  const todayFeeds = getTodayEvents(events, "feed");
  const todayDiapers = getTodayEvents(events, "diaper");
  const todaySleep = getTodayEvents(events, "sleep");
  const todayActivities = getTodayEvents(events, "activity");
  const totalSleep = todaySleep.reduce((s, e) => s + (e.duration || 0), 0);
  const activeType = Object.keys(activeTimers)[0];
  const upcomingAppts = appointments.filter((a) => !a.completed && new Date(a.date) >= new Date()).sort((a, b) => new Date(a.date) - new Date(b.date)).slice(0, 2);

  // Smart pattern detection
  const insights = useMemo(() => detectPatterns(events, baby, state.contextNotes), [events, baby, state.contextNotes]);
  const [dismissedInsights, setDismissedInsights] = useState(() => { try { return JSON.parse(localStorage.getItem("dismissed_insights") || "[]"); } catch(e) { return []; } });
useEffect(() => { try { localStorage.setItem("dismissed_insights", JSON.stringify(dismissedInsights)); } catch(e) {} }, [dismissedInsights]);  
  const [expandedInsight, setExpandedInsight] = useState(null);
  const [insightExplanation, setInsightExplanation] = useState("");

  return (
    <div style={S.page}>
      {/* Baby card */}
      <div style={{ ...S.card, background: "linear-gradient(135deg, #667eea18, #764ba218)", border: "none" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 48, height: 48, borderRadius: 24, background: "linear-gradient(135deg, #667eea, #764ba2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>👶</div>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 2 }}>{baby?.name || "Baby"}</h2>
            <p style={{ fontSize: 13, color: C.t2 }}>{baby?.birthDate ? `${formatAge(baby.birthDate)} · Week ${ageWeeks}` : "Birth date not set"}</p>
          </div>
        </div>
      </div>

      {/* Active timer */}
      {activeType && (
        <div style={{ ...S.card, background: activeType === "feed" ? C.feedL : C.sleepL, border: `2px solid ${activeType === "feed" ? C.feed : C.sleep}` }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <span style={{ fontSize: 12, fontWeight: 600, textTransform: "uppercase", color: activeType === "feed" ? C.feed : C.sleep }}>
                {activeType === "feed" ? "🤱 Feeding" : "😴 Sleeping"} in progress
              </span>
              <TimerDisplay startTime={activeTimers[activeType]?.startTime} color={activeType === "feed" ? C.feed : C.sleep} />
            </div>
            <button style={S.btn("danger")} onClick={() => onOpenLogger(activeType)}>Stop</button>
          </div>
        </div>
      )}

      {/* Smart Pattern Insights — Dismissable with explanation */}
      {insights.filter((i) => !dismissedInsights.includes(i.id)).length > 0 && (
        <div style={{ marginBottom: 4 }}>
          {insights.filter((i) => !dismissedInsights.includes(i.id)).map((insight) => (
            <div key={insight.id} style={{ ...S.card, background: insight.color + "08", border: `1.5px solid ${insight.color}25`, position: "relative" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <span style={{ fontSize: 22 }}>{insight.emoji}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: insight.color }}>{insight.title}</div>
                  <div style={{ fontSize: 10, fontWeight: 600, color: C.t3, textTransform: "uppercase" }}>
                    {insight.confidence === "likely" ? "Based on patterns" : insight.confidence === "check_doctor" ? "Worth checking with doctor" : "Something to watch"}
                  </div>
                </div>
              </div>
              <p style={{ fontSize: 13, color: C.t2, lineHeight: 1.5, marginBottom: 8 }}>{insight.message}</p>
              <div style={{ padding: "8px 12px", borderRadius: 10, background: "white", border: `1px solid ${insight.color}15` }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: insight.color, marginBottom: 2 }}>💛 What to do</div>
                <div style={{ fontSize: 12, color: C.t2, lineHeight: 1.5 }}>{insight.tips}</div>
              </div>

              {/* Explanation input */}
              {expandedInsight === insight.id && (
                <div style={{ marginTop: 10, padding: 12, background: C.bg, borderRadius: 10 }}>
                  <label style={{ fontSize: 11, fontWeight: 600, color: C.t2, display: "block", marginBottom: 6 }}>What's actually happening?</label>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
                    {["We forgot to log some events", "We're aware, it's normal for us", "Baby is on a different schedule", "We're traveling/routine changed"].map((reason) => (
                      <button key={reason} onClick={() => setInsightExplanation(reason)} style={{ padding: "5px 10px", borderRadius: 12, border: `1px solid ${insightExplanation === reason ? C.pri : C.border}`, background: insightExplanation === reason ? C.priL : "white", fontSize: 11, cursor: "pointer", fontFamily: "inherit", color: insightExplanation === reason ? C.pri : C.t2 }}>
                        {reason}
                      </button>
                    ))}
                  </div>
                  <input style={{ ...S.input, fontSize: 13, marginBottom: 10 }} value={insightExplanation} onChange={(e) => setInsightExplanation(e.target.value)} placeholder="Or type your own reason..." />
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => {
                      if (insightExplanation) {
                        onAddContextNote({ id: generateId(), text: `${insight.title}: ${insightExplanation}`, category: insight.id.includes("sleep") ? "sleep" : insight.id.includes("growth") || insight.id.includes("feed") ? "feed" : "general", active: false, createdAt: new Date().toISOString(), insightId: insight.id, explanation: insightExplanation });
                      }
                      setDismissedInsights((p) => [...p, insight.id]);
                      setExpandedInsight(null);
                      setInsightExplanation("");
                    }} style={{ padding: "8px 16px", borderRadius: 10, background: C.pri, color: "white", border: "none", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", flex: 1 }}>
                      Got it, dismiss & remember
                    </button>
                  </div>
                  <p style={{ fontSize: 10, color: C.t3, marginTop: 6 }}>The app will remember your explanation and won't warn about this again.</p>
                </div>
              )}

              {/* Action buttons */}
              {expandedInsight !== insight.id && (
                <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                  <button onClick={() => {
                    onAddContextNote({ id: generateId(), text: insight.title, category: insight.id.includes("sleep") ? "sleep" : insight.id.includes("growth") || insight.id.includes("feed") ? "feed" : "general", active: true, createdAt: new Date().toISOString() });
                    setDismissedInsights((p) => [...p, insight.id]);
                  }} style={{ padding: "6px 14px", borderRadius: 10, background: insight.color, color: "white", border: "none", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                    📌 Acknowledge & Adapt
                  </button>
                  <button onClick={() => { setExpandedInsight(insight.id); setInsightExplanation(""); }} style={{ padding: "6px 14px", borderRadius: 10, background: "white", color: C.t2, border: `1px solid ${C.border}`, fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>
                    ✏️ Explain & Dismiss
                  </button>
                  <button onClick={() => setDismissedInsights((p) => [...p, insight.id])} style={{ padding: "6px 14px", borderRadius: 10, background: C.borderL, color: C.t3, border: "none", fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>
                    ✕
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Quick actions */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8, marginBottom: 12 }}>
        <button style={S.quickAct(C.feedL)} onClick={() => onOpenLogger("feed")}><span style={{ fontSize: 24 }}>🍼</span><span style={{ fontSize: 11, fontWeight: 600, color: C.feed }}>Feed</span></button>
        <button style={S.quickAct(C.diaperL)} onClick={() => onOpenLogger("diaper")}><span style={{ fontSize: 24 }}>🧷</span><span style={{ fontSize: 11, fontWeight: 600, color: C.diaper }}>Diaper</span></button>
        <button style={S.quickAct(C.sleepL)} onClick={() => onOpenLogger("sleep")}><span style={{ fontSize: 24 }}>😴</span><span style={{ fontSize: 11, fontWeight: 600, color: C.sleep }}>Sleep</span></button>
        <button style={S.quickAct(C.activityL)} onClick={() => onOpenLogger("activities")}><span style={{ fontSize: 24 }}>🤸</span><span style={{ fontSize: 11, fontWeight: 600, color: C.activity }}>Activity</span></button>
      </div>

      {/* Next windows */}
      {recs && (lastFeed || lastSleep || lastDiaper) && (
        <div style={S.card}>
          <h3 style={{ fontSize: 12, fontWeight: 700, color: C.t2, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>Next Windows</h3>
          {lastFeed && <NextWindowBadge label="Feed" lastTimestamp={lastFeed.timestamp} intervalMins={recs.feedInterval} contextNotes={state.contextNotes} />}
          {lastSleep && <div style={{ marginTop: 6 }}><NextWindowBadge label="Sleep" lastTimestamp={lastSleep.endTime || lastSleep.timestamp} intervalMins={recs.sleepWake} contextNotes={state.contextNotes} /></div>}
          {lastDiaper && <div style={{ marginTop: 6 }}><NextWindowBadge label="Diaper" lastTimestamp={lastDiaper.timestamp} intervalMins={recs.diaperInterval} contextNotes={state.contextNotes} /></div>}
        </div>
      )}

      {/* Today summary */}
      <div style={S.card}>
        <h3 style={{ fontSize: 12, fontWeight: 700, color: C.t2, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 12 }}>Today</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          <div style={S.stat(C.feed)}><div style={{ fontSize: 11, color: C.t2, fontWeight: 600 }}>FEEDS</div><div style={{ fontSize: 22, fontWeight: 700, color: C.feed }}>{todayFeeds.length}</div></div>
          <div style={S.stat(C.diaper)}><div style={{ fontSize: 11, color: C.t2, fontWeight: 600 }}>DIAPERS</div><div style={{ fontSize: 22, fontWeight: 700, color: C.diaper }}>{todayDiapers.length}</div></div>
          <div style={S.stat(C.sleep)}><div style={{ fontSize: 11, color: C.t2, fontWeight: 600 }}>SLEEP</div><div style={{ fontSize: 22, fontWeight: 700, color: C.sleep }}>{formatDuration(totalSleep)}</div>{recs && <div style={{ fontSize: 10, color: C.t3 }}>Goal: ~{recs.sleepHours}h</div>}</div>
          <div style={S.stat(C.activity)}><div style={{ fontSize: 11, color: C.t2, fontWeight: 600 }}>ACTIVITIES</div><div style={{ fontSize: 22, fontWeight: 700, color: C.activity }}>{todayActivities.length}</div></div>
        </div>
      </div>

      {/* Active context notes */}
      {(state.contextNotes || []).filter((n) => n.active).length > 0 && (
        <div style={{ ...S.card, background: "#FFF8E1", border: "1px solid #FFE08220" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <span>📌</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#F59E0B" }}>Active Notes</span>
          </div>
          {(state.contextNotes || []).filter((n) => n.active).map((n) => (
            <div key={n.id} style={{ fontSize: 13, color: C.t2, padding: "2px 0" }}>
              {n.text} <span style={{ fontSize: 11, color: C.t3 }}>· {n.category} · since {formatDate(n.createdAt)}</span>
            </div>
          ))}
          <p style={{ fontSize: 11, color: C.t3, marginTop: 6 }}>Recommendations are gentler while these are active</p>
        </div>
      )}

      {/* Tips */}
      {recs && (
        <div style={{ ...S.card, background: C.priL, border: `1px solid ${C.pri}20` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}><span>💡</span><span style={{ fontSize: 13, fontWeight: 700, color: C.pri }}>Week {ageWeeks} Tips</span></div>
          <p style={{ fontSize: 13, color: C.t2, lineHeight: 1.5 }}>~{Math.round(24 * 60 / recs.feedInterval)} feeds/day, ~{recs.sleepHours}h sleep ({recs.naps} naps), ~{recs.diapers} diapers.</p>
        </div>
      )}

      {/* Upcoming */}
      {upcomingAppts.length > 0 && (
        <div style={S.card}>
          <h3 style={{ fontSize: 12, fontWeight: 700, color: C.t2, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 12 }}>Upcoming</h3>
          {upcomingAppts.map((a) => (
            <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 0", borderBottom: `1px solid ${C.borderL}` }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: a.type === "vaccination" ? C.vaccineL : C.doctorL, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>{a.type === "vaccination" ? "💉" : "🩺"}</div>
              <div style={{ flex: 1 }}><div style={{ fontSize: 13, fontWeight: 600 }}>{a.title}</div><div style={{ fontSize: 11, color: C.t3 }}>{formatDate(a.date)}</div></div>
            </div>
          ))}
        </div>
      )}

      {/* Recent */}
      <div style={S.card}>
        <h3 style={{ fontSize: 12, fontWeight: 700, color: C.t2, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 12 }}>Recent Activity</h3>
        {events.length === 0 ? <p style={{ fontSize: 13, color: C.t3, textAlign: "center", padding: 20 }}>No events yet. Start tracking!</p> : (
          [...events].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 8).map((ev) => (
            <div key={ev.id} onClick={() => { setSelectedEvent(ev); setDeleteConfirm(false); }} style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 0", borderBottom: `1px solid ${C.borderL}`, cursor: "pointer" }}>
              <div style={{ width: 28, height: 28, borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, background: ev.type === "feed" ? C.feedL : ev.type === "diaper" ? C.diaperL : ev.type === "sleep" ? C.sleepL : C.activityL }}>
                {ev.type === "feed" ? "🍼" : ev.type === "diaper" ? "🧷" : ev.type === "sleep" ? "😴" : "🤸"}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 600 }}>
                  {ev.type === "feed" ? `${ev.feedType === "breast" ? `Breast (${ev.side})` : ev.feedType === "expression" ? `Expression (${ev.side})` : "Formula"}${ev.amount ? ` · ${ev.amount}ml` : ""}${ev.duration ? ` · ${formatDuration(ev.duration)}` : ""}` : ev.type === "diaper" ? `Diaper · ${ev.content}` : ev.type === "sleep" ? `Sleep · ${formatDuration(ev.duration)}` : ev.activityTitle || "Activity"}
                </div>
                <div style={{ fontSize: 10, color: C.t3 }}>{formatTime(ev.timestamp)}</div>
              </div>
              <div style={{ color: C.t3, fontSize: 11 }}>›</div>
            </div>
          ))
        )}
      </div>

      {/* Event Detail Modal — editable */}
      <Modal isOpen={!!selectedEvent} onClose={() => { setSelectedEvent(null); setDeleteConfirm(false); setEditMode(false); }} title={editMode ? "Edit Event" : "Event Details"}>
        {selectedEvent && !editMode && (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, background: selectedEvent.type === "feed" ? C.feedL : selectedEvent.type === "diaper" ? C.diaperL : selectedEvent.type === "sleep" ? C.sleepL : C.activityL }}>
                {selectedEvent.type === "feed" ? "🍼" : selectedEvent.type === "diaper" ? "🧷" : selectedEvent.type === "sleep" ? "😴" : "🤸"}
              </div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700 }}>{selectedEvent.type === "feed" ? "Feeding" : selectedEvent.type === "diaper" ? "Diaper Change" : selectedEvent.type === "sleep" ? "Sleep" : "Activity"}</div>
                <div style={{ fontSize: 12, color: C.t3 }}>{formatDate(selectedEvent.timestamp)} at {formatTime(selectedEvent.timestamp)}</div>
              </div>
            </div>
            <div style={{ background: C.bg, borderRadius: 12, padding: 14, marginBottom: 16 }}>
              {selectedEvent.type === "feed" && (
                <>
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: `1px solid ${C.borderL}` }}><span style={{ fontSize: 13, color: C.t2 }}>Type</span><span style={{ fontSize: 13, fontWeight: 600 }}>{selectedEvent.feedType}</span></div>
                  {selectedEvent.side && <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: `1px solid ${C.borderL}` }}><span style={{ fontSize: 13, color: C.t2 }}>Side</span><span style={{ fontSize: 13, fontWeight: 600 }}>{selectedEvent.side}</span></div>}
                  {(selectedEvent.duration > 0) && <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: `1px solid ${C.borderL}` }}><span style={{ fontSize: 13, color: C.t2 }}>Duration</span><span style={{ fontSize: 13, fontWeight: 600 }}>{formatDuration(selectedEvent.duration)}</span></div>}
                  {(selectedEvent.amount > 0) && <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: `1px solid ${C.borderL}` }}><span style={{ fontSize: 13, color: C.t2 }}>Amount</span><span style={{ fontSize: 13, fontWeight: 600 }}>{selectedEvent.amount} ml</span></div>}
                  {selectedEvent.brand && <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: `1px solid ${C.borderL}` }}><span style={{ fontSize: 13, color: C.t2 }}>Brand</span><span style={{ fontSize: 13, fontWeight: 600 }}>{selectedEvent.brand}</span></div>}
                </>
              )}
              {selectedEvent.type === "diaper" && (
                <>
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: `1px solid ${C.borderL}` }}><span style={{ fontSize: 13, color: C.t2 }}>Content</span><span style={{ fontSize: 13, fontWeight: 600 }}>{selectedEvent.content}</span></div>
                  {selectedEvent.stoolColor && <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: `1px solid ${C.borderL}` }}><span style={{ fontSize: 13, color: C.t2 }}>Stool Color</span><span style={{ fontSize: 13, fontWeight: 600 }}>{selectedEvent.stoolColor}</span></div>}
                </>
              )}
              {selectedEvent.type === "sleep" && (
                <>
                  {(selectedEvent.duration > 0) && <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: `1px solid ${C.borderL}` }}><span style={{ fontSize: 13, color: C.t2 }}>Duration</span><span style={{ fontSize: 13, fontWeight: 600 }}>{formatDuration(selectedEvent.duration)}</span></div>}
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: `1px solid ${C.borderL}` }}><span style={{ fontSize: 13, color: C.t2 }}>Started</span><span style={{ fontSize: 13, fontWeight: 600 }}>{formatTime(selectedEvent.timestamp)}</span></div>
                  {selectedEvent.endTime && <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: `1px solid ${C.borderL}` }}><span style={{ fontSize: 13, color: C.t2 }}>Ended</span><span style={{ fontSize: 13, fontWeight: 600 }}>{formatTime(selectedEvent.endTime)}</span></div>}
                </>
              )}
              {selectedEvent.type === "activity" && (
                <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0" }}><span style={{ fontSize: 13, color: C.t2 }}>Activity</span><span style={{ fontSize: 13, fontWeight: 600 }}>{selectedEvent.activityTitle}</span></div>
              )}
              {selectedEvent.notes && <div style={{ padding: "8px 0" }}><span style={{ fontSize: 12, color: C.t3 }}>Notes: </span><span style={{ fontSize: 13 }}>{selectedEvent.notes}</span></div>}
            </div>
            <button style={{ ...S.btn("secondary"), width: "100%", marginBottom: 8 }} onClick={() => { setEditMode(true); setEditNotes(selectedEvent.notes || ""); }}>
              Edit Event
            </button>
            {!deleteConfirm ? (
              <button style={{ ...S.btn("ghost"), width: "100%", color: C.t3, fontSize: 13 }} onClick={() => setDeleteConfirm(true)}>Delete this event</button>
            ) : (
              <div style={{ padding: 14, background: "#FEE2E2", borderRadius: 12, textAlign: "center" }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: C.danger, marginBottom: 12 }}>Are you sure you want to delete?</p>
                <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
                  <button style={{ ...S.btn("danger"), padding: "10px 20px" }} onClick={async () => { if (onDeleteEvent) { await onDeleteEvent(selectedEvent.id); } setSelectedEvent(null); setDeleteConfirm(false); }}>Yes, Delete</button>
                  <button style={{ ...S.btn("secondary"), padding: "10px 20px" }} onClick={() => setDeleteConfirm(false)}>Cancel</button>
                </div>
              </div>
            )}
          </>
        )}
        {selectedEvent && editMode && (
          <EditEventForm event={selectedEvent} onSave={async (updates) => { if (onEditEvent) await onEditEvent(selectedEvent.id, updates); setSelectedEvent({ ...selectedEvent, ...updates }); setEditMode(false); }} onCancel={() => setEditMode(false)} />
        )}
      </Modal>
    </div>
  );
};

// ============================================================
// TRENDS DASHBOARD (Feeds/Sleep/Diapers/Weight vs WHO norms)
// ============================================================

// ============================================================
// DOCTOR SUMMARY (Weekly report — PDF + WhatsApp shareable)
// ============================================================
