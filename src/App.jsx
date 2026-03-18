import { useState, useEffect, useCallback, useRef, useMemo, createContext, useContext } from "react";

// ============================================================
// UTILITIES
// ============================================================
const generateId = () => Math.random().toString(36).substr(2, 9) + Date.now().toString(36);

const INITIAL_STATE = {
  baby: null,
  parentName: "",
  familyCode: "",
  events: [],
  appointments: [],
  milestones: [],
  weightLog: [],
  calendarEvents: [],
  chatMessages: [],
  activeTimers: {},
  contextNotes: [],   // Parent context notes like "sleep regression this week"
  healthLog: [],      // Auto-logged from AI chat: fevers, regressions, teething, etc.
  settings: { notificationInterval: 150, aiProvider: "claude" },
};

// ============================================================
// AGE-BASED ACTIVITY RECOMMENDATIONS
// ============================================================
const DAILY_ACTIVITIES = {
  0: [
    { title: "Tummy Time", duration: 3, icon: "🤸", description: "Place baby on tummy on a firm surface. Stay close and engage." },
    { title: "Eye Tracking", duration: 5, icon: "👀", description: "Hold a colorful object 8-12 inches from baby's face. Move slowly side to side." },
    { title: "Skin to Skin", duration: 15, icon: "🤗", description: "Hold baby against your bare chest. Promotes bonding and regulation." },
    { title: "Gentle Massage", duration: 5, icon: "✋", description: "Use gentle strokes on arms, legs, and tummy with baby-safe oil." },
    { title: "Talk & Sing", duration: 10, icon: "🎵", description: "Narrate your day or sing softly. Baby recognizes your voice." },
  ],
  4: [
    { title: "Tummy Time", duration: 5, icon: "🤸", description: "Aim for multiple short sessions. Use a mirror or toy to engage." },
    { title: "Rattle Play", duration: 5, icon: "🎶", description: "Shake a rattle gently near each ear. Helps auditory development." },
    { title: "Black & White Cards", duration: 5, icon: "🃏", description: "Show high-contrast cards at 8-12 inches. Baby's vision is developing." },
    { title: "Bicycle Legs", duration: 3, icon: "🚲", description: "Gently move baby's legs in a cycling motion. Helps with gas and strengthens muscles." },
    { title: "Mirror Time", duration: 5, icon: "🪞", description: "Hold baby in front of a mirror. They'll be fascinated by faces." },
  ],
  8: [
    { title: "Tummy Time", duration: 10, icon: "🤸", description: "Place toys just out of reach to encourage reaching and mini push-ups." },
    { title: "Reach & Grasp", duration: 5, icon: "🖐️", description: "Offer colorful toys for baby to reach and grab. Builds hand-eye coordination." },
    { title: "Reading Time", duration: 10, icon: "📖", description: "Read a board book with big pictures. Point to images and name them." },
    { title: "Supported Sitting", duration: 5, icon: "🪑", description: "Sit baby in your lap facing out. Let them look around their environment." },
    { title: "Texture Exploration", duration: 5, icon: "🧸", description: "Let baby touch different textures: soft, bumpy, smooth, crinkly." },
    { title: "Peekaboo", duration: 5, icon: "🙈", description: "Play peekaboo with a cloth. Teaches object permanence." },
  ],
  12: [
    { title: "Tummy Time", duration: 15, icon: "🤸", description: "Encourage rolling and reaching. Place toys around them in a circle." },
    { title: "Splash Time", duration: 10, icon: "💦", description: "During bath, let baby splash and play with cups. Cause and effect learning." },
    { title: "Singing with Actions", duration: 5, icon: "🎵", description: "Sing songs with hand motions. Baby starts to anticipate movements." },
    { title: "Floor Play", duration: 15, icon: "🏠", description: "Supervised play on a play mat. Let baby roll, reach and explore." },
    { title: "Object Drop", duration: 5, icon: "🧊", description: "Let baby drop safe objects into a container. Teaches cause and effect." },
    { title: "Babble Conversations", duration: 5, icon: "💬", description: "When baby babbles, respond. Take turns 'talking.' Builds communication." },
  ],
  16: [
    { title: "Tummy Time", duration: 20, icon: "🤸", description: "Baby should be lifting chest off floor. Encourage pre-crawling movements." },
    { title: "Sitting Practice", duration: 10, icon: "🪑", description: "Support baby in sitting position with pillows around. Build core strength." },
    { title: "Teething Toys", duration: 10, icon: "🦷", description: "Offer safe teething toys for exploration and gum relief." },
    { title: "Music & Dance", duration: 5, icon: "💃", description: "Play music and gently bounce or sway with baby. Rhythm awareness." },
    { title: "Object Permanence", duration: 5, icon: "🎩", description: "Hide a toy under a cloth. Baby learns objects still exist when hidden." },
    { title: "Outdoor Walk", duration: 15, icon: "🌳", description: "Walk outside. Point to trees, birds, cars. Nature stimulates all senses." },
  ],
  24: [
    { title: "Tummy Time / Crawling", duration: 30, icon: "🤸", description: "Encourage crawling by placing toys slightly out of reach." },
    { title: "Finger Foods", duration: 10, icon: "🥦", description: "Practice self-feeding with safe finger foods. Develops fine motor skills." },
    { title: "Stacking", duration: 10, icon: "🧱", description: "Stack blocks or cups together. Baby may enjoy knocking them down." },
    { title: "Clapping Games", duration: 5, icon: "👏", description: "Pat-a-cake and clapping games. Social interaction and rhythm." },
    { title: "Peek-a-Boo Variations", duration: 5, icon: "🙈", description: "Hide behind furniture, use blankets. Baby anticipates and laughs." },
    { title: "Ball Rolling", duration: 10, icon: "⚽", description: "Sit facing baby and roll a ball back and forth." },
  ],
  36: [
    { title: "Cruising Practice", duration: 15, icon: "🚶", description: "Let baby pull up and cruise along furniture. Build leg strength." },
    { title: "Shape Sorter", duration: 10, icon: "🔷", description: "Practice putting shapes in matching holes. Problem-solving skills." },
    { title: "Dancing", duration: 10, icon: "💃", description: "Play upbeat music. Baby may bounce, clap, and try to dance." },
    { title: "Picture Book Time", duration: 10, icon: "📚", description: "Point to animals and objects. Ask 'where is the cat?' Baby may point." },
    { title: "Push Toys", duration: 10, icon: "🚗", description: "Provide push-along toys to encourage walking. Stay close for support." },
    { title: "Water Play", duration: 10, icon: "💧", description: "Fill containers, pour water, splash. Teaches volume and cause-effect." },
  ],
  48: [
    { title: "Walking Practice", duration: 15, icon: "🚶", description: "Encourage walking with support or independently. Celebrate every step." },
    { title: "Stacking 3+ Blocks", duration: 10, icon: "🧱", description: "Build towers of 3+ blocks. Develops spatial awareness and patience." },
    { title: "Simple Puzzles", duration: 10, icon: "🧩", description: "Simple 2-3 piece puzzles. Teaches shape matching and persistence." },
    { title: "Crayon Scribbling", duration: 10, icon: "🖍️", description: "Let baby hold a large crayon and scribble on paper. First art!" },
    { title: "Naming Game", duration: 10, icon: "🏷️", description: "Point to body parts, objects, people. 'Where is your nose?' Baby learns to point." },
    { title: "Sensory Bin", duration: 15, icon: "🫧", description: "Fill a bin with rice, pasta, or water beads. Supervised tactile exploration." },
  ],
};

const getActivitiesForAge = (ageWeeks) => {
  const keys = Object.keys(DAILY_ACTIVITIES).map(Number).sort((a, b) => a - b);
  let selectedKey = keys[0];
  for (const k of keys) {
    if (ageWeeks >= k) selectedKey = k;
  }
  return DAILY_ACTIVITIES[selectedKey] || DAILY_ACTIVITIES[0];
};

// ============================================================
// MILESTONE DATA (WHO-based)
// ============================================================
const WHO_MILESTONES = [
  { id: "m1", title: "Lifts head briefly", category: "physical", weekStart: 0, weekEnd: 4, description: "When on tummy, briefly lifts head" },
  { id: "m2", title: "Responds to sounds", category: "cognitive", weekStart: 0, weekEnd: 4, description: "Startles or quiets to loud sounds" },
  { id: "m3", title: "Focuses on faces", category: "social", weekStart: 0, weekEnd: 6, description: "Looks at faces, especially parents" },
  { id: "m4", title: "Makes soft sounds", category: "language", weekStart: 2, weekEnd: 6, description: "Coos and makes gurgling sounds" },
  { id: "m5", title: "Holds head at 45°", category: "physical", weekStart: 4, weekEnd: 8, description: "Lifts head 45 degrees on tummy" },
  { id: "m6", title: "Follows objects", category: "cognitive", weekStart: 4, weekEnd: 8, description: "Tracks moving objects with eyes" },
  { id: "m7", title: "Social smile", category: "social", weekStart: 4, weekEnd: 10, description: "Smiles at people intentionally" },
  { id: "m8", title: "Self-soothing", category: "social", weekStart: 4, weekEnd: 12, description: "Brings hands to mouth to self-soothe" },
  { id: "m9", title: "Pushes up on arms", category: "physical", weekStart: 8, weekEnd: 14, description: "Pushes up on forearms during tummy time" },
  { id: "m10", title: "Opens/closes hands", category: "physical", weekStart: 8, weekEnd: 14, description: "Opens and closes hands, bats at toys" },
  { id: "m11", title: "Recognizes parents", category: "cognitive", weekStart: 8, weekEnd: 14, description: "Recognizes familiar people at a distance" },
  { id: "m12", title: "Babbles & coos", category: "language", weekStart: 8, weekEnd: 16, description: "Makes vowel sounds (ah, eh, oh)" },
  { id: "m13", title: "Holds head steady", category: "physical", weekStart: 12, weekEnd: 18, description: "Holds head steady without support" },
  { id: "m14", title: "Grasps toys", category: "physical", weekStart: 12, weekEnd: 18, description: "Reaches for and grasps toys" },
  { id: "m15", title: "Laughs", category: "social", weekStart: 12, weekEnd: 20, description: "Laughs out loud" },
  { id: "m16", title: "Copies movements", category: "cognitive", weekStart: 12, weekEnd: 20, description: "Copies some facial expressions" },
  { id: "m17", title: "Rolls over", category: "physical", weekStart: 16, weekEnd: 26, description: "Rolls from tummy to back" },
  { id: "m18", title: "Brings objects to mouth", category: "cognitive", weekStart: 16, weekEnd: 24, description: "Explores objects by mouthing them" },
  { id: "m19", title: "Responds to name", category: "language", weekStart: 20, weekEnd: 30, description: "Turns head when name is called" },
  { id: "m20", title: "Sits with support", category: "physical", weekStart: 16, weekEnd: 26, description: "Sits with help or propped up" },
  { id: "m21", title: "Sits without support", category: "physical", weekStart: 24, weekEnd: 36, description: "Sits independently without support" },
  { id: "m22", title: "Crawls", category: "physical", weekStart: 26, weekEnd: 40, description: "Moves forward by crawling" },
  { id: "m23", title: "Transfers objects", category: "cognitive", weekStart: 24, weekEnd: 36, description: "Passes objects between hands" },
  { id: "m24", title: "Stranger anxiety", category: "social", weekStart: 26, weekEnd: 40, description: "Shows wariness around strangers" },
  { id: "m25", title: "Says mama/dada", category: "language", weekStart: 28, weekEnd: 44, description: "Babbles mama, dada (non-specific)" },
  { id: "m26", title: "Pincer grasp", category: "physical", weekStart: 32, weekEnd: 44, description: "Picks up small objects with thumb and finger" },
  { id: "m27", title: "Pulls to stand", category: "physical", weekStart: 36, weekEnd: 48, description: "Pulls up to standing position" },
  { id: "m28", title: "Cruises furniture", category: "physical", weekStart: 36, weekEnd: 52, description: "Walks while holding onto furniture" },
  { id: "m29", title: "First words", category: "language", weekStart: 40, weekEnd: 56, description: "Says 1-3 words with meaning" },
  { id: "m30", title: "Points to objects", category: "cognitive", weekStart: 36, weekEnd: 52, description: "Points to things of interest" },
  { id: "m31", title: "Waves bye-bye", category: "social", weekStart: 36, weekEnd: 48, description: "Waves goodbye when prompted" },
  { id: "m32", title: "First steps", category: "physical", weekStart: 44, weekEnd: 60, description: "Takes first independent steps" },
  { id: "m33", title: "Walks independently", category: "physical", weekStart: 48, weekEnd: 72, description: "Walks well without help" },
  { id: "m34", title: "Stacks 2 blocks", category: "cognitive", weekStart: 52, weekEnd: 72, description: "Stacks two or more blocks" },
  { id: "m35", title: "10+ words", category: "language", weekStart: 56, weekEnd: 78, description: "Uses 10 or more words" },
  { id: "m36", title: "Drinks from cup", category: "physical", weekStart: 48, weekEnd: 72, description: "Drinks from a cup with help" },
];

const VACCINATION_SCHEDULE_BASE = [
  { name: "Hepatitis B (1st dose)", weekDue: 0, description: "At birth" },
  { name: "BCG", weekDue: 0, description: "At birth", region: "egypt" },
  { name: "OPV (Zero dose)", weekDue: 0, description: "At birth", region: "egypt" },
  { name: "Hepatitis B (2nd dose)", weekDue: 4, description: "1 month" },
  { name: "DTaP (1st dose)", weekDue: 8, description: "2 months" },
  { name: "IPV (1st dose)", weekDue: 8, description: "2 months" },
  { name: "Hib (1st dose)", weekDue: 8, description: "2 months" },
  { name: "PCV13 (1st dose)", weekDue: 8, description: "2 months" },
  { name: "Rotavirus (1st dose)", weekDue: 8, description: "2 months" },
  { name: "OPV (1st dose)", weekDue: 8, description: "2 months", region: "egypt" },
  { name: "DTaP (2nd dose)", weekDue: 16, description: "4 months" },
  { name: "IPV (2nd dose)", weekDue: 16, description: "4 months" },
  { name: "Hib (2nd dose)", weekDue: 16, description: "4 months" },
  { name: "PCV13 (2nd dose)", weekDue: 16, description: "4 months" },
  { name: "Rotavirus (2nd dose)", weekDue: 16, description: "4 months" },
  { name: "OPV (2nd dose)", weekDue: 16, description: "4 months", region: "egypt" },
  { name: "DTaP (3rd dose)", weekDue: 24, description: "6 months" },
  { name: "Hepatitis B (3rd dose)", weekDue: 24, description: "6 months" },
  { name: "OPV (3rd dose)", weekDue: 24, description: "6 months", region: "egypt" },
  { name: "Influenza (annual)", weekDue: 26, description: "6 months+" },
  { name: "PCV13 (booster)", weekDue: 36, description: "9 months", region: "egypt" },
  { name: "MMR (1st dose)", weekDue: 52, description: "12 months" },
  { name: "Varicella (1st dose)", weekDue: 52, description: "12 months" },
  { name: "Hepatitis A (1st dose)", weekDue: 52, description: "12 months" },
  { name: "Hib (booster)", weekDue: 56, description: "12-15 months" },
  { name: "OPV (booster)", weekDue: 72, description: "18 months", region: "egypt" },
  { name: "DTaP (4th dose)", weekDue: 72, description: "18 months" },
  { name: "MMR (2nd dose)", weekDue: 72, description: "18 months", region: "egypt" },
];

// ============================================================
// UTILITY FUNCTIONS
// ============================================================
const getBabyAgeWeeks = (birthDate) => {
  if (!birthDate) return 0;
  return Math.floor((new Date() - new Date(birthDate)) / (7 * 24 * 60 * 60 * 1000));
};
const getBabyAgeDays = (birthDate) => {
  if (!birthDate) return 0;
  return Math.floor((new Date() - new Date(birthDate)) / (24 * 60 * 60 * 1000));
};
const formatAge = (birthDate) => {
  const days = getBabyAgeDays(birthDate);
  if (days < 7) return `${days} day${days !== 1 ? "s" : ""} old`;
  const weeks = Math.floor(days / 7);
  if (weeks < 12) return `${weeks} week${weeks !== 1 ? "s" : ""} old`;
  const months = Math.floor(days / 30.44);
  return `${months} month${months !== 1 ? "s" : ""} old`;
};
const formatDuration = (ms) => {
  if (!ms || ms < 0) return "0m";
  const mins = Math.floor(ms / 60000);
  const hrs = Math.floor(mins / 60);
  if (hrs > 0) return `${hrs}h ${mins % 60}m`;
  return `${mins}m`;
};
const formatTime = (date) => new Date(date).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
const formatDate = (date) => new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" });
const formatDateFull = (date) => new Date(date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
const getTimeSince = (ts) => {
  const mins = Math.floor((Date.now() - new Date(ts).getTime()) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ${mins % 60}m ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};
const getTodayEvents = (events, type) => {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  return events.filter((e) => e.type === type && new Date(e.timestamp) >= today);
};
const getLastEvent = (events, type) => {
  return events.filter((e) => e.type === type && e.timestamp && new Date(e.timestamp).getTime() <= Date.now()).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0] || null;
};
const getAgeRecommendations = (ageWeeks) => {
  if (ageWeeks < 2) return { feedInterval: 120, sleepHours: 16, sleepWake: 45, tummyTime: 3, diapers: 10, diaperInterval: 120, naps: 6 };
  if (ageWeeks < 6) return { feedInterval: 150, sleepHours: 15.5, sleepWake: 60, tummyTime: 5, diapers: 8, diaperInterval: 150, naps: 5 };
  if (ageWeeks < 12) return { feedInterval: 150, sleepHours: 15, sleepWake: 75, tummyTime: 15, diapers: 8, diaperInterval: 150, naps: 4 };
  if (ageWeeks < 16) return { feedInterval: 180, sleepHours: 14.5, sleepWake: 90, tummyTime: 20, diapers: 7, diaperInterval: 180, naps: 4 };
  if (ageWeeks < 26) return { feedInterval: 210, sleepHours: 14, sleepWake: 120, tummyTime: 30, diapers: 6, diaperInterval: 210, naps: 3 };
  if (ageWeeks < 40) return { feedInterval: 240, sleepHours: 13.5, sleepWake: 150, tummyTime: 45, diapers: 5, diaperInterval: 240, naps: 2 };
  return { feedInterval: 270, sleepHours: 13, sleepWake: 180, tummyTime: 60, diapers: 5, diaperInterval: 270, naps: 2 };
};

const getNextWindow = (lastTimestamp, intervalMins) => {
  if (!lastTimestamp) return null;
  const next = new Date(new Date(lastTimestamp).getTime() + intervalMins * 60000);
  if (next < new Date()) return { time: next, overdue: true, overdueBy: Math.floor((Date.now() - next.getTime()) / 60000) };
  return { time: next, overdue: false, minsUntil: Math.floor((next.getTime() - Date.now()) / 60000) };
};

const toDateKey = (d) => { const dt = new Date(d); return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`; };

// ============================================================
// COLORS & STYLES
// ============================================================
const C = {
  bg: "#FAF9F7", card: "#FFFFFF", text: "#1A1A2E", t2: "#6B7280", t3: "#9CA3AF",
  border: "#E8E6E1", borderL: "#F3F1ED",
  pri: "#5B7FFF", priL: "#EEF1FF", priD: "#4060E0",
  feed: "#FF8C61", feedL: "#FFF0EA",
  diaper: "#4ECDC4", diaperL: "#E8FAF8",
  sleep: "#7C6CF0", sleepL: "#F0EEFE",
  tummy: "#FF6B9D", tummyL: "#FFECF2",
  weight: "#45B7D1", weightL: "#E6F6FA",
  doctor: "#96C93D", doctorL: "#F0F9E3",
  vaccine: "#DDA0DD", vaccineL: "#F9F0F9",
  milestone: "#FFD93D", milestoneL: "#FFF9E3",
  success: "#10B981", warning: "#F59E0B", danger: "#EF4444",
  physical: "#FF6B6B", cognitive: "#4ECDC4", social: "#FFD93D", language: "#7C6CF0",
  calendar: "#6366F1", calendarL: "#EEF2FF",
  activity: "#F97316", activityL: "#FFF7ED",
};

const S = {
  app: { fontFamily: "'DM Sans', -apple-system, sans-serif", background: C.bg, color: C.text, minHeight: "100vh", maxWidth: 480, margin: "0 auto", position: "relative", paddingBottom: 80 },
  header: { padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", background: "white", borderBottom: `1px solid ${C.border}`, position: "sticky", top: 0, zIndex: 100 },
  page: { padding: "16px 20px" },
  card: { background: C.card, borderRadius: 16, padding: 16, marginBottom: 12, border: `1px solid ${C.borderL}`, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" },
  btn: (v = "primary") => ({ padding: "12px 24px", borderRadius: 12, border: "none", fontWeight: 600, fontSize: 14, cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "all 0.15s", fontFamily: "inherit", ...(v === "primary" ? { background: C.pri, color: "white" } : v === "secondary" ? { background: C.priL, color: C.pri } : v === "danger" ? { background: "#FEE2E2", color: C.danger } : { background: "transparent", color: C.t2 }) }),
  input: { width: "100%", padding: "12px 16px", borderRadius: 12, border: `1.5px solid ${C.border}`, fontSize: 14, fontFamily: "inherit", outline: "none", boxSizing: "border-box", background: "white" },
  label: { fontSize: 12, fontWeight: 600, color: C.t2, marginBottom: 6, display: "block", textTransform: "uppercase", letterSpacing: "0.05em" },
  chip: (active, color = C.pri) => ({ padding: "8px 16px", borderRadius: 20, border: `1.5px solid ${active ? color : C.border}`, background: active ? color + "15" : "transparent", color: active ? color : C.t2, fontWeight: active ? 600 : 500, fontSize: 13, cursor: "pointer", transition: "all 0.15s", whiteSpace: "nowrap", fontFamily: "inherit" }),
  nav: { position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 480, background: "white", borderTop: `1px solid ${C.border}`, display: "flex", justifyContent: "space-around", padding: "6px 0 env(safe-area-inset-bottom, 6px)", zIndex: 200 },
  navItem: (a) => ({ display: "flex", flexDirection: "column", alignItems: "center", gap: 1, padding: "4px 4px", border: "none", background: "none", cursor: "pointer", color: a ? C.pri : C.t3, fontSize: 9, fontWeight: a ? 600 : 500, minWidth: 0 }),
  modal: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 300, backdropFilter: "blur(4px)" },
  modalC: { background: "white", borderRadius: "24px 24px 0 0", width: "100%", maxWidth: 480, maxHeight: "85vh", overflow: "auto", padding: "20px 20px 40px" },
  timer: { fontSize: 48, fontWeight: 700, fontVariantNumeric: "tabular-nums", letterSpacing: "-0.03em", textAlign: "center" },
  stat: (c) => ({ background: c + "12", borderRadius: 12, padding: "12px 14px", flex: 1, minWidth: 0 }),
  quickAct: (bg) => ({ background: bg, borderRadius: 16, padding: "14px 10px", display: "flex", flexDirection: "column", alignItems: "center", gap: 6, border: "none", cursor: "pointer", flex: 1, minWidth: 0, fontFamily: "inherit" }),
  nextWindow: (overdue) => ({ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", borderRadius: 12, background: overdue ? C.danger + "10" : C.success + "10", border: `1px solid ${overdue ? C.danger + "30" : C.success + "30"}`, marginTop: 8 }),
};

// ============================================================
// SMART PATTERN DETECTION ENGINE (rule-based, no ML needed)
// Compares last 3 days vs previous 2-week baseline
// ============================================================
const detectPatterns = (events, baby, contextNotes = []) => {
  if (!baby?.birthDate || events.length < 5) return [];

  const ageWeeks = getBabyAgeWeeks(baby.birthDate);
  const now = new Date();
  const insights = [];

  // Split events into recent (last 3 days) and baseline (4-17 days ago)
  const d3 = new Date(now); d3.setDate(d3.getDate() - 3);
  const d17 = new Date(now); d17.setDate(d17.getDate() - 17);
  const d4 = new Date(now); d4.setDate(d4.getDate() - 4);

  const recent = events.filter((e) => new Date(e.timestamp) >= d3);
  const baseline = events.filter((e) => { const t = new Date(e.timestamp); return t >= d17 && t < d4; });

  if (baseline.length < 3) return []; // not enough history

  // Helper: average per day
  const avgPerDay = (arr, days) => arr.length / Math.max(days, 1);
  const recentDays = 3, baselineDays = 13;

  // ---- SLEEP ANALYSIS ----
  const recentSleep = recent.filter((e) => e.type === "sleep");
  const baseSleep = baseline.filter((e) => e.type === "sleep");
  const recentSleepAvg = recentSleep.reduce((s, e) => s + (e.duration || 0), 0) / recentDays;
  const baseSleepAvg = baseSleep.reduce((s, e) => s + (e.duration || 0), 0) / baselineDays;

  const sleepDropPct = baseSleepAvg > 0 ? ((baseSleepAvg - recentSleepAvg) / baseSleepAvg) * 100 : 0;
  const sleepFreqRecent = avgPerDay(recentSleep, recentDays);
  const sleepFreqBase = avgPerDay(baseSleep, baselineDays);

  // ---- FEED ANALYSIS ----
  const recentFeeds = recent.filter((e) => e.type === "feed");
  const baseFeeds = baseline.filter((e) => e.type === "feed");
  const feedFreqRecent = avgPerDay(recentFeeds, recentDays);
  const feedFreqBase = avgPerDay(baseFeeds, baselineDays);
  const feedIncreasePct = feedFreqBase > 0 ? ((feedFreqRecent - feedFreqBase) / feedFreqBase) * 100 : 0;

  // ---- DIAPER ANALYSIS ----
  const recentDiapers = recent.filter((e) => e.type === "diaper");
  const baseDiapers = baseline.filter((e) => e.type === "diaper");
  const recentStools = recentDiapers.filter((d) => d.content === "stool" || d.content === "both");
  const baseStools = baseDiapers.filter((d) => d.content === "stool" || d.content === "both");
  const recentColors = recentStools.map((d) => d.stoolColor).filter(Boolean);
  const baseColors = baseStools.map((d) => d.stoolColor).filter(Boolean);

  // Check if any of these are already noted by the parent
  const activeNoteTexts = contextNotes.filter((n) => n.active).map((n) => n.text.toLowerCase());
  const alreadyNoted = (keyword) => activeNoteTexts.some((t) => t.includes(keyword.toLowerCase()));

  // ======= PATTERN: TEETHING =======
  // Clues: more feeds, less sleep, more waking, drooling notes, age 16-52 weeks
  if (ageWeeks >= 14 && ageWeeks <= 56 && !alreadyNoted("teething")) {
    const signs = [];
    if (sleepDropPct > 15) signs.push("sleeping less than usual");
    if (feedIncreasePct > 20) signs.push("feeding more often");
    if (sleepFreqRecent > sleepFreqBase * 1.3) signs.push("waking up more");
    // Check for notes mentioning teething-related words
    const teethingNotes = recent.filter((e) => e.notes && /drool|biting|gum|fuss|chew/i.test(e.notes));
    if (teethingNotes.length > 0) signs.push("notes mention drooling/fussiness");

    if (signs.length >= 2) {
      insights.push({
        id: "teething",
        emoji: "🦷",
        title: "Possible Teething",
        confidence: signs.length >= 3 ? "likely" : "possible",
        message: `${baby.name} might be teething. I noticed: ${signs.join(", ")}. This is very normal at ${ageWeeks} weeks!`,
        tips: "Offer a chilled teething ring, extra cuddles, and don't worry about slightly disrupted schedules.",
        color: "#F59E0B",
      });
    }
  }

  // ======= PATTERN: SLEEP REGRESSION =======
  // Clues: significant sleep drop, more night wakings, age near 4mo/8mo/12mo/18mo
  const regressionWeeks = [15, 16, 17, 18, 19, 34, 35, 36, 37, 50, 51, 52, 53, 72, 73, 74, 75];
  if (regressionWeeks.includes(ageWeeks) && !alreadyNoted("regression")) {
    const signs = [];
    if (sleepDropPct > 20) signs.push("total sleep dropped significantly");
    if (sleepFreqRecent > sleepFreqBase * 1.4) signs.push("more wake-ups than usual");
    if (feedIncreasePct > 15) signs.push("feeding more at night");

    if (signs.length >= 1 && sleepDropPct > 15) {
      const month = Math.round(ageWeeks / 4.33);
      insights.push({
        id: "sleep_regression",
        emoji: "🔄",
        title: `${month}-Month Sleep Regression`,
        confidence: signs.length >= 2 ? "likely" : "possible",
        message: `${baby.name}'s sleep has changed — this looks like the ${month}-month sleep regression. I noticed: ${signs.join(", ")}.`,
        tips: "This is a developmental leap, not a setback. It typically lasts 2-6 weeks. Maintain your routines and it will pass.",
        color: "#7C6CF0",
      });
    }
  }

  // ======= PATTERN: GROWTH SPURT =======
  // Clues: feeding significantly more, possibly more sleep, age near common spurt times
  const spurtWeeks = [1, 2, 3, 6, 7, 12, 13, 16, 17, 24, 25, 26, 36, 37, 52, 53];
  if (spurtWeeks.includes(ageWeeks) && !alreadyNoted("growth")) {
    const signs = [];
    if (feedIncreasePct > 25) signs.push("feeding much more than usual");
    if (recentSleepAvg > baseSleepAvg * 1.15) signs.push("sleeping a bit more");
    if (feedFreqRecent > feedFreqBase + 1.5) signs.push(`${Math.round(feedFreqRecent)} feeds/day vs usual ${Math.round(feedFreqBase)}`);

    if (signs.length >= 1 && feedIncreasePct > 20) {
      insights.push({
        id: "growth_spurt",
        emoji: "📈",
        title: "Possible Growth Spurt",
        confidence: signs.length >= 2 ? "likely" : "possible",
        message: `${baby.name} seems hungrier than usual — this could be a growth spurt! I noticed: ${signs.join(", ")}.`,
        tips: "Feed on demand during growth spurts. They usually last 2-3 days. Baby might also be a bit fussier.",
        color: "#10B981",
      });
    }
  }

  // ======= PATTERN: STOOL COLOR CHANGE =======
  if (recentColors.length >= 2 && !alreadyNoted("stool")) {
    const unusualColors = recentColors.filter((c) => c === "green" || c === "black" || c === "red" || c === "white");
    const baseUnusual = baseColors.filter((c) => c === "green" || c === "black" || c === "red" || c === "white");

    if (unusualColors.length >= 2 && unusualColors.length > baseUnusual.length) {
      const dominantColor = unusualColors.sort((a, b) => unusualColors.filter((c) => c === b).length - unusualColors.filter((c) => c === a).length)[0];
      let tip = "";
      if (dominantColor === "green") tip = "Green stools can be normal, especially with foremilk/hindmilk imbalance, teething, or a cold. Usually not concerning.";
      else if (dominantColor === "red") tip = "Red stools could indicate blood — please consult your pediatrician to be safe.";
      else if (dominantColor === "white") tip = "Pale/white stools should be checked by a doctor as they can indicate a liver issue.";
      else if (dominantColor === "black") tip = ageWeeks > 1 ? "Black stools after the newborn period should be checked by a doctor." : "Dark stools are normal in the first few days (meconium).";

      insights.push({
        id: "stool_change",
        emoji: "💩",
        title: "Stool Color Change",
        confidence: dominantColor === "red" || dominantColor === "white" ? "check_doctor" : "note",
        message: `I've noticed more ${dominantColor} stools recently compared to ${baby.name}'s usual pattern.`,
        tips: tip,
        color: dominantColor === "red" || dominantColor === "white" ? "#EF4444" : "#F59E0B",
      });
    }
  }

  // ======= PATTERN: ILLNESS SIGNS =======
  // Clues: less feeding, more sleep, stool changes, notes mentioning fever/cold
  if (!alreadyNoted("sick") && !alreadyNoted("ill") && !alreadyNoted("cold") && !alreadyNoted("fever")) {
    const signs = [];
    if (feedFreqRecent < feedFreqBase * 0.7 && feedFreqBase > 2) signs.push("feeding less than usual");
    if (sleepDropPct < -20) signs.push("sleeping more than usual");
    const sickNotes = recent.filter((e) => e.notes && /fever|cold|sick|cough|runny|congested|fussy|irritable/i.test(e.notes));
    if (sickNotes.length > 0) signs.push("notes mention illness symptoms");

    if (signs.length >= 2) {
      insights.push({
        id: "possible_illness",
        emoji: "🤒",
        title: "Baby Might Not Feel Well",
        confidence: "check",
        message: `${baby.name}'s patterns have shifted. I noticed: ${signs.join(", ")}. Worth keeping an eye on.`,
        tips: "Monitor temperature, keep up fluids/feeds, and contact your pediatrician if symptoms worsen or baby is under 3 months with a fever.",
        color: "#EF4444",
      });
    }
  }

  return insights;
};

// ============================================================
// SVG ICONS
// ============================================================
const Icon = ({ name, size = 20, color = "currentColor" }) => {
  const d = {
    back: <path d="M19 12H5m7-7l-7 7 7 7" />,
    x: <path d="M18 6L6 18M6 6l12 12" />,
    plus: <path d="M12 5v14m-7-7h14" />,
    check: <path d="M5 12l5 5L20 7" />,
    play: <polygon points="5,3 19,12 5,21" />,
    stop: <rect x="4" y="4" width="16" height="16" rx="2" />,
    send: <><path d="M22 2L11 13" /><path d="M22 2l-7 20-4-9-9-4z" /></>,
    home: <><path d="M3 12l9-9 9 9" /><path d="M5 10v10a1 1 0 001 1h4v-6h4v6h4a1 1 0 001-1V10" /></>,
    milestone: <path d="M12 2l3 7h7l-5.5 4.5 2 7L12 16l-6.5 4.5 2-7L2 9h7z" />,
    chart: <><path d="M3 3v18h18" /><path d="M7 16l4-6 4 4 4-8" /></>,
    chat: <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />,
    settings: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" /></>,
    calendar: <><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></>,
    download: <><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><path d="M7 10l5 5 5-5" /><path d="M12 15V3" /></>,
    share: <><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><path d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98" /></>,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 3" /></>,
    edit: <><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></>,
    link: <><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" /></>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: "inline-block", verticalAlign: "middle", flexShrink: 0 }}>
      {d[name] || <circle cx="12" cy="12" r="8" />}
    </svg>
  );
};

// ============================================================
// FONT LOADER
// ============================================================
const FontLoader = () => { useEffect(() => { const l = document.createElement("link"); l.href = "https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap"; l.rel = "stylesheet"; document.head.appendChild(l); }, []); return null; };

// ============================================================
// TIMER
// ============================================================
const useTimer = (start) => {
  const [e, setE] = useState(start ? Date.now() - new Date(start).getTime() : 0);
  useEffect(() => { if (!start) return; const id = setInterval(() => setE(Date.now() - new Date(start).getTime()), 1000); return () => clearInterval(id); }, [start]);
  return e;
};
const TimerDisplay = ({ startTime, color = C.pri }) => {
  const e = useTimer(startTime);
  const s = Math.floor(e / 1000), m = Math.floor(s / 60), h = Math.floor(m / 60);
  return <div style={{ ...S.timer, color }}>{h > 0 && `${h}:`}{String(m % 60).padStart(2, "0")}:{String(s % 60).padStart(2, "0")}</div>;
};

// ============================================================
// MODAL
// ============================================================
const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div style={S.modal} onClick={onClose}>
      <div style={S.modalC} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <h3 style={{ fontSize: 18, fontWeight: 700 }}>{title}</h3>
          <button style={{ ...S.btn("ghost"), padding: 8 }} onClick={onClose}><Icon name="x" size={20} /></button>
        </div>
        {children}
      </div>
    </div>
  );
};

// ============================================================
// NEXT WINDOW BADGE (Gentle — no alarming red for parents)
// ============================================================
const NextWindowBadge = ({ label, lastTimestamp, intervalMins, contextNotes = [] }) => {
  const [, setTick] = useState(0);
  useEffect(() => { const id = setInterval(() => setTick((t) => t + 1), 30000); return () => clearInterval(id); }, []);
  const win = getNextWindow(lastTimestamp, intervalMins);
  if (!win) return null;

  // Check if there's an active context note that explains irregular patterns
  const activeNotes = contextNotes.filter((n) => {
    if (!n.active) return false;
    if (n.category === "sleep" && label === "Sleep") return true;
    if (n.category === "feed" && label === "Feed") return true;
    if (n.category === "general") return true;
    return false;
  });
  const hasContext = activeNotes.length > 0;

  // Gentle overdue messaging — never alarming
  if (win.overdue) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", borderRadius: 12, background: hasContext ? C.pri + "08" : C.warning + "10", border: `1px solid ${hasContext ? C.pri + "20" : C.warning + "25"}`, marginTop: 8 }}>
        <span style={{ fontSize: 16 }}>{label === "Feed" ? "🍼" : label === "Sleep" ? "😴" : "🧷"}</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: hasContext ? C.t2 : C.warning }}>
            {hasContext
              ? `${label} window passed · That's okay`
              : win.overdueBy < 30
                ? `${label} window coming up`
                : `Might be time for a ${label.toLowerCase()} check`}
          </div>
          {hasContext && <div style={{ fontSize: 11, color: C.pri, marginTop: 2 }}>📌 {activeNotes[0].text}</div>}
          {!hasContext && <div style={{ fontSize: 11, color: C.t3 }}>Every baby has their own rhythm</div>}
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", borderRadius: 12, background: C.success + "08", border: `1px solid ${C.success + "20"}`, marginTop: 8 }}>
      <span style={{ fontSize: 16 }}>{label === "Feed" ? "🍼" : label === "Sleep" ? "😴" : "🧷"}</span>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: C.success }}>Next {label.toLowerCase()} in ~{win.minsUntil}m</div>
        <div style={{ fontSize: 11, color: C.t3 }}>Around {formatTime(win.time)}</div>
      </div>
    </div>
  );
};

// ============================================================
// ONBOARDING
// ============================================================
const Onboarding = ({ onComplete }) => {
  const [step, setStep] = useState(0); // 0=welcome, 1=signup, 2=login, 3=baby, 4=join
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [babyName, setBabyName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [familyCode, setFamilyCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    if (!name || !email || !password) return;
    if (password.length < 6) { setError("Password must be at least 6 characters"); return; }
    setLoading(true); setError("");
    try {
      const { signUpEmail } = await import("./lib/auth.js");
      await signUpEmail(email, password, name, babyName || "Baby", birthDate || null);
      // Auth state listener in App will pick this up
    } catch (e) {
      setError(e.message.includes("email-already-in-use") ? "This email is already registered. Try logging in." : e.message);
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!email || !password) return;
    setLoading(true); setError("");
    try {
      const { signInEmail } = await import("./lib/auth.js");
      await signInEmail(email, password);
    } catch (e) {
      setError(e.message.includes("invalid-credential") ? "Wrong email or password." : e.message);
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    if (!name || !email || !password || familyCode.length !== 6) return;
    if (password.length < 6) { setError("Password must be at least 6 characters"); return; }
    setLoading(true); setError("");
    try {
      const { signUpAndJoin } = await import("./lib/auth.js");
      await signUpAndJoin(email, password, name, familyCode);
    } catch (e) {
      setError(e.message);
      setLoading(false);
    }
  };

  const ErrorMsg = () => error ? <div style={{ padding: "10px 14px", borderRadius: 10, background: "#FEE2E2", color: C.danger, fontSize: 13, marginBottom: 12 }}>{error}</div> : null;

  return (
    <div style={{ ...S.app, display: "flex", flexDirection: "column", justifyContent: "center", padding: 24, minHeight: "100vh", paddingBottom: 24 }}>
      {step === 0 && (
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>👶</div>
          <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8, letterSpacing: "-0.03em" }}>Tiny Steps</h1>
          <p style={{ color: C.t2, fontSize: 15, marginBottom: 32, lineHeight: 1.5 }}>Track your baby's feeding, sleep, diapers, and milestones — together with your partner.</p>
          <button style={{ ...S.btn("primary"), width: "100%", padding: "16px", fontSize: 16 }} onClick={() => setStep(1)}>Create Account</button>
          <button style={{ ...S.btn("secondary"), width: "100%", marginTop: 12 }} onClick={() => setStep(4)}>
            <Icon name="link" size={16} color={C.pri} /> Join Partner's Account
          </button>
          <button style={{ ...S.btn("ghost"), width: "100%", marginTop: 8 }} onClick={() => setStep(2)}>Already have an account? Log in</button>
        </div>
      )}

      {/* SIGN UP */}
      {step === 1 && (
        <div>
          <button style={{ ...S.btn("ghost"), marginBottom: 16, padding: "8px 0" }} onClick={() => { setStep(0); setError(""); }}><Icon name="back" size={18} /> Back</button>
          <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24 }}>Create Account</h2>
          <ErrorMsg />
          <label style={S.label}>Your Name</label>
          <input style={{ ...S.input, marginBottom: 12 }} value={name} onChange={(e) => setName(e.target.value)} placeholder="Ahmed" />
          <label style={S.label}>Email</label>
          <input style={{ ...S.input, marginBottom: 12 }} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ahmed@example.com" />
          <label style={S.label}>Password</label>
          <input style={{ ...S.input, marginBottom: 16 }} type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" />
          <label style={S.label}>Baby's Name</label>
          <input style={{ ...S.input, marginBottom: 12 }} value={babyName} onChange={(e) => setBabyName(e.target.value)} placeholder="Baby's name" />
          <label style={S.label}>Birth Date (optional)</label>
          <input style={S.input} type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} />
          <p style={{ fontSize: 12, color: C.t3, marginTop: 8, marginBottom: 16 }}>Leave blank if not born yet.</p>
          <button style={{ ...S.btn("primary"), width: "100%", opacity: name && email && password ? 1 : 0.5 }} onClick={handleSignUp} disabled={loading}>
            {loading ? "Creating..." : "Create Account & Start"}
          </button>
        </div>
      )}

      {/* LOGIN */}
      {step === 2 && (
        <div>
          <button style={{ ...S.btn("ghost"), marginBottom: 16, padding: "8px 0" }} onClick={() => { setStep(0); setError(""); }}><Icon name="back" size={18} /> Back</button>
          <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24 }}>Log In</h2>
          <ErrorMsg />
          <label style={S.label}>Email</label>
          <input style={{ ...S.input, marginBottom: 12 }} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ahmed@example.com" />
          <label style={S.label}>Password</label>
          <input style={{ ...S.input, marginBottom: 16 }} type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Your password" />
          <button style={{ ...S.btn("primary"), width: "100%", opacity: email && password ? 1 : 0.5 }} onClick={handleLogin} disabled={loading}>
            {loading ? "Logging in..." : "Log In"}
          </button>
        </div>
      )}

      {/* JOIN PARTNER */}
      {step === 4 && (
        <div>
          <button style={{ ...S.btn("ghost"), marginBottom: 16, padding: "8px 0" }} onClick={() => { setStep(0); setError(""); }}><Icon name="back" size={18} /> Back</button>
          <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Join Partner</h2>
          <p style={{ color: C.t2, marginBottom: 24 }}>Create your account and enter the family code your partner shared.</p>
          <ErrorMsg />
          <label style={S.label}>Your Name</label>
          <input style={{ ...S.input, marginBottom: 12 }} value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
          <label style={S.label}>Email</label>
          <input style={{ ...S.input, marginBottom: 12 }} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" />
          <label style={S.label}>Password</label>
          <input style={{ ...S.input, marginBottom: 16 }} type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" />
          <label style={S.label}>Family Code</label>
          <input style={{ ...S.input, textTransform: "uppercase", letterSpacing: "0.2em", fontSize: 20, textAlign: "center" }} value={familyCode} onChange={(e) => setFamilyCode(e.target.value.toUpperCase())} placeholder="ABC123" maxLength={6} />
          <button style={{ ...S.btn("primary"), width: "100%", marginTop: 24, opacity: name && email && password && familyCode.length === 6 ? 1 : 0.5 }} onClick={handleJoin} disabled={loading}>
            {loading ? "Joining..." : "Join Family"}
          </button>
        </div>
      )}
    </div>
  );
};

// ============================================================
// FEED LOGGER (Breast, Expression, Formula with side-aware emoji)
// ============================================================
const FeedLogger = ({ isOpen, onClose, onSave, activeTimer, onStartTimer, onStopTimer, ageWeeks, lastFeed }) => {
  const [feedType, setFeedType] = useState("breast");
  const [breastSide, setBreastSide] = useState("left");
  const [expressionSide, setExpressionSide] = useState("left");
  const [amount, setAmount] = useState("");
  const [formulaBrand, setFormulaBrand] = useState("");
  const [notes, setNotes] = useState("");
  const [mode, setMode] = useState("timer"); // timer | manual
  const [manualTime, setManualTime] = useState("");
  const [manualDuration, setManualDuration] = useState("");
  const isTimerActive = activeTimer?.type === "feed";
  const [stoppedDuration, setStoppedDuration] = useState(0);
  const recs = ageWeeks !== null ? getAgeRecommendations(ageWeeks) : null;

  const handleSave = () => {
    const isManual = mode === "manual" && feedType === "breast";
    const timestamp = isManual && manualTime ? new Date(manualTime).toISOString() : isTimerActive ? activeTimer.startTime : new Date().toISOString();
    const duration = isManual ? (parseInt(manualDuration) || 0) * 60000 : isTimerActive ? Date.now() - new Date(activeTimer.startTime).getTime() : stoppedDuration;

    onSave({
      id: generateId(), type: "feed", timestamp, duration,
      feedType, ...(feedType === "breast" ? { side: breastSide } : {}),
      ...(feedType === "expression" ? { side: expressionSide, amount: parseFloat(amount) || 0 } : {}),
      ...(feedType === "formula" ? { amount: parseFloat(amount) || 0, brand: formulaBrand } : {}),
      notes,
    });
    if (isTimerActive) onStopTimer("feed");
    setFeedType("breast"); setBreastSide("left"); setAmount(""); setNotes(""); setManualTime(""); setManualDuration(""); setMode("timer"); onClose();
  };

  const BreastCircle = ({ side, selected, onClick, label }) => (
    <button onClick={onClick} style={{ width: 80, height: 80, borderRadius: 40, background: selected ? C.feed + "25" : C.borderL, border: `3px solid ${selected ? C.feed : C.border}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all 0.2s", fontFamily: "inherit" }}>
      <span style={{ fontSize: 28, transform: side === "right" ? "scaleX(-1)" : "none", display: "inline-block" }}>🤱</span>
      <span style={{ fontSize: 10, fontWeight: 700, color: selected ? C.feed : C.t3, marginTop: 2 }}>{label}</span>
    </button>
  );

  const ExpressionCircle = ({ side, selected, onClick, label }) => (
    <button onClick={onClick} style={{ width: 80, height: 80, borderRadius: 40, background: selected ? C.feed + "25" : C.borderL, border: `3px solid ${selected ? C.feed : C.border}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all 0.2s", fontFamily: "inherit" }}>
      <span style={{ fontSize: 28, transform: side === "right" ? "scaleX(-1)" : "none", display: "inline-block" }}>🤱</span>
      <span style={{ fontSize: 10, fontWeight: 700, color: selected ? C.feed : C.t3, marginTop: 2 }}>{label}</span>
    </button>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Log Feeding">
      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        {["breast", "expression", "formula"].map((t) => (
          <button key={t} style={S.chip(feedType === t, C.feed)} onClick={() => setFeedType(t)}>
            {t === "breast" ? "🤱 Breast" : t === "expression" ? "🤱 Expression" : "🥛 Formula"}
          </button>
        ))}
      </div>

      {feedType === "breast" && (
        <>
          <label style={S.label}>Which Side</label>
          <div style={{ display: "flex", gap: 20, justifyContent: "center", marginBottom: 16 }}>
            <BreastCircle side="left" selected={breastSide === "left" || breastSide === "both"} onClick={() => setBreastSide(breastSide === "right" ? "both" : "left")} label="LEFT" />
            <BreastCircle side="right" selected={breastSide === "right" || breastSide === "both"} onClick={() => setBreastSide(breastSide === "left" ? "both" : "right")} label="RIGHT" />
          </div>
          <div style={{ textAlign: "center", fontSize: 12, color: C.t3, marginBottom: 12 }}>Selected: <strong style={{ color: C.feed }}>{breastSide}</strong></div>

          {/* Timer / Manual toggle */}
          <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            <button style={S.chip(mode === "timer", C.feed)} onClick={() => setMode("timer")}>⏱ Timer</button>
            <button style={S.chip(mode === "manual", C.feed)} onClick={() => setMode("manual")}>✏️ Manual</button>
          </div>

          {mode === "timer" && (
            <div style={{ textAlign: "center", padding: 20, background: C.feedL, borderRadius: 16, marginBottom: 16 }}>
              {isTimerActive ? <TimerDisplay startTime={activeTimer.startTime} color={C.feed} /> : <div style={{ ...S.timer, color: C.feed }}>00:00</div>}
              <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 16 }}>
                {!isTimerActive ? (
                  <button style={S.btn("primary")} onClick={() => onStartTimer("feed")}><Icon name="play" size={16} color="white" /> Start</button>
                ) : (
                  <button style={S.btn("danger")} onClick={() => { setStoppedDuration(Date.now() - new Date(activeTimer.startTime).getTime()); onStopTimer("feed"); }}><Icon name="stop" size={16} color={C.danger} /> Stop</button>
                )}
              </div>
            </div>
          )}

          {mode === "manual" && (
            <div style={{ padding: 16, background: C.feedL, borderRadius: 16, marginBottom: 16 }}>
              <label style={S.label}>When</label>
              <input style={{ ...S.input, marginBottom: 12 }} type="datetime-local" value={manualTime} onChange={(e) => setManualTime(e.target.value)} />
              <label style={S.label}>Duration (minutes)</label>
              <input style={{ ...S.input }} type="number" value={manualDuration} onChange={(e) => setManualDuration(e.target.value)} placeholder="e.g. 15" />
            </div>
          )}
        </>
      )}

      {feedType === "expression" && (
        <>
          <label style={S.label}>Expressed From</label>
          <div style={{ display: "flex", gap: 20, justifyContent: "center", marginBottom: 16 }}>
            <ExpressionCircle side="left" selected={expressionSide === "left" || expressionSide === "both"} onClick={() => setExpressionSide(expressionSide === "right" ? "both" : "left")} label="LEFT" />
            <ExpressionCircle side="right" selected={expressionSide === "right" || expressionSide === "both"} onClick={() => setExpressionSide(expressionSide === "left" ? "both" : "right")} label="RIGHT" />
          </div>
          <div style={{ textAlign: "center", fontSize: 12, color: C.t3, marginBottom: 12 }}>Expressed from: <strong style={{ color: C.feed }}>{expressionSide}</strong></div>
          <label style={S.label}>Amount (ml)</label>
          <input style={{ ...S.input, marginBottom: 16 }} type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="e.g. 120" />
        </>
      )}

      {feedType === "formula" && (
        <>
          <label style={S.label}>Amount (ml)</label>
          <input style={{ ...S.input, marginBottom: 12 }} type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="e.g. 120" />
          <label style={S.label}>Brand</label>
          <input style={{ ...S.input, marginBottom: 16 }} value={formulaBrand} onChange={(e) => setFormulaBrand(e.target.value)} placeholder="e.g. Similac, Aptamil, Hero" />
        </>
      )}

      {/* Next Feed Window */}
      {recs && lastFeed && (
        <NextWindowBadge label="Feed" lastTimestamp={lastFeed.timestamp} intervalMins={recs.feedInterval} />
      )}

      <label style={{ ...S.label, marginTop: 16 }}>Notes</label>
      <input style={{ ...S.input, marginBottom: 20 }} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional notes..." />
      <button style={{ ...S.btn("primary"), width: "100%" }} onClick={handleSave}>Save Feeding</button>
    </Modal>
  );
};

// ============================================================
// DIAPER LOGGER
// ============================================================
const DiaperLogger = ({ isOpen, onClose, onSave }) => {
  const [content, setContent] = useState("wet");
  const [stoolColor, setStoolColor] = useState("");
  const [notes, setNotes] = useState("");
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Log Diaper">
      <label style={S.label}>Content</label>
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {["wet", "stool", "both"].map((c) => (
          <button key={c} style={{ ...S.chip(content === c, C.diaper), flex: 1 }} onClick={() => setContent(c)}>
            {c === "wet" ? "💧 Wet" : c === "stool" ? "💩 Stool" : "💧💩 Both"}
          </button>
        ))}
      </div>
      {content !== "wet" && (
        <>
          <label style={S.label}>Stool Color</label>
          <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
            {[["yellow", "#F4D03F"], ["green", "#2ECC71"], ["brown", "#8B4513"], ["black", "#2C3E50"], ["red", "#E74C3C"], ["white", "#ECF0F1"]].map(([n, bg]) => (
              <button key={n} onClick={() => setStoolColor(n)} style={{ width: 36, height: 36, borderRadius: 18, border: stoolColor === n ? `3px solid ${C.pri}` : `2px solid ${C.border}`, background: bg, cursor: "pointer" }} />
            ))}
          </div>
        </>
      )}
      <label style={S.label}>Notes</label>
      <input style={{ ...S.input, marginBottom: 20 }} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional notes..." />
      <button style={{ ...S.btn("primary"), width: "100%" }} onClick={() => { onSave({ id: generateId(), type: "diaper", timestamp: new Date().toISOString(), content, stoolColor: content !== "wet" ? stoolColor : "", notes }); setContent("wet"); setStoolColor(""); setNotes(""); onClose(); }}>Save Diaper</button>
    </Modal>
  );
};

// ============================================================
// SLEEP LOGGER (Gentle — with context notes for regressions, illness, etc.)
// ============================================================
const SleepLogger = ({ isOpen, onClose, onSave, activeTimer, onStartTimer, onStopTimer, ageWeeks, lastSleep, contextNotes, onAddContextNote }) => {
  const [mode, setMode] = useState("timer");
  const [manualStart, setManualStart] = useState("");
  const [manualEnd, setManualEnd] = useState("");
  const [notes, setNotes] = useState("");
  const [showContext, setShowContext] = useState(false);
  const [contextText, setContextText] = useState("");
  const isTimerActive = activeTimer?.type === "sleep";
  const recs = ageWeeks !== null ? getAgeRecommendations(ageWeeks) : null;

  const activeSleepNotes = (contextNotes || []).filter((n) => n.active && (n.category === "sleep" || n.category === "general"));

  const quickContextTags = [
    { label: "Sleep regression", emoji: "🔄" },
    { label: "Teething", emoji: "🦷" },
    { label: "Growth spurt", emoji: "📈" },
    { label: "Not feeling well", emoji: "🤒" },
    { label: "Routine change", emoji: "✈️" },
    { label: "Overtired", emoji: "😫" },
  ];

  const handleAddContext = (text) => {
    if (!text.trim()) return;
    onAddContextNote({ id: generateId(), text: text.trim(), category: "sleep", active: true, createdAt: new Date().toISOString() });
    setContextText("");
    setShowContext(false);
  };

  const handleSaveTimer = () => {
    onSave({ id: generateId(), type: "sleep", timestamp: isTimerActive ? activeTimer.startTime : new Date().toISOString(), endTime: new Date().toISOString(), duration: isTimerActive ? Date.now() - new Date(activeTimer.startTime).getTime() : 0, notes });
    if (isTimerActive) onStopTimer("sleep");
    setNotes(""); onClose();
  };
  const handleSaveManual = () => {
    if (!manualStart || !manualEnd) return;
    const start = new Date(manualStart);
    const end = new Date(manualEnd);
    const dur = end.getTime() - start.getTime();
    if (dur <= 0) return;
    onSave({ id: generateId(), type: "sleep", timestamp: start.toISOString(), endTime: end.toISOString(), duration: dur, notes });
    setManualStart(""); setManualEnd(""); setNotes(""); onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Log Sleep">
      {/* Active context notes banner */}
      {activeSleepNotes.length > 0 && (
        <div style={{ padding: "10px 14px", borderRadius: 12, background: C.pri + "08", border: `1px solid ${C.pri}15`, marginBottom: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: C.pri, marginBottom: 4 }}>📌 Active Notes</div>
          {activeSleepNotes.map((n) => (
            <div key={n.id} style={{ fontSize: 12, color: C.t2, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "2px 0" }}>
              <span>{n.text}</span>
              <button onClick={() => onAddContextNote({ ...n, active: false })} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 10, color: C.t3, padding: "2px 6px" }}>dismiss</button>
            </div>
          ))}
          <div style={{ fontSize: 11, color: C.t3, marginTop: 4 }}>Recommendations are adjusted while these are active</div>
        </div>
      )}

      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <button style={S.chip(mode === "timer", C.sleep)} onClick={() => setMode("timer")}>⏱ Timer</button>
        <button style={S.chip(mode === "manual", C.sleep)} onClick={() => setMode("manual")}>✏️ Manual</button>
        <button style={{ ...S.chip(showContext, C.pri), marginLeft: "auto" }} onClick={() => setShowContext(!showContext)}>📌 Add Note</button>
      </div>

      {/* Context note input */}
      {showContext && (
        <div style={{ padding: 14, background: C.priL, borderRadius: 12, marginBottom: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: C.pri, marginBottom: 8 }}>What's happening right now?</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
            {quickContextTags.map((tag) => (
              <button key={tag.label} style={{ padding: "6px 12px", borderRadius: 16, border: `1px solid ${C.pri}30`, background: "white", fontSize: 12, cursor: "pointer", fontFamily: "inherit" }} onClick={() => handleAddContext(tag.label)}>
                {tag.emoji} {tag.label}
              </button>
            ))}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <input style={{ ...S.input, flex: 1 }} value={contextText} onChange={(e) => setContextText(e.target.value)} placeholder="Or type your own note..." onKeyDown={(e) => e.key === "Enter" && handleAddContext(contextText)} />
            <button style={{ ...S.btn("primary"), padding: "10px 16px" }} onClick={() => handleAddContext(contextText)}>Add</button>
          </div>
          <p style={{ fontSize: 11, color: C.t3, marginTop: 8 }}>
            This tells the app not to worry about unusual patterns. It'll adjust recommendations and won't show alarming alerts.
          </p>
        </div>
      )}

      {mode === "timer" && (
        <div style={{ textAlign: "center", padding: 24, background: C.sleepL, borderRadius: 16, marginBottom: 16 }}>
          <span style={{ fontSize: 32 }}>😴</span>
          <div style={{ marginTop: 12 }}>
            {isTimerActive ? <TimerDisplay startTime={activeTimer.startTime} color={C.sleep} /> : <div style={{ ...S.timer, color: C.sleep }}>00:00</div>}
          </div>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 16 }}>
            {!isTimerActive ? (
              <button style={{ ...S.btn("primary"), background: C.sleep }} onClick={() => onStartTimer("sleep")}><Icon name="play" size={16} color="white" /> Baby fell asleep</button>
            ) : (
              <button style={S.btn("danger")} onClick={handleSaveTimer}><Icon name="stop" size={16} color={C.danger} /> Baby woke up</button>
            )}
          </div>
        </div>
      )}

      {mode === "manual" && (
        <div style={{ padding: 16, background: C.sleepL, borderRadius: 16, marginBottom: 16 }}>
          <label style={S.label}>Fell Asleep</label>
          <input style={{ ...S.input, marginBottom: 12 }} type="datetime-local" value={manualStart} onChange={(e) => setManualStart(e.target.value)} />
          <label style={S.label}>Woke Up</label>
          <input style={{ ...S.input, marginBottom: 12 }} type="datetime-local" value={manualEnd} onChange={(e) => setManualEnd(e.target.value)} />
          {manualStart && manualEnd && new Date(manualEnd) > new Date(manualStart) && (
            <div style={{ textAlign: "center", padding: 8, fontSize: 20, fontWeight: 700, color: C.sleep }}>
              {formatDuration(new Date(manualEnd).getTime() - new Date(manualStart).getTime())}
            </div>
          )}
        </div>
      )}

      {/* Next Sleep Window — gentle, context-aware */}
      {recs && lastSleep && (
        <NextWindowBadge label="Sleep" lastTimestamp={lastSleep.endTime || lastSleep.timestamp} intervalMins={recs.sleepWake} contextNotes={contextNotes} />
      )}

      <label style={{ ...S.label, marginTop: 12 }}>Notes</label>
      <input style={{ ...S.input, marginBottom: 20 }} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="e.g. nap location, fussiness..." />
      {mode === "manual" && <button style={{ ...S.btn("primary"), width: "100%", background: C.sleep, opacity: manualStart && manualEnd ? 1 : 0.5 }} onClick={handleSaveManual}>Save Sleep</button>}
      {mode === "timer" && !isTimerActive && <button style={{ ...S.btn("primary"), width: "100%", background: C.sleep }} onClick={handleSaveTimer}>Save Sleep</button>}
    </Modal>
  );
};

// ============================================================
// ACTIVITIES PAGE (Replaces Tummy Time)
// ============================================================
const ActivitiesPage = ({ state, onSave }) => {
  const ageWeeks = state.baby?.birthDate ? getBabyAgeWeeks(state.baby.birthDate) : 0;
  const activities = getActivitiesForAge(ageWeeks);
  const todayKey = toDateKey(new Date());
  const todayCompleted = state.events.filter((e) => e.type === "activity" && toDateKey(e.timestamp) === todayKey);
  const completedIds = new Set(todayCompleted.map((e) => e.activityTitle));

  const handleToggle = (activity) => {
    if (completedIds.has(activity.title)) return;
    onSave({ id: generateId(), type: "activity", timestamp: new Date().toISOString(), activityTitle: activity.title, duration: activity.duration * 60000, notes: "" });
  };

  const totalDone = todayCompleted.length;
  const totalActivities = activities.length;
  const progressPct = Math.round((totalDone / totalActivities) * 100);

  return (
    <div style={S.page}>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Daily Activities</h2>
      <p style={{ fontSize: 13, color: C.t2, marginBottom: 16 }}>Recommended for week {ageWeeks} · {totalDone}/{totalActivities} completed today</p>

      {/* Progress bar */}
      <div style={{ ...S.card, padding: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: C.activity }}>Today's Progress</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: C.activity }}>{progressPct}%</span>
        </div>
        <div style={{ height: 8, background: C.border, borderRadius: 4, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${progressPct}%`, background: `linear-gradient(90deg, ${C.activity}, #FBBF24)`, borderRadius: 4, transition: "width 0.5s" }} />
        </div>
      </div>

      {activities.map((act, i) => {
        const done = completedIds.has(act.title);
        return (
          <div key={i} style={{ ...S.card, display: "flex", alignItems: "center", gap: 12, opacity: done ? 0.7 : 1, border: done ? `1px solid ${C.success}30` : undefined }}>
            <button
              onClick={() => handleToggle(act)}
              style={{ width: 36, height: 36, borderRadius: 18, border: done ? "none" : `2px solid ${C.border}`, background: done ? C.success : "transparent", display: "flex", alignItems: "center", justifyContent: "center", cursor: done ? "default" : "pointer", flexShrink: 0 }}
            >
              {done && <Icon name="check" size={16} color="white" />}
            </button>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 18 }}>{act.icon}</span>
                <span style={{ fontSize: 14, fontWeight: 600, textDecoration: done ? "line-through" : "none" }}>{act.title}</span>
              </div>
              <div style={{ fontSize: 12, color: C.t3, marginTop: 2 }}>{act.description}</div>
              <div style={{ fontSize: 11, color: C.activity, fontWeight: 600, marginTop: 4 }}>~{act.duration} min</div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

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
const AppointmentLogger = ({ isOpen, onClose, onSave, customVaccines }) => {
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

const CalendarPage = ({ state, onAddEvent }) => {
  const [calView, setCalView] = useState("month"); // month | week | day
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMonth, setViewMonth] = useState(new Date());
  const [showAdd, setShowAdd] = useState(false);
  const [addDate, setAddDate] = useState(null);
  const [newTitle, setNewTitle] = useState("");
  const [newTime, setNewTime] = useState("");
  const [newEndTime, setNewEndTime] = useState("");
  const [newNotes, setNewNotes] = useState("");
  const [repeatType, setRepeatType] = useState("none"); // none | daily | weekly
  const [repeatCount, setRepeatCount] = useState("7");
  const [repeatTimesPerDay, setRepeatTimesPerDay] = useState("1");
  const dayScrollRef = useRef(null);

  // scroll to 6 AM on day/week mount
  useEffect(() => {
    if ((calView === "day" || calView === "week") && dayScrollRef.current) {
      dayScrollRef.current.scrollTop = 6 * HOUR_HEIGHT;
    }
  }, [calView, selectedDate]);

  const allEvents = useMemo(() => [
    ...state.calendarEvents,
    ...state.appointments.map((a) => ({ ...a, calType: a.type === "vaccination" ? "💉" : "🩺" })),
  ], [state.calendarEvents, state.appointments]);

  const eventsForDate = useCallback((dateKey) => allEvents.filter((e) => toDateKey(e.date) === dateKey), [allEvents]);
  const trackingForDate = useCallback((dateKey) => state.events.filter((e) => toDateKey(e.timestamp) === dateKey), [state.events]);

  const gcalUrl = (ev) => {
    const d = (ev.date || "").replace(/-/g, "");
    const t = ev.time ? ev.time.replace(/:/g, "") + "00" : "090000";
    const eT = ev.endTime ? ev.endTime.replace(/:/g, "") + "00" : (ev.time ? String(Math.min(23, parseInt(ev.time.split(":")[0]) + 1)).padStart(2, "0") + ev.time.split(":")[1] + "00" : "100000");
  };

  const openAdd = (date) => { setAddDate(date); setNewTitle(""); setNewTime(""); setNewEndTime(""); setNewNotes(""); setRepeatType("none"); setRepeatCount("7"); setRepeatTimesPerDay("1"); setShowAdd(true); };
  const handleAddEvent = () => {
    if (!newTitle || !addDate) return;

    if (repeatType === "none") {
      onAddEvent({ id: generateId(), title: newTitle, date: toDateKey(addDate), time: newTime, endTime: newEndTime, notes: newNotes, type: "custom" });
    } else {
      const days = repeatType === "daily" ? parseInt(repeatCount) || 7 : (parseInt(repeatCount) || 4) * 7;
      const timesPerDay = parseInt(repeatTimesPerDay) || 1;
      const times = timesPerDay === 1 ? [newTime || "09:00"] : timesPerDay === 2 ? [newTime || "09:00", newEndTime || "21:00"] : timesPerDay === 3 ? ["08:00", "14:00", "20:00"] : ["06:00", "10:00", "14:00", "20:00"];

      for (let d = 0; d < days; d++) {
        if (repeatType === "weekly" && d % 7 !== 0) continue;
        const eventDate = new Date(addDate);
        eventDate.setDate(eventDate.getDate() + d);
        const dateKey = toDateKey(eventDate);
        for (const t of times.slice(0, timesPerDay)) {
          onAddEvent({ id: generateId(), title: newTitle, date: dateKey, time: t, notes: newNotes, type: "custom", recurring: true });
        }
      }
    }
    setShowAdd(false);
  };

  // Navigation helpers
  const year = viewMonth.getFullYear(), month = viewMonth.getMonth();
  const prevMonth = () => setViewMonth(new Date(year, month - 1, 1));
  const nextMonth = () => setViewMonth(new Date(year, month + 1, 1));

  const getWeekDays = (d) => {
    const dt = new Date(d);
    const day = dt.getDay();
    const sun = new Date(dt); sun.setDate(dt.getDate() - day);
    return Array.from({ length: 7 }, (_, i) => { const dd = new Date(sun); dd.setDate(sun.getDate() + i); return dd; });
  };
  const weekDays = getWeekDays(selectedDate);

  const prevWeek = () => { const d = new Date(selectedDate); d.setDate(d.getDate() - 7); setSelectedDate(d); };
  const nextWeek = () => { const d = new Date(selectedDate); d.setDate(d.getDate() + 7); setSelectedDate(d); };
  const prevDay = () => { const d = new Date(selectedDate); d.setDate(d.getDate() - 1); setSelectedDate(d); };
  const nextDay = () => { const d = new Date(selectedDate); d.setDate(d.getDate() + 1); setSelectedDate(d); };

  const todayKey = toDateKey(new Date());

  // Shared event row component
  const EventRow = ({ ev, compact = false }) => (
    <div style={{ display: "flex", alignItems: "center", gap: compact ? 6 : 12, padding: compact ? "4px 0" : "10px 0", borderBottom: `1px solid ${C.borderL}` }}>
      <div style={{ width: compact ? 24 : 32, height: compact ? 24 : 32, borderRadius: compact ? 6 : 8, background: C.calendarL, display: "flex", alignItems: "center", justifyContent: "center", fontSize: compact ? 11 : 14, flexShrink: 0 }}>
        {ev.calType || "📅"}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: compact ? 12 : 13, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ev.title}</div>
        <div style={{ fontSize: compact ? 10 : 11, color: C.t3 }}>{ev.time || "All day"}{ev.endTime ? `–${ev.endTime}` : ""}{!compact && ev.notes ? ` · ${ev.notes}` : ""}</div>
      </div>
      {!compact && (
        <a href={gcalUrl(ev)} target="_blank" rel="noopener noreferrer" style={{ padding: "4px 8px", borderRadius: 6, background: C.priL, fontSize: 10, fontWeight: 600, color: C.pri, textDecoration: "none", flexShrink: 0 }}>
          + GCal
        </a>
      )}
    </div>
  );

  // Tracking row
  const TrackingRow = ({ ev }) => (
    <div style={{ fontSize: 12, color: C.t2, padding: "3px 0", display: "flex", alignItems: "center", gap: 6 }}>
      <span style={{ fontSize: 13 }}>{ev.type === "feed" ? "🍼" : ev.type === "diaper" ? "🧷" : ev.type === "sleep" ? "😴" : "🤸"}</span>
      <span>{ev.type === "feed" ? `${ev.feedType} feed` : ev.type === "diaper" ? `Diaper (${ev.content})` : ev.type === "sleep" ? `Sleep ${formatDuration(ev.duration)}` : ev.activityTitle || ev.type}</span>
      <span style={{ color: C.t3, marginLeft: "auto", fontSize: 11 }}>{formatTime(ev.timestamp)}</span>
    </div>
  );

  // ---- TIME GRID (shared for week & day) ----
  const TimeGrid = ({ dates, narrow = false }) => {
    const colW = narrow ? "100%" : `${100 / dates.length}%`;
    return (
      <div ref={dayScrollRef} style={{ overflow: "auto", maxHeight: "calc(100vh - 260px)", position: "relative" }}>
        {/* Hour lines */}
        <div style={{ display: "flex", minHeight: HOURS.length * HOUR_HEIGHT }}>
          {/* Time gutter */}
          <div style={{ width: 44, flexShrink: 0 }}>
            {HOURS.map((h) => (
              <div key={h} style={{ height: HOUR_HEIGHT, display: "flex", alignItems: "flex-start", justifyContent: "flex-end", paddingRight: 6, paddingTop: 0 }}>
                <span style={{ fontSize: 10, color: C.t3, fontWeight: 500, lineHeight: 1, transform: "translateY(-5px)" }}>
                  {h === 0 ? "" : h < 12 ? `${h} AM` : h === 12 ? "12 PM" : `${h - 12} PM`}
                </span>
              </div>
            ))}
          </div>

          {/* Columns */}
          <div style={{ flex: 1, display: "flex", position: "relative" }}>
            {dates.map((d, ci) => {
              const dk = toDateKey(d);
              const dayEvs = eventsForDate(dk);
              const dayTrack = trackingForDate(dk);
              // combine and sort by time
              const timed = [
                ...dayEvs.map((e) => ({ ...e, _sort: e.time || "00:00", _type: "event" })),
                ...dayTrack.map((e) => ({ ...e, _sort: new Date(e.timestamp).toTimeString().slice(0, 5), _type: "track" })),
              ].sort((a, b) => a._sort.localeCompare(b._sort));

              return (
                <div
                  key={ci}
                  style={{ flex: 1, position: "relative", borderLeft: `1px solid ${C.borderL}`, minWidth: 0 }}
                  onClick={() => { setSelectedDate(d); if (narrow) return; setCalView("day"); }}
                >
                  {/* Hour grid lines */}
                  {HOURS.map((h) => (
                    <div key={h} style={{ height: HOUR_HEIGHT, borderBottom: `1px solid ${C.borderL}` }} />
                  ))}

                  {/* Render events at their time positions */}
                  {timed.map((item, ei) => {
                    const timeParts = item._sort.split(":");
                    const hourVal = parseInt(timeParts[0]) + parseInt(timeParts[1]) / 60;
                    const top = hourVal * HOUR_HEIGHT;
                    const isEvent = item._type === "event";
                    return (
                      <div
                        key={`${dk}-${ei}`}
                        style={{
                          position: "absolute",
                          top,
                          left: 2,
                          right: 2,
                          padding: "3px 5px",
                          borderRadius: 6,
                          fontSize: 10,
                          fontWeight: 600,
                          lineHeight: 1.3,
                          background: isEvent ? C.pri + "20" : item.type === "feed" ? C.feed + "20" : item.type === "sleep" ? C.sleep + "20" : item.type === "diaper" ? C.diaper + "20" : C.activity + "20",
                          color: isEvent ? C.pri : item.type === "feed" ? C.feed : item.type === "sleep" ? C.sleep : item.type === "diaper" ? C.diaper : C.activity,
                          borderLeft: `3px solid ${isEvent ? C.pri : item.type === "feed" ? C.feed : item.type === "sleep" ? C.sleep : item.type === "diaper" ? C.diaper : C.activity}`,
                          overflow: "hidden",
                          whiteSpace: "nowrap",
                          textOverflow: "ellipsis",
                          zIndex: 5,
                          minHeight: 20,
                          cursor: "default",
                        }}
                      >
                        {isEvent ? (item.calType ? `${item.calType} ` : "📅 ") : ""}{item.title || item.activityTitle || `${item.type}`}
                      </div>
                    );
                  })}

                  {/* Current time indicator */}
                  {dk === todayKey && (() => {
                    const now = new Date();
                    const nowH = now.getHours() + now.getMinutes() / 60;
                    return (
                      <div style={{ position: "absolute", top: nowH * HOUR_HEIGHT, left: 0, right: 0, zIndex: 10, pointerEvents: "none" }}>
                        <div style={{ display: "flex", alignItems: "center" }}>
                          <div style={{ width: 8, height: 8, borderRadius: 4, background: C.danger, marginLeft: -4 }} />
                          <div style={{ flex: 1, height: 2, background: C.danger }} />
                        </div>
                      </div>
                    );
                  })()}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  // ============ MONTH VIEW ============
  const MonthView = () => {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const selKey = toDateKey(selectedDate);
    const selEvents = eventsForDate(selKey);
    const selTracking = trackingForDate(selKey);

    return (
      <>
        <div style={S.card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <button style={S.btn("ghost")} onClick={prevMonth}><Icon name="back" size={18} /></button>
            <span style={{ fontSize: 16, fontWeight: 700 }}>{viewMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}</span>
            <button style={{ ...S.btn("ghost"), transform: "rotate(180deg)" }} onClick={nextMonth}><Icon name="back" size={18} /></button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2, marginBottom: 4 }}>
            {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
              <div key={i} style={{ textAlign: "center", fontSize: 11, fontWeight: 600, color: C.t3, padding: 4 }}>{d}</div>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2 }}>
            {Array.from({ length: firstDay }, (_, i) => <div key={`e${i}`} />)}
            {Array.from({ length: daysInMonth }, (_, i) => {
              const day = i + 1;
              const dateKey = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
              const isSelected = dateKey === selKey;
              const isToday = dateKey === todayKey;
              const dayEvents = eventsForDate(dateKey);
              const dayTracking = trackingForDate(dateKey);
              const hasContent = dayEvents.length > 0 || dayTracking.length > 0;
              return (
                <button
                  key={day}
                  onClick={() => setSelectedDate(new Date(year, month, day))}
                  style={{ width: "100%", aspectRatio: "1", borderRadius: 12, border: "none", background: isSelected ? C.pri : isToday ? C.priL : "transparent", color: isSelected ? "white" : C.text, fontWeight: isSelected || isToday ? 700 : 400, fontSize: 14, cursor: "pointer", position: "relative", fontFamily: "inherit" }}
                >
                  {day}
                  {hasContent && (
                    <div style={{ position: "absolute", bottom: 3, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 2 }}>
                      {dayEvents.length > 0 && <div style={{ width: 4, height: 4, borderRadius: 2, background: isSelected ? "white" : C.pri }} />}
                      {dayTracking.length > 0 && <div style={{ width: 4, height: 4, borderRadius: 2, background: isSelected ? "rgba(255,255,255,0.6)" : C.feed }} />}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected date detail */}
        <div style={{ ...S.card, marginTop: 4 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: C.t2 }}>{formatDateFull(selectedDate)}</h3>
            <div style={{ display: "flex", gap: 6 }}>
              <button style={{ ...S.btn("ghost"), padding: "6px 8px", fontSize: 11 }} onClick={() => { setSelectedDate(selectedDate); setCalView("day"); }}>
                Day →
              </button>
              <button style={{ ...S.btn("secondary"), padding: "6px 12px", fontSize: 12 }} onClick={() => openAdd(selectedDate)}>
                <Icon name="plus" size={14} color={C.pri} /> Add
              </button>
            </div>
          </div>
          {selEvents.length === 0 && selTracking.length === 0 && (
            <p style={{ fontSize: 13, color: C.t3, textAlign: "center", padding: 16 }}>No events on this day</p>
          )}
          {selEvents.map((ev) => <EventRow key={ev.id} ev={ev} />)}
          {selTracking.length > 0 && (
            <div style={{ marginTop: selEvents.length > 0 ? 8 : 0 }}>
              {selEvents.length > 0 && <div style={{ fontSize: 11, fontWeight: 600, color: C.t3, textTransform: "uppercase", marginBottom: 4 }}>Tracking</div>}
              {selTracking.slice(0, 8).map((ev) => <TrackingRow key={ev.id} ev={ev} />)}
            </div>
          )}
        </div>
      </>
    );
  };

  // ============ WEEK VIEW ============
  const WeekView = () => {
    const weekLabel = `${weekDays[0].toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${weekDays[6].toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;
    return (
      <>
        {/* Week header */}
        <div style={S.card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <button style={S.btn("ghost")} onClick={prevWeek}><Icon name="back" size={18} /></button>
            <span style={{ fontSize: 14, fontWeight: 700 }}>{weekLabel}</span>
            <button style={{ ...S.btn("ghost"), transform: "rotate(180deg)" }} onClick={nextWeek}><Icon name="back" size={18} /></button>
          </div>
          {/* Day headers */}
          <div style={{ display: "flex", paddingLeft: 44 }}>
            {weekDays.map((d, i) => {
              const dk = toDateKey(d);
              const isToday = dk === todayKey;
              const isSel = dk === toDateKey(selectedDate);
              return (
                <div
                  key={i}
                  onClick={() => setSelectedDate(d)}
                  style={{ flex: 1, textAlign: "center", cursor: "pointer", padding: "4px 0" }}
                >
                  <div style={{ fontSize: 10, fontWeight: 600, color: C.t3, textTransform: "uppercase" }}>
                    {d.toLocaleDateString("en-US", { weekday: "short" })}
                  </div>
                  <div style={{
                    width: 28, height: 28, borderRadius: 14, margin: "2px auto 0",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 13, fontWeight: isToday || isSel ? 700 : 400,
                    background: isSel ? C.pri : isToday ? C.priL : "transparent",
                    color: isSel ? "white" : C.text,
                  }}>
                    {d.getDate()}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        {/* Time grid */}
        <div style={{ ...S.card, padding: 0, overflow: "hidden" }}>
          <TimeGrid dates={weekDays} />
        </div>
        {/* FAB */}
        <button onClick={() => openAdd(selectedDate)} style={{ position: "fixed", bottom: 90, right: "calc(50% - 220px)", width: 48, height: 48, borderRadius: 24, background: C.pri, color: "white", border: "none", boxShadow: "0 4px 12px rgba(91,127,255,0.4)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }}>
          <Icon name="plus" size={22} color="white" />
        </button>
      </>
    );
  };

  // ============ DAY VIEW ============
  const DayView = () => {
    const dayLabel = selectedDate.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
    const dk = toDateKey(selectedDate);
    const dayEvs = eventsForDate(dk);

    return (
      <>
        {/* Day header */}
        <div style={S.card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <button style={S.btn("ghost")} onClick={prevDay}><Icon name="back" size={18} /></button>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 14, fontWeight: 700 }}>{dayLabel}</div>
              {dk === todayKey && <div style={{ fontSize: 11, color: C.pri, fontWeight: 600 }}>Today</div>}
            </div>
            <button style={{ ...S.btn("ghost"), transform: "rotate(180deg)" }} onClick={nextDay}><Icon name="back" size={18} /></button>
          </div>
        </div>
        {/* All-day events */}
        {dayEvs.filter((e) => !e.time).length > 0 && (
          <div style={{ ...S.card, padding: 12 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: C.t3, textTransform: "uppercase", marginBottom: 6 }}>All Day</div>
            {dayEvs.filter((e) => !e.time).map((ev) => (
              <div key={ev.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 8px", borderRadius: 8, background: C.pri + "15", marginBottom: 4 }}>
                <span style={{ fontSize: 12 }}>{ev.calType || "📅"}</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: C.pri, flex: 1 }}>{ev.title}</span>
                <a href={gcalUrl(ev)} target="_blank" rel="noopener noreferrer" style={{ fontSize: 10, fontWeight: 600, color: C.pri, textDecoration: "none" }}>+GCal</a>
              </div>
            ))}
          </div>
        )}
        {/* Time grid */}
        <div style={{ ...S.card, padding: 0, overflow: "hidden" }}>
          <TimeGrid dates={[selectedDate]} narrow />
        </div>
        {/* Timed event list with GCal links */}
        {dayEvs.filter((e) => e.time).length > 0 && (
          <div style={{ ...S.card }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: C.t3, textTransform: "uppercase", marginBottom: 8 }}>Events</div>
            {dayEvs.filter((e) => e.time).sort((a, b) => (a.time || "").localeCompare(b.time || "")).map((ev) => <EventRow key={ev.id} ev={ev} />)}
          </div>
        )}
        {/* FAB */}
        <button onClick={() => openAdd(selectedDate)} style={{ position: "fixed", bottom: 90, right: "calc(50% - 220px)", width: 48, height: 48, borderRadius: 24, background: C.pri, color: "white", border: "none", boxShadow: "0 4px 12px rgba(91,127,255,0.4)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }}>
          <Icon name="plus" size={22} color="white" />
        </button>
      </>
    );
  };

  return (
    <div style={S.page}>
      {/* Top bar: title + view toggle */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700 }}>Calendar</h2>
        <button style={{ ...S.btn("ghost"), padding: "4px 8px", fontSize: 12, color: C.pri }} onClick={() => { setSelectedDate(new Date()); setViewMonth(new Date()); }}>Today</button>
      </div>

      {/* View switcher — Google Calendar style segmented control */}
      <div style={{ display: "flex", background: C.borderL, borderRadius: 10, padding: 3, marginBottom: 14 }}>
        {[
          { id: "month", label: "Month" },
          { id: "week", label: "Week" },
          { id: "day", label: "Day" },
        ].map((v) => (
          <button
            key={v.id}
            onClick={() => setCalView(v.id)}
            style={{
              flex: 1, padding: "8px 0", borderRadius: 8, border: "none", fontFamily: "inherit",
              fontSize: 13, fontWeight: calView === v.id ? 700 : 500, cursor: "pointer",
              background: calView === v.id ? "white" : "transparent",
              color: calView === v.id ? C.pri : C.t2,
              boxShadow: calView === v.id ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
              transition: "all 0.2s",
            }}
          >
            {v.label}
          </button>
        ))}
      </div>

      {/* Render active view */}
      {calView === "month" && <MonthView />}
      {calView === "week" && <WeekView />}
      {calView === "day" && <DayView />}

      {/* Add Event Modal */}
      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title={`Add Event · ${addDate ? formatDate(addDate) : ""}`}>
        <label style={S.label}>Title</label>
        <input style={{ ...S.input, marginBottom: 12 }} value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="e.g. Pediatrician visit" />
        <div style={{ display: "flex", gap: 8 }}>
          <div style={{ flex: 1 }}>
            <label style={S.label}>Start Time</label>
            <input style={{ ...S.input, marginBottom: 12 }} type="time" value={newTime} onChange={(e) => setNewTime(e.target.value)} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={S.label}>End Time</label>
            <input style={{ ...S.input, marginBottom: 12 }} type="time" value={newEndTime} onChange={(e) => setNewEndTime(e.target.value)} />
          </div>
        </div>
        <label style={S.label}>Notes</label>
        <input style={{ ...S.input, marginBottom: 12 }} value={newNotes} onChange={(e) => setNewNotes(e.target.value)} placeholder="Optional notes..." />

        {/* Repeat Options */}
        <label style={S.label}>Repeat</label>
        <div style={{ display: "flex", gap: 6, marginBottom: 12, flexWrap: "wrap" }}>
          <button style={S.chip(repeatType === "none", C.pri)} onClick={() => setRepeatType("none")}>Once</button>
          <button style={S.chip(repeatType === "daily", C.pri)} onClick={() => setRepeatType("daily")}>Daily</button>
          <button style={S.chip(repeatType === "weekly", C.pri)} onClick={() => setRepeatType("weekly")}>Weekly</button>
        </div>
        {repeatType !== "none" && (
          <div style={{ background: C.priL, borderRadius: 12, padding: 12, marginBottom: 12 }}>
            <div style={{ display: "flex", gap: 8 }}>
              <div style={{ flex: 1 }}>
                <label style={S.label}>{repeatType === "daily" ? "For how many days" : "For how many weeks"}</label>
                <input style={S.input} type="number" value={repeatCount} onChange={(e) => setRepeatCount(e.target.value)} placeholder={repeatType === "daily" ? "14" : "4"} />
              </div>
              {repeatType === "daily" && (
                <div style={{ flex: 1 }}>
                  <label style={S.label}>Times per day</label>
                  <div style={{ display: "flex", gap: 4 }}>
                    {["1", "2", "3"].map((n) => (<button key={n} style={{ ...S.chip(repeatTimesPerDay === n, C.pri), flex: 1, textAlign: "center" }} onClick={() => setRepeatTimesPerDay(n)}>{n}x</button>))}
                  </div>
                </div>
              )}
            </div>
            <p style={{ fontSize: 11, color: C.t3, marginTop: 8 }}>
              {repeatType === "daily" ? `Will create ${(parseInt(repeatCount) || 7) * (parseInt(repeatTimesPerDay) || 1)} events over ${repeatCount || 7} days` : `Will create events every ${repeatType === "weekly" ? "week" : "day"} for ${repeatCount || 4} weeks`}
            </p>
          </div>
        )}

        <button style={{ ...S.btn("primary"), width: "100%", opacity: newTitle ? 1 : 0.5 }} onClick={handleAddEvent}>Save Event{repeatType !== "none" ? "s" : ""}</button>
        <p style={{ fontSize: 11, color: C.t3, textAlign: "center", marginTop: 12 }}>After saving, click "+ GCal" on the event to add it to Google Calendar</p>
      </Modal>
    </div>
  );
};

// ============================================================
// GROWTH & HEALTH (Updated: custom vaccines)
// ============================================================
const GrowthPage = ({ state, onOpenLogger, customVaccines }) => {
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
const ChatPage = ({ state, onAddHealthLog, onAddContextNote, onAddAppointmentNote }) => {
  const [messages, setMessages] = useState([{ id: "w", role: "assistant", content: `Hi! I'm your baby care assistant for ${state.baby?.name || "your baby"}. I have access to all tracking data.\n\nI also watch for important health topics in our conversation — if you mention a fever, sleep regression, or teething, I'll offer to log it so the app can adapt its recommendations.\n\n💡 Try:\n• "My baby has a fever of 38.2"\n• "I think we're in a sleep regression"\n• "When should the next feed be?"` }]);
  const [input, setInput] = useState(""); const [loading, setLoading] = useState(false);
  const [detectedTopics, setDetectedTopics] = useState([]);
  const endRef = useRef(null);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  // Health topic detection patterns
  const HEALTH_PATTERNS = [
    { pattern: /fever|temperature|38|39|40|hot forehead/i, topic: "fever", category: "health", emoji: "🌡️", label: "Fever", appointmentNote: true },
    { pattern: /sleep regression|regressing|not sleeping|waking up a lot|won't sleep|keeps waking/i, topic: "sleep_regression", category: "sleep", emoji: "🔄", label: "Sleep Regression" },
    { pattern: /teeth|teething|drooling|biting|gum/i, topic: "teething", category: "general", emoji: "🦷", label: "Teething" },
    { pattern: /growth spurt|eating more|feeding more|hungry all the time/i, topic: "growth_spurt", category: "feed", emoji: "📈", label: "Growth Spurt" },
    { pattern: /cold|cough|runny nose|congested|sneezing|sick|ill|unwell/i, topic: "illness", category: "health", emoji: "🤧", label: "Cold/Illness", appointmentNote: true },
    { pattern: /rash|spots|red skin|eczema|allergic/i, topic: "rash", category: "health", emoji: "🔴", label: "Rash/Skin", appointmentNote: true },
    { pattern: /vomit|throwing up|spit up a lot|reflux/i, topic: "vomiting", category: "health", emoji: "🤢", label: "Vomiting/Reflux", appointmentNote: true },
    { pattern: /diarrhea|loose stool|watery poop/i, topic: "diarrhea", category: "health", emoji: "⚠️", label: "Diarrhea", appointmentNote: true },
    { pattern: /constipat|hard stool|not pooping|straining/i, topic: "constipation", category: "health", emoji: "⚠️", label: "Constipation", appointmentNote: true },
    { pattern: /colic|crying a lot|inconsolable|won't stop crying/i, topic: "colic", category: "general", emoji: "😭", label: "Colic/Excessive Crying" },
    { pattern: /vaccination|vaccine|shot|jab|side effect/i, topic: "vaccine_reaction", category: "health", emoji: "💉", label: "Vaccine Reaction", appointmentNote: true },
  ];

  const detectTopics = (text) => {
    return HEALTH_PATTERNS.filter((p) => p.pattern.test(text));
  };

  const handleLogTopic = (topic, userMessage) => {
    // Add to health log
    onAddHealthLog({
      id: generateId(),
      topic: topic.topic,
      label: topic.label,
      emoji: topic.emoji,
      category: topic.category,
      source: "ai_chat",
      userMessage: userMessage.substring(0, 200),
      timestamp: new Date().toISOString(),
    });

    // Add context note so recommendations adapt
    onAddContextNote({
      id: generateId(),
      text: topic.label,
      category: topic.category,
      active: true,
      createdAt: new Date().toISOString(),
    });

    // Remove from pending detections
    setDetectedTopics((prev) => prev.filter((d) => d.topic !== topic.topic));
  };

  const handleLogToDoctor = (topic, userMessage) => {
    handleLogTopic(topic, userMessage);
    // Also add to next doctor appointment notes
    onAddAppointmentNote(topic.label, userMessage.substring(0, 200));
    setDetectedTopics((prev) => prev.filter((d) => d.topic !== topic.topic));
  };

  const handleDismissTopic = (topicId) => {
    setDetectedTopics((prev) => prev.filter((d) => d.topic !== topicId));
  };

  const handleSend = () => {
    if (!input.trim() || loading) return;
    const msg = { id: generateId(), role: "user", content: input.trim() };
    setMessages((p) => [...p, msg]); setInput(""); setLoading(true);

    // Detect health topics from user message
    const topics = detectTopics(msg.content);
    if (topics.length > 0) {
      setDetectedTopics((prev) => {
        const existing = new Set(prev.map((d) => d.topic));
        const newTopics = topics.filter((t) => !existing.has(t.topic)).map((t) => ({ ...t, userMessage: msg.content }));
        return [...prev, ...newTopics];
      });
    }

    // Try real AI API first, fall back to built-in responses
    const tryRealAI = async () => {
      try {
        const { sendChat } = await import("./lib/ai.js");
        const chatHistory = [...messages.filter((m) => m.id !== "w"), msg].map((m) => ({ role: m.role, content: m.content }));
        const provider = state.settings?.aiProvider || "claude";
        const response = await sendChat(chatHistory, state, provider);
        setMessages((p) => [...p, { id: generateId(), role: "assistant", content: response }]);
        setLoading(false);
      } catch (apiErr) {
        console.warn("AI API failed, using built-in responses:", apiErr.message);
        // Fallback to built-in responses
        const ageWeeks = state.baby?.birthDate ? getBabyAgeWeeks(state.baby.birthDate) : null;
        const recs = ageWeeks !== null ? getAgeRecommendations(ageWeeks) : null;
        const q = msg.content.toLowerCase();
        let r = "";
        const activeNotes = (state.contextNotes || []).filter((n) => n.active);
        const contextStr = activeNotes.length > 0 ? `\n\n📌 I'm keeping in mind: ${activeNotes.map((n) => n.text).join(", ")}` : "";

        if (q.includes("sleep")) {
          const ts = getTodayEvents(state.events, "sleep");
          const total = ts.reduce((s, e) => s + (e.duration || 0), 0);
          const lastS = getLastEvent(state.events, "sleep");
          const sleepNotes = activeNotes.filter((n) => n.category === "sleep");
          r = `Today: ${ts.length} sleep sessions, ${formatDuration(total)} total.${recs ? ` Typical goal: ~${recs.sleepHours}h.` : ""}`;
          if (sleepNotes.length > 0) r += `\n\n💛 "${sleepNotes[0].text}" noted — this is normal and temporary. Focus on comfort and responsiveness.`;
          r += lastS ? `\nLast sleep ended ${getTimeSince(lastS.endTime || lastS.timestamp)}.` : "";
        } else if (q.includes("feed") || q.includes("eat") || q.includes("milk")) {
          const tf = getTodayEvents(state.events, "feed");
          const lf = getLastEvent(state.events, "feed");
          r = `Today: ${tf.length} feeds.${lf ? ` Last: ${getTimeSince(lf.timestamp)} (${lf.feedType}).` : ""}${recs ? `\nTypical rhythm: every ~${Math.round(recs.feedInterval / 60)}h.` : ""}`;
        } else if (q.includes("diaper")) {
          const td = getTodayEvents(state.events, "diaper");
          r = `Today: ${td.length} diapers.${recs ? ` Typical: ~${recs.diapers}/day.` : ""}`;
        } else if (q.includes("milestone")) {
          const cur = WHO_MILESTONES.filter((m) => ageWeeks >= m.weekStart && ageWeeks <= m.weekEnd);
          r = `Week ${ageWeeks} milestones:\n${cur.map((m) => `• ${m.title} (${m.category}): ${m.description}`).join("\n")}`;
        } else {
          r = `I can help with feeding, sleep, diapers, and milestones for ${state.baby?.name || "baby"} at week ${ageWeeks || "?"}.${contextStr}\n\n⚠️ AI chat needs an API key configured. Add your Claude or OpenAI key in the .env.local file and redeploy.`;
        }
        setMessages((p) => [...p, { id: generateId(), role: "assistant", content: r }]);
        setLoading(false);
      }
    };
    tryRealAI();
  };

  return (
    <div style={{ ...S.page, display: "flex", flexDirection: "column", height: "calc(100vh - 130px)", padding: 0 }}>
      <div style={{ padding: "12px 20px", borderBottom: `1px solid ${C.borderL}`, display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 36, height: 36, borderRadius: 18, background: "linear-gradient(135deg, #667eea, #764ba2)", display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name="chat" size={18} color="white" /></div>
        <div><div style={{ fontSize: 14, fontWeight: 700 }}>Baby Care AI</div><div style={{ fontSize: 11, color: C.success }}>● Watches for health topics</div></div>
      </div>

      {/* Detected health topics banner */}
      {detectedTopics.length > 0 && (
        <div style={{ padding: "10px 20px", background: C.warning + "10", borderBottom: `1px solid ${C.warning}20` }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.warning, marginBottom: 6 }}>🔍 Detected in conversation</div>
          {detectedTopics.map((topic) => (
            <div key={topic.topic} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0", flexWrap: "wrap" }}>
              <span style={{ fontSize: 14 }}>{topic.emoji}</span>
              <span style={{ fontSize: 12, fontWeight: 600, flex: 1 }}>{topic.label}</span>
              <div style={{ display: "flex", gap: 4 }}>
                <button onClick={() => handleLogTopic(topic, topic.userMessage)} style={{ padding: "4px 10px", borderRadius: 8, background: C.pri, color: "white", border: "none", fontSize: 10, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                  Log it
                </button>
                {topic.appointmentNote && (
                  <button onClick={() => handleLogToDoctor(topic, topic.userMessage)} style={{ padding: "4px 10px", borderRadius: 8, background: C.doctor, color: "white", border: "none", fontSize: 10, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                    Log + Doctor Note
                  </button>
                )}
                <button onClick={() => handleDismissTopic(topic.topic)} style={{ padding: "4px 8px", borderRadius: 8, background: C.borderL, color: C.t3, border: "none", fontSize: 10, cursor: "pointer", fontFamily: "inherit" }}>
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{ flex: 1, overflow: "auto", padding: "16px 20px" }}>
        {messages.map((m) => (
          <div key={m.id} style={{ marginBottom: 16, display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
            <div style={{ maxWidth: "85%", padding: "12px 16px", borderRadius: m.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px", background: m.role === "user" ? C.pri : C.card, color: m.role === "user" ? "white" : C.text, fontSize: 14, lineHeight: 1.6, border: m.role === "assistant" ? `1px solid ${C.borderL}` : "none", whiteSpace: "pre-wrap" }}>{m.content}</div>
          </div>
        ))}
        {loading && <div style={{ display: "flex" }}><div style={{ padding: "12px 20px", borderRadius: 16, background: C.card, border: `1px solid ${C.borderL}`, fontSize: 14 }}>Thinking...</div></div>}
        <div ref={endRef} />
      </div>
      <div style={{ padding: "12px 20px 20px", borderTop: `1px solid ${C.borderL}`, background: "white" }}>
        <div style={{ display: "flex", gap: 8 }}>
          <input style={{ ...S.input, flex: 1 }} value={input} onChange={(e) => setInput(e.target.value)} placeholder={`Ask about ${state.baby?.name || "baby"}...`} onKeyDown={(e) => e.key === "Enter" && handleSend()} />
          <button style={{ ...S.btn("primary"), padding: "12px 14px", opacity: input.trim() ? 1 : 0.5 }} onClick={handleSend}><Icon name="send" size={18} color="white" /></button>
        </div>
      </div>
    </div>
  );
};

// ============================================================
// SETTINGS (Updated: CSV export, family sharing)
// ============================================================
const SettingsPage = ({ state, onUpdateBaby, onUpdateSettings, onSignOut, userEmail }) => {
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
        <button style={{ ...S.btn("primary"), width: "100%" }} onClick={async () => { try { const perm = await Notification.requestPermission(); if (perm === "granted") { const { requestNotifications } = await import("./lib/notifications.js"); const { auth } = await import("./lib/firebase.js"); await requestNotifications(auth.currentUser?.uid); alert("Notifications enabled!"); } else { alert("Please allow notifications in your device settings."); } } catch(e) { alert("Error: " + e.message); } }}>
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

// ============================================================
// EDIT EVENT FORM
// ============================================================
const EditEventForm = ({ event, onSave, onCancel }) => {
  const [notes, setNotes] = useState(event.notes || "");
  const [amount, setAmount] = useState(event.amount || "");
  const [side, setSide] = useState(event.side || "");
  const [content, setContent] = useState(event.content || "");
  const [stoolColor, setStoolColor] = useState(event.stoolColor || "");
  const [durationMins, setDurationMins] = useState(event.duration ? Math.round(event.duration / 60000) : "");

  return (
    <div>
      {event.type === "feed" && (
        <>
          {event.feedType === "breast" && (
            <>
              <label style={S.label}>Side</label>
              <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                {["left", "right", "both"].map((s) => (<button key={s} style={S.chip(side === s, C.feed)} onClick={() => setSide(s)}>{s}</button>))}
              </div>
            </>
          )}
          <label style={S.label}>Duration (minutes)</label>
          <input style={{ ...S.input, marginBottom: 12 }} type="number" value={durationMins} onChange={(e) => setDurationMins(e.target.value)} />
          {(event.feedType === "expression" || event.feedType === "formula") && (
            <><label style={S.label}>Amount (ml)</label><input style={{ ...S.input, marginBottom: 12 }} type="number" value={amount} onChange={(e) => setAmount(e.target.value)} /></>
          )}
        </>
      )}
      {event.type === "diaper" && (
        <>
          <label style={S.label}>Content</label>
          <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
            {["wet", "stool", "both"].map((c) => (<button key={c} style={S.chip(content === c, C.diaper)} onClick={() => setContent(c)}>{c}</button>))}
          </div>
          {content !== "wet" && (
            <>
              <label style={S.label}>Stool Color</label>
              <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
                {[["yellow","#F4D03F"],["green","#2ECC71"],["brown","#8B4513"],["black","#2C3E50"],["red","#E74C3C"],["white","#ECF0F1"]].map(([n,bg]) => (
                  <button key={n} onClick={() => setStoolColor(n)} style={{ width: 32, height: 32, borderRadius: 16, border: stoolColor === n ? `3px solid ${C.pri}` : `2px solid ${C.border}`, background: bg, cursor: "pointer" }} />
                ))}
              </div>
            </>
          )}
        </>
      )}
      {event.type === "sleep" && (
        <><label style={S.label}>Duration (minutes)</label><input style={{ ...S.input, marginBottom: 12 }} type="number" value={durationMins} onChange={(e) => setDurationMins(e.target.value)} /></>
      )}
      <label style={S.label}>Notes</label>
      <input style={{ ...S.input, marginBottom: 16 }} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Add or edit notes..." />
      <div style={{ display: "flex", gap: 8 }}>
        <button style={{ ...S.btn("primary"), flex: 1 }} onClick={() => {
          const updates = { notes };
          if (side) updates.side = side;
          if (amount) updates.amount = parseFloat(amount);
          if (content) updates.content = content;
          if (stoolColor && content !== "wet") updates.stoolColor = stoolColor;
          if (durationMins) updates.duration = parseInt(durationMins) * 60000;
          onSave(updates);
        }}>Save Changes</button>
        <button style={{ ...S.btn("secondary"), flex: 1 }} onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
};

// ============================================================
// DASHBOARD
// ============================================================
const Dashboard = ({ state, onOpenLogger, onStartTimer, onStopTimer, onAddContextNote, onDeleteEvent, onEditEvent }) => {
  const { baby, events, activeTimers, appointments } = state;
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editNotes, setEditNotes] = useState("");
  const ageWeeks = baby?.birthDate ? getBabyAgeWeeks(baby.birthDate) : null;
  const recs = ageWeeks !== null ? getAgeRecommendations(ageWeeks) : null;
  const lastFeed = getLastEvent(events, "feed");
  const lastSleep = getLastEvent(events, "sleep");
  const lastDiaper = getLastEvent(events, "diaper");
  const todayFeeds = getTodayEvents(events, "feed");
  const todayDiapers = getTodayEvents(events, "diaper");
  const todaySleep = getTodayEvents(events, "sleep");
  const todayActivities = getTodayEvents(events, "activity");
  const totalSleep = todaySleep.reduce((s, e) => s + (e.duration || 0), 0);
  const activeType = Object.keys(activeTimers)[0];
  const upcomingAppts = appointments.filter((a) => !a.completed && new Date(a.date) >= new Date()).sort((a, b) => new Date(a.date) - new Date(b.date)).slice(0, 2);

  // Smart pattern detection
  const insights = useMemo(() => detectPatterns(events, baby, state.contextNotes), [events, baby, state.contextNotes]);
  const [dismissedInsights, setDismissedInsights] = useState(() => { try { return JSON.parse(localStorage.getItem("dismissed_insights") || "[]"); } catch(e) { return []; } });
useEffect(() => { try { localStorage.setItem("dismissed_insights", JSON.stringify(dismissedInsights)); } catch(e) {} }, [dismissedInsights]);  
  const [expandedInsight, setExpandedInsight] = useState(null);
  const [insightExplanation, setInsightExplanation] = useState("");

  return (
    <div style={S.page}>
      {/* Baby card */}
      <div style={{ ...S.card, background: "linear-gradient(135deg, #667eea18, #764ba218)", border: "none" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 48, height: 48, borderRadius: 24, background: "linear-gradient(135deg, #667eea, #764ba2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>👶</div>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 2 }}>{baby?.name || "Baby"}</h2>
            <p style={{ fontSize: 13, color: C.t2 }}>{baby?.birthDate ? `${formatAge(baby.birthDate)} · Week ${ageWeeks}` : "Birth date not set"}</p>
          </div>
        </div>
      </div>

      {/* Active timer */}
      {activeType && (
        <div style={{ ...S.card, background: activeType === "feed" ? C.feedL : C.sleepL, border: `2px solid ${activeType === "feed" ? C.feed : C.sleep}` }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <span style={{ fontSize: 12, fontWeight: 600, textTransform: "uppercase", color: activeType === "feed" ? C.feed : C.sleep }}>
                {activeType === "feed" ? "🤱 Feeding" : "😴 Sleeping"} in progress
              </span>
              <TimerDisplay startTime={activeTimers[activeType]?.startTime} color={activeType === "feed" ? C.feed : C.sleep} />
            </div>
            <button style={S.btn("danger")} onClick={() => onOpenLogger(activeType)}>Stop</button>
          </div>
        </div>
      )}

      {/* Smart Pattern Insights — Dismissable with explanation */}
      {insights.filter((i) => !dismissedInsights.includes(i.id)).length > 0 && (
        <div style={{ marginBottom: 4 }}>
          {insights.filter((i) => !dismissedInsights.includes(i.id)).map((insight) => (
            <div key={insight.id} style={{ ...S.card, background: insight.color + "08", border: `1.5px solid ${insight.color}25`, position: "relative" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <span style={{ fontSize: 22 }}>{insight.emoji}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: insight.color }}>{insight.title}</div>
                  <div style={{ fontSize: 10, fontWeight: 600, color: C.t3, textTransform: "uppercase" }}>
                    {insight.confidence === "likely" ? "Based on patterns" : insight.confidence === "check_doctor" ? "Worth checking with doctor" : "Something to watch"}
                  </div>
                </div>
              </div>
              <p style={{ fontSize: 13, color: C.t2, lineHeight: 1.5, marginBottom: 8 }}>{insight.message}</p>
              <div style={{ padding: "8px 12px", borderRadius: 10, background: "white", border: `1px solid ${insight.color}15` }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: insight.color, marginBottom: 2 }}>💛 What to do</div>
                <div style={{ fontSize: 12, color: C.t2, lineHeight: 1.5 }}>{insight.tips}</div>
              </div>

              {/* Explanation input */}
              {expandedInsight === insight.id && (
                <div style={{ marginTop: 10, padding: 12, background: C.bg, borderRadius: 10 }}>
                  <label style={{ fontSize: 11, fontWeight: 600, color: C.t2, display: "block", marginBottom: 6 }}>What's actually happening?</label>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
                    {["We forgot to log some events", "We're aware, it's normal for us", "Baby is on a different schedule", "We're traveling/routine changed"].map((reason) => (
                      <button key={reason} onClick={() => setInsightExplanation(reason)} style={{ padding: "5px 10px", borderRadius: 12, border: `1px solid ${insightExplanation === reason ? C.pri : C.border}`, background: insightExplanation === reason ? C.priL : "white", fontSize: 11, cursor: "pointer", fontFamily: "inherit", color: insightExplanation === reason ? C.pri : C.t2 }}>
                        {reason}
                      </button>
                    ))}
                  </div>
                  <input style={{ ...S.input, fontSize: 13, marginBottom: 10 }} value={insightExplanation} onChange={(e) => setInsightExplanation(e.target.value)} placeholder="Or type your own reason..." />
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => {
                      if (insightExplanation) {
                        onAddContextNote({ id: generateId(), text: `${insight.title}: ${insightExplanation}`, category: insight.id.includes("sleep") ? "sleep" : insight.id.includes("growth") || insight.id.includes("feed") ? "feed" : "general", active: false, createdAt: new Date().toISOString(), insightId: insight.id, explanation: insightExplanation });
                      }
                      setDismissedInsights((p) => [...p, insight.id]);
                      setExpandedInsight(null);
                      setInsightExplanation("");
                    }} style={{ padding: "8px 16px", borderRadius: 10, background: C.pri, color: "white", border: "none", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", flex: 1 }}>
                      Got it, dismiss & remember
                    </button>
                  </div>
                  <p style={{ fontSize: 10, color: C.t3, marginTop: 6 }}>The app will remember your explanation and won't warn about this again.</p>
                </div>
              )}

              {/* Action buttons */}
              {expandedInsight !== insight.id && (
                <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                  <button onClick={() => {
                    onAddContextNote({ id: generateId(), text: insight.title, category: insight.id.includes("sleep") ? "sleep" : insight.id.includes("growth") || insight.id.includes("feed") ? "feed" : "general", active: true, createdAt: new Date().toISOString() });
                    setDismissedInsights((p) => [...p, insight.id]);
                  }} style={{ padding: "6px 14px", borderRadius: 10, background: insight.color, color: "white", border: "none", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                    📌 Acknowledge & Adapt
                  </button>
                  <button onClick={() => { setExpandedInsight(insight.id); setInsightExplanation(""); }} style={{ padding: "6px 14px", borderRadius: 10, background: "white", color: C.t2, border: `1px solid ${C.border}`, fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>
                    ✏️ Explain & Dismiss
                  </button>
                  <button onClick={() => setDismissedInsights((p) => [...p, insight.id])} style={{ padding: "6px 14px", borderRadius: 10, background: C.borderL, color: C.t3, border: "none", fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>
                    ✕
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Quick actions */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8, marginBottom: 12 }}>
        <button style={S.quickAct(C.feedL)} onClick={() => onOpenLogger("feed")}><span style={{ fontSize: 24 }}>🍼</span><span style={{ fontSize: 11, fontWeight: 600, color: C.feed }}>Feed</span></button>
        <button style={S.quickAct(C.diaperL)} onClick={() => onOpenLogger("diaper")}><span style={{ fontSize: 24 }}>🧷</span><span style={{ fontSize: 11, fontWeight: 600, color: C.diaper }}>Diaper</span></button>
        <button style={S.quickAct(C.sleepL)} onClick={() => onOpenLogger("sleep")}><span style={{ fontSize: 24 }}>😴</span><span style={{ fontSize: 11, fontWeight: 600, color: C.sleep }}>Sleep</span></button>
        <button style={S.quickAct(C.activityL)} onClick={() => onOpenLogger("activities")}><span style={{ fontSize: 24 }}>🤸</span><span style={{ fontSize: 11, fontWeight: 600, color: C.activity }}>Activity</span></button>
      </div>

      {/* Next windows */}
      {recs && (lastFeed || lastSleep || lastDiaper) && (
        <div style={S.card}>
          <h3 style={{ fontSize: 12, fontWeight: 700, color: C.t2, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>Next Windows</h3>
          {lastFeed && <NextWindowBadge label="Feed" lastTimestamp={lastFeed.timestamp} intervalMins={recs.feedInterval} contextNotes={state.contextNotes} />}
          {lastSleep && <div style={{ marginTop: 6 }}><NextWindowBadge label="Sleep" lastTimestamp={lastSleep.endTime || lastSleep.timestamp} intervalMins={recs.sleepWake} contextNotes={state.contextNotes} /></div>}
          {lastDiaper && <div style={{ marginTop: 6 }}><NextWindowBadge label="Diaper" lastTimestamp={lastDiaper.timestamp} intervalMins={recs.diaperInterval} contextNotes={state.contextNotes} /></div>}
        </div>
      )}

      {/* Today summary */}
      <div style={S.card}>
        <h3 style={{ fontSize: 12, fontWeight: 700, color: C.t2, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 12 }}>Today</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          <div style={S.stat(C.feed)}><div style={{ fontSize: 11, color: C.t2, fontWeight: 600 }}>FEEDS</div><div style={{ fontSize: 22, fontWeight: 700, color: C.feed }}>{todayFeeds.length}</div></div>
          <div style={S.stat(C.diaper)}><div style={{ fontSize: 11, color: C.t2, fontWeight: 600 }}>DIAPERS</div><div style={{ fontSize: 22, fontWeight: 700, color: C.diaper }}>{todayDiapers.length}</div></div>
          <div style={S.stat(C.sleep)}><div style={{ fontSize: 11, color: C.t2, fontWeight: 600 }}>SLEEP</div><div style={{ fontSize: 22, fontWeight: 700, color: C.sleep }}>{formatDuration(totalSleep)}</div>{recs && <div style={{ fontSize: 10, color: C.t3 }}>Goal: ~{recs.sleepHours}h</div>}</div>
          <div style={S.stat(C.activity)}><div style={{ fontSize: 11, color: C.t2, fontWeight: 600 }}>ACTIVITIES</div><div style={{ fontSize: 22, fontWeight: 700, color: C.activity }}>{todayActivities.length}</div></div>
        </div>
      </div>

      {/* Active context notes */}
      {(state.contextNotes || []).filter((n) => n.active).length > 0 && (
        <div style={{ ...S.card, background: "#FFF8E1", border: "1px solid #FFE08220" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <span>📌</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#F59E0B" }}>Active Notes</span>
          </div>
          {(state.contextNotes || []).filter((n) => n.active).map((n) => (
            <div key={n.id} style={{ fontSize: 13, color: C.t2, padding: "2px 0" }}>
              {n.text} <span style={{ fontSize: 11, color: C.t3 }}>· {n.category} · since {formatDate(n.createdAt)}</span>
            </div>
          ))}
          <p style={{ fontSize: 11, color: C.t3, marginTop: 6 }}>Recommendations are gentler while these are active</p>
        </div>
      )}

      {/* Tips */}
      {recs && (
        <div style={{ ...S.card, background: C.priL, border: `1px solid ${C.pri}20` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}><span>💡</span><span style={{ fontSize: 13, fontWeight: 700, color: C.pri }}>Week {ageWeeks} Tips</span></div>
          <p style={{ fontSize: 13, color: C.t2, lineHeight: 1.5 }}>~{Math.round(24 * 60 / recs.feedInterval)} feeds/day, ~{recs.sleepHours}h sleep ({recs.naps} naps), ~{recs.diapers} diapers.</p>
        </div>
      )}

      {/* Upcoming */}
      {upcomingAppts.length > 0 && (
        <div style={S.card}>
          <h3 style={{ fontSize: 12, fontWeight: 700, color: C.t2, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 12 }}>Upcoming</h3>
          {upcomingAppts.map((a) => (
            <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 0", borderBottom: `1px solid ${C.borderL}` }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: a.type === "vaccination" ? C.vaccineL : C.doctorL, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>{a.type === "vaccination" ? "💉" : "🩺"}</div>
              <div style={{ flex: 1 }}><div style={{ fontSize: 13, fontWeight: 600 }}>{a.title}</div><div style={{ fontSize: 11, color: C.t3 }}>{formatDate(a.date)}</div></div>
            </div>
          ))}
        </div>
      )}

      {/* Recent */}
      <div style={S.card}>
        <h3 style={{ fontSize: 12, fontWeight: 700, color: C.t2, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 12 }}>Recent Activity</h3>
        {events.length === 0 ? <p style={{ fontSize: 13, color: C.t3, textAlign: "center", padding: 20 }}>No events yet. Start tracking!</p> : (
          [...events].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 8).map((ev) => (
            <div key={ev.id} onClick={() => { setSelectedEvent(ev); setDeleteConfirm(false); }} style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 0", borderBottom: `1px solid ${C.borderL}`, cursor: "pointer" }}>
              <div style={{ width: 28, height: 28, borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, background: ev.type === "feed" ? C.feedL : ev.type === "diaper" ? C.diaperL : ev.type === "sleep" ? C.sleepL : C.activityL }}>
                {ev.type === "feed" ? "🍼" : ev.type === "diaper" ? "🧷" : ev.type === "sleep" ? "😴" : "🤸"}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 600 }}>
                  {ev.type === "feed" ? `${ev.feedType === "breast" ? `Breast (${ev.side})` : ev.feedType === "expression" ? `Expression (${ev.side})` : "Formula"}${ev.amount ? ` · ${ev.amount}ml` : ""}${ev.duration ? ` · ${formatDuration(ev.duration)}` : ""}` : ev.type === "diaper" ? `Diaper · ${ev.content}` : ev.type === "sleep" ? `Sleep · ${formatDuration(ev.duration)}` : ev.activityTitle || "Activity"}
                </div>
                <div style={{ fontSize: 10, color: C.t3 }}>{formatTime(ev.timestamp)}</div>
              </div>
              <div style={{ color: C.t3, fontSize: 11 }}>›</div>
            </div>
          ))
        )}
      </div>

      {/* Event Detail Modal — editable */}
      <Modal isOpen={!!selectedEvent} onClose={() => { setSelectedEvent(null); setDeleteConfirm(false); setEditMode(false); }} title={editMode ? "Edit Event" : "Event Details"}>
        {selectedEvent && !editMode && (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, background: selectedEvent.type === "feed" ? C.feedL : selectedEvent.type === "diaper" ? C.diaperL : selectedEvent.type === "sleep" ? C.sleepL : C.activityL }}>
                {selectedEvent.type === "feed" ? "🍼" : selectedEvent.type === "diaper" ? "🧷" : selectedEvent.type === "sleep" ? "😴" : "🤸"}
              </div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700 }}>{selectedEvent.type === "feed" ? "Feeding" : selectedEvent.type === "diaper" ? "Diaper Change" : selectedEvent.type === "sleep" ? "Sleep" : "Activity"}</div>
                <div style={{ fontSize: 12, color: C.t3 }}>{formatDate(selectedEvent.timestamp)} at {formatTime(selectedEvent.timestamp)}</div>
              </div>
            </div>
            <div style={{ background: C.bg, borderRadius: 12, padding: 14, marginBottom: 16 }}>
              {selectedEvent.type === "feed" && (
                <>
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: `1px solid ${C.borderL}` }}><span style={{ fontSize: 13, color: C.t2 }}>Type</span><span style={{ fontSize: 13, fontWeight: 600 }}>{selectedEvent.feedType}</span></div>
                  {selectedEvent.side && <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: `1px solid ${C.borderL}` }}><span style={{ fontSize: 13, color: C.t2 }}>Side</span><span style={{ fontSize: 13, fontWeight: 600 }}>{selectedEvent.side}</span></div>}
                  {(selectedEvent.duration > 0) && <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: `1px solid ${C.borderL}` }}><span style={{ fontSize: 13, color: C.t2 }}>Duration</span><span style={{ fontSize: 13, fontWeight: 600 }}>{formatDuration(selectedEvent.duration)}</span></div>}
                  {(selectedEvent.amount > 0) && <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: `1px solid ${C.borderL}` }}><span style={{ fontSize: 13, color: C.t2 }}>Amount</span><span style={{ fontSize: 13, fontWeight: 600 }}>{selectedEvent.amount} ml</span></div>}
                  {selectedEvent.brand && <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: `1px solid ${C.borderL}` }}><span style={{ fontSize: 13, color: C.t2 }}>Brand</span><span style={{ fontSize: 13, fontWeight: 600 }}>{selectedEvent.brand}</span></div>}
                </>
              )}
              {selectedEvent.type === "diaper" && (
                <>
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: `1px solid ${C.borderL}` }}><span style={{ fontSize: 13, color: C.t2 }}>Content</span><span style={{ fontSize: 13, fontWeight: 600 }}>{selectedEvent.content}</span></div>
                  {selectedEvent.stoolColor && <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: `1px solid ${C.borderL}` }}><span style={{ fontSize: 13, color: C.t2 }}>Stool Color</span><span style={{ fontSize: 13, fontWeight: 600 }}>{selectedEvent.stoolColor}</span></div>}
                </>
              )}
              {selectedEvent.type === "sleep" && (
                <>
                  {(selectedEvent.duration > 0) && <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: `1px solid ${C.borderL}` }}><span style={{ fontSize: 13, color: C.t2 }}>Duration</span><span style={{ fontSize: 13, fontWeight: 600 }}>{formatDuration(selectedEvent.duration)}</span></div>}
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: `1px solid ${C.borderL}` }}><span style={{ fontSize: 13, color: C.t2 }}>Started</span><span style={{ fontSize: 13, fontWeight: 600 }}>{formatTime(selectedEvent.timestamp)}</span></div>
                  {selectedEvent.endTime && <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: `1px solid ${C.borderL}` }}><span style={{ fontSize: 13, color: C.t2 }}>Ended</span><span style={{ fontSize: 13, fontWeight: 600 }}>{formatTime(selectedEvent.endTime)}</span></div>}
                </>
              )}
              {selectedEvent.type === "activity" && (
                <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0" }}><span style={{ fontSize: 13, color: C.t2 }}>Activity</span><span style={{ fontSize: 13, fontWeight: 600 }}>{selectedEvent.activityTitle}</span></div>
              )}
              {selectedEvent.notes && <div style={{ padding: "8px 0" }}><span style={{ fontSize: 12, color: C.t3 }}>Notes: </span><span style={{ fontSize: 13 }}>{selectedEvent.notes}</span></div>}
            </div>
            <button style={{ ...S.btn("secondary"), width: "100%", marginBottom: 8 }} onClick={() => { setEditMode(true); setEditNotes(selectedEvent.notes || ""); }}>
              Edit Event
            </button>
            {!deleteConfirm ? (
              <button style={{ ...S.btn("ghost"), width: "100%", color: C.t3, fontSize: 13 }} onClick={() => setDeleteConfirm(true)}>Delete this event</button>
            ) : (
              <div style={{ padding: 14, background: "#FEE2E2", borderRadius: 12, textAlign: "center" }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: C.danger, marginBottom: 12 }}>Are you sure you want to delete?</p>
                <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
                  <button style={{ ...S.btn("danger"), padding: "10px 20px" }} onClick={async () => { if (onDeleteEvent) { await onDeleteEvent(selectedEvent.id); } setSelectedEvent(null); setDeleteConfirm(false); }}>Yes, Delete</button>
                  <button style={{ ...S.btn("secondary"), padding: "10px 20px" }} onClick={() => setDeleteConfirm(false)}>Cancel</button>
                </div>
              </div>
            )}
          </>
        )}
        {selectedEvent && editMode && (
          <EditEventForm event={selectedEvent} onSave={async (updates) => { if (onEditEvent) await onEditEvent(selectedEvent.id, updates); setSelectedEvent({ ...selectedEvent, ...updates }); setEditMode(false); }} onCancel={() => setEditMode(false)} />
        )}
      </Modal>
    </div>
  );
};

// ============================================================
// TRENDS DASHBOARD (Feeds/Sleep/Diapers/Weight vs WHO norms)
// ============================================================

// ============================================================
// DOCTOR SUMMARY (Weekly report — PDF + WhatsApp shareable)
// ============================================================
const DoctorSummary = ({ state, onAddNote, onAddContextNote }) => {
  const { baby, events, weightLog, milestones, appointments, healthLog, contextNotes } = state;
  const ageWeeks = baby?.birthDate ? getBabyAgeWeeks(baby.birthDate) : 0;
  const [period, setPeriod] = useState("7d");
  const [copied, setCopied] = useState(false);
  const [showAddNote, setShowAddNote] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [showAddAppt, setShowAddAppt] = useState(false);
  const [apptTitle, setApptTitle] = useState("");
  const [apptDate, setApptDate] = useState("");
  const [apptTime, setApptTime] = useState("");
  const [apptNotes, setApptNotes] = useState("");
  const givenVaccines = (() => { try { return JSON.parse(localStorage.getItem("given_vaccines") || "[]"); } catch(e) { return []; } })();

  const periodDays = period === "7d" ? 7 : period === "14d" ? 14 : 30;
  const now = new Date();
  const start = new Date(now); start.setDate(start.getDate() - periodDays);

  const periodEvents = events.filter((e) => new Date(e.timestamp) >= start);
  const feeds = periodEvents.filter((e) => e.type === "feed");
  const sleeps = periodEvents.filter((e) => e.type === "sleep");
  const diapers = periodEvents.filter((e) => e.type === "diaper");
  const totalSleepH = (sleeps.reduce((s, e) => s + (e.duration || 0), 0) / 3600000 / periodDays).toFixed(1);
  const avgFeeds = (feeds.length / periodDays).toFixed(1);
  const avgDiapers = (diapers.length / periodDays).toFixed(1);
  const stools = diapers.filter((d) => d.content === "stool" || d.content === "both");
  const stoolColors = [...new Set(stools.map((d) => d.stoolColor).filter(Boolean))];
  const latestWeight = weightLog.length > 0 ? weightLog[weightLog.length - 1] : null;
  const achievedMilestones = (milestones || []).filter((m) => m.achievedDate);
  const recentHealth = (healthLog || []).filter((h) => new Date(h.timestamp) >= start);
  const activeNotes = (contextNotes || []).filter((n) => n.active);

  const summaryText = () => {
    let t = `BABY HEALTH SUMMARY\n`;
    t += `${"=".repeat(30)}\n`;
    t += `Baby: ${baby?.name || "Baby"}\n`;
    t += `Age: ${ageWeeks} weeks (${formatAge(baby?.birthDate)})\n`;
    t += `Period: Last ${periodDays} days (${formatDate(start)} - ${formatDate(now)})\n\n`;
    t += `FEEDING\n`;
    t += `• Average: ${avgFeeds} feeds/day\n`;
    t += `• Total sessions: ${feeds.length}\n`;
    const breastFeeds = feeds.filter((f) => f.feedType === "breast");
    const exprFeeds = feeds.filter((f) => f.feedType === "expression");
    const formulaFeeds = feeds.filter((f) => f.feedType === "formula");
    if (breastFeeds.length) t += `• Breast: ${breastFeeds.length} (${Math.round(breastFeeds.length/feeds.length*100)}%)\n`;
    if (exprFeeds.length) t += `• Expression: ${exprFeeds.length} (${Math.round(exprFeeds.length/feeds.length*100)}%)\n`;
    if (formulaFeeds.length) t += `• Formula: ${formulaFeeds.length} (${Math.round(formulaFeeds.length/feeds.length*100)}%)\n`;
    t += `\nSLEEP\n`;
    t += `• Average: ${totalSleepH}h/day\n`;
    t += `• Total sessions: ${sleeps.length}\n`;
    t += `\nDIAPERS\n`;
    t += `• Average: ${avgDiapers}/day\n`;
    t += `• Stools: ${stools.length} total\n`;
    if (stoolColors.length) t += `• Stool colors: ${stoolColors.join(", ")}\n`;
    if (latestWeight) { t += `\nWEIGHT\n`; t += `• Latest: ${latestWeight.weight} ${latestWeight.unit} (${formatDate(latestWeight.date)})\n`; }
    if (recentHealth.length) { t += `\nHEALTH NOTES\n`; recentHealth.forEach((h) => { t += `• ${h.emoji} ${h.label} (${formatDate(h.timestamp)})\n`; }); }
    if (activeNotes.length) { t += `\nACTIVE CONCERNS\n`; activeNotes.forEach((n) => { t += `• ${n.text}${n.explanation ? " — " + n.explanation : ""} (since ${formatDate(n.createdAt)})\n`; }); }
    if (achievedMilestones.length) { t += `\nMILESTONES ACHIEVED\n`; achievedMilestones.slice(-5).forEach((m) => { const def = WHO_MILESTONES.find((w) => w.id === m.milestoneId); if (def) t += `• ${def.title} (${formatDate(m.achievedDate)})\n`; }); }
    const givenVax = VACCINATION_SCHEDULE_BASE.filter((v) => givenVaccines.includes(v.name));
    const pendingVax = VACCINATION_SCHEDULE_BASE.filter((v) => !givenVaccines.includes(v.name) && v.weekDue <= ageWeeks + 4);
    if (givenVax.length) { t += `\nVACCINATIONS GIVEN (${givenVax.length})\n`; givenVax.forEach((v) => { t += `• ${v.name} (Week ${v.weekDue})\n`; }); }
    if (pendingVax.length) { t += `\nVACCINATIONS PENDING\n`; pendingVax.forEach((v) => { t += `• ${v.name} (Week ${v.weekDue})\n`; }); }
    t += `\n---\nGenerated by Tiny Steps on ${new Date().toLocaleDateString()}`;
    return t;
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(summaryText()).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  };

  const shareWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(summaryText())}`, "_blank");
  };

  const downloadPDF = () => {
    const text = summaryText();
    const lines = text.split("\n");
    let html = "<html><head><style>body{font-family:Arial,sans-serif;padding:40px;max-width:600px;margin:0 auto;color:#1a1a2e}h1{color:#5B7FFF;font-size:20px}h2{color:#6B7280;font-size:14px;text-transform:uppercase;margin-top:20px;border-bottom:1px solid #eee;padding-bottom:4px}p{margin:4px 0;font-size:13px}hr{border:none;border-top:1px solid #eee;margin:16px 0}.footer{color:#9CA3AF;font-size:11px;margin-top:24px}</style></head><body>";
    lines.forEach((line) => {
      if (line.startsWith("BABY HEALTH")) html += `<h1>👶 ${line}</h1>`;
      else if (line.startsWith("===")) return;
      else if (line === "FEEDING" || line === "SLEEP" || line === "DIAPERS" || line === "WEIGHT" || line === "HEALTH NOTES" || line === "ACTIVE CONCERNS" || line === "MILESTONES ACHIEVED") html += `<h2>${line}</h2>`;
      else if (line.startsWith("•")) html += `<p>${line}</p>`;
      else if (line.startsWith("---")) html += "<hr>";
      else if (line.startsWith("Generated")) html += `<p class=\"footer\">${line}</p>`;
      else if (line.trim()) html += `<p><strong>${line}</strong></p>`;
    });
    html += "</body></html>";
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${baby?.name || "baby"}-summary-${toDateKey(new Date())}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={S.page}>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Doctor Summary</h2>
      <p style={{ fontSize: 13, color: C.t2, marginBottom: 16 }}>Share with your pediatrician</p>

      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {[["7d", "7 Days"], ["14d", "2 Weeks"], ["30d", "30 Days"]].map(([id, label]) => (
          <button key={id} style={S.chip(period === id, C.pri)} onClick={() => setPeriod(id)}>{label}</button>
        ))}
      </div>

      {/* Preview */}
      <div style={{ ...S.card, background: C.bg }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <span style={{ fontSize: 20 }}>👶</span>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>{baby?.name || "Baby"}</div>
            <div style={{ fontSize: 12, color: C.t3 }}>{ageWeeks} weeks · Last {periodDays} days</div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
          <div style={S.stat(C.feed)}><div style={{ fontSize: 10, color: C.t2, fontWeight: 600 }}>FEEDS/DAY</div><div style={{ fontSize: 20, fontWeight: 700, color: C.feed }}>{avgFeeds}</div></div>
          <div style={S.stat(C.sleep)}><div style={{ fontSize: 10, color: C.t2, fontWeight: 600 }}>SLEEP/DAY</div><div style={{ fontSize: 20, fontWeight: 700, color: C.sleep }}>{totalSleepH}h</div></div>
          <div style={S.stat(C.diaper)}><div style={{ fontSize: 10, color: C.t2, fontWeight: 600 }}>DIAPERS/DAY</div><div style={{ fontSize: 20, fontWeight: 700, color: C.diaper }}>{avgDiapers}</div></div>
          <div style={S.stat(C.weight)}><div style={{ fontSize: 10, color: C.t2, fontWeight: 600 }}>WEIGHT</div><div style={{ fontSize: 20, fontWeight: 700, color: C.weight }}>{latestWeight ? `${latestWeight.weight}${latestWeight.unit}` : "—"}</div></div>
        </div>

        {recentHealth.length > 0 && (
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.danger, marginBottom: 4 }}>Health Notes</div>
            {recentHealth.map((h, i) => (<div key={i} style={{ fontSize: 12, color: C.t2, padding: "2px 0" }}>{h.emoji} {h.label} — {formatDate(h.timestamp)}</div>))}
          </div>
        )}

        {activeNotes.length > 0 && (
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.warning, marginBottom: 4 }}>Active Concerns</div>
            {activeNotes.map((n, i) => (<div key={i} style={{ fontSize: 12, color: C.t2, padding: "2px 0" }}>📌 {n.text}</div>))}
          </div>
        )}

        {stoolColors.length > 0 && (
          <div style={{ fontSize: 12, color: C.t2, marginBottom: 8 }}>Stool colors observed: {stoolColors.join(", ")}</div>
        )}
      </div>

      {/* Vaccinations Given */}
      <div style={S.card}>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: C.vaccine, marginBottom: 8 }}>💉 Vaccinations</h3>
        <div style={{ fontSize: 12, color: C.success, marginBottom: 8 }}>{givenVaccines.length} given</div>
        {VACCINATION_SCHEDULE_BASE.filter((v) => givenVaccines.includes(v.name)).map((v, i) => (
          <div key={i} style={{ fontSize: 12, color: C.t2, padding: "3px 0" }}>✅ {v.name} · {v.description}</div>
        ))}
        {VACCINATION_SCHEDULE_BASE.filter((v) => !givenVaccines.includes(v.name) && v.weekDue <= ageWeeks + 4).length > 0 && (
          <>
            <div style={{ fontSize: 12, fontWeight: 600, color: C.warning, marginTop: 8, marginBottom: 4 }}>Upcoming / Pending</div>
            {VACCINATION_SCHEDULE_BASE.filter((v) => !givenVaccines.includes(v.name) && v.weekDue <= ageWeeks + 4).map((v, i) => (
              <div key={i} style={{ fontSize: 12, color: C.t3, padding: "3px 0" }}>⏳ {v.name} · Week {v.weekDue}</div>
            ))}
          </>
        )}
      </div>

      {/* Add Notes */}
      <div style={S.card}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: C.t2 }}>📝 Notes for Doctor</h3>
          <button style={{ ...S.btn("secondary"), padding: "6px 12px", fontSize: 12 }} onClick={() => setShowAddNote(!showAddNote)}>+ Add Note</button>
        </div>
        {showAddNote && (
          <div style={{ marginBottom: 12 }}>
            <input style={{ ...S.input, marginBottom: 8 }} value={noteText} onChange={(e) => setNoteText(e.target.value)} placeholder="e.g. Baby had mild rash on left cheek..." />
            <button style={{ ...S.btn("primary"), width: "100%", opacity: noteText ? 1 : 0.5 }} onClick={() => { if (noteText && onAddNote) { onAddNote({ id: generateId(), text: noteText, timestamp: new Date().toISOString() }); setNoteText(""); setShowAddNote(false); } }}>Save Note</button>
          </div>
        )}
        {(healthLog || []).slice(0, 10).map((h, i) => (
          <div key={i} style={{ fontSize: 12, color: C.t2, padding: "4px 0", borderBottom: `1px solid ${C.borderL}` }}>{h.emoji || "📌"} {h.label || h.text} · {formatDate(h.timestamp)}</div>
        ))}
        {(!healthLog || healthLog.length === 0) && <p style={{ fontSize: 12, color: C.t3 }}>No notes yet. Add observations for your next doctor visit.</p>}
      </div>

      {/* Add Google Calendar Appointment */}
      <div style={S.card}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: C.doctor }}>📅 Doctor Appointment</h3>
          <button style={{ ...S.btn("secondary"), padding: "6px 12px", fontSize: 12 }} onClick={() => setShowAddAppt(!showAddAppt)}>+ Schedule</button>
        </div>
        {showAddAppt && (
          <div style={{ marginBottom: 12 }}>
            <label style={S.label}>Title</label>
            <input style={{ ...S.input, marginBottom: 8 }} value={apptTitle} onChange={(e) => setApptTitle(e.target.value)} placeholder="e.g. 2-month checkup" />
            <label style={S.label}>Date</label>
            <input style={{ ...S.input, marginBottom: 8 }} type="date" value={apptDate} onChange={(e) => setApptDate(e.target.value)} />
            <label style={S.label}>Time</label>
            <input style={{ ...S.input, marginBottom: 8 }} type="time" value={apptTime} onChange={(e) => setApptTime(e.target.value)} />
            <label style={S.label}>Notes for Doctor</label>
            <input style={{ ...S.input, marginBottom: 8 }} value={apptNotes} onChange={(e) => setApptNotes(e.target.value)} placeholder="Include any concerns..." />
              <button onClick={() => { const d = (apptDate||"20260101").replace(/-/g,""); const t = (apptTime||"09:00").replace(/:/g,""); const t2 = String(Math.min(23,parseInt((apptTime||"09:00").split(":")[0])+1)).padStart(2,"0") + (apptTime||"09:00").split(":")[1]; const url = "https://www.google.com/calendar/render?action=TEMPLATE&text=" + encodeURIComponent((apptTitle || "Doctor Visit") + " - " + (baby?.name || "Baby")) + "&dates=" + d + "T" + t + "00/" + d + "T" + t2 + "00&details=" + encodeURIComponent((apptNotes || "") + "\n\n" + summaryText()); window.open(url, "_blank"); }} style={{ ...S.btn("primary"), width: "100%", opacity: apptDate ? 1 : 0.5 }}>
              📅 Add to Google Calendar
            </button>
            <p style={{ fontSize: 10, color: C.t3, marginTop: 6, textAlign: "center" }}>Opens Google Calendar with the summary auto-filled in the description</p>
          </div>
        )}
        {appointments.filter((a) => !a.completed && new Date(a.date) >= new Date()).slice(0, 3).map((a, i) => (
          <div key={i} style={{ fontSize: 12, color: C.t2, padding: "4px 0" }}>{a.type === "vaccination" ? "💉" : "🩺"} {a.title} · {formatDate(a.date)}</div>
        ))}
      </div>

      {/* Share Actions */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <button style={{ ...S.btn("primary"), width: "100%" }} onClick={shareWhatsApp}>
          📱 Share via WhatsApp
        </button>
        <button style={{ ...S.btn("secondary"), width: "100%" }} onClick={copyToClipboard}>
          {copied ? "✓ Copied!" : "📋 Copy Summary Text"}
        </button>
        <button style={{ ...S.btn("secondary"), width: "100%" }} onClick={downloadPDF}>
          📄 Download Report (HTML)
        </button>
      </div>
    </div>
  );
};

const TrendsDashboard = ({ state }) => {
  const [period, setPeriod] = useState("7d"); // 7d | 14d | 30d
  const { baby, events, weightLog } = state;
  const ageWeeks = baby?.birthDate ? getBabyAgeWeeks(baby.birthDate) : 0;
  const recs = getAgeRecommendations(ageWeeks);

  const periodDays = period === "7d" ? 7 : period === "14d" ? 14 : 30;
  const now = new Date();

  // Group events by day
  const dailyData = useMemo(() => {
    const days = [];
    for (let i = periodDays - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      const dEnd = new Date(d); dEnd.setHours(23, 59, 59, 999);
      const dayKey = toDateKey(d);
      const dayEvents = events.filter((e) => { const t = new Date(e.timestamp); return t >= d && t <= dEnd; });

      const feeds = dayEvents.filter((e) => e.type === "feed");
      const sleeps = dayEvents.filter((e) => e.type === "sleep");
      const diapers = dayEvents.filter((e) => e.type === "diaper");
      const totalSleepMin = sleeps.reduce((s, e) => s + (e.duration || 0), 0) / 60000;
      const totalFeedMin = feeds.reduce((s, e) => s + (e.duration || 0), 0) / 60000;

      days.push({
        date: d,
        dayKey,
        label: d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }),
        shortLabel: d.toLocaleDateString("en-US", { weekday: "narrow" }),
        feedCount: feeds.length,
        feedMinutes: Math.round(totalFeedMin),
        sleepMinutes: Math.round(totalSleepMin),
        sleepHours: (totalSleepMin / 60).toFixed(1),
        diaperCount: diapers.length,
        stoolCount: diapers.filter((d) => d.content === "stool" || d.content === "both").length,
      });
    }
    return days;
  }, [events, periodDays]);

  // WHO norms for comparison
  const whoNorms = {
    feedsPerDay: Math.round(24 * 60 / recs.feedInterval),
    sleepHours: recs.sleepHours,
    diapersPerDay: recs.diapers,
  };

  // Averages
  const daysWithData = dailyData.filter((d) => d.feedCount > 0 || d.sleepMinutes > 0 || d.diaperCount > 0);
  const avgFeeds = daysWithData.length > 0 ? (daysWithData.reduce((s, d) => s + d.feedCount, 0) / daysWithData.length).toFixed(1) : "—";
  const avgSleep = daysWithData.length > 0 ? (daysWithData.reduce((s, d) => s + d.sleepMinutes, 0) / daysWithData.length / 60).toFixed(1) : "—";
  const avgDiapers = daysWithData.length > 0 ? (daysWithData.reduce((s, d) => s + d.diaperCount, 0) / daysWithData.length).toFixed(1) : "—";

  // Simple bar chart component
  const BarChart = ({ data, valueKey, color, normValue, normLabel, unit, maxOverride }) => {
    const values = data.map((d) => d[valueKey]);
    const max = maxOverride || Math.max(...values, normValue || 0, 1);
    return (
      <div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 2, height: 100, padding: "0 4px", position: "relative" }}>
          {/* Norm line */}
          {normValue > 0 && (
            <div style={{ position: "absolute", left: 0, right: 0, bottom: `${(normValue / max) * 100}%`, borderTop: `2px dashed ${color}40`, zIndex: 1 }}>
              <span style={{ position: "absolute", right: 0, top: -14, fontSize: 9, color: color, fontWeight: 600, background: "white", padding: "0 4px" }}>{normLabel}</span>
            </div>
          )}
          {data.map((d, i) => {
            const h = max > 0 ? (d[valueKey] / max) * 100 : 0;
            const isToday = d.dayKey === toDateKey(new Date());
            return (
              <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                <span style={{ fontSize: 8, color: C.t3, fontWeight: d[valueKey] > 0 ? 500 : 400 }}>{d[valueKey] > 0 ? d[valueKey] : ""}</span>
                <div style={{ width: "100%", height: `${Math.max(h, 2)}%`, background: isToday ? color : color + "60", borderRadius: 3, transition: "height 0.3s" }} />
              </div>
            );
          })}
        </div>
        {/* Day labels */}
        <div style={{ display: "flex", gap: 2, padding: "4px 4px 0" }}>
          {data.map((d, i) => (
            <div key={i} style={{ flex: 1, textAlign: "center", fontSize: 8, color: d.dayKey === toDateKey(new Date()) ? color : C.t3, fontWeight: d.dayKey === toDateKey(new Date()) ? 700 : 400 }}>
              {d.shortLabel}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Comparison badge
  const CompBadge = ({ actual, norm, unit = "", higher = "good" }) => {
    const a = parseFloat(actual);
    const n = parseFloat(norm);
    if (isNaN(a) || isNaN(n) || a === 0) return null;
    const diff = ((a - n) / n * 100).toFixed(0);
    const isAbove = a > n;
    const color = (higher === "good" && isAbove) || (higher === "low" && !isAbove) ? C.success : Math.abs(diff) < 15 ? C.warning : C.t3;
    return (
      <span style={{ fontSize: 10, fontWeight: 600, color, marginLeft: 4 }}>
        {isAbove ? "↑" : "↓"}{Math.abs(diff)}% vs norm
      </span>
    );
  };

  return (
    <div style={S.page}>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Trends</h2>
      <p style={{ fontSize: 13, color: C.t2, marginBottom: 12 }}>Week {ageWeeks} · vs WHO age norms</p>

      {/* Period selector */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {[["7d", "7 Days"], ["14d", "2 Weeks"], ["30d", "30 Days"]].map(([id, label]) => (
          <button key={id} style={S.chip(period === id, C.pri)} onClick={() => setPeriod(id)}>{label}</button>
        ))}
      </div>

      {/* Summary cards */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 16 }}>
        <div style={{ ...S.card, padding: 12, textAlign: "center", marginBottom: 0 }}>
          <div style={{ fontSize: 10, color: C.t2, fontWeight: 600, marginBottom: 4 }}>AVG FEEDS/DAY</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: C.feed }}>{avgFeeds}</div>
          <div style={{ fontSize: 10, color: C.t3 }}>Norm: {whoNorms.feedsPerDay}</div>
          <CompBadge actual={avgFeeds} norm={whoNorms.feedsPerDay} higher="neutral" />
        </div>
        <div style={{ ...S.card, padding: 12, textAlign: "center", marginBottom: 0 }}>
          <div style={{ fontSize: 10, color: C.t2, fontWeight: 600, marginBottom: 4 }}>AVG SLEEP</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: C.sleep }}>{avgSleep}h</div>
          <div style={{ fontSize: 10, color: C.t3 }}>Norm: {whoNorms.sleepHours}h</div>
          <CompBadge actual={avgSleep} norm={whoNorms.sleepHours} higher="good" />
        </div>
        <div style={{ ...S.card, padding: 12, textAlign: "center", marginBottom: 0 }}>
          <div style={{ fontSize: 10, color: C.t2, fontWeight: 600, marginBottom: 4 }}>AVG DIAPERS</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: C.diaper }}>{avgDiapers}</div>
          <div style={{ fontSize: 10, color: C.t3 }}>Norm: {whoNorms.diapersPerDay}</div>
          <CompBadge actual={avgDiapers} norm={whoNorms.diapersPerDay} higher="good" />
        </div>
      </div>

      {/* Feeding chart */}
      <div style={S.card}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: C.feed }}>🍼 Feeds per Day</h3>
            <span style={{ fontSize: 11, color: C.t3 }}>WHO norm: ~{whoNorms.feedsPerDay}/day</span>
          </div>
        </div>
        <BarChart data={dailyData} valueKey="feedCount" color={C.feed} normValue={whoNorms.feedsPerDay} normLabel={`${whoNorms.feedsPerDay}/day`} />
      </div>

      {/* Sleep chart */}
      <div style={S.card}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: C.sleep }}>😴 Sleep Hours</h3>
            <span style={{ fontSize: 11, color: C.t3 }}>WHO norm: ~{whoNorms.sleepHours}h/day</span>
          </div>
        </div>
        <BarChart data={dailyData.map((d) => ({ ...d, sleepH: parseFloat(d.sleepHours) }))} valueKey="sleepH" color={C.sleep} normValue={whoNorms.sleepHours} normLabel={`${whoNorms.sleepHours}h`} maxOverride={20} unit="h" />
      </div>

      {/* Diaper chart */}
      <div style={S.card}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: C.diaper }}>🧷 Diapers per Day</h3>
            <span style={{ fontSize: 11, color: C.t3 }}>WHO norm: ~{whoNorms.diapersPerDay}/day</span>
          </div>
        </div>
        <BarChart data={dailyData} valueKey="diaperCount" color={C.diaper} normValue={whoNorms.diapersPerDay} normLabel={`${whoNorms.diapersPerDay}/day`} />
      </div>

      {/* Weight chart */}
      {weightLog.length > 0 && (
        <div style={S.card}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: C.weight, marginBottom: 12 }}>⚖️ Weight Trend</h3>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 100, padding: "0 8px" }}>
            {[...weightLog].sort((a, b) => new Date(a.date) - new Date(b.date)).map((w, i, arr) => {
              const max = Math.max(...arr.map((s) => s.weight));
              const min = Math.min(...arr.map((s) => s.weight));
              const range = max - min || 1;
              const height = 20 + ((w.weight - min) / range) * 70;
              return (
                <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                  <span style={{ fontSize: 10, color: C.t3 }}>{w.weight}{w.unit}</span>
                  <div style={{ width: "100%", maxWidth: 28, height: `${height}%`, background: `linear-gradient(to top, ${C.weight}, ${C.weight}80)`, borderRadius: 4 }} />
                  <span style={{ fontSize: 8, color: C.t3 }}>{formatDate(w.date)}</span>
                </div>
              );
            })}
          </div>
          <div style={{ marginTop: 12, textAlign: "center" }}>
            <span style={{ fontSize: 24, fontWeight: 700, color: C.weight }}>{weightLog[weightLog.length - 1]?.weight}</span>
            <span style={{ fontSize: 14, color: C.t3, marginLeft: 4 }}>{weightLog[weightLog.length - 1]?.unit}</span>
            {weightLog.length >= 2 && (
              <div style={{ fontSize: 12, color: C.success, marginTop: 4 }}>
                +{(weightLog[weightLog.length - 1].weight - weightLog[0].weight).toFixed(2)} {weightLog[0].unit} since first weigh-in
              </div>
            )}
          </div>
        </div>
      )}

      {/* Active context notes affecting trends */}
      {(state.contextNotes || []).filter((n) => n.active).length > 0 && (
        <div style={{ ...S.card, background: "#FFF8E1", border: "1px solid #FFE08220" }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: C.warning, marginBottom: 6 }}>📌 Active Notes Affecting Trends</div>
          {(state.contextNotes || []).filter((n) => n.active).map((n) => (
            <div key={n.id} style={{ fontSize: 12, color: C.t2, padding: "3px 0" }}>
              {n.text}{n.explanation ? ` — "${n.explanation}"` : ""} <button onClick={() => onAddContextNote({ ...n, active: false })} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 10, color: C.t3, textDecoration: "underline", fontFamily: "inherit" }}>dismiss</button>
 <span style={{ fontSize: 10, color: C.t3 }}>since {formatDate(n.createdAt)}</span>
            </div>
          ))}
          <p style={{ fontSize: 10, color: C.t3, marginTop: 6 }}>Trend comparisons are less meaningful during these periods</p>
        </div>
      )}
    </div>
  );
};

// ============================================================
// MAIN APP
// ============================================================
// ============================================================
// AUTH SCREEN (Email signup/login + Join family)
// ============================================================
const AuthScreen = ({ onAuth }) => {
  const [mode, setMode] = useState("welcome"); // welcome | signup | login | join
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [babyName, setBabyName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [familyCode, setFamilyCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!email || !password || !name || !babyName) return setError("Please fill all fields");
    if (password.length < 6) return setError("Password must be at least 6 characters");
    setLoading(true); setError("");
    try {
      const { signUpEmail } = await import("./lib/auth.js");
      await signUpEmail(email, password, name, babyName, birthDate || null);
      onAuth();
    } catch (e) { setError(e.message); }
    setLoading(false);
  };

  const handleLogin = async () => {
    if (!email || !password) return setError("Please fill all fields");
    setLoading(true); setError("");
    try {
      const { signInEmail } = await import("./lib/auth.js");
      await signInEmail(email, password);
      onAuth();
    } catch (e) { setError(e.message.includes("invalid") ? "Wrong email or password" : e.message); }
    setLoading(false);
  };

  const handleJoin = async () => {
    if (!email || !password || !name || !familyCode) return setError("Please fill all fields");
    if (familyCode.length !== 6) return setError("Family code must be 6 characters");
    setLoading(true); setError("");
    try {
      const { signUpAndJoin } = await import("./lib/auth.js");
      await signUpAndJoin(email, password, name, familyCode);
      onAuth();
    } catch (e) { setError(e.message); }
    setLoading(false);
  };

  const inputStyle = { ...S.input, marginBottom: 12 };

  return (
    <>
      <FontLoader />
      <div style={{ ...S.app, display: "flex", flexDirection: "column", justifyContent: "center", padding: 24, minHeight: "100vh", paddingBottom: 24 }}>
        {mode === "welcome" && (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>👶</div>
            <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8, letterSpacing: "-0.03em" }}>Tiny Steps</h1>
            <p style={{ color: C.t2, fontSize: 15, marginBottom: 32, lineHeight: 1.5 }}>Track your baby's feeding, sleep, diapers, and milestones — together with your partner.</p>
            <button style={{ ...S.btn("primary"), width: "100%", padding: "16px", fontSize: 16 }} onClick={() => setMode("signup")}>Create Account</button>
            <button style={{ ...S.btn("ghost"), width: "100%", marginTop: 8 }} onClick={() => setMode("join")}>Join Partner's Account</button>
            <button style={{ ...S.btn("ghost"), width: "100%", marginTop: 4, fontSize: 13 }} onClick={() => setMode("login")}>Already have an account? Log in</button>
          </div>
        )}

        {mode === "signup" && (
          <div>
            <button style={{ ...S.btn("ghost"), marginBottom: 16, padding: "8px 0" }} onClick={() => { setMode("welcome"); setError(""); }}>← Back</button>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>Create Account</h2>
            <p style={{ color: C.t2, marginBottom: 20 }}>You'll get a family code to share with your partner.</p>
            <label style={S.label}>Your Name</label>
            <input style={inputStyle} value={name} onChange={(e) => setName(e.target.value)} placeholder="Ahmed" />
            <label style={S.label}>Email</label>
            <input style={inputStyle} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" />
            <label style={S.label}>Password</label>
            <input style={inputStyle} type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" />
            <label style={S.label}>Baby's Name</label>
            <input style={inputStyle} value={babyName} onChange={(e) => setBabyName(e.target.value)} placeholder="Baby's name" />
            <label style={S.label}>Birth Date (optional)</label>
            <input style={inputStyle} type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} />
            {error && <p style={{ color: C.danger, fontSize: 13, marginBottom: 12 }}>{error}</p>}
            <button style={{ ...S.btn("primary"), width: "100%", opacity: loading ? 0.6 : 1 }} onClick={handleSignup} disabled={loading}>
              {loading ? "Creating..." : "Create Account"}
            </button>
          </div>
        )}

        {mode === "join" && (
          <div>
            <button style={{ ...S.btn("ghost"), marginBottom: 16, padding: "8px 0" }} onClick={() => { setMode("welcome"); setError(""); }}>← Back</button>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>Join Partner</h2>
            <p style={{ color: C.t2, marginBottom: 20 }}>Enter the 6-digit family code your partner shared.</p>
            <label style={S.label}>Your Name</label>
            <input style={inputStyle} value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
            <label style={S.label}>Email</label>
            <input style={inputStyle} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" />
            <label style={S.label}>Password</label>
            <input style={inputStyle} type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" />
            <label style={S.label}>Family Code</label>
            <input style={{ ...inputStyle, textTransform: "uppercase", letterSpacing: "0.15em", fontSize: 20, textAlign: "center" }} value={familyCode} onChange={(e) => setFamilyCode(e.target.value.toUpperCase())} placeholder="ABC123" maxLength={6} />
            {error && <p style={{ color: C.danger, fontSize: 13, marginBottom: 12 }}>{error}</p>}
            <button style={{ ...S.btn("primary"), width: "100%", opacity: loading ? 0.6 : 1 }} onClick={handleJoin} disabled={loading}>
              {loading ? "Joining..." : "Join Family"}
            </button>
          </div>
        )}

        {mode === "login" && (
          <div>
            <button style={{ ...S.btn("ghost"), marginBottom: 16, padding: "8px 0" }} onClick={() => { setMode("welcome"); setError(""); }}>← Back</button>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 20 }}>Welcome Back</h2>
            <label style={S.label}>Email</label>
            <input style={inputStyle} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" />
            <label style={S.label}>Password</label>
            <input style={inputStyle} type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Your password" />
            {error && <p style={{ color: C.danger, fontSize: 13, marginBottom: 12 }}>{error}</p>}
            <button style={{ ...S.btn("primary"), width: "100%", opacity: loading ? 0.6 : 1 }} onClick={handleLogin} disabled={loading}>
              {loading ? "Logging in..." : "Log In"}
            </button>
          </div>
        )}
      </div>
    </>
  );
};

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
  const addEvent = async (e) => {
    const fs = await import("./lib/firestore.js");
    await fs.addEvent(familyId, e);
  };
  const addAppointment = async (a) => {
    const fs = await import("./lib/firestore.js");
    await fs.addAppointment(familyId, a);
  };
  const addWeight = async (w) => {
    const fs = await import("./lib/firestore.js");
    await fs.addWeight(familyId, w);
  };
  const addCalendarEvent = async (e) => {
    const fs = await import("./lib/firestore.js");
    await fs.addCalEvent(familyId, e);
  };
  const toggleMilestone = async (id) => {
    const fs = await import("./lib/firestore.js");
    const current = state.milestones.find((m) => m.milestoneId === id);
    const newDate = current?.achievedDate ? null : new Date().toISOString();
    await fs.setMilestone(familyId, id, newDate);
  };
  const startTimer = async (t) => {
    const fs = await import("./lib/firestore.js");
    await fs.setTimer(familyId, t, new Date().toISOString());
  };
  const stopTimer = async (t) => {
    const fs = await import("./lib/firestore.js");
    await fs.clearTimer(familyId, t);
  };
  const addContextNote = async (note) => {
    const fs = await import("./lib/firestore.js");
    await fs.addContextNote(familyId, note);
  };
  const addHealthLog = async (entry) => {
    const fs = await import("./lib/firestore.js");
    await fs.addHealthLog(familyId, entry);
  };
  const addAppointmentNote = async (label, detail) => {
    const upcoming = state.appointments.filter((a) => !a.completed && new Date(a.date) >= new Date()).sort((a, b) => new Date(a.date) - new Date(b.date));
    if (upcoming.length > 0) {
      const fs = await import("./lib/firestore.js");
      const appt = upcoming[0];
      const existingNotes = appt.notes || "";
      const newNote = `[AI] ${label}: ${detail}`;
      await fs.updateAppointment(familyId, appt.id, { notes: existingNotes ? `${existingNotes}\n${newNote}` : newNote });
    } else {
      await addAppointment({ id: generateId(), title: `Doctor Visit — ${label}`, date: new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0], time: "", type: "checkup", notes: `[AI] ${label}: ${detail}`, completed: false });
    }
  };
  const updateBaby = async (baby) => {
    const fs = await import("./lib/firestore.js");
    await fs.updateBaby(familyId, baby);
  };
  const updateSettings = async (settings) => {
    const fs = await import("./lib/firestore.js");
    await fs.updateSettings(familyId, { ...state.settings, ...settings });
  };
  const handleSignOut = async () => {
    const { signOut } = await import("./lib/auth.js");
    await signOut();
  };

  const ageWeeks = state.baby?.birthDate ? getBabyAgeWeeks(state.baby.birthDate) : null;
  const lastFeed = getLastEvent(state.events, "feed");
  const lastSleep = getLastEvent(state.events, "sleep");
  const lastDiaper = getLastEvent(state.events, "diaper");
  const recs = ageWeeks !== null ? getAgeRecommendations(ageWeeks) : null;

  // ---- LOCAL NOTIFICATION SCHEDULING ----
  // Reschedules whenever a new feed/sleep/diaper is logged
  useEffect(() => {
    if (!recs || !state.baby?.name) return;
    if (typeof Notification === "undefined" || Notification.permission !== "granted") return;

    const timers = [];
    const schedule = (title, body, delayMs) => {
      if (delayMs > 0 && delayMs < 24 * 60 * 60 * 1000) {
        timers.push(setTimeout(() => {
          new Notification(title, { body, icon: "/icons/icon-192.png", tag: title, vibrate: [200, 100, 200] });
        }, delayMs));
      }
    };

    const name = state.baby.name;

    // Feed window
    if (lastFeed) {
      const nextMs = new Date(lastFeed.timestamp).getTime() + recs.feedInterval * 60000 - Date.now();
      schedule(`🍼 Feed time for ${name}`, `It's been ~${Math.round(recs.feedInterval / 60)}h since the last feed.`, nextMs);
      schedule(`🍼 ${name} might be hungry`, `Feed window passed ${Math.round(recs.feedInterval / 60 * 0.3)}min ago.`, nextMs + recs.feedInterval * 60000 * 0.3);
    }

    // Sleep window
    if (lastSleep) {
      const sleepEnd = lastSleep.endTime || lastSleep.timestamp;
      const nextMs = new Date(sleepEnd).getTime() + recs.sleepWake * 60000 - Date.now();
      schedule(`😴 Nap time for ${name}`, `Wake window is ending. Watch for sleepy cues!`, nextMs);
    }

    // Diaper window
    if (lastDiaper) {
      const nextMs = new Date(lastDiaper.timestamp).getTime() + recs.diaperInterval * 60000 - Date.now();
      schedule(`🧷 Diaper check for ${name}`, `It's been a while since the last change.`, nextMs);
    }

    return () => timers.forEach((t) => clearTimeout(t));
  }, [lastFeed?.timestamp, lastSleep?.timestamp, lastDiaper?.timestamp, recs, state.baby?.name]);

  // ---- AUTO-POPULATE CALENDAR WITH VACCINATIONS ----
  // Runs once when baby has a birth date and calendar is empty of vaccine entries
  useEffect(() => {
    if (!familyId || !state.baby?.birthDate || !state.calendarEvents) return;
    const hasVaccineEvents = state.calendarEvents.some((e) => e.autoType === "vaccine");
    if (hasVaccineEvents) return; // already populated

    const populate = async () => {
      const fs = await import("./lib/firestore.js");
      const birthDate = new Date(state.baby.birthDate);

      // Add vaccination dates to calendar
      for (const vax of VACCINATION_SCHEDULE_BASE) {
        const dueDate = new Date(birthDate);
        dueDate.setDate(dueDate.getDate() + vax.weekDue * 7);
        const dateStr = `${dueDate.getFullYear()}-${String(dueDate.getMonth() + 1).padStart(2, "0")}-${String(dueDate.getDate()).padStart(2, "0")}`;
        await fs.addCalEvent(familyId, {
          id: generateId(),
          title: `💉 ${vax.name}`,
          date: dateStr,
          time: "",
          notes: vax.description + (vax.region === "egypt" ? " (Egypt schedule)" : ""),
          type: "vaccination",
          autoType: "vaccine",
        });
      }

      // Add standard checkup appointments
      const checkups = [
        { week: 1, title: "Newborn Checkup" },
        { week: 4, title: "1-Month Checkup" },
        { week: 8, title: "2-Month Checkup" },
        { week: 16, title: "4-Month Checkup" },
        { week: 24, title: "6-Month Checkup" },
        { week: 36, title: "9-Month Checkup" },
        { week: 52, title: "12-Month Checkup" },
        { week: 72, title: "18-Month Checkup" },
        { week: 104, title: "2-Year Checkup" },
      ];
      for (const checkup of checkups) {
        const dueDate = new Date(birthDate);
        dueDate.setDate(dueDate.getDate() + checkup.week * 7);
        const dateStr = `${dueDate.getFullYear()}-${String(dueDate.getMonth() + 1).padStart(2, "0")}-${String(dueDate.getDate()).padStart(2, "0")}`;
        await fs.addCalEvent(familyId, {
          id: generateId(),
          title: `🩺 ${checkup.title}`,
          date: dateStr,
          time: "",
          notes: `Week ${checkup.week} pediatric checkup`,
          type: "checkup",
          autoType: "checkup",
        });
      }

      console.log("Auto-populated calendar with vaccinations and checkups");
    };

    populate().catch(console.error);
  }, [familyId, state.baby?.birthDate, state.calendarEvents]);

  const deleteEvent = async (eventId) => {
    try {
      const fs = await import("./lib/firestore.js");
      await fs.deleteEvent(familyId, eventId);
    } catch (e) {
      console.error("Delete failed:", e);
    }
  };
  const editEvent = async (eventId, updates) => {
    try {
      const { doc, updateDoc } = await import("firebase/firestore");
      const { db } = await import("./lib/firebase.js");
      await updateDoc(doc(db, "families", familyId, "events", eventId), updates);
    } catch (e) {
      console.error("Edit failed:", e);
    }
  };
  const openLogger = (t) => { if (t === "activities") { setTab("activities"); } else { setModal(t); } };

  // Loading state
  if (authLoading) return (
    <>
      <FontLoader />
      <div style={{ ...S.app, display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>👶</div>
          <div style={{ fontSize: 16, fontWeight: 600, color: C.t2 }}>Loading Tiny Steps...</div>
        </div>
      </div>
    </>
  );

  // Not logged in
  if (!user) return <AuthScreen onAuth={() => {}} />;

  // Logged in but family data still loading
  if (!state.baby) return (
    <>
      <FontLoader />
      <div style={{ ...S.app, display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>👶</div>
          <div style={{ fontSize: 16, fontWeight: 600, color: C.t2 }}>Syncing family data...</div>
        </div>
      </div>
    </>
  );

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
        {tab === "trends" && <TrendsDashboard state={state} />}
        {tab === "doctor" && <DoctorSummary state={state} onAddNote={addHealthLog} onAddContextNote={addContextNote} />}
        {tab === "activities" && <ActivitiesPage state={state} onSave={addEvent} />}
        {tab === "milestones" && <MilestonesPage state={state} onToggle={toggleMilestone} />}
                {tab === "growth" && <GrowthPage state={state} onOpenLogger={(t) => setModal(t)} customVaccines={customVaccines} />}
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
