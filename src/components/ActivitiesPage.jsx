import { useState, useMemo, useRef, useEffect } from "react";
import { C, S } from "../styles/theme.js";
import { generateId, getBabyAgeWeeks, getBabyDisplayWeek, formatDuration, formatDate, toDateKey } from "../utils/helpers.js";
import { DEV_ACTIVITIES, ACTIVITY_CATEGORIES, getActivitiesForWeek, getAgeBandLabel, getActivityRecommendations } from "../data/devActivities.js";
import { Icon } from "./Icon.jsx";
import { Modal } from "./Modal.jsx";

// ============================================================
// ACTIVITIES PAGE — Evidence-based developmental activities
// ============================================================
export const ActivitiesPage = ({ state, onSave }) => {
  const ageWeeks = state.baby?.birthDate ? getBabyAgeWeeks(state.baby.birthDate) : 0;
  const displayWeek = state.baby?.birthDate ? getBabyDisplayWeek(state.baby.birthDate) : 1;
  const ageLabel = getAgeBandLabel(ageWeeks);

  const [view, setView] = useState("today"); // today | history | timeline
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selectedActivity, setSelectedActivity] = useState(null);

  const todaysActivities = getActivitiesForWeek(ageWeeks);
  const todayKey = toDateKey(new Date());
  const todayCompleted = state.events.filter((e) => e.type === "activity" && toDateKey(e.timestamp) === todayKey);
  const completedTitles = new Set(todayCompleted.map((e) => e.activityTitle));

  // Smart recommendations
  const recommendations = useMemo(
    () => getActivityRecommendations(state.events || [], ageWeeks),
    [state.events, ageWeeks]
  );

  const filteredToday = categoryFilter === "all"
    ? todaysActivities
    : todaysActivities.filter((a) => a.category === categoryFilter);

  const handleComplete = (activity) => {
    if (completedTitles.has(activity.title)) return;
    onSave({
      id: generateId(),
      type: "activity",
      timestamp: new Date().toISOString(),
      activityTitle: activity.title,
      activityCategory: activity.category,
      duration: activity.duration * 60000,
      notes: "",
    });
  };

  const totalDone = todayCompleted.length;
  const totalActivities = todaysActivities.length;
  const progressPct = Math.min(100, Math.round((totalDone / Math.max(totalActivities, 1)) * 100));

  // For timeline view
  const ageBandKeys = Object.keys(DEV_ACTIVITIES).map(Number).sort((a, b) => a - b);
  const currentBandKey = useMemo(() => {
    let key = ageBandKeys[0];
    for (const k of ageBandKeys) if (ageWeeks >= k) key = k;
    return key;
  }, [ageWeeks]);

  const currentBandRef = useRef(null);
  useEffect(() => {
    if (view === "timeline" && currentBandRef.current) {
      const t = setTimeout(() => {
        currentBandRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
      return () => clearTimeout(t);
    }
  }, [view]);

  const bandLabel = (key) => {
    if (key === 0) return "Newborn (0-2w)";
    if (key === 2) return "2-4 weeks";
    if (key === 4) return "1 month";
    if (key === 8) return "2 months";
    if (key === 12) return "3 months";
    if (key === 16) return "4 months";
    if (key === 20) return "5 months";
    if (key === 26) return "6-7 months";
    if (key === 32) return "7-8 months";
    if (key === 39) return "9-10 months";
    if (key === 46) return "11-12 months";
    return `Week ${key}+`;
  };

  // History view: group activity events by day for last 14 days
  const historyData = useMemo(() => {
    const days = [];
    const now = new Date();
    for (let i = 0; i < 14; i++) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      const dEnd = new Date(d);
      dEnd.setHours(23, 59, 59, 999);
      const dayKey = toDateKey(d);
      const dayEvents = (state.events || []).filter(
        (e) => e.type === "activity" && new Date(e.timestamp) >= d && new Date(e.timestamp) <= dEnd
      );
      days.push({ date: d, dayKey, events: dayEvents });
    }
    return days;
  }, [state.events]);

  return (
    <div style={S.page}>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Activities</h2>
      <p style={{ fontSize: 13, color: C.t2, marginBottom: 12 }}>
        {ageLabel} · Week {displayWeek} · Evidence-based developmental play
      </p>

      {/* View toggle */}
      <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
        <button style={{ ...S.chip(view === "today", C.activity), flex: 1 }} onClick={() => setView("today")}>📅 Today</button>
        <button style={{ ...S.chip(view === "history", C.activity), flex: 1 }} onClick={() => setView("history")}>📊 History</button>
        <button style={{ ...S.chip(view === "timeline", C.activity), flex: 1 }} onClick={() => setView("timeline")}>📚 Timeline</button>
      </div>

      {/* ===== TODAY VIEW ===== */}
      {view === "today" && (
        <>
          {/* Progress card */}
          <div style={{ ...S.card, padding: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: C.activity }}>TODAY'S PROGRESS</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: C.activity }}>{totalDone}/{totalActivities} · {progressPct}%</span>
            </div>
            <div style={{ height: 8, background: C.border, borderRadius: 4, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${progressPct}%`, background: `linear-gradient(90deg, ${C.activity}, #FBBF24)`, borderRadius: 4, transition: "width 0.5s" }} />
            </div>
            <p style={{ fontSize: 11, color: C.t3, marginTop: 8 }}>
              💡 Quality &gt; quantity. 2-3 focused activities daily is more impactful than rushing through all of them.
            </p>
          </div>

          {/* Smart recommendations */}
          {(recommendations.underserved.length > 0 || recommendations.streaks.length > 0) && (
            <div style={{ ...S.card, background: "#F5F3FF", border: `1.5px solid ${C.pri}25`, padding: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
                <span style={{ fontSize: 16 }}>💡</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: C.pri, textTransform: "uppercase", letterSpacing: "0.05em" }}>Smart Recommendations</span>
              </div>

              {recommendations.underserved.length > 0 && (
                <div style={{ marginBottom: 10 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: C.t2, marginBottom: 6 }}>Try more this week:</div>
                  {recommendations.underserved.map((rec, i) => {
                    const cat = ACTIVITY_CATEGORIES[rec.category];
                    return (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 10px", background: "white", borderRadius: 8, marginBottom: 4, border: `1px solid ${cat.color}25` }}>
                        <span style={{ fontSize: 16 }}>{cat.emoji}</span>
                        <div style={{ flex: 1, fontSize: 12, color: C.t2 }}>
                          <strong style={{ color: cat.color }}>{cat.label}</strong> activities — only {rec.done} done in last 7 days
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {recommendations.streaks.length > 0 && (
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: C.t2, marginBottom: 6 }}>🔥 Great consistency on:</div>
                  {recommendations.streaks.map((s, i) => (
                    <div key={i} style={{ fontSize: 11, color: C.t3, padding: "3px 0" }}>
                      • <strong style={{ color: C.success }}>{s.title}</strong> — {s.count}× this week
                    </div>
                  ))}
                </div>
              )}

              <p style={{ fontSize: 10, color: C.t3, marginTop: 8 }}>{recommendations.totalLast7Days} activities logged in the last 7 days</p>
            </div>
          )}

          {/* Category filter */}
          <div style={{ display: "flex", gap: 6, marginBottom: 12, overflowX: "auto", paddingBottom: 4 }}>
            <button onClick={() => setCategoryFilter("all")} style={{ padding: "6px 12px", borderRadius: 16, border: `1.5px solid ${categoryFilter === "all" ? C.pri : C.border}`, background: categoryFilter === "all" ? C.priL : "transparent", color: categoryFilter === "all" ? C.pri : C.t3, fontWeight: categoryFilter === "all" ? 600 : 500, fontSize: 11, cursor: "pointer", whiteSpace: "nowrap", fontFamily: "inherit" }}>All</button>
            {Object.entries(ACTIVITY_CATEGORIES).map(([key, cat]) => (
              <button key={key} onClick={() => setCategoryFilter(key)} style={{ padding: "6px 12px", borderRadius: 16, border: `1.5px solid ${categoryFilter === key ? cat.color : C.border}`, background: categoryFilter === key ? cat.color + "15" : "transparent", color: categoryFilter === key ? cat.color : C.t3, fontWeight: categoryFilter === key ? 600 : 500, fontSize: 11, cursor: "pointer", whiteSpace: "nowrap", fontFamily: "inherit" }}>
                {cat.emoji} {cat.label}
              </button>
            ))}
          </div>

          {/* Activity cards */}
          {filteredToday.map((act, i) => {
            const done = completedTitles.has(act.title);
            const cat = ACTIVITY_CATEGORIES[act.category] || ACTIVITY_CATEGORIES.bonding;
            return (
              <div key={i} style={{ ...S.card, opacity: done ? 0.6 : 1, border: done ? `1.5px solid ${C.success}40` : `1px solid ${cat.color}25` }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                  <button
                    onClick={() => handleComplete(act)}
                    style={{ width: 32, height: 32, borderRadius: 16, border: done ? "none" : `2px solid ${cat.color}`, background: done ? C.success : "transparent", display: "flex", alignItems: "center", justifyContent: "center", cursor: done ? "default" : "pointer", flexShrink: 0, marginTop: 2, fontFamily: "inherit" }}
                  >
                    {done && <Icon name="check" size={16} color="white" />}
                  </button>
                  <div style={{ flex: 1, minWidth: 0 }} onClick={() => setSelectedActivity(act)}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 18 }}>{act.icon}</span>
                      <span style={{ fontSize: 14, fontWeight: 700, textDecoration: done ? "line-through" : "none" }}>{act.title}</span>
                      <span style={{ fontSize: 9, fontWeight: 700, color: cat.color, background: cat.color + "15", padding: "2px 8px", borderRadius: 8, textTransform: "uppercase" }}>{cat.emoji} {cat.label}</span>
                    </div>
                    <div style={{ fontSize: 12, color: C.t2, lineHeight: 1.5, marginBottom: 6 }}>{act.description}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 10, color: C.t3 }}>
                      {act.duration > 0 && <span style={{ fontWeight: 600, color: cat.color }}>~{act.duration} min</span>}
                      <span style={{ color: C.pri, cursor: "pointer", fontWeight: 600 }}>Tap for science →</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </>
      )}

      {/* ===== HISTORY VIEW ===== */}
      {view === "history" && (
        <>
          {/* Weekly summary */}
          <div style={{ ...S.card, padding: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.t2, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 10 }}>Last 7 Days</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: C.activity, marginBottom: 4 }}>{recommendations.totalLast7Days}</div>
            <div style={{ fontSize: 12, color: C.t3, marginBottom: 12 }}>activities completed</div>

            {/* Category breakdown */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6 }}>
              {Object.entries(ACTIVITY_CATEGORIES).map(([key, cat]) => {
                const count = recommendations.categoryCounts[key] || 0;
                return (
                  <div key={key} style={{ background: cat.color + "10", borderRadius: 10, padding: "8px 6px", textAlign: "center", border: `1px solid ${cat.color}25` }}>
                    <div style={{ fontSize: 14 }}>{cat.emoji}</div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: cat.color }}>{count}</div>
                    <div style={{ fontSize: 9, color: C.t3, fontWeight: 600 }}>{cat.label}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Daily history */}
          <div style={{ marginTop: 4 }}>
            <h3 style={{ fontSize: 12, fontWeight: 700, color: C.t2, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8, marginTop: 12 }}>Daily Log</h3>
            {historyData.map((day, i) => {
              const isToday = day.dayKey === todayKey;
              return (
                <div key={i} style={{ ...S.card, padding: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: day.events.length > 0 ? 8 : 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: isToday ? C.pri : C.text }}>
                      {isToday ? "Today" : i === 1 ? "Yesterday" : day.date.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
                    </div>
                    <div style={{ fontSize: 11, color: C.t3, fontWeight: 600 }}>
                      {day.events.length} {day.events.length === 1 ? "activity" : "activities"}
                    </div>
                  </div>
                  {day.events.length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                      {day.events.map((e, j) => {
                        const cat = ACTIVITY_CATEGORIES[e.activityCategory] || ACTIVITY_CATEGORIES.bonding;
                        return (
                          <div key={j} style={{ fontSize: 10, padding: "3px 8px", borderRadius: 8, background: cat.color + "15", color: cat.color, fontWeight: 600 }}>
                            {cat.emoji} {e.activityTitle}
                          </div>
                        );
                      })}
                    </div>
                  )}
                  {day.events.length === 0 && (
                    <div style={{ fontSize: 11, color: C.t3, fontStyle: "italic" }}>No activities logged</div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* ===== TIMELINE VIEW ===== */}
      {view === "timeline" && (
        <div>
          {ageBandKeys.map((key) => {
            const isCurrent = key === currentBandKey;
            const isPast = key < currentBandKey;
            const activities = DEV_ACTIVITIES[key];
            return (
              <div key={key} ref={isCurrent ? currentBandRef : null} style={{ marginBottom: 24 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: isCurrent ? C.pri : isPast ? C.t3 : C.text }}>
                    {bandLabel(key)}
                  </h3>
                  {isCurrent && <span style={{ fontSize: 10, fontWeight: 700, color: "white", background: C.pri, padding: "2px 8px", borderRadius: 8 }}>NOW</span>}
                  {isPast && <span style={{ fontSize: 10, color: C.success }}>✓ past</span>}
                </div>
                {activities.map((act, i) => {
                  const cat = ACTIVITY_CATEGORIES[act.category] || ACTIVITY_CATEGORIES.bonding;
                  return (
                    <div key={i} onClick={() => setSelectedActivity(act)} style={{ ...S.card, cursor: "pointer", opacity: isPast ? 0.6 : 1, border: `1px solid ${cat.color}25`, padding: 12 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ fontSize: 20 }}>{act.icon}</span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                            <span style={{ fontSize: 13, fontWeight: 700 }}>{act.title}</span>
                            <span style={{ fontSize: 9, fontWeight: 700, color: cat.color, background: cat.color + "15", padding: "1px 6px", borderRadius: 6, textTransform: "uppercase" }}>{cat.emoji} {cat.label}</span>
                          </div>
                          <div style={{ fontSize: 11, color: C.t3, marginTop: 2 }}>{act.duration > 0 ? `${act.duration} min · ` : ""}Tap for details</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      )}

      {/* Activity detail modal */}
      <Modal isOpen={!!selectedActivity} onClose={() => setSelectedActivity(null)} title={selectedActivity?.title || ""}>
        {selectedActivity && (() => {
          const cat = ACTIVITY_CATEGORIES[selectedActivity.category] || ACTIVITY_CATEGORIES.bonding;
          return (
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                <span style={{ fontSize: 36 }}>{selectedActivity.icon}</span>
                <div>
                  <span style={{ fontSize: 10, fontWeight: 700, color: cat.color, background: cat.color + "15", padding: "3px 10px", borderRadius: 8, textTransform: "uppercase" }}>{cat.emoji} {cat.label}</span>
                  {selectedActivity.duration > 0 && <div style={{ fontSize: 12, color: C.t3, marginTop: 4 }}>~{selectedActivity.duration} min</div>}
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: C.t3, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>How to do it</div>
                <p style={{ fontSize: 14, color: C.text, lineHeight: 1.6 }}>{selectedActivity.description}</p>
              </div>

              <div style={{ marginBottom: 16, padding: 12, background: cat.color + "08", borderRadius: 12, border: `1px solid ${cat.color}20` }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: cat.color, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>🧪 Why it works</div>
                <p style={{ fontSize: 13, color: C.t2, lineHeight: 1.6 }}>{selectedActivity.science}</p>
              </div>

              {selectedActivity.whoCanDo && (
                <div style={{ marginBottom: 16, padding: 10, background: C.bg, borderRadius: 10 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: C.t3, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>👥 Who can do this</div>
                  <p style={{ fontSize: 12, color: C.t2 }}>{selectedActivity.whoCanDo}</p>
                </div>
              )}

              {view === "today" && !completedTitles.has(selectedActivity.title) && (
                <button style={{ ...S.btn("primary"), width: "100%", background: cat.color }} onClick={() => { handleComplete(selectedActivity); setSelectedActivity(null); }}>
                  ✓ Mark as Done
                </button>
              )}
              {view === "today" && completedTitles.has(selectedActivity.title) && (
                <div style={{ textAlign: "center", padding: 12, background: C.success + "15", borderRadius: 10, color: C.success, fontWeight: 600, fontSize: 13 }}>
                  ✓ Completed today
                </div>
              )}
            </div>
          );
        })()}
      </Modal>
    </div>
  );
};
