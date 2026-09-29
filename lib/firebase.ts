import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getMessaging, getToken, onMessage, isSupported, Messaging } from 'firebase/messaging';
import { playNotificationSound } from './notificationSound';

// Safe environment config
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyDemoFallbackKeyPhulwariAdminERP2026',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'phulwari-patna.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'phulwari-patna',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'phulwari-patna.appspot.com',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '1029384756',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:1029384756:web:abcdef123456',
};

let app: FirebaseApp | null = null;
let messaging: Messaging | null = null;

export function getFirebaseApp(): FirebaseApp {
  if (!app) {
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  }
  return app;
}

/**
 * Request Notification permission and retrieve FCM device token.
 */
export async function requestFcmToken(): Promise<string | null> {
  if (typeof window === 'undefined') return null;

  try {
    const supported = await isSupported();
    if (!supported) {
      console.log('Firebase Cloud Messaging is not supported in this browser environment.');
      return null;
    }

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.log('Notification permission not granted.');
      return null;
    }

    const firebaseApp = getFirebaseApp();
    messaging = getMessaging(firebaseApp);

    const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY || undefined;

    // Register service worker if available
    let swRegistration: ServiceWorkerRegistration | undefined = undefined;
    if ('serviceWorker' in navigator) {
      swRegistration = await navigator.serviceWorker.register('/firebase-messaging-sw.js').catch(() => undefined);
    }

    const token = await getToken(messaging, {
      vapidKey,
      serviceWorkerRegistration: swRegistration,
    }).catch(err => {
      console.warn('FCM getToken notice (standard when credentials pending in .env.local):', err.message);
      return null;
    });

    if (token) {
      console.log('✅ [FCM DEVICE TOKEN RECEIVED]:', token);
      try {
        localStorage.setItem('phulwari_fcm_token', token);
      } catch (_) {}
    }

    return token;
  } catch (err: any) {
    console.warn('FCM initialization notice:', err.message);
    return null;
  }
}

/**
 * Listen for foreground FCM messages and trigger sound + alert
 */
export function onMessageListener(callback: (payload: any) => void) {
  if (typeof window === 'undefined') return () => {};

  isSupported().then((supported) => {
    if (!supported) return;

    try {
      const firebaseApp = getFirebaseApp();
      const msg = getMessaging(firebaseApp);

      onMessage(msg, (payload) => {
        console.log('🔔 [FOREGROUND FCM MESSAGE RECEIVED]:', payload);
        // Play notification audio chime
        playNotificationSound();
        callback(payload);
      });
    } catch (err) {
      console.warn('onMessageListener setup notice:', err);
    }
  });

  return () => {};
}
