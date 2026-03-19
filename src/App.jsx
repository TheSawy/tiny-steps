import { useState, useEffect } from "react";
import { C, S } from "./styles/theme.js";
import { generateId, getBabyAgeWeeks, getLastEvent, getAgeRecommendations } from "./utils/helpers.js";
import { detectPatterns } from "./utils/patterns.js";
import { INITIAL_STATE, WHO_MILESTONES, VACCINATION_SCHEDULE_BASE, STANDARD_CHECKUPS } from "./data/constants.js";

// Components
import { Icon } from "./components/Icon.jsx";
import { FontLoader } from "./components/FontLoader.jsx";
import { Dashboard } from "./components/Dashboard.jsx";
import { TrendsDashboard } from "./components/TrendsDashboard.jsx";
import { DoctorSummary } from "./components/DoctorSummary.jsx";
import { ActivitiesPage } from "./components/ActivitiesPage.jsx";
import { MilestonesPage } from "./components/MilestonesPage.jsx";
import { GrowthPage } from "./components/GrowthPage.jsx";
import { SettingsPage } from "./components/SettingsPage.jsx";
import { FeedLogger } from "./components/FeedLogger.jsx";
import { DiaperLogger } from "./components/DiaperLogger.jsx";
import { SleepLogger } from "./components/SleepLogger.jsx";
import { WeightLogger } from "./components/WeightLogger.jsx";
import { AppointmentLogger } from "./components/AppointmentLogger.jsx";
import { AuthScreen } from "./components/AuthScreen.jsx";

// ============================================================
// MAIN APP — Firebase-connected
// ============================================================
export default function App() {
  const [user, setUser] = useState(null);
  const [familyId, setFamilyId] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [state, setState] = useState(INITIAL_STATE);
  const [tab, setTab] = useState("home");
  const [modal, setModal] = useState(null);
  const [customVaccines, setCustomVaccines] = useState([]);

  const update = (u) => setState((p) => ({ ...p, ...u }));

  // Listen for auth changes
  useEffect(() => {
    let unsub;
    const init = async () => {
      const { onAuthChange, getUserFamily } = await import("./lib/auth.js");
      unsub = onAuthChange(async (fbUser) => {
        if (fbUser) {
          setUser(fbUser);
          const fid = await getUserFamily(fbUser.uid);
          setFamilyId(fid);
        } else {
          setUser(null);
          setFamilyId(null);
        }
        setAuthLoading(false);
      });
    };
    init();
    return () => unsub && unsub();
  }, []);

  // Listen for family data in real-time
  useEffect(() => {
    if (!familyId) return;
    const unsubs = [];
    const init = async () => {
      const fs = await import("./lib/firestore.js");
      unsubs.push(fs.onFamilyChange(familyId, (fam) => {
        update({ baby: fam.baby, familyCode: fam.code, parentName: fam.memberNames?.[user?.uid] || "", settings: fam.settings || { aiProvider: "claude" } });
      }));
      unsubs.push(fs.onAllEvents(familyId, (events) => update({ events })));
      unsubs.push(fs.onWeights(familyId, (weightLog) => update({ weightLog })));
      unsubs.push(fs.onAppointments(familyId, (appointments) => update({ appointments })));
      unsubs.push(fs.onMilestones(familyId, (milestonesMap) => {
        const milestones = WHO_MILESTONES.map((m) => ({ milestoneId: m.id, achievedDate: milestonesMap[m.id] || null }));
        update({ milestones });
      }));
      unsubs.push(fs.onCalEvents(familyId, (calendarEvents) => update({ calendarEvents })));
      unsubs.push(fs.onCustomVaccines(familyId, (cv) => setCustomVaccines(cv)));
      unsubs.push(fs.onContextNotes(familyId, (contextNotes) => update({ contextNotes })));
      unsubs.push(fs.onHealthLog(familyId, (healthLog) => update({ healthLog })));
      unsubs.push(fs.onTimers(familyId, (activeTimers) => update({ activeTimers })));
    };
    init();
    return () => unsubs.forEach((u) => typeof u === "function" && u());
  }, [familyId, user]);

  // Firebase-backed actions
  const addEvent = async (e) => { const fs = await import("./lib/firestore.js"); await fs.addEvent(familyId, e); };
  const addAppointment = async (a) => { const fs = await import("./lib/firestore.js"); await fs.addAppointment(familyId, a); };
  const addWeight = async (w) => { const fs = await import("./lib/firestore.js"); await fs.addWeight(familyId, w); };
  const addCalendarEvent = async (e) => { const fs = await import("./lib/firestore.js"); await fs.addCalEvent(familyId, e); };
  const toggleMilestone = async (id) => {
    const fs = await import("./lib/firestore.js");
    const current = state.milestones.find((m) => m.milestoneId === id);
    await fs.setMilestone(familyId, id, current?.achievedDate ? null : new Date().toISOString());
  };
  const startTimer = async (t) => { const fs = await import("./lib/firestore.js"); await fs.setTimer(familyId, t, new Date().toISOString()); };
  const stopTimer = async (t) => { const fs = await import("./lib/firestore.js"); await fs.clearTimer(familyId, t); };
  const addContextNote = async (note) => { const fs = await import("./lib/firestore.js"); await fs.addContextNote(familyId, note); };
  const addHealthLog = async (entry) => { const fs = await import("./lib/firestore.js"); await fs.addHealthLog(familyId, entry); };
  const addAppointmentNote = async (label, detail) => {
    const upcoming = state.appointments.filter((a) => !a.completed && new Date(a.date) >= new Date()).sort((a, b) => new Date(a.date) - new Date(b.date));
    if (upcoming.length > 0) {
      const fs = await import("./lib/firestore.js");
      const appt = upcoming[0];
      const newNote = `[AI] ${label}: ${detail}`;
      await fs.updateAppointment(familyId, appt.id, { notes: appt.notes ? `${appt.notes}\n${newNote}` : newNote });
    } else {
      await addAppointment({ id: generateId(), title: `Doctor Visit — ${label}`, date: new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0], time: "", type: "checkup", notes: `[AI] ${label}: ${detail}`, completed: false });
    }
  };
  const updateBaby = async (baby) => { const fs = await import("./lib/firestore.js"); await fs.updateBaby(familyId, baby); };
  const updateSettings = async (settings) => { const fs = await import("./lib/firestore.js"); await fs.updateSettings(familyId, { ...state.settings, ...settings }); };
  const handleSignOut = async () => { const { signOut } = await import("./lib/auth.js"); await signOut(); };

  const ageWeeks = state.baby?.birthDate ? getBabyAgeWeeks(state.baby.birthDate) : null;
  const lastFeed = getLastEvent(state.events, "feed");
  const lastSleep = getLastEvent(state.events, "sleep");
  const lastDiaper = getLastEvent(state.events, "diaper");
  const recs = ageWeeks !== null ? getAgeRecommendations(ageWeeks) : null;

  // ---- PATTERN LIFECYCLE LOGGING ----
  // Log detected patterns to healthLog (max once per pattern per day)
  useEffect(() => {
    if (!familyId || !state.baby?.birthDate || state.events.length < 5) return;
    const patterns = detectPatterns(state.events, state.baby, state.contextNotes, state.healthLog || []);
    const active = patterns.filter((p) => p.patternId && p.confidence !== "unlikely" && p.confidence !== "good_news");
    if (active.length === 0) return;

    const today = new Date().toISOString().split("T")[0];
    const loggedToday = (state.healthLog || []).filter((h) => h.patternId && h.timestamp?.startsWith?.(today)).map((h) => h.patternId);
    const toLog = active.filter((p) => !loggedToday.includes(p.patternId));
    if (toLog.length === 0) return;

    const log = async () => {
      const fs = await import("./lib/firestore.js");
      for (const p of toLog) {
        await fs.addHealthLog(familyId, { patternId: p.patternId, title: p.title, confidence: p.confidence, timestamp: new Date().toISOString(), auto: true });
      }
    };
    log().catch(console.error);
  }, [familyId, state.events.length, state.baby?.birthDate]);

  // ---- LOCAL NOTIFICATION SCHEDULING ----
  useEffect(() => {
    if (!recs || !state.baby?.name) return;
    if (typeof Notification === "undefined" || Notification.permission !== "granted") return;
    const timers = [];
    const schedule = (title, body, delayMs) => {
      if (delayMs > 0 && delayMs < 86400000) {
        timers.push(setTimeout(() => new Notification(title, { body, icon: "/icons/icon-192.png", tag: title, vibrate: [200, 100, 200] }), delayMs));
      }
    };
    const name = state.baby.name;
    if (lastFeed) {
      const nextMs = new Date(lastFeed.timestamp).getTime() + recs.feedInterval * 60000 - Date.now();
      schedule(`🍼 Feed time for ${name}`, `It's been ~${Math.round(recs.feedInterval / 60)}h since the last feed.`, nextMs);
      schedule(`🍼 ${name} might be hungry`, `Feed window passed ${Math.round(recs.feedInterval / 60 * 0.3)}min ago.`, nextMs + recs.feedInterval * 60000 * 0.3);
    }
    if (lastSleep) {
      const sleepEnd = lastSleep.endTime || lastSleep.timestamp;
      schedule(`😴 Nap time for ${name}`, `Wake window is ending. Watch for sleepy cues!`, new Date(sleepEnd).getTime() + recs.sleepWake * 60000 - Date.now());
    }
    if (lastDiaper) {
      schedule(`🧷 Diaper check for ${name}`, `It's been a while since the last change.`, new Date(lastDiaper.timestamp).getTime() + recs.diaperInterval * 60000 - Date.now());
    }
    return () => timers.forEach((t) => clearTimeout(t));
  }, [lastFeed?.timestamp, lastSleep?.timestamp, lastDiaper?.timestamp, recs, state.baby?.name]);

  // ---- AUTO-POPULATE CALENDAR WITH VACCINATIONS ----
  useEffect(() => {
    if (!familyId || !state.baby?.birthDate || !state.calendarEvents) return;
    if (state.calendarEvents.some((e) => e.autoType === "vaccine")) return;
    const populate = async () => {
      const fs = await import("./lib/firestore.js");
      const birthDate = new Date(state.baby.birthDate);
      for (const vax of VACCINATION_SCHEDULE_BASE) {
        const dueDate = new Date(birthDate); dueDate.setDate(dueDate.getDate() + vax.weekDue * 7);
        const dateStr = `${dueDate.getFullYear()}-${String(dueDate.getMonth() + 1).padStart(2, "0")}-${String(dueDate.getDate()).padStart(2, "0")}`;
        await fs.addCalEvent(familyId, { id: generateId(), title: `💉 ${vax.name}`, date: dateStr, time: "", notes: vax.description + (vax.region === "egypt" ? " (Egypt schedule)" : ""), type: "vaccination", autoType: "vaccine" });
      }
      for (const checkup of STANDARD_CHECKUPS) {
        const dueDate = new Date(birthDate); dueDate.setDate(dueDate.getDate() + checkup.week * 7);
        const dateStr = `${dueDate.getFullYear()}-${String(dueDate.getMonth() + 1).padStart(2, "0")}-${String(dueDate.getDate()).padStart(2, "0")}`;
        await fs.addCalEvent(familyId, { id: generateId(), title: `🩺 ${checkup.title}`, date: dateStr, time: "", notes: `Week ${checkup.week} pediatric checkup`, type: "checkup", autoType: "checkup" });
      }
    };
    populate().catch(console.error);
  }, [familyId, state.baby?.birthDate, state.calendarEvents]);

  const deleteEvent = async (eventId) => { try { const fs = await import("./lib/firestore.js"); await fs.deleteEvent(familyId, eventId); } catch (e) { console.error("Delete failed:", e); } };
  const editEvent = async (eventId, updates) => {
    try { const { doc, updateDoc } = await import("firebase/firestore"); const { db } = await import("./lib/firebase.js"); await updateDoc(doc(db, "families", familyId, "events", eventId), updates); } catch (e) { console.error("Edit failed:", e); }
  };
  const openLogger = (t) => { if (t === "activities") { setTab("activities"); } else { setModal(t); } };

  // Loading
  if (authLoading) return (<><FontLoader /><div style={{ ...S.app, display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}><div style={{ textAlign: "center" }}><div style={{ fontSize: 48, marginBottom: 12 }}>👶</div><div style={{ fontSize: 16, fontWeight: 600, color: C.t2 }}>Loading Tiny Steps...</div></div></div></>);
  if (!user) return <AuthScreen onAuth={() => {}} />;
  if (!state.baby) return (<><FontLoader /><div style={{ ...S.app, display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}><div style={{ textAlign: "center" }}><div style={{ fontSize: 48, marginBottom: 12 }}>👶</div><div style={{ fontSize: 16, fontWeight: 600, color: C.t2 }}>Syncing family data...</div></div></div></>);

  return (
    <>
      <FontLoader />
      <div style={S.app}>
        <div style={S.header}>
          <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: "-0.02em" }}>
            {tab === "home" ? "Tiny Steps" : tab === "trends" ? "Trends" : tab === "doctor" ? "Doctor Summary" : tab === "activities" ? "Activities" : tab === "milestones" ? "Milestones" : tab === "growth" ? "Growth" : "Settings"}
          </div>
          <div style={{ display: "flex", gap: 4 }}>
            {tab === "home" && <button style={{ ...S.btn("ghost"), padding: 8 }} onClick={() => setTab("settings")}><Icon name="settings" size={20} color={C.t2} /></button>}
          </div>
        </div>

        {tab === "home" && <Dashboard state={state} onOpenLogger={openLogger} onStartTimer={startTimer} onStopTimer={stopTimer} onAddContextNote={addContextNote} onDeleteEvent={deleteEvent} onEditEvent={editEvent} />}
        {tab === "trends" && <TrendsDashboard state={state} onAddContextNote={addContextNote} />}
        {tab === "doctor" && <DoctorSummary state={state} onAddNote={addHealthLog} onAddContextNote={addContextNote} />}
        {tab === "activities" && <ActivitiesPage state={state} onSave={addEvent} />}
        {tab === "milestones" && <MilestonesPage state={state} onToggle={toggleMilestone} />}
        {tab === "growth" && <GrowthPage state={state} onOpenLogger={(t) => setModal(t)} customVaccines={customVaccines} onAddContextNote={addContextNote} onAddHealthLog={addHealthLog} />}
        {tab === "settings" && <SettingsPage state={state} onUpdateBaby={updateBaby} onUpdateSettings={updateSettings} onSignOut={handleSignOut} />}

        <div style={S.nav}>
          {[
            { id: "home", icon: "home", label: "Home" },
            { id: "trends", icon: "chart", label: "Trends" },
            { id: "milestones", icon: "milestone", label: "Milestones" },
            { id: "growth", icon: "chart", label: "Growth" },
            { id: "doctor", icon: "edit", label: "Summary" },
          ].map((t) => (
            <button key={t.id} style={S.navItem(tab === t.id)} onClick={() => setTab(t.id)}>
              <Icon name={t.icon} size={18} color={tab === t.id ? C.pri : C.t3} />
              <span>{t.label}</span>
            </button>
          ))}
        </div>

        <FeedLogger isOpen={modal === "feed"} onClose={() => setModal(null)} onSave={(e) => { addEvent(e); setModal(null); }} activeTimer={state.activeTimers.feed} onStartTimer={startTimer} onStopTimer={stopTimer} ageWeeks={ageWeeks} lastFeed={lastFeed} />
        <DiaperLogger isOpen={modal === "diaper"} onClose={() => setModal(null)} onSave={(e) => { addEvent(e); setModal(null); }} />
        <SleepLogger isOpen={modal === "sleep"} onClose={() => setModal(null)} onSave={(e) => { addEvent(e); setModal(null); }} activeTimer={state.activeTimers.sleep} onStartTimer={startTimer} onStopTimer={stopTimer} ageWeeks={ageWeeks} lastSleep={lastSleep} contextNotes={state.contextNotes} onAddContextNote={addContextNote} />
        <WeightLogger isOpen={modal === "weight"} onClose={() => setModal(null)} onSave={addWeight} />
        <AppointmentLogger isOpen={modal === "appointment"} onClose={() => setModal(null)} onSave={addAppointment} />
      </div>
    </>
  );
}
