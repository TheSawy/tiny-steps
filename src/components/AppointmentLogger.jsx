import { useState } from "react";
import { C, S } from "../styles/theme.js";
import { generateId } from "../utils/helpers.js";
import { Icon } from "./Icon.jsx";
import { Modal } from "./Modal.jsx";

// ============================================================
// APPOINTMENT / VACCINATION LOGGER
// ============================================================
export const AppointmentLogger = ({ isOpen, onClose, onSave, customVaccines }) => {
  const [title, setTitle] = useState(""); const [date, setDate] = useState(""); const [time, setTime] = useState(""); const [aType, setAType] = useState("checkup"); const [notes, setNotes] = useState("");
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Appointment">
      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        <button style={S.chip(aType === "checkup", C.doctor)} onClick={() => setAType("checkup")}>🩺 Checkup</button>
        <button style={S.chip(aType === "vaccination", C.vaccine)} onClick={() => setAType("vaccination")}>💉 Vaccination</button>
        <button style={S.chip(aType === "other", C.pri)} onClick={() => setAType("other")}>📋 Other</button>
      </div>
      <label style={S.label}>Title</label>
      <input style={{ ...S.input, marginBottom: 12 }} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. 2-month checkup" />
      <label style={S.label}>Date</label>
      <input style={{ ...S.input, marginBottom: 12 }} type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      <label style={S.label}>Time</label>
      <input style={{ ...S.input, marginBottom: 12 }} type="time" value={time} onChange={(e) => setTime(e.target.value)} />
      <label style={S.label}>Notes</label>
      <input style={{ ...S.input, marginBottom: 20 }} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Doctor name, location..." />
      <button style={{ ...S.btn("primary"), width: "100%", opacity: date ? 1 : 0.5 }} onClick={() => { if (date) { onSave({ id: generateId(), title: title || (aType === "vaccination" ? "Vaccination" : "Doctor Visit"), date, time, type: aType, notes, completed: false }); setTitle(""); setDate(""); setTime(""); setNotes(""); onClose(); } }}>Save Appointment</button>
    </Modal>
  );
};

