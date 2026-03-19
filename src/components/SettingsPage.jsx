import { useState } from "react";
import { C, S } from "../styles/theme.js";
import { toDateKey } from "../utils/helpers.js";
import { WHO_MILESTONES } from "../data/constants.js";
import { Icon } from "./Icon.jsx";

export const SettingsPage = ({ state, onUpdateBaby, onUpdateSettings, onSignOut, userEmail }) => {
  const [babyName, setBabyName] = useState(state.baby?.name || "");
  const [birthDate, setBirthDate] = useState(state.baby?.birthDate || "");
  const [saved, setSaved] = useState(false);

  const handleSave = () => { onUpdateBaby({ name: babyName, birthDate: birthDate || null }); setSaved(true); setTimeout(() => setSaved(false), 2000); };

  const exportCSV = () => {
    const rows = [["Timestamp", "Type", "Details", "Duration (min)", "Notes"]];
    state.events.forEach((e) => {
      let details = "";
      if (e.type === "feed") details = `${e.feedType}${e.side ? " " + e.side : ""}${e.amount ? " " + e.amount + "ml" : ""}`;
      else if (e.type === "diaper") details = `${e.content}${e.stoolColor ? " " + e.stoolColor : ""}`;
      else if (e.type === "sleep") details = "sleep";
      else if (e.type === "activity") details = e.activityTitle || "";
      rows.push([new Date(e.timestamp).toISOString(), e.type, details, e.duration ? Math.round(e.duration / 60000) : "", e.notes || ""]);
    });
    state.weightLog.forEach((w) => rows.push([new Date(w.date).toISOString(), "weight", `${w.weight} ${w.unit}`, "", ""]));
    state.appointments.forEach((a) => rows.push([a.date, "appointment", `${a.title} (${a.type})`, "", a.notes || ""]));
    state.milestones.filter((m) => m.achievedDate).forEach((m) => {
      const ms = WHO_MILESTONES.find((w) => w.id === m.milestoneId);
      rows.push([m.achievedDate, "milestone", ms ? ms.title : m.milestoneId, "", ""]);
    });
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `tiny-steps-${state.baby?.name || "baby"}-${toDateKey(new Date())}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={S.page}>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>Settings</h2>

      {/* Baby Profile */}
      <div style={S.card}>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: C.t2, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 16 }}>Baby Profile</h3>
        <label style={S.label}>Name</label>
        <input style={{ ...S.input, marginBottom: 12 }} value={babyName} onChange={(e) => setBabyName(e.target.value)} />
        <label style={S.label}>Birth Date</label>
        <input style={{ ...S.input, marginBottom: 16 }} type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} />
        <button style={{ ...S.btn("primary"), width: "100%" }} onClick={handleSave}>{saved ? "✓ Saved!" : "Save Changes"}</button>
      </div>

      {/* Family Sharing */}
      <div style={{ ...S.card, background: "linear-gradient(135deg, #667eea10, #764ba210)" }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: C.t2, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 12 }}>
          <Icon name="share" size={16} /> Family Sharing
        </h3>
        <p style={{ fontSize: 13, color: C.t2, lineHeight: 1.6, marginBottom: 12 }}>
          Share this code with your wife so she can sync everything on her phone. Both of you will see real-time updates.
        </p>
        <div style={{ background: "white", borderRadius: 12, padding: 16, textAlign: "center", border: `2px dashed ${C.pri}` }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: C.t3, marginBottom: 4, textTransform: "uppercase" }}>Family Code</div>
          <div style={{ fontSize: 32, fontWeight: 700, color: C.pri, letterSpacing: "0.2em", fontVariantNumeric: "tabular-nums" }}>{state.familyCode || "------"}</div>
        </div>
        <p style={{ fontSize: 11, color: C.t3, marginTop: 8, textAlign: "center" }}>
          Your wife opens the app → "Join Partner's Account" → enters this code
        </p>
        <div style={{ ...S.card, background: C.success + "10", border: `1px solid ${C.success}20`, marginTop: 12, marginBottom: 0, padding: 12 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: C.success, marginBottom: 4 }}>🔄 Real-time Sync via Firebase</div>
          <div style={{ fontSize: 11, color: C.t2 }}>When connected to Firebase, both parents see every event, timer, and update instantly.</div>
        </div>
      </div>

      {/* AI Provider */}
      <div style={S.card}>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: C.t2, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 16 }}>AI Provider</h3>
        <div style={{ display: "flex", gap: 8 }}>
          <button style={S.chip(state.settings.aiProvider === "claude", C.pri)} onClick={() => onUpdateSettings({ aiProvider: "claude" })}>Claude</button>
          <button style={S.chip(state.settings.aiProvider === "openai", C.pri)} onClick={() => onUpdateSettings({ aiProvider: "openai" })}>GPT</button>
        </div>
      </div>

      {/* Export */}
      <div style={S.card}>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: C.t2, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 12 }}>Export Data</h3>
        <p style={{ fontSize: 13, color: C.t2, marginBottom: 12 }}>Download all tracking data as a CSV file.</p>
        <button style={{ ...S.btn("secondary"), width: "100%" }} onClick={exportCSV}>
          <Icon name="download" size={16} color={C.pri} /> Download CSV
        </button>
      </div>

      {/* Notifications */}
      <div style={S.card}>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: C.t2, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 12 }}>Push Notifications</h3>
        <p style={{ fontSize: 13, color: C.t2, marginBottom: 12 }}>Get notified for feed/sleep/diaper windows, partner events, and appointments.</p>
        <button style={{ ...S.btn("primary"), width: "100%" }} onClick={async () => { try { const perm = await Notification.requestPermission(); if (perm === "granted") { const { requestNotifications } = await import("../lib/notifications.js"); const { auth } = await import("../lib/firebase.js"); await requestNotifications(auth.currentUser?.uid); alert("Notifications enabled!"); } else { alert("Please allow notifications in your device settings."); } } catch(e) { alert("Error: " + e.message); } }}>
          Enable Notifications
        </button>
      </div>

      {/* Sign Out */}
      {onSignOut && (
        <div style={S.card}>
          <button style={{ ...S.btn("danger"), width: "100%" }} onClick={onSignOut}>
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
};
