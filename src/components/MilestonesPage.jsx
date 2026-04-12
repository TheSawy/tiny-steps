import { useState, useMemo, useRef, useEffect } from "react";
import { C, S } from "../styles/theme.js";
import { getBabyAgeWeeks, getBabyDisplayWeek } from "../utils/helpers.js";
import { WHO_MILESTONES } from "../data/constants.js";
import { WEEKLY_EXPECTATIONS } from "../data/weeklyExpectations.js";
import { Icon } from "./Icon.jsx";
import { Modal } from "./Modal.jsx";

export const MilestonesPage = ({ state, onToggle }) => {
  const [view, setView] = useState("timeline");
  const [catFilter, setCatFilter] = useState("all");
  const [selected, setSelected] = useState(null);
  const ageWeeks = state.baby?.birthDate ? getBabyAgeWeeks(state.baby.birthDate) : 0;
  const displayWeek = state.baby?.birthDate ? getBabyDisplayWeek(state.baby.birthDate) : 1;
  const maxW = Math.max(52, ageWeeks + 8);
  const achievedMap = {};
  state.milestones.forEach((m) => { achievedMap[m.milestoneId] = m.achievedDate; });
  const filtered = WHO_MILESTONES.filter((m) => catFilter === "all" || m.category === catFilter);
  const cc = { physical: C.physical, cognitive: C.cognitive, social: C.social, language: C.language };

  const currentWeekRef = useRef(null);
  useEffect(() => {
    if (view === "timeline" && currentWeekRef.current) {
      currentWeekRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [view]);

  return (
    <div style={S.page}>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Milestones</h2>
      <p style={{ fontSize: 13, color: C.t2, marginBottom: 16 }}>Week {displayWeek} · {state.milestones.filter((m) => m.achievedDate).length}/{WHO_MILESTONES.length} achieved</p>

      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <button style={S.chip(view === "timeline", C.pri)} onClick={() => setView("timeline")}>📅 Timeline</button>
        <button style={S.chip(view === "gantt", C.pri)} onClick={() => setView("gantt")}>Gantt</button>
        <button style={S.chip(view === "list", C.pri)} onClick={() => setView("list")}>Checklist</button>
      </div>

      {view !== "timeline" && (
        <div style={{ display: "flex", gap: 6, marginBottom: 16, overflowX: "auto" }}>
          <button style={S.chip(catFilter === "all", C.pri)} onClick={() => setCatFilter("all")}>All</button>
          {["physical", "cognitive", "social", "language"].map((c) => (<button key={c} style={S.chip(catFilter === c, cc[c])} onClick={() => setCatFilter(c)}>{c.charAt(0).toUpperCase() + c.slice(1)}</button>))}
        </div>
      )}

      {/* TIMELINE VIEW */}
      {view === "timeline" && (
        <div>
          {WEEKLY_EXPECTATIONS.map((w) => {
            const isCurrent = w.week === displayWeek;
            const isPast = w.week < displayWeek;
            return (
              <div key={w.week} ref={isCurrent ? currentWeekRef : null} style={{
                ...S.card, padding: 14,
                border: isCurrent ? `2px solid ${C.pri}` : w.regression ? `1.5px solid ${C.sleep}30` : w.spurt ? `1.5px solid ${C.feed}30` : `1px solid ${C.borderL}`,
                opacity: isPast ? 0.55 : 1,
                background: isCurrent ? C.priL : w.regression ? C.sleepL + "40" : w.spurt ? C.feedL + "40" : C.card,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 15, fontWeight: 700, color: isCurrent ? C.pri : C.text }}>Week {w.week}</span>
                    {isCurrent && <span style={{ fontSize: 10, fontWeight: 700, color: "white", background: C.pri, padding: "2px 8px", borderRadius: 8 }}>NOW</span>}
                    {w.spurt && <span style={{ fontSize: 10, fontWeight: 600, color: C.feed, background: C.feedL, padding: "2px 8px", borderRadius: 8 }}>📈 Spurt</span>}
                    {w.regression && <span style={{ fontSize: 10, fontWeight: 600, color: C.sleep, background: C.sleepL, padding: "2px 8px", borderRadius: 8 }}>🔄 Regression</span>}
                  </div>
                  {isPast && <span style={{ fontSize: 10, color: C.success }}>✓</span>}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 6 }}>
                  <div style={{ background: C.feedL, borderRadius: 10, padding: "8px 10px", textAlign: "center" }}>
                    <div style={{ fontSize: 9, fontWeight: 600, color: C.t3 }}>FEEDS</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: C.feed }}>{w.feeds}</div>
                    <div style={{ fontSize: 9, color: C.t3 }}>{w.feedDuration} each</div>
                  </div>
                  <div style={{ background: C.feedL, borderRadius: 10, padding: "8px 10px", textAlign: "center" }}>
                    <div style={{ fontSize: 9, fontWeight: 600, color: C.t3 }}>EXPRESSION</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: C.feed }}>{w.expressionMl}</div>
                    <div style={{ fontSize: 9, color: C.t3 }}>per session</div>
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 6 }}>
                  <div style={{ background: C.sleepL, borderRadius: 10, padding: "8px 10px", textAlign: "center" }}>
                    <div style={{ fontSize: 9, fontWeight: 600, color: C.t3 }}>TOTAL SLEEP</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: C.sleep }}>{w.totalSleep}</div>
                    <div style={{ fontSize: 9, color: C.t3 }}>{w.naps} naps · {w.napDuration}</div>
                  </div>
                  <div style={{ background: C.sleepL, borderRadius: 10, padding: "8px 10px", textAlign: "center" }}>
                    <div style={{ fontSize: 9, fontWeight: 600, color: C.t3 }}>LONGEST NIGHT</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: C.sleep }}>{w.nightSleep}</div>
                    <div style={{ fontSize: 9, color: C.t3 }}>stretch</div>
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 6, marginBottom: 10 }}>
                  <div style={{ background: C.diaperL, borderRadius: 10, padding: "8px 10px", textAlign: "center" }}>
                    <div style={{ fontSize: 9, fontWeight: 600, color: C.t3 }}>DIAPERS</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: C.diaper }}>{w.diapers}<span style={{ fontSize: 10, fontWeight: 400, color: C.t3 }}> /day</span></div>
                  </div>
                </div>
                <p style={{ fontSize: 12, color: isCurrent ? C.text : C.t2, lineHeight: 1.5 }}>{w.mood}</p>
              </div>
            );
          })}
          <div style={{ textAlign: "center", padding: 20, color: C.t3, fontSize: 13 }}>More weeks coming as {state.baby?.name || "baby"} grows 💛</div>
        </div>
      )}

      {/* GANTT VIEW */}
      {view === "gantt" && (
        <div style={{ ...S.card, padding: 12, overflowX: "auto" }}>
          <div style={{ display: "flex", borderBottom: `1px solid ${C.border}`, paddingBottom: 8, marginBottom: 8, minWidth: 600 }}>
            <div style={{ width: 130, flexShrink: 0, fontSize: 11, fontWeight: 600, color: C.t3 }}>Milestone</div>
            <div style={{ flex: 1, display: "flex" }}>
              {Array.from({ length: Math.ceil(maxW / 4) }, (_, i) => (
                <div key={i} style={{ flex: 1, fontSize: 9, color: C.t3, textAlign: "center", borderLeft: `1px solid ${C.borderL}` }}>{i * 4 < 52 ? `W${i * 4 + 1}` : `M${Math.round(i * 4 / 4.33)}`}</div>
              ))}
            </div>
          </div>
          <div style={{ position: "relative", minWidth: 600 }}>
            {filtered.map((m) => {
              const left = (m.weekStart / maxW) * 100, width = ((m.weekEnd - m.weekStart) / maxW) * 100;
              const isAch = !!achievedMap[m.id], inR = ageWeeks >= m.weekStart && ageWeeks <= m.weekEnd;
              return (
                <div key={m.id} style={{ display: "flex", alignItems: "center", height: 30, marginBottom: 3 }}>
                  <div style={{ width: 130, flexShrink: 0, fontSize: 11, fontWeight: inR ? 600 : 400, color: isAch ? C.success : inR ? C.text : C.t3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{isAch && "✓ "}{m.title}</div>
                  <div style={{ flex: 1, position: "relative", height: 30 }}>
                    <div onClick={() => setSelected(m)} style={{ position: "absolute", top: 3, left: `${left}%`, width: `${width}%`, height: 22, background: isAch ? cc[m.category] : cc[m.category] + "30", border: isAch ? "none" : `2px solid ${cc[m.category]}`, borderRadius: 11, cursor: "pointer", minWidth: 8 }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* CHECKLIST VIEW */}
      {view === "list" && filtered.map((m) => {
        const isAch = !!achievedMap[m.id], inR = ageWeeks >= m.weekStart && ageWeeks <= m.weekEnd;
        return (
          <div key={m.id} style={{ ...S.card, display: "flex", alignItems: "center", gap: 12, border: inR ? `2px solid ${cc[m.category]}` : undefined }}>
            <button onClick={() => onToggle(m.id)} style={{ width: 28, height: 28, borderRadius: 14, border: isAch ? "none" : `2px solid ${C.border}`, background: isAch ? C.success : "transparent", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
              {isAch && <Icon name="check" size={14} color="white" />}
            </button>
            <div style={{ flex: 1 }} onClick={() => setSelected(m)}>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{m.title}</div>
              <div style={{ fontSize: 12, color: C.t3 }}><span style={{ color: cc[m.category], fontWeight: 600 }}>{m.category}</span> · W{m.weekStart + 1}–{m.weekEnd + 1}</div>
            </div>
            {inR && <span style={{ fontSize: 10, fontWeight: 600, color: cc[m.category], background: cc[m.category] + "20", padding: "2px 8px", borderRadius: 10 }}>Now</span>}
          </div>
        );
      })}

      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title={selected?.title || ""}>
        {selected && (
          <div>
            <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: cc[selected.category], background: cc[selected.category] + "20", padding: "4px 12px", borderRadius: 10 }}>{selected.category}</span>
              <span style={{ fontSize: 12, color: C.t3, padding: "4px 0" }}>Week {selected.weekStart + 1}–{selected.weekEnd + 1}</span>
            </div>
            <p style={{ fontSize: 14, color: C.t2, lineHeight: 1.6, marginBottom: 20 }}>{selected.description}</p>
            <button style={{ ...S.btn(achievedMap[selected.id] ? "danger" : "primary"), width: "100%" }} onClick={() => { onToggle(selected.id); setSelected(null); }}>
              {achievedMap[selected.id] ? "Unmark" : "Mark as Achieved ✓"}
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
};
