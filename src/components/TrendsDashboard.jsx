import { useState, useMemo } from "react";
import { C, S } from "../styles/theme.js";
import { getBabyAgeWeeks, getBabyDisplayWeek, formatDuration, formatDate, toDateKey, getAgeRecommendations } from "../utils/helpers.js";
import { Icon } from "./Icon.jsx";

export const TrendsDashboard = ({ state, onAddContextNote }) => {
  const [period, setPeriod] = useState("7d");
  const { baby, events, weightLog } = state;
  const ageWeeks = baby?.birthDate ? getBabyAgeWeeks(baby.birthDate) : 0;
  const displayWeek = baby?.birthDate ? getBabyDisplayWeek(baby.birthDate) : 1;
  const recs = getAgeRecommendations(ageWeeks);
  const periodDays = period === "7d" ? 7 : period === "14d" ? 14 : 30;
  const now = new Date();

  const dailyData = useMemo(() => {
    const days = [];
    for (let i = periodDays - 1; i >= 0; i--) {
      const d = new Date(now); d.setDate(d.getDate() - i); d.setHours(0, 0, 0, 0);
      const dEnd = new Date(d); dEnd.setHours(23, 59, 59, 999);
      const dayKey = toDateKey(d);
      const dayEvents = events.filter((e) => { const t = new Date(e.timestamp); return t >= d && t <= dEnd; });
      const feeds = dayEvents.filter((e) => e.type === "feed");
      const sleeps = dayEvents.filter((e) => e.type === "sleep");
      const diapers = dayEvents.filter((e) => e.type === "diaper");
      const totalSleepMin = sleeps.reduce((s, e) => s + (e.duration || 0), 0) / 60000;
      days.push({
        date: d, dayKey,
        shortLabel: d.toLocaleDateString("en-US", { weekday: "narrow" }),
        dayNum: d.getDate(),
        feedCount: feeds.length,
        sleepHours: parseFloat((totalSleepMin / 60).toFixed(1)),
        diaperCount: diapers.length,
      });
    }
    return days;
  }, [events, periodDays]);

  const whoNorms = { feedsPerDay: Math.round(24 * 60 / recs.feedInterval), sleepHours: recs.sleepHours, diapersPerDay: recs.diapers };
  const daysWithData = dailyData.filter((d) => d.feedCount > 0 || d.sleepHours > 0 || d.diaperCount > 0);
  const avgFeeds = daysWithData.length > 0 ? (daysWithData.reduce((s, d) => s + d.feedCount, 0) / daysWithData.length).toFixed(1) : "—";
  const avgSleep = daysWithData.length > 0 ? (daysWithData.reduce((s, d) => s + d.sleepHours, 0) / daysWithData.length).toFixed(1) : "—";
  const avgDiapers = daysWithData.length > 0 ? (daysWithData.reduce((s, d) => s + d.diaperCount, 0) / daysWithData.length).toFixed(1) : "—";

  // Column chart — tall bars with number labels on top
  const ColumnChart = ({ data, valueKey, color, normValue, normLabel, maxOverride }) => {
    const values = data.map((d) => d[valueKey]);
    const max = maxOverride || Math.max(...values, normValue || 0, 1);
    const barGap = periodDays > 14 ? 2 : 4;
    return (
      <div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: barGap, height: 160, position: "relative", padding: "0 2px" }}>
          {/* Norm line */}
          {normValue > 0 && (
            <div style={{ position: "absolute", left: 0, right: 0, bottom: `${(normValue / max) * 100}%`, borderTop: `2px dashed ${color}50`, zIndex: 1 }}>
              <span style={{ position: "absolute", right: 2, top: -15, fontSize: 9, color, fontWeight: 700, background: "white", padding: "0 3px", borderRadius: 3 }}>{normLabel}</span>
            </div>
          )}
          {data.map((d, i) => {
            const val = d[valueKey];
            const h = max > 0 ? Math.max((val / max) * 100, val > 0 ? 4 : 1) : 0;
            const isToday = d.dayKey === toDateKey(new Date());
            return (
              <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", height: "100%" }}>
                {val > 0 && (
                  <span style={{ fontSize: periodDays > 14 ? 8 : 11, fontWeight: 700, color: isToday ? color : C.text, marginBottom: 2 }}>{val}</span>
                )}
                <div style={{
                  width: "100%",
                  maxWidth: periodDays > 14 ? 16 : 32,
                  height: `${h}%`,
                  background: isToday ? color : color + "80",
                  borderRadius: periodDays > 14 ? 2 : 4,
                  border: isToday ? `2px solid ${color}` : "none",
                }} />
              </div>
            );
          })}
        </div>
        <div style={{ display: "flex", gap: barGap, padding: "6px 2px 0" }}>
          {data.map((d, i) => (
            <div key={i} style={{ flex: 1, textAlign: "center", fontSize: periodDays > 14 ? 7 : 10, color: d.dayKey === toDateKey(new Date()) ? color : C.t3, fontWeight: d.dayKey === toDateKey(new Date()) ? 700 : 400 }}>
              {periodDays <= 14 ? d.shortLabel : (i % 3 === 0 ? d.dayNum : "")}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div style={S.page}>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Trends</h2>
      <p style={{ fontSize: 13, color: C.t2, marginBottom: 12 }}>Week {displayWeek} · vs WHO age norms</p>

      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {[["7d", "7 Days"], ["14d", "2 Weeks"], ["30d", "30 Days"]].map(([id, label]) => (
          <button key={id} style={S.chip(period === id, C.pri)} onClick={() => setPeriod(id)}>{label}</button>
        ))}
      </div>

      {/* Summary cards */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 16 }}>
        <div style={{ ...S.card, padding: 12, textAlign: "center", marginBottom: 0 }}>
          <div style={{ fontSize: 10, color: C.t2, fontWeight: 600, marginBottom: 4 }}>AVG FEEDS</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: C.feed }}>{avgFeeds}</div>
          <div style={{ fontSize: 10, color: C.t3 }}>norm: {whoNorms.feedsPerDay}</div>
        </div>
        <div style={{ ...S.card, padding: 12, textAlign: "center", marginBottom: 0 }}>
          <div style={{ fontSize: 10, color: C.t2, fontWeight: 600, marginBottom: 4 }}>AVG SLEEP</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: C.sleep }}>{avgSleep}h</div>
          <div style={{ fontSize: 10, color: C.t3 }}>norm: {whoNorms.sleepHours}h</div>
        </div>
        <div style={{ ...S.card, padding: 12, textAlign: "center", marginBottom: 0 }}>
          <div style={{ fontSize: 10, color: C.t2, fontWeight: 600, marginBottom: 4 }}>AVG DIAPERS</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: C.diaper }}>{avgDiapers}</div>
          <div style={{ fontSize: 10, color: C.t3 }}>norm: {whoNorms.diapersPerDay}</div>
        </div>
      </div>

      {/* Feeds chart */}
      <div style={S.card}>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: C.feed, marginBottom: 12 }}>🍼 Feeds per Day</h3>
        <ColumnChart data={dailyData} valueKey="feedCount" color={C.feed} normValue={whoNorms.feedsPerDay} normLabel={`${whoNorms.feedsPerDay}/day`} />
      </div>

      {/* Sleep chart */}
      <div style={S.card}>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: C.sleep, marginBottom: 12 }}>😴 Sleep Hours</h3>
        <ColumnChart data={dailyData} valueKey="sleepHours" color={C.sleep} normValue={whoNorms.sleepHours} normLabel={`${whoNorms.sleepHours}h`} maxOverride={20} />
      </div>

      {/* Diapers chart */}
      <div style={S.card}>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: C.diaper, marginBottom: 12 }}>🧷 Diapers per Day</h3>
        <ColumnChart data={dailyData} valueKey="diaperCount" color={C.diaper} normValue={whoNorms.diapersPerDay} normLabel={`${whoNorms.diapersPerDay}/day`} />
      </div>

      {/* Weight chart */}
      {weightLog.length > 0 && (
        <div style={S.card}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: C.weight, marginBottom: 12 }}>⚖️ Weight Trend</h3>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 120, padding: "0 8px" }}>
            {[...weightLog].sort((a, b) => new Date(a.date) - new Date(b.date)).map((w, i, arr) => {
              const max = Math.max(...arr.map((s) => s.weight));
              const min = Math.min(...arr.map((s) => s.weight));
              const range = max - min || 1;
              const height = 20 + ((w.weight - min) / range) * 70;
              return (
                <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                  <span style={{ fontSize: 10, fontWeight: 600, color: C.weight }}>{w.weight}</span>
                  <div style={{ width: "100%", maxWidth: 28, height: `${height}%`, background: `linear-gradient(to top, ${C.weight}, ${C.weight}80)`, borderRadius: 4 }} />
                  <span style={{ fontSize: 8, color: C.t3 }}>{formatDate(w.date)}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Active context notes */}
      {(state.contextNotes || []).filter((n) => n.active).length > 0 && (
        <div style={{ ...S.card, background: "#FFF8E1", border: "1px solid #FFE08220" }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: C.warning, marginBottom: 6 }}>📌 Active Notes</div>
          {(state.contextNotes || []).filter((n) => n.active).map((n) => (
            <div key={n.id} style={{ fontSize: 12, color: C.t2, padding: "3px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>{n.text}</span>
              <button onClick={() => onAddContextNote({ ...n, active: false })} style={{ background: C.borderL, border: "none", cursor: "pointer", fontSize: 12, color: C.t3, borderRadius: 10, padding: "2px 8px", fontFamily: "inherit" }}>✕</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
