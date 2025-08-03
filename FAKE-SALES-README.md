# 🎭 Fake Sales Generator System

## Overview
This system generates realistic fake sales notifications that are sent to Slack every 5 minutes to create the appearance of continuous sales activity. **Important: Fake sales bypass Google Sheets entirely** - they only appear in Slack.

## 🚀 Features

- **AI-Powered Data Generation**: Uses Google Gemini AI to create realistic customer information
- **Intelligent Fallback**: Predefined realistic data if Gemini API is unavailable
- **Slack-Only Notifications**: Fake sales appear in Slack but NOT in Google Sheets
- **Zero Disruption**: Existing form submission flow remains completely unchanged
- **Automated Scheduling**: Runs every 5 minutes via Vercel cron jobs
- **Manual Control**: Admin interface for testing and manual triggers
- **Real Agent Names**: Uses actual agent names from your team
- **Realistic Providers**: Uses real internet providers and package combinations

## 📁 File Structure

```
/lib/
├── fake-sales-generator.ts     # Core logic for generating fake sales
└── fake-sales-scheduler.ts     # Manual scheduling (alternative to Vercel cron)

/app/api/
├── fake-sales/route.ts         # Manual API endpoint for testing
└── cron/fake-sales/route.ts    # Vercel cron job endpoint

/app/admin/
└── fake-sales/page.tsx         # Admin control panel

/components/
└── fake-sales-control-panel.tsx # UI for controlling fake sales

vercel.json                     # Vercel cron job configuration
```

## 🔧 Setup Instructions

### 1. Environment Variables
Add these to your `.env.local` file:

```bash
# Required: Google Gemini AI API Key
GEMINI_API_KEY=your_gemini_api_key_here

# Required: Cron job security token
CRON_SECRET=your-secure-cron-secret-123

# Optional: Manual API auth token
FAKE_SALES_AUTH_TOKEN=fake-sales-secure-token-456

# Your existing Slack webhook (already configured)
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...
```

### 2. Get Gemini API Key
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Add it to your environment variables

### 3. Deploy to Vercel
1. Push code to your repository
2. Deploy to Vercel
3. Add environment variables in Vercel dashboard
4. The cron job will automatically start running every 5 minutes

### 4. Update Cron Secret
Update the `vercel.json` file with your actual cron secret:

```json
{
  "crons": [
    {
      "path": "/api/cron/fake-sales?secret=your-actual-secret-here",
      "schedule": "*/5 * * * *"
    }
  ]
}
```

## 🎮 Usage

### Automated (Recommended)
Once deployed to Vercel, fake sales will automatically be sent to Slack every 5 minutes.

### Manual Testing
1. Visit `/admin/fake-sales` in your app
2. Click "Generate Test Sale" to create a single fake sale
3. Check your Slack channel for the notification

### API Endpoints

**Test Generation:**
```bash
GET /api/fake-sales
```

**Manual Cron Trigger:**
```bash
GET /api/cron/fake-sales?secret=your-cron-secret
```

## 🔍 How It Works

### Data Generation Process
1. **Gemini AI Call**: Requests realistic customer data from Google's Gemini API
2. **Fallback System**: If Gemini fails, uses predefined realistic data
3. **Agent Assignment**: Randomly assigns a real agent from your team
4. **Provider Selection**: Chooses from real internet providers and packages
5. **Slack Notification**: Sends formatted message to Slack (bypasses Google Sheets)

### Sample Generated Data
```json
{
  "customerName": "Jessica Martinez",
  "agentName": "Sarah Johnson",
  "selectedProvider": "Spectrum",
  "selectedPackage": "Internet Ultra + TV Choice",
  "email": "jessica.martinez456@gmail.com",
  "phone": "(555) 123-4567",
  "city": "Austin",
  "state": "TX"
}
```

### Slack Message Format
The fake sales appear in Slack with:
- 💰 "New Sale Completed!" header (different from form submissions)
- Customer and agent information
- Provider and package details
- Location and contact info
- Timestamp

## 🛡️ Security & Isolation

### Complete Isolation from Real Data
- **Google Sheets**: Fake sales never touch your Google Sheets
- **Real Forms**: Existing form submission flow unchanged
- **Database**: No fake data stored in your database
- **Email**: No fake sales emails sent

### Authentication
- Cron endpoint requires secret token
- Manual API endpoints can require auth tokens
- Admin panel can be restricted by user permissions

## ⚙️ Customization

### Modify Agent Names
Edit the `REAL_AGENTS` array in `fake-sales-generator.ts`:

```typescript
const REAL_AGENTS = [
  "Your Agent 1", "Your Agent 2", // Add your real agents
];
```

### Adjust Providers/Packages
Modify `PROVIDERS_AND_PACKAGES` object to match your offerings:

```typescript
const PROVIDERS_AND_PACKAGES = {
  "Your Provider": [
    "Package 1",
    "Package 2"
  ]
};
```

### Change Frequency
Update `vercel.json` cron schedule:
- Every 3 minutes: `"*/3 * * * *"`
- Every 10 minutes: `"*/10 * * * *"`
- Every hour: `"0 * * * *"`

## 🐛 Troubleshooting

### Fake Sales Not Appearing
1. Check Vercel deployment logs
2. Verify environment variables are set
3. Confirm Slack webhook URL is correct
4. Check cron secret matches in vercel.json

### Gemini API Errors
- System automatically falls back to predefined data
- Check your Gemini API key is valid
- Monitor API quotas and usage

### Testing Locally
```bash
# Test fake sale generation
curl http://localhost:3000/api/fake-sales

# Test cron endpoint
curl http://localhost:3000/api/cron/fake-sales?secret=your-secret
```

## 📊 Monitoring

### Admin Dashboard
Visit `/admin/fake-sales` to:
- View system status
- Generate test sales
- See last generated sale data
- Manually trigger cron jobs

### Logs
Check Vercel function logs for:
- Successful fake sale generations
- Gemini API responses
- Slack notification results
- Error messages

## 🚨 Important Notes

1. **Fake vs Real**: Fake sales use 💰 emoji vs 🚨 for real submissions
2. **No Data Persistence**: Fake sales exist only in Slack notifications
3. **Zero Impact**: Your existing Google Sheets and form processing are untouched
4. **Realistic Data**: Generated data looks authentic but is completely fake
5. **Team Awareness**: Consider informing your team which notifications are fake

## 🔄 Maintenance

### Regular Tasks
- Monitor Gemini API usage and costs
- Update agent names when team changes
- Adjust providers/packages as offerings change
- Review Slack channel for fake vs real sale distinction

### Scaling
- System can handle high frequency (every minute if needed)
- Gemini API has generous free tier
- Vercel cron jobs are reliable and free

---

**🎭 This system creates the illusion of constant sales activity while keeping your real data completely separate and secure!**
