// Automated Fake Sales Scheduler
// This runs every 5 minutes to send fake sales to Slack
// NOTE: For Vercel deployment, use the cron job in vercel.json instead
// This file is for local development or non-Vercel deployments

import { generateFakeSaleWithGemini, sendFakeSlackNotification } from '@/lib/fake-sales-generator';

class FakeSalesScheduler {
  private isRunning = false;
  private intervalId: NodeJS.Timeout | null = null;

  // Start the scheduler to run every 5 minutes
  start() {
    if (this.isRunning) {
      console.log('🎭 Fake sales scheduler already running');
      return;
    }

    console.log('🎭 Starting fake sales scheduler - every 5 minutes');
    this.isRunning = true;

    // Run immediately once
    this.generateAndSendFakeSale();

    // Then run every 5 minutes (300,000 milliseconds)
    this.intervalId = setInterval(() => {
      this.generateAndSendFakeSale();
    }, 5 * 60 * 1000);
  }

  // Stop the scheduler
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
    console.log('🎭 Fake sales scheduler stopped');
  }

  // Generate and send a fake sale
  private async generateAndSendFakeSale() {
    try {
      console.log('🎭 Generating scheduled fake sale...');
      
      const fakeData = await generateFakeSaleWithGemini();
      const slackResult = await sendFakeSlackNotification(fakeData);
      
      if (slackResult) {
        console.log(`✅ Fake sale sent: ${fakeData.customerName} (${fakeData.selectedProvider}) via ${fakeData.agentName}`);
      } else {
        console.error('❌ Failed to send fake sale to Slack');
      }
    } catch (error) {
      console.error('🎭 Error in scheduled fake sale generation:', error);
    }
  }

  // Check if scheduler is running
  isActive(): boolean {
    return this.isRunning;
  }
}

// Create singleton instance
const scheduler = new FakeSalesScheduler();

// Export functions for manual control
export function startFakeSalesScheduler() {
  scheduler.start();
}

export function stopFakeSalesScheduler() {
  scheduler.stop();
}

export function isFakeSalesSchedulerActive(): boolean {
  return scheduler.isActive();
}

// For Next.js apps, you might want to start this in your main layout or a specific page
// Or use it with API routes for manual control

export default scheduler;
