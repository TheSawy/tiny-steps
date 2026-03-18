import {
  createUserWithEmailAndPassword, signInWithEmailAndPassword,
  signInWithPopup, GoogleAuthProvider, signOut as fbSignOut,
  onAuthStateChanged, updateProfile,
} from 'firebase/auth';
import { doc, setDoc, getDoc, query, collection, where, getDocs, updateDoc, arrayUnion, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebase.js';

const googleProvider = new GoogleAuthProvider();

const genCode = () => {
  const c = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let r = '';
  for (let i = 0; i < 6; i++) r += c[Math.floor(Math.random() * c.length)];
  return r;
};

const getUniqueCode = async () => {
  let code, exists = true;
  while (exists) {
    code = genCode();
    const q = query(collection(db, 'families'), where('code', '==', code));
    exists = !(await getDocs(q)).empty;
  }
  return code;
};

export const createFamily = async (userId, parentName, babyName, birthDate) => {
  const code = await getUniqueCode();
  const familyId = `family_${Date.now()}`;
  await setDoc(doc(db, 'families', familyId), {
    code, createdBy: userId, members: [userId],
    memberNames: { [userId]: parentName },
    baby: { name: babyName, birthDate: birthDate || null },
    settings: { aiProvider: 'claude' },
    createdAt: serverTimestamp(), updatedAt: serverTimestamp(),
  });
  await setDoc(doc(db, 'users', userId), { familyId, name: parentName, createdAt: serverTimestamp() });
  return { familyId, code };
};

export const joinFamily = async (userId, parentName, familyCode) => {
  const q = query(collection(db, 'families'), where('code', '==', familyCode.toUpperCase()));
  const snap = await getDocs(q);
  if (snap.empty) throw new Error('Invalid family code.');
  const familyDoc = snap.docs[0];
  const data = familyDoc.data();
  if (data.members.includes(userId)) throw new Error('Already a member.');
  if (data.members.length >= 2) throw new Error('Family already has 2 members.');
  await updateDoc(doc(db, 'families', familyDoc.id), {
    members: arrayUnion(userId), [`memberNames.${userId}`]: parentName, updatedAt: serverTimestamp(),
  });
  await setDoc(doc(db, 'users', userId), { familyId: familyDoc.id, name: parentName, createdAt: serverTimestamp() });
  return { familyId: familyDoc.id, code: familyCode, baby: data.baby };
};

export const signUpEmail = async (email, password, name, babyName, birthDate) => {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(cred.user, { displayName: name });
  const { familyId, code } = await createFamily(cred.user.uid, name, babyName, birthDate);
  return { user: cred.user, familyId, code };
};

export const signUpAndJoin = async (email, password, name, familyCode) => {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(cred.user, { displayName: name });
  return { user: cred.user, ...(await joinFamily(cred.user.uid, name, familyCode)) };
};

export const signInEmail = (email, pw) => signInWithEmailAndPassword(auth, email, pw);
export const signInGoogle = () => signInWithPopup(auth, googleProvider);
export const signOut = () => fbSignOut(auth);
export const getUserFamily = async (uid) => {
  const d = await getDoc(doc(db, 'users', uid));
  return d.exists() ? d.data().familyId : null;
};
export const onAuthChange = (cb) => onAuthStateChanged(auth, cb);
