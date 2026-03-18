import { getToken, onMessage } from 'firebase/messaging';
import { getMessagingInstance } from './firebase.js';
import { saveFcmToken } from './firestore.js';

const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY;

export const requestNotifications = async (userId) => {
  try {
    if (Notification.permission !== 'granted') {
      const perm = await Notification.requestPermission();
      if (perm !== 'granted') return null;
    }
    const messaging = await getMessagingInstance();
    if (!messaging) return null;
    const token = await getToken(messaging, { vapidKey: VAPID_KEY });
    if (token && userId) await saveFcmToken(userId, token);
    return token;
  } catch (e) { console.warn('Notification setup failed:', e); return null; }
};

export const scheduleLocal = (title, body, delayMs) => {
  if (!('Notification' in window) || Notification.permission !== 'granted') return null;
  return setTimeout(() => new Notification(title, { body, icon: '/icons/icon-192.png', vibrate: [200, 100, 200] }), delayMs);
};

export const cancelLocal = (id) => id && clearTimeout(id);
