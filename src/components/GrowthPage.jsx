import { useState } from "react";
import { C, S } from "../styles/theme.js";
import { getBabyAgeWeeks, formatAge, formatDate, formatDateFull } from "../utils/helpers.js";
import { WHO_MILESTONES, VACCINATION_SCHEDULE_BASE } from "../data/constants.js";
import { Icon } from "./Icon.jsx";
import { VaccineAdder } from "./VaccineAdder.jsx";

// ============================================================
// CALENDAR PAGE — Month / Week / Day views (Google Calendar style)
// ============================================================
export const GrowthPage = ({ state, onOpenLogger, customVaccines }) => {
  const { weightLog, appointments, baby } = state;
  const ageWeeks = baby?.birthDate ? getBabyAgeWeeks(baby.birthDate) : 0;
  const [showVaccineAdd, setShowVaccineAdd] = useState(false);
  const [givenVaccines, setGivenVaccines] = useState(() => { try { return JSON.parse(localStorage.getItem("given_vaccines") || "[]"); } catch(e) { return []; } });
  const toggleVaccine = (name) => { setGivenVaccines((p) => { const next = p.includes(name) ? p.filter((n) => n !== name) : [...p, name]; localStorage.setItem("given_vaccines", JSON.stringify(next)); return next; }); };
  const [showAllVaccines, setShowAllVaccines] = useState(false);

  const allVaccines = [...VACCINATION_SCHEDULE_BASE, ...customVaccines].sort((a, b) => a.weekDue - b.weekDue);
  const relevantVaccines = allVaccines.filter((v) => v.weekDue >= ageWeeks - 4).slice(0, 8);
  const sortedWeights = [...weightLog].sort((a, b) => new Date(a.date) - new Date(b.date));

  return (
    <div style={S.page}>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>Growth & Health</h2>

      {/* Weight */}
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

      {/* Vaccination Schedule */}
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

      {/* Appointments */}
      <div style={S.card}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: C.t2, textTransform: "uppercase", letterSpacing: "0.05em" }}>Appointments</h3>
          <button style={{ ...S.btn("secondary"), padding: "6px 12px", fontSize: 12 }} onClick={() => onOpenLogger("appointment")}><Icon name="plus" size={14} color={C.pri} /> Add</button>
        </div>
        {appointments.length === 0 ? (
          <p style={{ fontSize: 13, color: C.t3, textAlign: "center", padding: 20 }}>No appointments yet</p>
        ) : (
          appointments.sort((a, b) => new Date(a.date) - new Date(b.date)).map((a) => (
            <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: `1px solid ${C.borderL}` }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: a.type === "vaccination" ? C.vaccineL : C.doctorL, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>{a.type === "vaccination" ? "💉" : "🩺"}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{a.title}</div>
                <div style={{ fontSize: 11, color: C.t3 }}>{formatDate(a.date)}{a.time ? ` at ${a.time}` : ""}</div>
              </div>
            </div>
          ))
        )}
      </div>

      <VaccineAdder isOpen={showVaccineAdd} onClose={() => setShowVaccineAdd(false)} onSave={(v) => { customVaccines.push(v); setShowVaccineAdd(false); }} />
    </div>
  );
};
