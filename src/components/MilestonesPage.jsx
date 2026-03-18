// ============================================================
// MILESTONES (Gantt Chart)
// ============================================================
const MilestonesPage = ({ state, onToggle }) => {
  const [view, setView] = useState("gantt");
  const [catFilter, setCatFilter] = useState("all");
  const [selected, setSelected] = useState(null);
  const ageWeeks = state.baby?.birthDate ? getBabyAgeWeeks(state.baby.birthDate) : 0;
  const maxW = Math.max(52, ageWeeks + 8);
  const achievedMap = {};
  state.milestones.forEach((m) => { achievedMap[m.milestoneId] = m.achievedDate; });
  const filtered = WHO_MILESTONES.filter((m) => catFilter === "all" || m.category === catFilter);
  const cc = { physical: C.physical, cognitive: C.cognitive, social: C.social, language: C.language };

  return (
    <div style={S.page}>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Milestones</h2>
      <p style={{ fontSize: 13, color: C.t2, marginBottom: 16 }}>Week {ageWeeks} · {state.milestones.filter((m) => m.achievedDate).length}/{WHO_MILESTONES.length} achieved</p>
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <button style={S.chip(view === "gantt", C.pri)} onClick={() => setView("gantt")}>Gantt</button>
        <button style={S.chip(view === "list", C.pri)} onClick={() => setView("list")}>Checklist</button>
      </div>
      <div style={{ display: "flex", gap: 6, marginBottom: 16, overflowX: "auto" }}>
        <button style={S.chip(catFilter === "all", C.pri)} onClick={() => setCatFilter("all")}>All</button>
        {["physical", "cognitive", "social", "language"].map((c) => (<button key={c} style={S.chip(catFilter === c, cc[c])} onClick={() => setCatFilter(c)}>{c.charAt(0).toUpperCase() + c.slice(1)}</button>))}
      </div>

      {view === "gantt" ? (
        <div style={{ ...S.card, padding: 12, overflowX: "auto" }}>
          <div style={{ display: "flex", borderBottom: `1px solid ${C.border}`, paddingBottom: 8, marginBottom: 8, minWidth: 600 }}>
            <div style={{ width: 130, flexShrink: 0, fontSize: 11, fontWeight: 600, color: C.t3 }}>Milestone</div>
            <div style={{ flex: 1, display: "flex" }}>
              {Array.from({ length: Math.ceil(maxW / 4) }, (_, i) => (
                <div key={i} style={{ flex: 1, fontSize: 9, color: C.t3, textAlign: "center", borderLeft: `1px solid ${C.borderL}` }}>{i * 4 < 52 ? `W${i * 4}` : `M${Math.round(i * 4 / 4.33)}`}</div>
              ))}
            </div>
          </div>
          <div style={{ position: "relative", minWidth: 600 }}>
            {filtered.map((m) => {
              const left = (m.weekStart / maxW) * 100, width = ((m.weekEnd - m.weekStart) / maxW) * 100;
              const isAch = !!achievedMap[m.id], inR = ageWeeks >= m.weekStart && ageWeeks <= m.weekEnd;
              const color = cc[m.category];
              return (
                <div key={m.id} style={{ display: "flex", alignItems: "center", height: 30, marginBottom: 3 }}>
                  <div style={{ width: 130, flexShrink: 0, fontSize: 11, fontWeight: inR ? 600 : 400, color: isAch ? C.success : inR ? C.text : C.t3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{isAch && "✓ "}{m.title}</div>
                  <div style={{ flex: 1, position: "relative", height: 30 }}>
                    <div onClick={() => setSelected(m)} style={{ position: "absolute", top: 3, left: `${left}%`, width: `${width}%`, height: 22, background: isAch ? color : color + "30", border: isAch ? "none" : `2px solid ${color}`, borderRadius: 11, cursor: "pointer", minWidth: 8 }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        filtered.map((m) => {
          const isAch = !!achievedMap[m.id], inR = ageWeeks >= m.weekStart && ageWeeks <= m.weekEnd;
          return (
            <div key={m.id} style={{ ...S.card, display: "flex", alignItems: "center", gap: 12, border: inR ? `2px solid ${cc[m.category]}` : undefined }}>
              <button onClick={() => onToggle(m.id)} style={{ width: 28, height: 28, borderRadius: 14, border: isAch ? "none" : `2px solid ${C.border}`, background: isAch ? C.success : "transparent", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
                {isAch && <Icon name="check" size={14} color="white" />}
              </button>
              <div style={{ flex: 1 }} onClick={() => setSelected(m)}>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{m.title}</div>
                <div style={{ fontSize: 12, color: C.t3 }}><span style={{ color: cc[m.category], fontWeight: 600 }}>{m.category}</span> · W{m.weekStart}-{m.weekEnd}</div>
              </div>
              {inR && <span style={{ fontSize: 10, fontWeight: 600, color: cc[m.category], background: cc[m.category] + "20", padding: "2px 8px", borderRadius: 10 }}>Now</span>}
            </div>
          );
        })
      )}

      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title={selected?.title || ""}>
        {selected && (
          <div>
            <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: cc[selected.category], background: cc[selected.category] + "20", padding: "4px 12px", borderRadius: 10 }}>{selected.category}</span>
              <span style={{ fontSize: 12, color: C.t3, padding: "4px 0" }}>Week {selected.weekStart}-{selected.weekEnd}</span>
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

// ============================================================
// AI CHAT
// ============================================================
