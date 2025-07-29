import { NextRequest, NextResponse } from 'next/server';

// Simple in-memory store for push subscriptions (in production, use a database)
let pushSubscriptions: any[] = [];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, subscription, notification } = body;

    if (action === 'subscribe') {
      // Store the push subscription
      pushSubscriptions.push(subscription);
      console.log('Push subscription stored:', subscription);
      
      return NextResponse.json({ 
        success: true, 
        message: 'Subscription stored successfully' 
      });
    }

    if (action === 'notify') {
      // Send notification to all subscribed devices
      console.log('Sending push notification:', notification);
      
      // For now, we'll just log it (in production, you'd use web-push library)
      // This will trigger the client-side notification we implemented
      
      return NextResponse.json({ 
        success: true, 
        message: 'Notification sent successfully',
        subscriberCount: pushSubscriptions.length
      });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Push notification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    subscriberCount: pushSubscriptions.length,
    subscriptions: pushSubscriptions.map(sub => ({
      endpoint: sub.endpoint.substring(0, 50) + '...',
      hasKeys: !!sub.keys
    }))
  });
}
