import { useState, useEffect, useMemo } from "react";
import { C, S } from "../styles/theme.js";
import { generateId, getBabyAgeWeeks, getBabyDisplayWeek, formatAge, formatDuration, formatTime, formatDate, getTimeSince, getTodayEvents, getLastEvent, getLastFullFeed, getAgeRecommendations, getNextWindow, toDateKey } from "../utils/helpers.js";
import { detectPatterns } from "../utils/patterns.js";
import { Icon } from "./Icon.jsx";
import { NextWindowBadge } from "./NextWindowBadge.jsx";
import { EditEventForm } from "./EditEventForm.jsx";
import { Modal } from "./Modal.jsx";
import { TimerDisplay } from "./TimerDisplay.jsx";

// ============================================================
// DASHBOARD
// ============================================================
export const Dashboard = ({ state, onOpenLogger, onStartTimer, onStopTimer, onAddContextNote, onDeleteEvent, onEditEvent }) => {
  const { baby, events, activeTimers, appointments } = state;
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editNotes, setEditNotes] = useState("");
  const [activityFilter, setActivityFilter] = useState("all");
  const ageWeeks = baby?.birthDate ? getBabyAgeWeeks(baby.birthDate) : null;
  const displayWeek = baby?.birthDate ? getBabyDisplayWeek(baby.birthDate) : 1;
  const latestWeight = state.weightLog?.length > 0 ? [...state.weightLog].sort((a, b) => new Date(b.date) - new Date(a.date))[0]?.weight : null;
  const weightContext = baby?.birthWeight ? { birthWeight: baby.birthWeight, latestWeight } : null;
  const recs = ageWeeks !== null ? getAgeRecommendations(ageWeeks, weightContext) : null;
  const lastFeed = getLastEvent(events, "feed");
  const lastFullFeed = getLastFullFeed(events);
  const lastSleep = getLastEvent(events, "sleep");
  const lastDiaper = getLastEvent(events, "diaper");
  const activeType = Object.keys(activeTimers)[0];
  const upcomingAppts = appointments.filter((a) => !a.completed && new Date(a.date) >= new Date()).sort((a, b) => new Date(a.date) - new Date(b.date)).slice(0, 2);

  // Day navigation for "Today" section
  const [dayOffset, setDayOffset] = useState(0);
  const selectedDay = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - dayOffset);
    d.setHours(0, 0, 0, 0);
    return d;
  }, [dayOffset]);
  const selectedDayEnd = useMemo(() => {
    const d = new Date(selectedDay);
    d.setHours(23, 59, 59, 999);
    return d;
  }, [selectedDay]);
  const isToday = dayOffset === 0;
  const dayLabel = isToday ? "Today" : dayOffset === 1 ? "Yesterday" : formatDate(selectedDay);

  const dayEvents = useMemo(() => events.filter((e) => {
    const t = new Date(e.timestamp);
    return t >= selectedDay && t <= selectedDayEnd;
  }), [events, selectedDay, selectedDayEnd]);

  const dayFeeds = dayEvents.filter((e) => e.type === "feed");
  const dayDiapers = dayEvents.filter((e) => e.type === "diaper");
  const dayWet = dayDiapers.filter((d) => d.content === "wet" || d.content === "both");
  const dayStool = dayDiapers.filter((d) => d.content === "stool" || d.content === "both");
  const daySleep = dayEvents.filter((e) => e.type === "sleep");
  const dayActivities = dayEvents.filter((e) => e.type === "activity");
  const dayTotalSleep = daySleep.reduce((s, e) => s + (e.duration || 0), 0);

  // Smart pattern detection
  const insights = useMemo(() => detectPatterns(events, baby, state.contextNotes, state.healthLog || []), [events, baby, state.contextNotes, state.healthLog]);
  const [dismissedInsights, setDismissedInsights] = useState(() => { try { return JSON.parse(localStorage.getItem("dismissed_insights") || "[]"); } catch(e) { return []; } });
  useEffect(() => { try { localStorage.setItem("dismissed_insights", JSON.stringify(dismissedInsights)); } catch(e) {} }, [dismissedInsights]);

  return (
    <div style={S.page}>
      {/* Baby card */}
      <div style={{ ...S.card, background: "linear-gradient(135deg, #667eea18, #764ba218)", border: "none" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 48, height: 48, borderRadius: 24, background: "linear-gradient(135deg, #667eea, #764ba2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>👶</div>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 2 }}>{baby?.name || "Baby"}</h2>
            <p style={{ fontSize: 13, color: C.t2 }}>{baby?.birthDate ? `${formatAge(baby.birthDate)} · Week ${displayWeek}` : "Birth date not set"}</p>
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

      {/* Pattern Insights — with close button */}
      {insights.filter((i) => !dismissedInsights.includes(i.id)).length > 0 && (
        <div style={{ marginBottom: 4 }}>
          {insights.filter((i) => !dismissedInsights.includes(i.id)).map((insight) => (
            <div key={insight.id} style={{ ...S.card, background: insight.color + "08", border: `1.5px solid ${insight.color}25`, position: "relative" }}>
              {/* Close button */}
              <button onClick={() => setDismissedInsights((p) => [...p, insight.id])} style={{ position: "absolute", top: 10, right: 10, width: 28, height: 28, borderRadius: 14, background: C.borderL, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, color: C.t3 }}>✕</button>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, paddingRight: 32 }}>
                <span style={{ fontSize: 22 }}>{insight.emoji}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: insight.color }}>{insight.title}</div>
                  <div style={{ fontSize: 10, fontWeight: 600, color: C.t3, textTransform: "uppercase" }}>
                    {insight.confidence === "likely" ? "Based on patterns" : insight.confidence === "check_doctor" ? "Worth checking with doctor" : insight.confidence === "good_news" ? "Good news" : "Something to watch"}
                  </div>
                </div>
              </div>
              <p style={{ fontSize: 13, color: C.t2, lineHeight: 1.5, marginBottom: 8 }}>{insight.message}</p>
              <div style={{ padding: "8px 12px", borderRadius: 10, background: "white", border: `1px solid ${insight.color}15` }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: insight.color, marginBottom: 2 }}>💛 What to do</div>
                <div style={{ fontSize: 12, color: C.t2, lineHeight: 1.5 }}>{insight.tips}</div>
              </div>
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

      {/* Weight catch-up banner */}
      {recs?.mode === "catch_up_weight" && (
        <div style={{ ...S.card, background: "#FFF0EA", border: "2px solid #FF8C6140", padding: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <span style={{ fontSize: 18 }}>⚖️</span>
            <span style={{ fontSize: 14, fontWeight: 700, color: C.feed }}>Weight Catch-Up Mode</span>
          </div>
          <p style={{ fontSize: 12, color: C.t2, lineHeight: 1.5, marginBottom: 6 }}>
            {recs.currentWeight === "not logged"
              ? `${baby?.name} needs to reach birth weight of ${recs.targetWeight}kg. Log a weight to track progress.`
              : `${baby?.name} is at ${recs.currentWeight}kg — needs ${recs.targetWeight}kg (${recs.gap}kg to go).`}
          </p>
          <p style={{ fontSize: 11, color: C.feed, fontWeight: 600 }}>Feed every 2h · Max nap 2.5h day · Max 3h night</p>
        </div>
      )}

      {/* Next Windows */}
      {recs && (lastFullFeed || lastSleep || lastDiaper) && (
        <>
          <h3 style={{ fontSize: 12, fontWeight: 700, color: C.t2, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8, marginTop: 4 }}>Next Windows</h3>
          <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            {lastFullFeed && <NextWindowBadge label="Feed" lastTimestamp={lastFullFeed.timestamp} intervalMins={recs.feedInterval} />}
            {lastSleep && <NextWindowBadge label="Sleep" lastTimestamp={lastSleep.endTime || lastSleep.timestamp} intervalMins={recs.sleepWake} />}
            {lastDiaper && <NextWindowBadge label="Diaper" lastTimestamp={lastDiaper.timestamp} intervalMins={recs.diaperInterval} />}
          </div>
        </>
      )}

      {/* Today / Day Summary */}
      <div style={S.card}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <button onClick={() => setDayOffset((d) => d + 1)} style={{ ...S.btn("ghost"), padding: "4px 8px" }}><Icon name="back" size={16} color={C.t2} /></button>
          <div style={{ textAlign: "center" }}>
            <h3 style={{ fontSize: 12, fontWeight: 700, color: C.t2, textTransform: "uppercase", letterSpacing: "0.05em" }}>{dayLabel}</h3>
            {!isToday && <div style={{ fontSize: 10, color: C.t3 }}>{formatDate(selectedDay)}</div>}
          </div>
          <div style={{ display: "flex", gap: 4 }}>
            {!isToday && <button onClick={() => setDayOffset(0)} style={{ ...S.btn("ghost"), padding: "4px 8px", fontSize: 10, color: C.pri }}>Today</button>}
            <button onClick={() => setDayOffset((d) => Math.max(0, d - 1))} style={{ ...S.btn("ghost"), padding: "4px 8px", opacity: isToday ? 0.3 : 1 }} disabled={isToday}>
              <span style={{ display: "inline-block", transform: "scaleX(-1)" }}><Icon name="back" size={16} color={C.t2} /></span>
            </button>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          <div style={S.stat(C.feed)}>
            <div style={{ fontSize: 11, color: C.t2, fontWeight: 600 }}>FEEDS</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: C.feed }}>{dayFeeds.length}</div>
          </div>
          <div style={S.stat(C.diaper)}>
            <div style={{ fontSize: 11, color: C.t2, fontWeight: 600 }}>DIAPERS</div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 4 }}>
              <span style={{ fontSize: 18, fontWeight: 700, color: C.diaper }}>💧 {dayWet.length}</span>
              <span style={{ fontSize: 18, fontWeight: 700, color: "#8B6914" }}>💩 {dayStool.length}</span>
            </div>
          </div>
          <div style={S.stat(C.sleep)}>
            <div style={{ fontSize: 11, color: C.t2, fontWeight: 600 }}>SLEEP</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: C.sleep }}>{formatDuration(dayTotalSleep)}</div>
            {recs && isToday && <div style={{ fontSize: 10, color: C.t3 }}>Goal: ~{recs.sleepHours}h</div>}
          </div>
          <div style={S.stat(C.activity)}>
            <div style={{ fontSize: 11, color: C.t2, fontWeight: 600 }}>ACTIVITIES</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: C.activity }}>{dayActivities.length}</div>
          </div>
        </div>
      </div>

      {/* Tips */}
      {recs && (
        <div style={{ marginTop: 8 }}>
          <h3 style={{ fontSize: 12, fontWeight: 700, color: C.t2, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>Tips</h3>
          <div style={{ ...S.card, background: recs.mode === "catch_up_weight" ? "#FFF0EA" : C.priL, border: `1px solid ${recs.mode === "catch_up_weight" ? C.feed + "20" : C.pri + "20"}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}><span>💡</span><span style={{ fontSize: 13, fontWeight: 700, color: recs.mode === "catch_up_weight" ? C.feed : C.pri }}>Week {displayWeek} {recs.mode === "catch_up_weight" ? "· Catch-Up" : ""}</span></div>
            {recs.mode === "catch_up_weight" ? (
              <p style={{ fontSize: 13, color: C.t2, lineHeight: 1.5 }}>Feed every 2h. Wake to feed if sleeping over 2.5h (day) or 3h (night). 12+ feeds/day target.</p>
            ) : (
              <p style={{ fontSize: 13, color: C.t2, lineHeight: 1.5 }}>~{Math.round(24 * 60 / recs.feedInterval)} feeds/day, ~{recs.sleepHours}h sleep ({recs.naps} naps), ~{recs.diapers} diapers.</p>
            )}
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <div style={{ marginTop: 8 }}>
        <h3 style={{ fontSize: 12, fontWeight: 700, color: C.t2, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>Recent Activity</h3>
        <div style={S.card}>
        <div style={{ display: "flex", gap: 6, marginBottom: 12, overflowX: "auto" }}>
          {[
            { id: "all", label: "All", color: C.pri },
            { id: "feed", label: "🍼 Feed", color: C.feed },
            { id: "diaper", label: "🧷 Diaper", color: C.diaper },
            { id: "sleep", label: "😴 Sleep", color: C.sleep },
            { id: "activity", label: "🤸 Activity", color: C.activity },
          ].map((f) => (
            <button key={f.id} onClick={() => setActivityFilter(f.id)} style={{ padding: "5px 12px", borderRadius: 16, border: `1.5px solid ${activityFilter === f.id ? f.color : C.border}`, background: activityFilter === f.id ? f.color + "15" : "transparent", color: activityFilter === f.id ? f.color : C.t3, fontWeight: activityFilter === f.id ? 600 : 500, fontSize: 11, cursor: "pointer", whiteSpace: "nowrap", fontFamily: "inherit" }}>
              {f.label}
            </button>
          ))}
        </div>
        {events.length === 0 ? <p style={{ fontSize: 13, color: C.t3, textAlign: "center", padding: 20 }}>No events yet. Start tracking!</p> : (
          [...events]
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .filter((ev) => activityFilter === "all" || ev.type === activityFilter)
            .slice(0, 20)
            .map((ev) => {
              const stoolEmoji = ev.type === "diaper" && ev.stoolColor ? { yellow: "🟡", green: "🟢", brown: "🟤", black: "⚫", red: "🔴", white: "⚪" }[ev.stoolColor] || "" : "";
              return (
                <div key={ev.id} onClick={() => { setSelectedEvent(ev); setDeleteConfirm(false); setEditMode(false); }} style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 0", borderBottom: `1px solid ${C.borderL}`, cursor: "pointer" }}>
                  <div style={{ width: 28, height: 28, borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, background: ev.type === "feed" ? C.feedL : ev.type === "diaper" ? C.diaperL : ev.type === "sleep" ? C.sleepL : C.activityL }}>
                    {ev.type === "feed" ? "🍼" : ev.type === "diaper" ? "🧷" : ev.type === "sleep" ? "😴" : "🤸"}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 600 }}>
                      {ev.type === "feed" ? `${ev.feedType === "breast" ? `Breast (${ev.side})` : ev.feedType === "expression" ? `Expression (${ev.side})` : "Formula"}${ev.amount ? ` · ${ev.amount}ml` : ""}${ev.duration ? ` · ${formatDuration(ev.duration)}` : ""}` : ev.type === "diaper" ? `Diaper · ${ev.content}${stoolEmoji ? ` ${stoolEmoji}` : ""}` : ev.type === "sleep" ? `Sleep · ${formatDuration(ev.duration)}` : ev.activityTitle || "Activity"}
                    </div>
                    <div style={{ fontSize: 10, color: C.t3 }}>{formatTime(ev.timestamp)} · {formatDate(ev.timestamp)}</div>
                  </div>
                  <div style={{ color: C.t3, fontSize: 11 }}>›</div>
                </div>
              );
            })
        )}
      </div>
      </div>

      {/* Event Detail Modal */}
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
            <button style={{ ...S.btn("secondary"), width: "100%", marginBottom: 8 }} onClick={() => setEditMode(true)}>Edit Event</button>
            {!deleteConfirm ? (
              <button style={{ ...S.btn("ghost"), width: "100%", color: C.t3, fontSize: 13 }} onClick={() => setDeleteConfirm(true)}>Delete this event</button>
            ) : (
              <div style={{ padding: 14, background: "#FEE2E2", borderRadius: 12, textAlign: "center" }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: C.danger, marginBottom: 12 }}>Are you sure?</p>
                <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
                  <button style={{ ...S.btn("danger"), padding: "10px 20px" }} onClick={async () => { if (onDeleteEvent) await onDeleteEvent(selectedEvent.id); setSelectedEvent(null); setDeleteConfirm(false); }}>Yes, Delete</button>
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
