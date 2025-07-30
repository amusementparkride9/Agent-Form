import { SubmissionFormData } from './google-sheets';
import { formatSSN, formatDateOfBirth } from './utils';

interface EmailData {
  to: string[];
  subject: string;
  html: string;
}

export async function sendEmailNotification(formData: SubmissionFormData): Promise<boolean> {
  try {
    // Using EmailJS free service - no server needed
    // This will be handled on the client side
    const emailData = {
      service_id: process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID,
      template_id: process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID,
      user_id: process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY,
      template_params: {
        to_email: process.env.NEXT_PUBLIC_NOTIFICATION_EMAIL,
        subject: `New Internet Order - Agent: ${formData.agentName}`,
        agent_name: formData.agentName,
        agent_id: formData.agentId,
        customer_name: formData.customerName,
        customer_email: formData.email,
        customer_phone: formData.phone,
        service_address: `${formData.streetAddress}${formData.aptUnit ? `, ${formData.aptUnit}` : ''}, ${formData.city}, ${formData.state} ${formData.zipCode}`,
        selected_provider: formData.selectedProvider,
        selected_package: formData.selectedPackage || 'DirectTV Only',
        directv_package: formData.selectedDirectvPackage || 'None',
        add_ons: formData.selectedAddOns.join(', ') || 'None',
        submission_date: formData.submissionDate,
        moved_last_year: formData.movedLastYear ? 'Yes' : 'No',
        previous_address: formData.movedLastYear && formData.prevStreetAddress 
          ? `${formData.prevStreetAddress}${formData.prevAptUnit ? `, ${formData.prevAptUnit}` : ''}, ${formData.prevCity}, ${formData.prevState} ${formData.prevZipCode}`
          : 'N/A'
      }
    };

    // This will be called from the client side using EmailJS
    return true;
  } catch (error) {
    console.error('Error preparing email notification:', error);
    return false;
  }
}

// Alternative free email service using Resend (server-side)
export async function sendEmailWithResend(formData: SubmissionFormData): Promise<boolean> {
  try {
    const RESEND_API_KEY = process.env.RESEND_API_KEY;
    const TO_EMAIL = process.env.NOTIFICATION_EMAIL;

    if (!RESEND_API_KEY || !TO_EMAIL) {
      console.error('Missing email configuration');
      return false;
    }

    const emailHtml = `
      <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 10px;">
              New Internet Order Form Submission
            </h1>
            
            <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h2 style="color: #1e40af; margin-top: 0;">Agent Information</h2>
              <p><strong>Name:</strong> ${formData.agentName}</p>
              <p><strong>ID:</strong> ${formData.agentId}</p>
            </div>

            <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h2 style="color: #16a34a; margin-top: 0;">Customer Information</h2>
              <p><strong>Name:</strong> ${formData.customerName}</p>
              <p><strong>Email:</strong> ${formData.email}</p>
              <p><strong>Phone:</strong> ${formData.phone}</p>
              <p><strong>Date of Birth:</strong> ${formatDateOfBirth(formData.dateOfBirth)}</p>
              <p><strong>SSN:</strong> ${formatSSN(formData.ssn)}</p>
            </div>

            <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h2 style="color: #d97706; margin-top: 0;">Service Address</h2>
              <p><strong>Address:</strong> ${formData.streetAddress}${formData.aptUnit ? `, ${formData.aptUnit}` : ''}</p>
              <p><strong>City, State ZIP:</strong> ${formData.city}, ${formData.state} ${formData.zipCode}</p>
              ${formData.movedLastYear ? `
                <p><strong>Moved Last Year:</strong> Yes</p>
                <p><strong>Previous Address:</strong> ${formData.prevStreetAddress}${formData.prevAptUnit ? `, ${formData.prevAptUnit}` : ''}, ${formData.prevCity}, ${formData.prevState} ${formData.prevZipCode}</p>
              ` : '<p><strong>Moved Last Year:</strong> No</p>'}
            </div>

            <div style="background-color: #ede9fe; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h2 style="color: #7c3aed; margin-top: 0;">Service Selection</h2>
              <p><strong>Provider:</strong> ${formData.selectedProvider}</p>
              <p><strong>Package:</strong> ${formData.selectedPackage || 'DirectTV Only'}</p>
              ${formData.selectedDirectvPackage ? `<p><strong>DirecTV Package:</strong> ${formData.selectedDirectvPackage}</p>` : ''}
              ${formData.selectedAddOns.length > 0 ? `<p><strong>Add-ons:</strong> ${formData.selectedAddOns.join(', ')}</p>` : ''}
            </div>

            <div style="background-color: #f1f5f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h2 style="color: #475569; margin-top: 0;">Submission Details</h2>
              <p><strong>Submitted:</strong> ${new Date(formData.submissionDate).toLocaleString('en-US', {
                timeZone: 'America/New_York',
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: true
              })} EST</p>
              ${formData.ipAddress ? `<p><strong>IP Address:</strong> ${formData.ipAddress}</p>` : ''}
            </div>

            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center; color: #64748b;">
              <p>This is an automated notification from the Internet Order Form system.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'onboarding@resend.dev', // Use Resend's test domain
        to: [TO_EMAIL],
        subject: `New Internet Order - Agent: ${formData.agentName}`,
        html: emailHtml,
      }),
    });

    if (!response.ok) {
      throw new Error(`Email service responded with status: ${response.status}`);
    }

    return true;
  } catch (error) {
    console.error('Error sending email with Resend:', error);
    return false;
  }
}
