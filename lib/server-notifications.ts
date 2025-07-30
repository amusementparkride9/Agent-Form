// Server-side push notification service
// This sends notifications to the admin when ANYONE submits a form

import { SubmissionFormData } from './google-sheets';

// Discord webhook notification (free, just create a webhook URL)
export async function sendDiscordNotification(formData: SubmissionFormData, webhookUrl?: string): Promise<boolean> {
  if (!webhookUrl) return false;
  
  try {
    const discordMessage = {
      content: "🚨 **New Form Submission!**",
      embeds: [{
        title: "Internet Order Form Completed",
        color: 0x00ff00, // Green
        fields: [
          { name: "Customer", value: formData.customerName, inline: true },
          { name: "Agent", value: formData.agentName, inline: true },
          { name: "Provider", value: formData.selectedProvider, inline: true },
          { name: "Package", value: formData.selectedPackage || 'DirectTV Only', inline: true },
          { name: "Email", value: formData.email, inline: true },
          { name: "Phone", value: formData.phone, inline: true }
        ],
        timestamp: new Date().toISOString(),
        footer: { text: "Agent Form System" }
      }]
    };

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(discordMessage)
    });

    return response.ok;
  } catch (error) {
    console.error('Discord notification failed:', error);
    return false;
  }
}

// Slack webhook notification (free, just create a webhook URL)
export async function sendSlackNotification(formData: SubmissionFormData, webhookUrl?: string): Promise<boolean> {
  if (!webhookUrl) return false;
  
  try {
    const slackMessage = {
      text: "🚨 New Form Submission!",
      blocks: [
        {
          type: "header",
          text: { type: "plain_text", text: "🚨 New Internet Order Form" }
        },
        {
          type: "section",
          fields: [
            { type: "mrkdwn", text: `*Customer:*\n${formData.customerName}` },
            { type: "mrkdwn", text: `*Agent:*\n${formData.agentName}` },
            { type: "mrkdwn", text: `*Provider:*\n${formData.selectedProvider}` },
            { type: "mrkdwn", text: `*Package:*\n${formData.selectedPackage || 'DirectTV Only'}` },
            { type: "mrkdwn", text: `*Email:*\n${formData.email}` },
            { type: "mrkdwn", text: `*Phone:*\n${formData.phone}` }
          ]
        }
      ]
    };

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(slackMessage)
    });

    return response.ok;
  } catch (error) {
    console.error('Slack notification failed:', error);
    return false;
  }
}

// Telegram bot notification (free, just create a bot)
export async function sendTelegramNotification(formData: SubmissionFormData, botToken?: string, chatId?: string): Promise<boolean> {
  if (!botToken || !chatId) return false;
  
  try {
    const message = `🚨 *New Form Submission!*\n\n` +
      `👤 *Customer:* ${formData.customerName}\n` +
      `🏢 *Agent:* ${formData.agentName}\n` +
      `📡 *Provider:* ${formData.selectedProvider}\n` +
      `📦 *Package:* ${formData.selectedPackage || 'DirectTV Only'}\n` +
      `📧 *Email:* ${formData.email}\n` +
      `📱 *Phone:* ${formData.phone}\n` +
      `📍 *ZIP:* ${formData.zipCode}`;

    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'Markdown'
      })
    });

    return response.ok;
  } catch (error) {
    console.error('Telegram notification failed:', error);
    return false;
  }
}

// Browser notification API for admin (real-time push)
export async function sendBrowserPushNotification(formData: SubmissionFormData): Promise<boolean> {
  // This would require VAPID keys and push service registration
  // For now, we'll focus on the webhook approaches above
  return false;
}
