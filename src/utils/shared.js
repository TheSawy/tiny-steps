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
