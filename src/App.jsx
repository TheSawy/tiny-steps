import { useState, useEffect } from "react";
import { C, S } from "./styles/theme.js";
import { generateId, getBabyAgeWeeks, getLastEvent, getLastFullFeed, getAgeRecommendations } from "./utils/helpers.js";
import { detectPatterns } from "./utils/patterns.js";
import { INITIAL_STATE, WHO_MILESTONES, VACCINATION_SCHEDULE_BASE, STANDARD_CHECKUPS } from "./data/constants.js";
import * as fs from "./lib/firestore.js";
import { Icon } from "./components/Icon.jsx";
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
import { AuthScreen, loadCredentials, clearCredentials } from "./components/AuthScreen.jsx";

export default function App() {
  const cachedFamilyId = localStorage.getItem("ts_family_id");
  const hasCreds = !!loadCredentials();

  const [user, setUser] = useState(null);
  const [familyId, setFamilyId] = useState(cachedFamilyId || null);
  const [appReady, setAppReady] = useState(!!cachedFamilyId);
  const [showAuth, setShowAuth] = useState(!hasCreds && !cachedFamilyId);
  const [state, setState] = useState(INITIAL_STATE);
  const [tab, setTab] = useState("home");
  const [modal, setModal] = useState(null);
  const [customVaccines, setCustomVaccines] = useState([]);

  const update = (u) => setState((p) => ({ ...p, ...u }));

  // Auth runs in background — does not block rendering
  useEffect(() => {
    const init = async () => {
      const { onAuthChange, getUserFamily, signInEmail } = await import("./lib/auth.js");
      onAuthChange(async (fbUser) => {
        if (fbUser) {
          setUser(fbUser);
          const cached = localStorage.getItem("ts_family_id");
          if (!cached) {
            getUserFamily(fbUser.uid).then((fid) => {
              if (fid) { localStorage.setItem("ts_family_id", fid); setFamilyId(fid); setAppReady(true); }
            }).catch(() => {});
          }
        } else {
          const creds = loadCredentials();
          if (creds) {
            try { await signInEmail(creds.email, creds.password); return; }
            catch { clearCredentials(); localStorage.removeItem("ts_family_id"); setFamilyId(null); setShowAuth(true); }
          } else if (!cachedFamilyId) {
            setShowAuth(true);
          }
        }
      });
    };
    init();
  }, []);

  // Firestore starts immediately from cachedFamilyId.
  // With persistentLocalCache enabled, first callback fires from IndexedDB cache instantly.
  useEffect(() => {
    if (!familyId) return;
    const failsafe = setTimeout(() => setAppReady(true), 1500);
    const unsubs = [];
    unsubs.push(fs.onFamilyChange(familyId, (fam) => {
      update({ baby: fam.baby, familyCode: fam.code, parentName: fam.memberNames?.[user?.uid] || "", settings: fam.settings || { aiProvider: "claude" } });
      clearTimeout(failsafe);
      setAppReady(true);
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
    return () => { clearTimeout(failsafe); unsubs.forEach((u) => typeof u === "function" && u()); };
  }, [familyId]);

  const addEvent = async (e) => { await fs.addEvent(familyId, e); };
  const addAppointment = async (a) => { await fs.addAppointment(familyId, a); };
  const addWeight = async (w) => { await fs.addWeight(familyId, w); };
  const addCalendarEvent = async (e) => { await fs.addCalEvent(familyId, e); };
  const toggleMilestone = async (id) => {
    const current = state.milestones.find((m) => m.milestoneId === id);
    await fs.setMilestone(familyId, id, current?.achievedDate ? null : new Date().toISOString());
  };
  const startTimer = async (t) => { await fs.setTimer(familyId, t, new Date().toISOString()); };
  const stopTimer = async (t) => { await fs.clearTimer(familyId, t); };
  const addContextNote = async (note) => { await fs.addContextNote(familyId, note); };
  const addHealthLog = async (entry) => { await fs.addHealthLog(familyId, entry); };
  const addAppointmentNote = async (label, detail) => {
    const upcoming = state.appointments.filter((a) => !a.completed && new Date(a.date) >= new Date()).sort((a, b) => new Date(a.date) - new Date(b.date));
    if (upcoming.length > 0) {
      const appt = upcoming[0];
      const newNote = `[AI] ${label}: ${detail}`;
      await fs.updateAppointment(familyId, appt.id, { notes: appt.notes ? `${appt.notes}\n${newNote}` : newNote });
    } else {
      await addAppointment({ id: generateId(), title: `Doctor Visit — ${label}`, date: new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0], time: "", type: "checkup", notes: `[AI] ${label}: ${detail}`, completed: false });
    }
  };
  const updateBaby = async (baby) => { await fs.updateBaby(familyId, baby); };
  const updateSettings = async (settings) => { await fs.updateSettings(familyId, { ...state.settings, ...settings }); };
  const handleSignOut = async () => {
    clearCredentials();
    localStorage.removeItem("ts_family_id");
    const { signOut } = await import("./lib/auth.js");
    await signOut();
    setUser(null); setFamilyId(null); setState(INITIAL_STATE); setAppReady(false); setShowAuth(true);
  };

  const ageWeeks = state.baby?.birthDate ? getBabyAgeWeeks(state.baby.birthDate) : null;
  const lastFeed = getLastEvent(state.events, "feed");
  const lastFullFeed = getLastFullFeed(state.events);
  const lastSleep = getLastEvent(state.events, "sleep");
  const lastDiaper = getLastEvent(state.events, "diaper");
  const latestWeight = state.weightLog.length > 0 ? [...state.weightLog].sort((a, b) => new Date(b.date) - new Date(a.date))[0]?.weight : null;
  const weightContext = state.baby?.birthWeight ? { birthWeight: state.baby.birthWeight, latestWeight } : null;
  const recs = ageWeeks !== null ? getAgeRecommendations(ageWeeks, weightContext) : null;

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
      for (const p of toLog) await fs.addHealthLog(familyId, { patternId: p.patternId, title: p.title, confidence: p.confidence, timestamp: new Date().toISOString(), auto: true });
    };
    log().catch(console.error);
  }, [familyId, state.events.length, state.baby?.birthDate]);

  useEffect(() => {
    if (!recs || !state.baby?.name) return;
    if (typeof Notification === "undefined" || Notification.permission !== "granted") return;
    const timers = [];
    const schedule = (title, body, delayMs) => {
      if (delayMs > 0 && delayMs < 86400000) timers.push(setTimeout(() => new Notification(title, { body, icon: "/icons/icon-192.png", tag: title }), delayMs));
    };
    const name = state.baby.name;
    if (lastFullFeed) {
      const nextMs = new Date(lastFullFeed.timestamp).getTime() + recs.feedInterval * 60000 - Date.now();
      schedule(`🍼 Feed time for ${name}`, `It's been ~${Math.round(recs.feedInterval / 60)}h since the last feed.`, nextMs);
    }
    if (lastSleep) schedule(`😴 Nap time for ${name}`, `Wake window is ending.`, new Date(lastSleep.endTime || lastSleep.timestamp).getTime() + recs.sleepWake * 60000 - Date.now());
    if (lastDiaper) schedule(`🧷 Diaper check for ${name}`, `It's been a while since the last change.`, new Date(lastDiaper.timestamp).getTime() + recs.diaperInterval * 60000 - Date.now());
    return () => timers.forEach((t) => clearTimeout(t));
  }, [lastFullFeed?.timestamp, lastSleep?.timestamp, lastDiaper?.timestamp, recs, state.baby?.name]);

  useEffect(() => {
    if (!familyId || !state.baby?.birthDate || !state.calendarEvents) return;
    if (state.calendarEvents.some((e) => e.autoType === "vaccine")) return;
    const populate = async () => {
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

  const deleteEvent = async (eventId) => { try { await fs.deleteEvent(familyId, eventId); } catch (e) { console.error("Delete failed:", e); } };
  const editEvent = async (eventId, updates) => {
    try { const { doc, updateDoc } = await import("firebase/firestore"); const { db } = await import("./lib/firebase.js"); await updateDoc(doc(db, "families", familyId, "events", eventId), updates); } catch (e) { console.error("Edit failed:", e); }
  };
  const openLogger = (t) => { if (t === "activities") { setTab("activities"); } else { setModal(t); } };

  if (showAuth) return <AuthScreen onAuth={() => setShowAuth(false)} />;
  if (!appReady) return (
    <div style={{ ...S.app, display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>👶</div>
        <div style={{ fontSize: 16, fontWeight: 600, color: C.t2 }}>Loading Tiny Steps...</div>
      </div>
    </div>
  );

  return (
    <>
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
        <FeedLogger isOpen={modal === "feed"} onClose={() => setModal(null)} onSave={(e) => { addEvent(e); setModal(null); }} activeTimer={state.activeTimers.feed} onStartTimer={startTimer} onStopTimer={stopTimer} ageWeeks={ageWeeks} lastFeed={lastFeed} weightContext={weightContext} />
        <DiaperLogger isOpen={modal === "diaper"} onClose={() => setModal(null)} onSave={(e) => { addEvent(e); setModal(null); }} />
        <SleepLogger isOpen={modal === "sleep"} onClose={() => setModal(null)} onSave={(e) => { addEvent(e); setModal(null); }} activeTimer={state.activeTimers.sleep} onStartTimer={startTimer} onStopTimer={stopTimer} ageWeeks={ageWeeks} lastSleep={lastSleep} contextNotes={state.contextNotes} onAddContextNote={addContextNote} />
        <WeightLogger isOpen={modal === "weight"} onClose={() => setModal(null)} onSave={addWeight} />
        <AppointmentLogger isOpen={modal === "appointment"} onClose={() => setModal(null)} onSave={addAppointment} />
      </div>
    </>
  );
}
