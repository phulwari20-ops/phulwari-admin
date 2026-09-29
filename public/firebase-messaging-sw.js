// Firebase Cloud Messaging Service Worker for background push notifications
/* eslint-disable no-undef */
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyDemoFallbackKeyPhulwariAdminERP2026",
  authDomain: "phulwari-patna.firebaseapp.com",
  projectId: "phulwari-patna",
  storageBucket: "phulwari-patna.appspot.com",
  messagingSenderId: "1029384756",
  appId: "1:1029384756:web:abcdef123456"
};

try {
  firebase.initializeApp(firebaseConfig);
  const messaging = firebase.messaging();

  messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);

    const notificationTitle = payload.notification?.title || payload.data?.title || '🔔 Phulwari Notification';
    const notificationOptions = {
      body: payload.notification?.body || payload.data?.body || 'New alert from Phulwari Admin ERP',
      icon: '/icons/icon-192x192.png',
      badge: '/icons/badge-72x72.png',
      data: payload.data || {},
      vibrate: [200, 100, 200]
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
  });
} catch (e) {
  console.log('Firebase sw initialization note:', e);
}

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});
