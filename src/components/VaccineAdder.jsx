// Custom Vaccine adder
const VaccineAdder = ({ isOpen, onClose, onSave }) => {
  const [name, setName] = useState(""); const [weekDue, setWeekDue] = useState(""); const [desc, setDesc] = useState("");
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Custom Vaccine">
      <p style={{ fontSize: 13, color: C.t2, marginBottom: 16 }}>Add a vaccination specific to Egypt or your doctor's recommendation.</p>
      <label style={S.label}>Vaccine Name</label>
      <input style={{ ...S.input, marginBottom: 12 }} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Meningococcal" />
      <label style={S.label}>Due at Week</label>
      <input style={{ ...S.input, marginBottom: 12 }} type="number" value={weekDue} onChange={(e) => setWeekDue(e.target.value)} placeholder="e.g. 24" />
      <label style={S.label}>Description</label>
      <input style={{ ...S.input, marginBottom: 20 }} value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="e.g. 6 months" />
      <button style={{ ...S.btn("primary"), width: "100%", opacity: name && weekDue ? 1 : 0.5 }} onClick={() => { if (name && weekDue) { onSave({ name, weekDue: parseInt(weekDue), description: desc || `Week ${weekDue}`, region: "custom" }); setName(""); setWeekDue(""); setDesc(""); onClose(); } }}>Add Vaccine</button>
    </Modal>
  );
};

// ============================================================
// CALENDAR PAGE — Month / Week / Day views (Google Calendar style)
// ============================================================
const HOURS = Array.from({ length: 24 }, (_, i) => i);
const HOUR_HEIGHT = 56;

