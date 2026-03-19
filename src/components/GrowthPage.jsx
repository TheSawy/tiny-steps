import { useState, useMemo } from "react";
import { C, S } from "../styles/theme.js";
import { generateId, getBabyAgeWeeks, formatAge, formatDate, formatDateFull } from "../utils/helpers.js";
import { WHO_MILESTONES, VACCINATION_SCHEDULE_BASE } from "../data/constants.js";
import { detectPatterns } from "../utils/patterns.js";
import { Icon } from "./Icon.jsx";
import { Modal } from "./Modal.jsx";
import { VaccineAdder } from "./VaccineAdder.jsx";

// ============================================================
// GROWTH & HEALTH — Weight, Vaccinations, Pattern Insights
// ============================================================
export const GrowthPage = ({ state, onOpenLogger, customVaccines, onAddContextNote, onAddHealthLog }) => {
  const { weightLog, baby, events, contextNotes, healthLog } = state;
  const ageWeeks = baby?.birthDate ? getBabyAgeWeeks(baby.birthDate) : 0;
  const [showVaccineAdd, setShowVaccineAdd] = useState(false);
  const [givenVaccines, setGivenVaccines] = useState(() => { try { return JSON.parse(localStorage.getItem("given_vaccines") || "[]"); } catch(e) { return []; } });
  const toggleVaccine = (name) => { setGivenVaccines((p) => { const next = p.includes(name) ? p.filter((n) => n !== name) : [...p, name]; localStorage.setItem("given_vaccines", JSON.stringify(next)); return next; }); };
  const [showAllVaccines, setShowAllVaccines] = useState(false);

  // Pattern insights
  const insights = useMemo(() => detectPatterns(events, baby, contextNotes || [], healthLog || []), [events, baby, contextNotes, healthLog]);
  const [selectedInsight, setSelectedInsight] = useState(null);
  const [explanation, setExplanation] = useState("");
  const [historyView, setHistoryView] = useState(false);

  // Pattern history from healthLog
  const patternHistory = useMemo(() => {
    return (healthLog || [])
      .filter((h) => h.patternId)
      .sort((a, b) => new Date(b.timestamp || b.createdAt) - new Date(a.timestamp || a.createdAt));
  }, [healthLog]);

  // Context notes tied to patterns (user explanations)
  const patternNotes = useMemo(() => {
    return (contextNotes || []).filter((n) => n.insightId || n.explanation);
  }, [contextNotes]);

  const handleExplain = (insight) => {
    if (!explanation.trim()) return;
    // Save explanation as context note
    if (onAddContextNote) {
      onAddContextNote({
        id: generateId(),
        text: `${insight.title}: ${explanation}`,
        category: insight.id.includes("sleep") ? "sleep" : insight.id.includes("growth") || insight.id.includes("feed") ? "feed" : "general",
        active: true,
        createdAt: new Date().toISOString(),
        insightId: insight.id,
        explanation: explanation,
      });
    }
    // Log to health log for lifecycle tracking
    if (onAddHealthLog) {
      onAddHealthLog({
        patternId: insight.patternId || insight.id,
        title: insight.title,
        confidence: insight.confidence,
        timestamp: new Date().toISOString(),
        userExplanation: explanation,
        action: "explained",
      });
    }
    setExplanation("");
    setSelectedInsight(null);
  };

  const handleAcknowledge = (insight) => {
    if (onAddContextNote) {
      onAddContextNote({
        id: generateId(),
        text: insight.title,
        category: insight.id.includes("sleep") ? "sleep" : insight.id.includes("growth") || insight.id.includes("feed") ? "feed" : "general",
        active: true,
        createdAt: new Date().toISOString(),
        insightId: insight.id,
      });
    }
    if (onAddHealthLog) {
      onAddHealthLog({
        patternId: insight.patternId || insight.id,
        title: insight.title,
        confidence: insight.confidence,
        timestamp: new Date().toISOString(),
        action: "acknowledged",
      });
    }
  };

  const handleDismiss = (insight, reason) => {
    if (onAddContextNote) {
      onAddContextNote({
        id: generateId(),
        text: `${insight.title}: ${reason || "dismissed"}`,
        category: "general",
        active: false,
        createdAt: new Date().toISOString(),
        insightId: insight.id,
        explanation: reason || "dismissed",
      });
    }
    if (onAddHealthLog) {
      onAddHealthLog({
        patternId: insight.patternId || insight.id,
        title: insight.title,
        confidence: insight.confidence,
        timestamp: new Date().toISOString(),
        userExplanation: reason || "dismissed",
        action: "dismissed",
      });
    }
  };

  const allVaccines = [...VACCINATION_SCHEDULE_BASE, ...customVaccines].sort((a, b) => a.weekDue - b.weekDue);
  const relevantVaccines = allVaccines.filter((v) => v.weekDue >= ageWeeks - 4).slice(0, 8);
  const sortedWeights = [...weightLog].sort((a, b) => new Date(a.date) - new Date(b.date));

  // Group pattern history by pattern
  const historyByPattern = useMemo(() => {
    const map = {};
    patternHistory.forEach((h) => {
      if (!map[h.patternId]) map[h.patternId] = [];
      map[h.patternId].push(h);
    });
    return map;
  }, [patternHistory]);

  const confidenceLabel = (c) => {
    if (c === "likely") return { text: "Likely", bg: "#F59E0B20", color: "#F59E0B" };
    if (c === "check_doctor") return { text: "Check with doctor", bg: "#EF444420", color: "#EF4444" };
    if (c === "good_news") return { text: "Resolving", bg: "#10B98120", color: "#10B981" };
    if (c === "unlikely") return { text: "Unlikely", bg: C.borderL, color: C.t3 };
    return { text: "Possible", bg: C.priL, color: C.pri };
  };

  return (
    <div style={S.page}>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>Growth & Health</h2>

      {/* ---- PATTERN INSIGHTS ---- */}
      <div style={S.card}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: C.t2, textTransform: "uppercase", letterSpacing: "0.05em" }}>Pattern Insights</h3>
          <button
            onClick={() => setHistoryView(!historyView)}
            style={{ ...S.btn("ghost"), padding: "4px 10px", fontSize: 11, color: C.pri }}
          >
            {historyView ? "Current" : "History"}
          </button>
        </div>

        {!historyView ? (
          /* ---- CURRENT INSIGHTS ---- */
          insights.length === 0 ? (
            <div style={{ textAlign: "center", padding: 20 }}>
              <span style={{ fontSize: 32 }}>✨</span>
              <p style={{ fontSize: 13, color: C.t3, marginTop: 8 }}>No patterns detected right now. Everything looks normal!</p>
              <p style={{ fontSize: 11, color: C.t3, marginTop: 4 }}>The engine compares recent activity against {baby?.name || "baby"}'s baseline and flags changes.</p>
            </div>
          ) : (
            insights.map((insight) => (
              <div key={insight.id} style={{ marginBottom: 12, padding: 14, borderRadius: 14, background: insight.color + "08", border: `1.5px solid ${insight.color}20` }}>
                {/* Header */}
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <span style={{ fontSize: 22 }}>{insight.emoji}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: insight.color }}>{insight.title}</div>
                    <div style={{ display: "inline-block", fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 8, background: confidenceLabel(insight.confidence).bg, color: confidenceLabel(insight.confidence).color, marginTop: 2 }}>
                      {confidenceLabel(insight.confidence).text}
                    </div>
                  </div>
                </div>

                {/* Message */}
                <p style={{ fontSize: 13, color: C.t2, lineHeight: 1.6, marginBottom: 8 }}>{insight.message}</p>

                {/* Tips */}
                <div style={{ padding: "8px 12px", borderRadius: 10, background: "white", border: `1px solid ${insight.color}15`, marginBottom: 10 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: insight.color, marginBottom: 2 }}>💛 What to do</div>
                  <div style={{ fontSize: 12, color: C.t2, lineHeight: 1.5 }}>{insight.tips}</div>
                </div>

                {/* Previous explanations for this pattern */}
                {patternNotes.filter((n) => n.insightId === insight.id && n.explanation).length > 0 && (
                  <div style={{ padding: "8px 12px", borderRadius: 10, background: C.priL, marginBottom: 10 }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: C.pri, marginBottom: 4 }}>📝 Your previous notes</div>
                    {patternNotes.filter((n) => n.insightId === insight.id && n.explanation).map((n, i) => (
                      <div key={i} style={{ fontSize: 12, color: C.t2, marginBottom: 2 }}>
                        "{n.explanation}" <span style={{ fontSize: 10, color: C.t3 }}>— {formatDate(n.createdAt)}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Interaction — expanded */}
                {selectedInsight === insight.id ? (
                  <div style={{ padding: 12, background: C.bg, borderRadius: 12 }}>
                    <label style={{ fontSize: 11, fontWeight: 600, color: C.t2, display: "block", marginBottom: 8 }}>What's actually happening?</label>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
                      {[
                        "We forgot to log some events",
                        "We're aware, it's normal for us",
                        "Baby is on a different schedule",
                        "We're traveling / routine changed",
                        "Doctor said it's fine",
                        "Started a new feeding approach",
                      ].map((reason) => (
                        <button key={reason} onClick={() => setExplanation(reason)} style={{ padding: "5px 10px", borderRadius: 12, border: `1px solid ${explanation === reason ? C.pri : C.border}`, background: explanation === reason ? C.priL : "white", fontSize: 11, cursor: "pointer", fontFamily: "inherit", color: explanation === reason ? C.pri : C.t2 }}>
                          {reason}
                        </button>
                      ))}
                    </div>
                    <input
                      style={{ ...S.input, fontSize: 13, marginBottom: 10 }}
                      value={explanation}
                      onChange={(e) => setExplanation(e.target.value)}
                      placeholder="Or type your own explanation..."
                    />
                    <div style={{ display: "flex", gap: 8 }}>
                      <button
                        onClick={() => handleExplain(insight)}
                        style={{ padding: "8px 16px", borderRadius: 10, background: C.pri, color: "white", border: "none", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", flex: 1 }}
                      >
                        Save & Remember
                      </button>
                      <button
                        onClick={() => { handleDismiss(insight, explanation || null); setSelectedInsight(null); setExplanation(""); }}
                        style={{ padding: "8px 16px", borderRadius: 10, background: C.borderL, color: C.t3, border: "none", fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}
                      >
                        Dismiss
                      </button>
                    </div>
                    <p style={{ fontSize: 10, color: C.t3, marginTop: 6 }}>Your explanation helps the engine learn your patterns and adjust future recommendations.</p>
                  </div>
                ) : (
                  /* Action buttons — collapsed */
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => handleAcknowledge(insight)} style={{ padding: "6px 14px", borderRadius: 10, background: insight.color, color: "white", border: "none", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                      📌 Acknowledge
                    </button>
                    <button onClick={() => { setSelectedInsight(insight.id); setExplanation(""); }} style={{ padding: "6px 14px", borderRadius: 10, background: "white", color: C.t2, border: `1px solid ${C.border}`, fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>
                      ✏️ Explain
                    </button>
                    <button onClick={() => handleDismiss(insight)} style={{ padding: "6px 14px", borderRadius: 10, background: C.borderL, color: C.t3, border: "none", fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>
                      ✕
                    </button>
                  </div>
                )}
              </div>
            ))
          )
        ) : (
          /* ---- HISTORY VIEW ---- */
          patternHistory.length === 0 ? (
            <div style={{ textAlign: "center", padding: 20 }}>
              <p style={{ fontSize: 13, color: C.t3 }}>No pattern history yet. Insights will appear here as they're detected and you interact with them.</p>
            </div>
          ) : (
            <div>
              {Object.entries(historyByPattern).map(([patternId, entries]) => {
                const latest = entries[0];
                const firstSeen = entries[entries.length - 1];
                const daySpan = Math.floor((new Date(latest.timestamp) - new Date(firstSeen.timestamp)) / 86400000);
                const userNotes = entries.filter((e) => e.userExplanation);
                return (
                  <div key={patternId} style={{ marginBottom: 12, padding: 12, borderRadius: 12, background: C.bg, border: `1px solid ${C.borderL}` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{latest.title || patternId}</div>
                      <div style={{ fontSize: 10, color: C.t3 }}>{entries.length} occurrence{entries.length !== 1 ? "s" : ""}</div>
                    </div>
                    <div style={{ fontSize: 11, color: C.t3, marginBottom: 6 }}>
                      First: {formatDate(firstSeen.timestamp)}{daySpan > 0 ? ` · Lasted ${daySpan} day${daySpan !== 1 ? "s" : ""}` : " · Same day"}
                    </div>
                    {userNotes.length > 0 && (
                      <div style={{ marginTop: 6 }}>
                        <div style={{ fontSize: 10, fontWeight: 600, color: C.pri, marginBottom: 4 }}>Your notes:</div>
                        {userNotes.map((n, i) => (
                          <div key={i} style={{ fontSize: 11, color: C.t2, marginBottom: 2, paddingLeft: 8, borderLeft: `2px solid ${C.pri}30` }}>
                            "{n.userExplanation}" <span style={{ color: C.t3 }}>— {n.action} on {formatDate(n.timestamp)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    <div style={{ display: "flex", gap: 4, marginTop: 6, flexWrap: "wrap" }}>
                      {entries.slice(0, 5).map((e, i) => (
                        <span key={i} style={{ fontSize: 9, padding: "2px 6px", borderRadius: 6, background: e.action === "acknowledged" ? "#10B98120" : e.action === "dismissed" ? C.borderL : e.action === "explained" ? C.priL : "#F59E0B20", color: e.action === "acknowledged" ? "#10B981" : e.action === "dismissed" ? C.t3 : e.action === "explained" ? C.pri : "#F59E0B" }}>
                          {e.action || "auto"} · {formatDate(e.timestamp)}
                        </span>
                      ))}
                      {entries.length > 5 && <span style={{ fontSize: 9, color: C.t3 }}>+{entries.length - 5} more</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          )
        )}
      </div>

      {/* ---- WEIGHT TRACKER ---- */}
      <div style={S.card}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: C.t2, textTransform: "uppercase", letterSpacing: "0.05em" }}>Weight Tracker</h3>
          <button style={{ ...S.btn("secondary"), padding: "6px 12px", fontSize: 12 }} onClick={() => onOpenLogger("weight")}><Icon name="plus" size={14} color={C.pri} /> Add</button>
        </div>
        {sortedWeights.length === 0 ? (
          <p style={{ fontSize: 13, color: C.t3, textAlign: "center", padding: 20 }}>No weights logged yet</p>
        ) : (
          <div>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 100, padding: "0 8px" }}>
              {sortedWeights.map((w, i) => {
                const max = Math.max(...sortedWeights.map((s) => s.weight));
                const min = Math.min(...sortedWeights.map((s) => s.weight));
                const range = max - min || 1;
                const height = 20 + ((w.weight - min) / range) * 70;
                return (
                  <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                    <span style={{ fontSize: 10, color: C.t3 }}>{w.weight}</span>
                    <div style={{ width: "100%", maxWidth: 24, height: `${height}%`, background: `linear-gradient(to top, ${C.weight}, ${C.weight}80)`, borderRadius: 4 }} />
                    <span style={{ fontSize: 9, color: C.t3 }}>{formatDate(w.date)}</span>
                  </div>
                );
              })}
            </div>
            <div style={{ marginTop: 12, textAlign: "center" }}>
              <span style={{ fontSize: 24, fontWeight: 700, color: C.weight }}>{sortedWeights[sortedWeights.length - 1].weight}</span>
              <span style={{ fontSize: 14, color: C.t3, marginLeft: 4 }}>{sortedWeights[sortedWeights.length - 1].unit}</span>
            </div>
          </div>
        )}
      </div>

      {/* ---- VACCINATION SCHEDULE ---- */}
      <div style={S.card}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: C.t2, textTransform: "uppercase", letterSpacing: "0.05em" }}>Vaccinations</h3>
          <button style={{ ...S.btn("secondary"), padding: "6px 12px", fontSize: 12 }} onClick={() => setShowVaccineAdd(true)}>
            <Icon name="plus" size={14} color={C.pri} /> Custom
          </button>
        </div>
        <div style={{ fontSize: 12, color: C.success, marginBottom: 8 }}>{givenVaccines.length}/{allVaccines.length} given</div>
        {(showAllVaccines ? allVaccines : relevantVaccines).map((v, i) => {
          const isDue = Math.abs(ageWeeks - v.weekDue) <= 2;
          const isEgypt = v.region === "egypt";
          const isCustom = v.region === "custom";
          const isGiven = givenVaccines.includes(v.name);
          return (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: `1px solid ${C.borderL}`, opacity: isGiven ? 0.6 : 1 }}>
              <button onClick={() => toggleVaccine(v.name)} style={{ width: 28, height: 28, borderRadius: 14, border: isGiven ? "none" : `2px solid ${C.border}`, background: isGiven ? C.success : "transparent", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
                {isGiven && <Icon name="check" size={14} color="white" />}
              </button>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
                  {v.name}
                  {isEgypt && <span style={{ fontSize: 9, background: "#009639" + "20", color: "#009639", padding: "1px 6px", borderRadius: 6, fontWeight: 700 }}>EG</span>}
                  {isCustom && <span style={{ fontSize: 9, background: C.pri + "20", color: C.pri, padding: "1px 6px", borderRadius: 6, fontWeight: 700 }}>Custom</span>}
                </div>
                <div style={{ fontSize: 11, color: C.t3 }}>{v.description} · Week {v.weekDue}</div>
              </div>
              {isGiven && <span style={{ fontSize: 10, fontWeight: 600, color: C.success, background: C.success + "20", padding: "2px 8px", borderRadius: 10 }}>Given</span>}
              {!isGiven && isDue && <span style={{ fontSize: 10, fontWeight: 600, color: C.warning, background: C.warning + "20", padding: "2px 8px", borderRadius: 10 }}>Due</span>}
            </div>
          );
        })}
        <button onClick={() => setShowAllVaccines(!showAllVaccines)} style={{ ...S.btn("ghost"), width: "100%", fontSize: 12, marginTop: 8, color: C.pri }}>{showAllVaccines ? "Show upcoming only" : "Show all vaccines"}</button>
      </div>

      <VaccineAdder isOpen={showVaccineAdd} onClose={() => setShowVaccineAdd(false)} onSave={(v) => { customVaccines.push(v); setShowVaccineAdd(false); }} />
    </div>
  );
};
