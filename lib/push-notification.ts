// Push notification service for order notifications
import { SubmissionFormData } from './google-sheets';

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

// Generate alert beep sound programmatically
function playNotificationSound(): void {
  try {
    // Create audio context for programmatic sound generation
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Create a longer, more distinctive alert pattern
    const alertPattern = [
      { freq: 800, duration: 0.4, volume: 0.3 },   // Low beep
      { freq: 1200, duration: 0.4, volume: 0.4 },  // High beep  
      { freq: 800, duration: 0.4, volume: 0.3 },   // Low beep
      { freq: 1200, duration: 0.6, volume: 0.5 },  // Longer high beep
      { freq: 1000, duration: 0.8, volume: 0.4 },  // Medium sustained tone
    ];
    
    let startTime = audioContext.currentTime;

    alertPattern.forEach((tone, index) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(tone.freq, startTime);
      oscillator.type = 'sine';
      
      // Configure tone with fade in/out for smoother sound
      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(tone.volume, startTime + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + tone.duration - 0.05);
      
      oscillator.start(startTime);
      oscillator.stop(startTime + tone.duration);
      
      startTime += tone.duration + 0.2; // Gap between tones
    });
    
    console.log('🔊 Playing notification alert sound');
  } catch (error) {
    console.log('Audio not supported, using silent notification');
  }
}

// Send local notification (fallback for development)
export function sendLocalNotification(formData: SubmissionFormData): void {
  if (!('Notification' in window)) {
    console.log('Notifications not supported');
    return;
  }

  if (Notification.permission === 'granted') {
    // Play notification sound immediately
    playNotificationSound();

    const notification = new Notification(`🚨 NEW ORDER - ${formData.customerName}`, {
      body: `${formData.selectedProvider} - ${formData.selectedPackage}\n📍 ${formData.streetAddress}, ${formData.city} ${formData.state}\n👤 Agent: ${formData.agentName} (${formData.agentId})`,
      icon: '/favicon.ico',
      tag: 'new-order',
      requireInteraction: true, // Keeps notification visible until clicked
      silent: false // Allow system notification sound (if available)
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
