import { useState, useMemo } from "react";
import { C, S } from "../styles/theme.js";
import { getBabyAgeWeeks, formatDuration, formatDate, toDateKey, getAgeRecommendations } from "../utils/helpers.js";
import { Icon } from "./Icon.jsx";

export const TrendsDashboard = ({ state }) => {
  const [period, setPeriod] = useState("7d"); // 7d | 14d | 30d
  const { baby, events, weightLog } = state;
  const ageWeeks = baby?.birthDate ? getBabyAgeWeeks(baby.birthDate) : 0;
  const recs = getAgeRecommendations(ageWeeks);

  const periodDays = period === "7d" ? 7 : period === "14d" ? 14 : 30;
  const now = new Date();

  // Group events by day
  const dailyData = useMemo(() => {
    const days = [];
    for (let i = periodDays - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      const dEnd = new Date(d); dEnd.setHours(23, 59, 59, 999);
      const dayKey = toDateKey(d);
      const dayEvents = events.filter((e) => { const t = new Date(e.timestamp); return t >= d && t <= dEnd; });

      const feeds = dayEvents.filter((e) => e.type === "feed");
      const sleeps = dayEvents.filter((e) => e.type === "sleep");
      const diapers = dayEvents.filter((e) => e.type === "diaper");
      const totalSleepMin = sleeps.reduce((s, e) => s + (e.duration || 0), 0) / 60000;
      const totalFeedMin = feeds.reduce((s, e) => s + (e.duration || 0), 0) / 60000;

      days.push({
        date: d,
        dayKey,
        label: d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }),
        shortLabel: d.toLocaleDateString("en-US", { weekday: "narrow" }),
        feedCount: feeds.length,
        feedMinutes: Math.round(totalFeedMin),
        sleepMinutes: Math.round(totalSleepMin),
        sleepHours: (totalSleepMin / 60).toFixed(1),
        diaperCount: diapers.length,
        stoolCount: diapers.filter((d) => d.content === "stool" || d.content === "both").length,
      });
    }
    return days;
  }, [events, periodDays]);

  // WHO norms for comparison
  const whoNorms = {
    feedsPerDay: Math.round(24 * 60 / recs.feedInterval),
    sleepHours: recs.sleepHours,
    diapersPerDay: recs.diapers,
  };

  // Averages
  const daysWithData = dailyData.filter((d) => d.feedCount > 0 || d.sleepMinutes > 0 || d.diaperCount > 0);
  const avgFeeds = daysWithData.length > 0 ? (daysWithData.reduce((s, d) => s + d.feedCount, 0) / daysWithData.length).toFixed(1) : "—";
  const avgSleep = daysWithData.length > 0 ? (daysWithData.reduce((s, d) => s + d.sleepMinutes, 0) / daysWithData.length / 60).toFixed(1) : "—";
  const avgDiapers = daysWithData.length > 0 ? (daysWithData.reduce((s, d) => s + d.diaperCount, 0) / daysWithData.length).toFixed(1) : "—";

  // Simple bar chart component
  const BarChart = ({ data, valueKey, color, normValue, normLabel, unit, maxOverride }) => {
    const values = data.map((d) => d[valueKey]);
    const max = maxOverride || Math.max(...values, normValue || 0, 1);
    return (
      <div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 2, height: 100, padding: "0 4px", position: "relative" }}>
          {/* Norm line */}
          {normValue > 0 && (
            <div style={{ position: "absolute", left: 0, right: 0, bottom: `${(normValue / max) * 100}%`, borderTop: `2px dashed ${color}40`, zIndex: 1 }}>
              <span style={{ position: "absolute", right: 0, top: -14, fontSize: 9, color: color, fontWeight: 600, background: "white", padding: "0 4px" }}>{normLabel}</span>
            </div>
          )}
          {data.map((d, i) => {
            const h = max > 0 ? (d[valueKey] / max) * 100 : 0;
            const isToday = d.dayKey === toDateKey(new Date());
            return (
              <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                <span style={{ fontSize: 8, color: C.t3, fontWeight: d[valueKey] > 0 ? 500 : 400 }}>{d[valueKey] > 0 ? d[valueKey] : ""}</span>
                <div style={{ width: "100%", height: `${Math.max(h, 2)}%`, background: isToday ? color : color + "60", borderRadius: 3, transition: "height 0.3s" }} />
              </div>
            );
          })}
        </div>
        {/* Day labels */}
        <div style={{ display: "flex", gap: 2, padding: "4px 4px 0" }}>
          {data.map((d, i) => (
            <div key={i} style={{ flex: 1, textAlign: "center", fontSize: 8, color: d.dayKey === toDateKey(new Date()) ? color : C.t3, fontWeight: d.dayKey === toDateKey(new Date()) ? 700 : 400 }}>
              {d.shortLabel}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Comparison badge
  const CompBadge = ({ actual, norm, unit = "", higher = "good" }) => {
    const a = parseFloat(actual);
    const n = parseFloat(norm);
    if (isNaN(a) || isNaN(n) || a === 0) return null;
    const diff = ((a - n) / n * 100).toFixed(0);
    const isAbove = a > n;
    const color = (higher === "good" && isAbove) || (higher === "low" && !isAbove) ? C.success : Math.abs(diff) < 15 ? C.warning : C.t3;
    return (
      <span style={{ fontSize: 10, fontWeight: 600, color, marginLeft: 4 }}>
        {isAbove ? "↑" : "↓"}{Math.abs(diff)}% vs norm
      </span>
    );
  };

  return (
    <div style={S.page}>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Trends</h2>
      <p style={{ fontSize: 13, color: C.t2, marginBottom: 12 }}>Week {ageWeeks} · vs WHO age norms</p>

      {/* Period selector */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {[["7d", "7 Days"], ["14d", "2 Weeks"], ["30d", "30 Days"]].map(([id, label]) => (
          <button key={id} style={S.chip(period === id, C.pri)} onClick={() => setPeriod(id)}>{label}</button>
        ))}
      </div>

      {/* Summary cards */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 16 }}>
        <div style={{ ...S.card, padding: 12, textAlign: "center", marginBottom: 0 }}>
          <div style={{ fontSize: 10, color: C.t2, fontWeight: 600, marginBottom: 4 }}>AVG FEEDS/DAY</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: C.feed }}>{avgFeeds}</div>
          <div style={{ fontSize: 10, color: C.t3 }}>Norm: {whoNorms.feedsPerDay}</div>
          <CompBadge actual={avgFeeds} norm={whoNorms.feedsPerDay} higher="neutral" />
        </div>
        <div style={{ ...S.card, padding: 12, textAlign: "center", marginBottom: 0 }}>
          <div style={{ fontSize: 10, color: C.t2, fontWeight: 600, marginBottom: 4 }}>AVG SLEEP</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: C.sleep }}>{avgSleep}h</div>
          <div style={{ fontSize: 10, color: C.t3 }}>Norm: {whoNorms.sleepHours}h</div>
          <CompBadge actual={avgSleep} norm={whoNorms.sleepHours} higher="good" />
        </div>
        <div style={{ ...S.card, padding: 12, textAlign: "center", marginBottom: 0 }}>
          <div style={{ fontSize: 10, color: C.t2, fontWeight: 600, marginBottom: 4 }}>AVG DIAPERS</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: C.diaper }}>{avgDiapers}</div>
          <div style={{ fontSize: 10, color: C.t3 }}>Norm: {whoNorms.diapersPerDay}</div>
          <CompBadge actual={avgDiapers} norm={whoNorms.diapersPerDay} higher="good" />
        </div>
      </div>

      {/* Feeding chart */}
      <div style={S.card}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: C.feed }}>🍼 Feeds per Day</h3>
            <span style={{ fontSize: 11, color: C.t3 }}>WHO norm: ~{whoNorms.feedsPerDay}/day</span>
          </div>
        </div>
        <BarChart data={dailyData} valueKey="feedCount" color={C.feed} normValue={whoNorms.feedsPerDay} normLabel={`${whoNorms.feedsPerDay}/day`} />
      </div>

      {/* Sleep chart */}
      <div style={S.card}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: C.sleep }}>😴 Sleep Hours</h3>
            <span style={{ fontSize: 11, color: C.t3 }}>WHO norm: ~{whoNorms.sleepHours}h/day</span>
          </div>
        </div>
        <BarChart data={dailyData.map((d) => ({ ...d, sleepH: parseFloat(d.sleepHours) }))} valueKey="sleepH" color={C.sleep} normValue={whoNorms.sleepHours} normLabel={`${whoNorms.sleepHours}h`} maxOverride={20} unit="h" />
      </div>

      {/* Diaper chart */}
      <div style={S.card}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: C.diaper }}>🧷 Diapers per Day</h3>
            <span style={{ fontSize: 11, color: C.t3 }}>WHO norm: ~{whoNorms.diapersPerDay}/day</span>
          </div>
        </div>
        <BarChart data={dailyData} valueKey="diaperCount" color={C.diaper} normValue={whoNorms.diapersPerDay} normLabel={`${whoNorms.diapersPerDay}/day`} />
      </div>

      {/* Weight chart */}
      {weightLog.length > 0 && (
        <div style={S.card}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: C.weight, marginBottom: 12 }}>⚖️ Weight Trend</h3>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 100, padding: "0 8px" }}>
            {[...weightLog].sort((a, b) => new Date(a.date) - new Date(b.date)).map((w, i, arr) => {
              const max = Math.max(...arr.map((s) => s.weight));
              const min = Math.min(...arr.map((s) => s.weight));
              const range = max - min || 1;
              const height = 20 + ((w.weight - min) / range) * 70;
              return (
                <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                  <span style={{ fontSize: 10, color: C.t3 }}>{w.weight}{w.unit}</span>
                  <div style={{ width: "100%", maxWidth: 28, height: `${height}%`, background: `linear-gradient(to top, ${C.weight}, ${C.weight}80)`, borderRadius: 4 }} />
                  <span style={{ fontSize: 8, color: C.t3 }}>{formatDate(w.date)}</span>
                </div>
              );
            })}
          </div>
          <div style={{ marginTop: 12, textAlign: "center" }}>
            <span style={{ fontSize: 24, fontWeight: 700, color: C.weight }}>{weightLog[weightLog.length - 1]?.weight}</span>
            <span style={{ fontSize: 14, color: C.t3, marginLeft: 4 }}>{weightLog[weightLog.length - 1]?.unit}</span>
            {weightLog.length >= 2 && (
              <div style={{ fontSize: 12, color: C.success, marginTop: 4 }}>
                +{(weightLog[weightLog.length - 1].weight - weightLog[0].weight).toFixed(2)} {weightLog[0].unit} since first weigh-in
              </div>
            )}
          </div>
        </div>
      )}

      {/* Active context notes affecting trends */}
      {(state.contextNotes || []).filter((n) => n.active).length > 0 && (
        <div style={{ ...S.card, background: "#FFF8E1", border: "1px solid #FFE08220" }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: C.warning, marginBottom: 6 }}>📌 Active Notes Affecting Trends</div>
          {(state.contextNotes || []).filter((n) => n.active).map((n) => (
            <div key={n.id} style={{ fontSize: 12, color: C.t2, padding: "3px 0" }}>
              {n.text}{n.explanation ? ` — "${n.explanation}"` : ""} <button onClick={() => onAddContextNote({ ...n, active: false })} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 10, color: C.t3, textDecoration: "underline", fontFamily: "inherit" }}>dismiss</button>
 <span style={{ fontSize: 10, color: C.t3 }}>since {formatDate(n.createdAt)}</span>
            </div>
          ))}
          <p style={{ fontSize: 10, color: C.t3, marginTop: 6 }}>Trend comparisons are less meaningful during these periods</p>
        </div>
      )}
    </div>
  );
};
