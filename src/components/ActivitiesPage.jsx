// ============================================================
// ACTIVITIES PAGE (Replaces Tummy Time)
// ============================================================
const ActivitiesPage = ({ state, onSave }) => {
  const ageWeeks = state.baby?.birthDate ? getBabyAgeWeeks(state.baby.birthDate) : 0;
  const activities = getActivitiesForAge(ageWeeks);
  const todayKey = toDateKey(new Date());
  const todayCompleted = state.events.filter((e) => e.type === "activity" && toDateKey(e.timestamp) === todayKey);
  const completedIds = new Set(todayCompleted.map((e) => e.activityTitle));

  const handleToggle = (activity) => {
    if (completedIds.has(activity.title)) return;
    onSave({ id: generateId(), type: "activity", timestamp: new Date().toISOString(), activityTitle: activity.title, duration: activity.duration * 60000, notes: "" });
  };

  const totalDone = todayCompleted.length;
  const totalActivities = activities.length;
  const progressPct = Math.round((totalDone / totalActivities) * 100);

  return (
    <div style={S.page}>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Daily Activities</h2>
      <p style={{ fontSize: 13, color: C.t2, marginBottom: 16 }}>Recommended for week {ageWeeks} · {totalDone}/{totalActivities} completed today</p>

      {/* Progress bar */}
      <div style={{ ...S.card, padding: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: C.activity }}>Today's Progress</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: C.activity }}>{progressPct}%</span>
        </div>
        <div style={{ height: 8, background: C.border, borderRadius: 4, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${progressPct}%`, background: `linear-gradient(90deg, ${C.activity}, #FBBF24)`, borderRadius: 4, transition: "width 0.5s" }} />
        </div>
      </div>

      {activities.map((act, i) => {
        const done = completedIds.has(act.title);
        return (
          <div key={i} style={{ ...S.card, display: "flex", alignItems: "center", gap: 12, opacity: done ? 0.7 : 1, border: done ? `1px solid ${C.success}30` : undefined }}>
            <button
              onClick={() => handleToggle(act)}
              style={{ width: 36, height: 36, borderRadius: 18, border: done ? "none" : `2px solid ${C.border}`, background: done ? C.success : "transparent", display: "flex", alignItems: "center", justifyContent: "center", cursor: done ? "default" : "pointer", flexShrink: 0 }}
            >
              {done && <Icon name="check" size={16} color="white" />}
            </button>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 18 }}>{act.icon}</span>
                <span style={{ fontSize: 14, fontWeight: 600, textDecoration: done ? "line-through" : "none" }}>{act.title}</span>
              </div>
              <div style={{ fontSize: 12, color: C.t3, marginTop: 2 }}>{act.description}</div>
              <div style={{ fontSize: 11, color: C.activity, fontWeight: 600, marginTop: 4 }}>~{act.duration} min</div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ============================================================
// WEIGHT LOGGER
// ============================================================
