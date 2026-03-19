import {
  doc, collection, addDoc, setDoc, updateDoc, deleteDoc, getDoc,
  query, orderBy, onSnapshot, serverTimestamp, arrayUnion, arrayRemove,
} from 'firebase/firestore';
import { db } from './firebase.js';

// Family
export const onFamilyChange = (fid, cb) => onSnapshot(doc(db, 'families', fid), (s) => s.exists() && cb({ id: s.id, ...s.data() }));
export const updateBaby = (fid, baby) => updateDoc(doc(db, 'families', fid), { baby, updatedAt: serverTimestamp() });
export const updateSettings = (fid, settings) => updateDoc(doc(db, 'families', fid), { settings, updatedAt: serverTimestamp() });

// Events
const evCol = (fid) => collection(db, 'families', fid, 'events');
export const addEvent = (fid, ev) => addDoc(evCol(fid), { ...ev, createdAt: serverTimestamp() });
export const deleteEvent = (fid, eid) => deleteDoc(doc(db, 'families', fid, 'events', eid));
export const onAllEvents = (fid, cb) => onSnapshot(query(evCol(fid), orderBy('timestamp', 'desc')), (s) => cb(s.docs.map((d) => ({ ...d.data(), id: d.id }))));

// Weights
const wCol = (fid) => collection(db, 'families', fid, 'weights');
export const addWeight = (fid, w) => addDoc(wCol(fid), { ...w, createdAt: serverTimestamp() });
export const onWeights = (fid, cb) => onSnapshot(query(wCol(fid), orderBy('date', 'asc')), (s) => cb(s.docs.map((d) => ({ ...d.data(), id: d.id }))));

// Appointments
const aCol = (fid) => collection(db, 'families', fid, 'appointments');
export const addAppointment = (fid, a) => addDoc(aCol(fid), { ...a, createdAt: serverTimestamp() });
export const updateAppointment = (fid, aid, data) => updateDoc(doc(db, 'families', fid, 'appointments', aid), { ...data, updatedAt: serverTimestamp() });
export const onAppointments = (fid, cb) => onSnapshot(query(aCol(fid), orderBy('date', 'asc')), (s) => cb(s.docs.map((d) => ({ ...d.data(), id: d.id }))));

// Milestones
export const setMilestone = (fid, mid, date) => setDoc(doc(db, 'families', fid, 'milestones', mid), { milestoneId: mid, achievedDate: date, updatedAt: serverTimestamp() }, { merge: true });
export const onMilestones = (fid, cb) => onSnapshot(collection(db, 'families', fid, 'milestones'), (s) => { const m = {}; s.docs.forEach((d) => { const data = d.data(); m[data.milestoneId] = data.achievedDate; }); cb(m); });

// Calendar
const cCol = (fid) => collection(db, 'families', fid, 'calendar');
export const addCalEvent = (fid, ev) => addDoc(cCol(fid), { ...ev, createdAt: serverTimestamp() });
export const onCalEvents = (fid, cb) => onSnapshot(query(cCol(fid), orderBy('date', 'asc')), (s) => cb(s.docs.map((d) => ({ ...d.data(), id: d.id }))));

// Custom Vaccines
const vCol = (fid) => collection(db, 'families', fid, 'customVaccines');
export const addCustomVaccine = (fid, v) => addDoc(vCol(fid), { ...v, createdAt: serverTimestamp() });
export const onCustomVaccines = (fid, cb) => onSnapshot(vCol(fid), (s) => cb(s.docs.map((d) => ({ ...d.data(), id: d.id }))));

// Context Notes
const cnCol = (fid) => collection(db, 'families', fid, 'contextNotes');
export const addContextNote = (fid, note) => setDoc(doc(db, 'families', fid, 'contextNotes', note.id), { ...note, updatedAt: serverTimestamp() }, { merge: true });
export const onContextNotes = (fid, cb) => onSnapshot(cnCol(fid), (s) => cb(s.docs.map((d) => ({ ...d.data(), id: d.id }))));

// Health Log
const hCol = (fid) => collection(db, 'families', fid, 'healthLog');
export const addHealthLog = (fid, entry) => addDoc(hCol(fid), { ...entry, createdAt: serverTimestamp() });
export const onHealthLog = (fid, cb) => onSnapshot(query(hCol(fid), orderBy('timestamp', 'desc')), (s) => cb(s.docs.map((d) => ({ ...d.data(), id: d.id }))));

// Timers (shared between parents)
export const setTimer = (fid, type, startTime) => setDoc(doc(db, 'families', fid, 'timers', type), { type, startTime, updatedAt: serverTimestamp() });
export const clearTimer = (fid, type) => deleteDoc(doc(db, 'families', fid, 'timers', type));
export const onTimers = (fid, cb) => onSnapshot(collection(db, 'families', fid, 'timers'), (s) => { const t = {}; s.docs.forEach((d) => { const data = d.data(); t[data.type] = data; }); cb(t); });

// FCM Token
export const saveFcmToken = (uid, token) => updateDoc(doc(db, 'users', uid), { fcmTokens: arrayUnion(token) });
