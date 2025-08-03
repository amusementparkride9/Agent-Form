// Vercel Cron Job API Route
// This endpoint is called by Vercel's cron jobs every 5 minutes
// Configure in vercel.json with: {"crons": [{"path": "/api/cron/fake-sales", "schedule": "*/5 * * * *"}]}

import { NextRequest, NextResponse } from 'next/server';
import { generateFakeSaleWithGemini, sendFakeSlackNotification } from '@/lib/fake-sales-generator';

export async function GET(request: NextRequest) {
  try {
    // Verify this is a legitimate cron request (Vercel adds this header)
    const cronSecret = request.nextUrl.searchParams.get('secret');
    const expectedSecret = process.env.CRON_SECRET || 'your-cron-secret-here';
    
    if (cronSecret !== expectedSecret) {
      console.log('🚫 Unauthorized cron request');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('⏰ Cron job triggered - generating fake sale');
    
    // Generate fake sale data
    const fakeData = await generateFakeSaleWithGemini();
    
    // Send to Slack only (not Google Sheets)
    const slackResult = await sendFakeSlackNotification(fakeData);
    
    if (slackResult) {
      console.log(`✅ Cron fake sale sent: ${fakeData.customerName} (${fakeData.selectedProvider})`);
      return NextResponse.json({ 
        success: true,
        timestamp: new Date().toISOString(),
        customer: fakeData.customerName,
        agent: fakeData.agentName,
        provider: fakeData.selectedProvider,
        message: 'Fake sale sent to Slack via cron'
      });
    } else {
      console.error('❌ Cron fake sale failed to send to Slack');
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to send to Slack',
        timestamp: new Date().toISOString()
      }, { status: 500 });
    }

  } catch (error) {
    console.error('⏰ Cron fake sales error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Cron job failed',
      timestamp: new Date().toISOString(),
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Also support POST for manual triggering
export async function POST(request: NextRequest) {
  return GET(request);
}
