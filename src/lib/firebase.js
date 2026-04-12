import { initializeApp } from 'firebase/app';
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore';
import { getMessaging, isSupported } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// browserLocalPersistence is the most reliable on iOS PWA
setPersistence(auth, browserLocalPersistence).catch(() => {});

// THE FIX: persistentLocalCache enables Firestore IndexedDB caching.
// First open: fetches from network and caches (~1-2s).
// Every subsequent open: returns cached data instantly (<100ms), then syncs in background.
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
  experimentalAutoDetectLongPolling: true,
});

let messaging = null;
export const getMessagingInstance = async () => {
  if (messaging) return messaging;
  const supported = await isSupported();
  if (supported) messaging = getMessaging(app);
  return messaging;
};

export default app;
