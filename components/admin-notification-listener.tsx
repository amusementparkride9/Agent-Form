'use client';

import { useEffect } from 'react';
import { sendLocalNotification } from '@/lib/push-notification';

// Background listener for admin notifications
export default function AdminNotificationListener() {
  useEffect(() => {
    // Listen for server-sent events or poll for new notifications
    const checkForNotifications = async () => {
      try {
        // This could poll an endpoint or use Server-Sent Events
        // For now, we'll use the existing email + local notification system
        console.log('Admin notification listener active');
      } catch (error) {
        console.error('Notification listener error:', error);
      }
    };

    // Set up periodic check (optional)
    const interval = setInterval(checkForNotifications, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, []);

  return null; // This component doesn't render anything
}
