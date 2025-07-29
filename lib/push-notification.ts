// Push notification service for order notifications
import { FormData } from './google-sheets';

interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

let pushSubscription: PushSubscription | null = null;

// Initialize push notifications for the admin/owner
export async function initializePushNotifications(): Promise<boolean> {
  if (!checkNotificationSupport()) {
    console.log('Push notifications not supported');
    return false;
  }

  try {
    // Register service worker for enhanced notifications
    const registration = await navigator.serviceWorker.register('/sw.js');
    console.log('Service Worker registered:', registration);

    // Request notification permission
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.log('Notification permission denied');
      return false;
    }

    console.log('Local notifications enabled');
    return true;
  } catch (error) {
    console.error('Notification setup failed:', error);
    return false;
  }
}

// Send local notification (fallback for development)
export function sendLocalNotification(formData: FormData): void {
  if (!('Notification' in window)) {
    console.log('Notifications not supported');
    return;
  }

  if (Notification.permission === 'granted') {
    const notification = new Notification(`🚨 NEW ORDER - ${formData.customerName}`, {
      body: `${formData.selectedProvider} - ${formData.selectedPackage}\n📍 ${formData.streetAddress}, ${formData.city} ${formData.state}\n👤 Agent: ${formData.agentName} (${formData.agentId})`,
      icon: '/favicon.ico',
      tag: 'new-order',
      requireInteraction: true // Keeps notification visible until clicked
    });

    notification.onclick = function() {
      window.focus();
      notification.close();
      // Could open a specific order details page
    };

    // Auto-close after 30 seconds if not clicked
    setTimeout(() => {
      notification.close();
    }, 30000);
  }
}

// Check if push notifications are enabled
export function isPushNotificationsEnabled(): boolean {
  return 'Notification' in window && Notification.permission === 'granted';
}

// Request permission for notifications
export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    return false;
  }

  const permission = await Notification.requestPermission();
  return permission === 'granted';
}

// Helper function for checking notification support
function checkNotificationSupport(): boolean {
  return 'Notification' in window && 'serviceWorker' in navigator;
}
