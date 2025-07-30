'use client';

import { useState, useEffect, useRef } from 'react';
import { Bell, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Notification {
  id: number;
  timestamp: string;
  type: string;
  data: {
    customer: string;
    agent: string;
    provider: string;
    package: string;
    email: string;
    phone: string;
  };
  read: boolean;
}

export default function RealTimeNotificationListener() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const lastNotificationCount = useRef(0);

  // Initialize audio context
  useEffect(() => {
    try {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (error) {
      console.error('Audio context not supported:', error);
    }
  }, []);

  // Play notification sound
  const playNotificationSound = () => {
    if (!soundEnabled || !audioContextRef.current) return;

    try {
      const ctx = audioContextRef.current;
      
      // Resume audio context if suspended (Chrome requirement)
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      // Create a distinctive notification sound pattern
      const playBeep = (frequency: number, duration: number, delay: number) => {
        setTimeout(() => {
          const oscillator = ctx.createOscillator();
          const gainNode = ctx.createGain();
          
          oscillator.connect(gainNode);
          gainNode.connect(ctx.destination);
          
          oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);
          oscillator.type = 'sine';
          
          gainNode.gain.setValueAtTime(0, ctx.currentTime);
          gainNode.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.01);
          gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
          
          oscillator.start(ctx.currentTime);
          oscillator.stop(ctx.currentTime + duration);
        }, delay);
      };

      // Play a pleasant notification pattern
      playBeep(800, 0.2, 0);    // First beep
      playBeep(1000, 0.2, 250); // Second beep
      playBeep(1200, 0.3, 500); // Third beep (longer)
      
    } catch (error) {
      console.error('Error playing notification sound:', error);
    }
  };

  // Check for new notifications
  const checkNotifications = async () => {
    try {
      const response = await fetch('/api/admin-notifications');
      if (response.ok) {
        const data = await response.json();
        const newNotifications = data.notifications || [];
        
        // Check if we have new notifications
        if (newNotifications.length > lastNotificationCount.current) {
          console.log('🔔 New form submission detected!');
          playNotificationSound();
          
          // Show browser notification if permission granted
          if (Notification.permission === 'granted') {
            const latestNotification = newNotifications[0];
            new Notification('🚨 New Form Submission!', {
              body: `Customer: ${latestNotification.data.customer}\nAgent: ${latestNotification.data.agent}`,
              icon: '/placeholder-logo.png',
              tag: 'form-submission'
            });
          }
        }
        
        setNotifications(newNotifications);
        lastNotificationCount.current = newNotifications.length;
      }
    } catch (error) {
      console.error('Error checking notifications:', error);
    }
  };

  // Start/stop listening
  const toggleListening = () => {
    if (isListening) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setIsListening(false);
    } else {
      // Request notification permission
      if (Notification.permission === 'default') {
        Notification.requestPermission();
      }
      
      // Start polling every 3 seconds
      intervalRef.current = setInterval(checkNotifications, 3000);
      setIsListening(true);
      
      // Initial check
      checkNotifications();
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Mark notification as read
  const markAsRead = async (notificationId: number) => {
    try {
      await fetch('/api/admin-notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId })
      });
      
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Test sound
  const testSound = () => {
    playNotificationSound();
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center gap-4">
        <Button
          onClick={toggleListening}
          variant={isListening ? "default" : "outline"}
          className="flex items-center gap-2"
        >
          <Bell className={`h-4 w-4 ${isListening ? 'animate-pulse' : ''}`} />
          {isListening ? 'Listening for Submissions' : 'Start Listening'}
          {unreadCount > 0 && (
            <Badge variant="destructive" className="ml-2">
              {unreadCount}
            </Badge>
          )}
        </Button>

        <Button
          onClick={() => setSoundEnabled(!soundEnabled)}
          variant="outline"
          size="sm"
        >
          {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
        </Button>

        <Button
          onClick={testSound}
          variant="outline"
          size="sm"
          disabled={!soundEnabled}
        >
          Test Sound
        </Button>
      </div>

      {/* Status */}
      <div className="text-sm text-muted-foreground">
        {isListening ? (
          <span className="text-green-600">
            🟢 Real-time notifications active - You'll hear sounds when forms are submitted
          </span>
        ) : (
          <span className="text-gray-500">
            ⚫ Click "Start Listening" to receive real-time audio notifications
          </span>
        )}
      </div>

      {/* Recent Notifications */}
      {notifications.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium">Recent Submissions:</h4>
          <div className="max-h-40 overflow-y-auto space-y-2">
            {notifications.slice(0, 5).map((notification) => (
              <div
                key={notification.id}
                className={`p-3 border rounded-lg text-sm ${
                  notification.read ? 'bg-gray-50' : 'bg-blue-50 border-blue-200'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium">{notification.data.customer}</div>
                    <div className="text-muted-foreground">
                      Agent: {notification.data.agent} • {notification.data.provider}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(notification.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                  {!notification.read && (
                    <Button
                      onClick={() => markAsRead(notification.id)}
                      variant="ghost"
                      size="sm"
                    >
                      Mark Read
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
