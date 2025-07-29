import { NextRequest, NextResponse } from 'next/server';
import { submitToGoogleSheets, FormData } from '@/lib/google-sheets';
import { sendEmailWithResend } from '@/lib/email-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const requiredFields = [
      'agentName', 'agentId', 'customerName', 'email', 'phone', 
      'dateOfBirth', 'ssn', 'streetAddress', 'city', 'state', 'zipCode',
      'selectedProvider', 'selectedPackage'
    ];
    
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Get client IP address
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown';
    
    // Prepare form data
    const formData: FormData = {
      ...body,
      submissionDate: new Date().toISOString(),
      ipAddress: ip,
      selectedAddOns: body.selectedAddOns || [],
    };

    // Submit to Google Sheets
    let sheetsResult;
    try {
      sheetsResult = await submitToGoogleSheets(formData);
    } catch (error) {
      console.error('Google Sheets submission failed:', error);
      return NextResponse.json(
        { error: 'Failed to save form data' },
        { status: 500 }
      );
    }

    // Send email notification (optional - won't fail the submission if it fails)
    let emailSent = false;
    try {
      emailSent = await sendEmailWithResend(formData);
    } catch (error) {
      console.error('Email notification failed:', error);
      // Don't fail the entire submission if email fails
    }

    // Trigger push notification to admin (server-side)
    try {
      await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/push-notifications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'notify',
          notification: {
            title: `🚨 NEW ORDER - ${formData.customerName}`,
            body: `${formData.selectedProvider} - ${formData.selectedPackage}\n📍 ${formData.streetAddress}, ${formData.city} ${formData.state}\n👤 Agent: ${formData.agentName} (${formData.agentId})`,
            data: formData
          }
        })
      });
    } catch (error) {
      console.error('Push notification trigger failed:', error);
      // Don't fail submission if notification fails
    }

    return NextResponse.json({
      success: true,
      message: 'Form submitted successfully',
      sheetsResult,
      emailSent,
      submissionId: sheetsResult.range,
    });

  } catch (error) {
    console.error('Error processing form submission:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
