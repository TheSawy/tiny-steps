// ============================================================
// UTILITY FUNCTIONS
// ============================================================

export const generateId = () => Math.random().toString(36).substr(2, 9) + Date.now().toString(36);

export const getBabyAgeWeeks = (birthDate) => {
  if (!birthDate) return 0;
  return Math.floor((new Date() - new Date(birthDate)) / (7 * 24 * 60 * 60 * 1000));
};

export const getBabyAgeDays = (birthDate) => {
  if (!birthDate) return 0;
  return Math.floor((new Date() - new Date(birthDate)) / (24 * 60 * 60 * 1000));
};

export const formatAge = (birthDate) => {
  const days = getBabyAgeDays(birthDate);
  if (days < 7) return `${days} day${days !== 1 ? "s" : ""} old`;
  const weeks = Math.floor(days / 7);
  if (weeks < 12) return `${weeks} week${weeks !== 1 ? "s" : ""} old`;
  const months = Math.floor(days / 30.44);
  return `${months} month${months !== 1 ? "s" : ""} old`;
};

export const formatDuration = (ms) => {
  if (!ms || ms < 0) return "0m";
  const mins = Math.floor(ms / 60000);
  const hrs = Math.floor(mins / 60);
  if (hrs > 0) return `${hrs}h ${mins % 60}m`;
  return `${mins}m`;
};

export const formatTime = (date) => new Date(date).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
export const formatDate = (date) => new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" });
export const formatDateFull = (date) => new Date(date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });

export const getTimeSince = (ts) => {
  const mins = Math.floor((Date.now() - new Date(ts).getTime()) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ${mins % 60}m ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

export const getTodayEvents = (events, type) => {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  return events.filter((e) => e.type === type && new Date(e.timestamp) >= today);
};

export const getLastEvent = (events, type) => {
  return events.filter((e) => e.type === type && e.timestamp && new Date(e.timestamp).getTime() <= Date.now()).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0] || null;
};

export const getAgeRecommendations = (ageWeeks) => {
  if (ageWeeks < 2) return { feedInterval: 120, sleepHours: 16, sleepWake: 45, tummyTime: 3, diapers: 10, diaperInterval: 120, naps: 6 };
  if (ageWeeks < 6) return { feedInterval: 150, sleepHours: 15.5, sleepWake: 60, tummyTime: 5, diapers: 8, diaperInterval: 150, naps: 5 };
  if (ageWeeks < 12) return { feedInterval: 150, sleepHours: 15, sleepWake: 75, tummyTime: 15, diapers: 8, diaperInterval: 150, naps: 4 };
  if (ageWeeks < 16) return { feedInterval: 180, sleepHours: 14.5, sleepWake: 90, tummyTime: 20, diapers: 7, diaperInterval: 180, naps: 4 };
  if (ageWeeks < 26) return { feedInterval: 210, sleepHours: 14, sleepWake: 120, tummyTime: 30, diapers: 6, diaperInterval: 210, naps: 3 };
  if (ageWeeks < 40) return { feedInterval: 240, sleepHours: 13.5, sleepWake: 150, tummyTime: 45, diapers: 5, diaperInterval: 240, naps: 2 };
  return { feedInterval: 270, sleepHours: 13, sleepWake: 180, tummyTime: 60, diapers: 5, diaperInterval: 270, naps: 2 };
};

export const getNextWindow = (lastTimestamp, intervalMins) => {
  if (!lastTimestamp) return null;
  const next = new Date(new Date(lastTimestamp).getTime() + intervalMins * 60000);
  if (next < new Date()) return { time: next, overdue: true, overdueBy: Math.floor((Date.now() - next.getTime()) / 60000) };
  return { time: next, overdue: false, minsUntil: Math.floor((next.getTime() - Date.now()) / 60000) };
};

export const toDateKey = (d) => {
  const dt = new Date(d);
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
};
