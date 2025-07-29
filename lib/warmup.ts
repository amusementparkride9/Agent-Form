// API Route Warmup Service
// This helps reduce cold start times in development
import { google } from 'googleapis';

// Initialize services on client side
export async function warmupApiRoutes() {
  if (typeof window === 'undefined') return; // Only run on client side
  
  const routes = [
    '/api/submit-form',
    '/api/process-queue'
  ];

  // Wait a bit after page load to warm up routes
  setTimeout(async () => {
    for (const route of routes) {
      try {
        await fetch(route, { method: 'GET' });
        console.log(`Warmed up: ${route}`);
      } catch (error) {
        console.log(`Warmup failed for ${route}:`, error);
      }
    }
  }, 2000); // Wait 2 seconds after page load
}

// Initialize expensive services during app startup to speed up first request
// This runs on the server side
export async function warmupServices() {
  // Don't run on client side
  if (typeof window !== 'undefined') return false;
  
  try {
    console.log('Warming up backend services...');
    
    // Pre-initialize Google API client
    await warmupGoogleAPI();
    
    console.log('Services warm-up complete');
    return true;
  } catch (error) {
    console.error('Warmup failed:', error);
    return false;
  }
}

// Initialize Google API connections
async function warmupGoogleAPI() {
  try {
    const SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY;
    
    if (SERVICE_ACCOUNT_EMAIL && PRIVATE_KEY) {
      const auth = new google.auth.JWT({
        email: SERVICE_ACCOUNT_EMAIL,
        key: PRIVATE_KEY.replace(/\\n/g, '\n'),
        scopes: ['https://www.googleapis.com/auth/spreadsheets']
      });
      
      const sheets = google.sheets({ version: 'v4', auth });
      
      // Minimal validation call to cache the client
      await auth.authorize();
      
      console.log('Google API client warmed up');
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Google API warmup failed:', error);
    return false;
  }
}
