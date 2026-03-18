// ============================================================
// WEIGHT LOGGER
// ============================================================
const WeightLogger = ({ isOpen, onClose, onSave }) => {
  const [weight, setWeight] = useState(""); const [unit, setUnit] = useState("kg");
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Log Weight">
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <button style={S.chip(unit === "kg", C.weight)} onClick={() => setUnit("kg")}>kg</button>
        <button style={S.chip(unit === "lb", C.weight)} onClick={() => setUnit("lb")}>lb</button>
      </div>
      <label style={S.label}>Weight</label>
      <input style={{ ...S.input, marginBottom: 20 }} type="number" step="0.01" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder={unit === "kg" ? "3.5" : "7.7"} />
      <button style={{ ...S.btn("primary"), width: "100%", background: C.weight, opacity: weight ? 1 : 0.5 }} onClick={() => { if (weight) { onSave({ id: generateId(), date: new Date().toISOString(), weight: parseFloat(weight), unit }); setWeight(""); onClose(); } }}>Save Weight</button>
    </Modal>
  );
};

// ============================================================
// APPOINTMENT / VACCINATION LOGGER
// ============================================================
