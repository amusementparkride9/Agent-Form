// Service Worker for push notifications
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  event.waitUntil(self.clients.claim());
});

// Handle push events (for future server-side push notifications)
self.addEventListener('push', (event) => {
  console.log('Push event received:', event);
  
  let data;
  try {
    data = event.data ? event.data.json() : {};
  } catch (e) {
    data = { title: 'New Order', body: 'A new order has been submitted' };
  }

  const options = {
    body: data.body || 'A new order has been submitted',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    tag: 'new-order',
    requireInteraction: true,
    data: data
  };

  event.waitUntil(
    self.registration.showNotification(data.title || '🚨 New Order', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);
  
  event.notification.close();

  // Focus or open the app window
  event.waitUntil(
    self.clients.matchAll().then((clients) => {
      // If app is already open, focus it
      for (const client of clients) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus();
        }
      }
      
      // Otherwise open a new window
      if (self.clients.openWindow) {
        return self.clients.openWindow('/');
      }
    })
  );
});

// Handle background sync (for offline support)
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    console.log('Background sync triggered');
    // Could sync pending form submissions when back online
  }
});
