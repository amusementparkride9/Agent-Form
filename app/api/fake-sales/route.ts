// API Route for generating fake sales notifications
// This endpoint generates fake sales and sends them to Slack every 5 minutes
// Usage: Can be called manually or automated with cron jobs

import { NextRequest, NextResponse } from 'next/server';
import { generateFakeSaleWithGemini, sendFakeSlackNotification } from '@/lib/fake-sales-generator';

export async function POST(request: NextRequest) {
  try {
    // Check if request has valid authorization (optional security)
    const authHeader = request.headers.get('authorization');
    const expectedAuth = process.env.FAKE_SALES_AUTH_TOKEN || 'fake-sales-token-123';
    
    if (authHeader !== `Bearer ${expectedAuth}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('🎭 Generating fake sale...');
    
    // Generate fake customer data using Gemini AI
    const fakeData = await generateFakeSaleWithGemini();
    console.log('🎭 Generated fake customer:', fakeData.customerName);
    
    // Send to Slack (NOT to Google Sheets)
    const slackResult = await sendFakeSlackNotification(fakeData);
    
    if (slackResult) {
      console.log('✅ Fake sale notification sent to Slack successfully');
      return NextResponse.json({ 
        success: true, 
        message: 'Fake sale sent to Slack',
        customer: fakeData.customerName,
        agent: fakeData.agentName,
        provider: fakeData.selectedProvider
      });
    } else {
      console.error('❌ Failed to send fake sale to Slack');
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to send to Slack' 
      }, { status: 500 });
    }

  } catch (error) {
    console.error('🎭 Fake sales generation error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// GET endpoint for manual testing
export async function GET(request: NextRequest) {
  try {
    // Allow GET requests for testing purposes
    console.log('🎭 Manual fake sale generation requested');
    
    const fakeData = await generateFakeSaleWithGemini();
    const slackResult = await sendFakeSlackNotification(fakeData);
    
    return NextResponse.json({ 
      success: slackResult,
      message: slackResult ? 'Test fake sale sent to Slack' : 'Failed to send to Slack',
      generatedData: fakeData
    });

  } catch (error) {
    console.error('🎭 Manual fake sales test error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
