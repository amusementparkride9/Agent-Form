'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bell, BellOff, Smartphone, AlertCircle } from 'lucide-react';
import { initializePushNotifications, isPushNotificationsEnabled, requestNotificationPermission, sendLocalNotification } from '@/lib/push-notification';

export default function NotificationSettings() {
  const [isEnabled, setIsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [browserSupport, setBrowserSupport] = useState(true);

  useEffect(() => {
    // Check if notifications are currently enabled
    setIsEnabled(isPushNotificationsEnabled());
    
    // Check browser support
    if (!('Notification' in window) || !('serviceWorker' in navigator)) {
      setBrowserSupport(false);
    }
  }, []);

  const handleEnableNotifications = async () => {
    setIsLoading(true);
    
    try {
      const granted = await requestNotificationPermission();
      if (granted) {
        const initialized = await initializePushNotifications();
        setIsEnabled(initialized);
      } else {
        alert('Please allow notifications in your browser settings to receive order alerts.');
      }
    } catch (error) {
      console.error('Failed to enable notifications:', error);
      alert('Failed to enable notifications. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const sendTestNotification = () => {
    if (isEnabled) {
      // Create a test form data to simulate a real notification with sound
      const testFormData = {
        agentName: 'Test Agent',
        agentId: 'TEST001',
        customerName: 'John Test Customer',
        email: 'test@example.com',
        phone: '(555) 123-4567',
        dateOfBirth: '1990-01-01',
        ssn: '123-45-6789',
        streetAddress: '123 Test Street',
        city: 'Test City',
        state: 'TS',
        zipCode: '12345',
        movedLastYear: false,
        selectedProvider: 'Test Provider',
        selectedPackage: 'Test Package',
        selectedAddOns: ['Test Add-on'],
        submissionDate: new Date().toISOString(),
        ipAddress: '127.0.0.1'
      };
      
      // Use the full notification with sound
      sendLocalNotification(testFormData);
    }
  };

  if (!browserSupport) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-500" />
            Browser Not Supported
          </CardTitle>
          <CardDescription>
            Your browser doesn't support push notifications. Please use Chrome, Firefox, or Safari.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Smartphone className="h-5 w-5" />
          Order Notifications
        </CardTitle>
        <CardDescription>
          Get instant alerts on your phone when new orders are submitted
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Status</span>
          <Badge variant={isEnabled ? "default" : "secondary"}>
            {isEnabled ? "Enabled" : "Disabled"}
          </Badge>
        </div>

        {!isEnabled ? (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Enable notifications to receive instant alerts when agents submit new orders.
            </p>
            <Button 
              onClick={handleEnableNotifications} 
              disabled={isLoading}
              className="w-full"
            >
              <Bell className="h-4 w-4 mr-2" />
              {isLoading ? "Setting up..." : "Enable Notifications"}
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-green-600">
              ✅ You'll receive instant notifications for new orders!
            </p>
            <div className="grid grid-cols-2 gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={sendTestNotification}
              >
                Test Alert
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  setIsEnabled(false);
                  // Could add logic to unsubscribe here
                }}
              >
                <BellOff className="h-4 w-4 mr-1" />
                Disable
              </Button>
            </div>
          </div>
        )}

        <div className="pt-3 border-t">
          <h4 className="text-sm font-medium mb-2">Features:</h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Instant mobile notifications with sound</li>
            <li>• Works even when browser is closed</li>
            <li>• Customer name and provider info</li>
            <li>• Click to open order details</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
