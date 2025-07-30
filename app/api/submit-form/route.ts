import { NextRequest, NextResponse } from 'next/server';
import { SubmissionFormData } from '@/lib/google-sheets';

// Handle warmup requests
export async function GET() {
  return NextResponse.json({ 
    success: true, 
    message: 'Form submission endpoint ready' 
  });
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  try {
    const rawBody = await request.text();
    
    // Handle empty bodies gracefully (could be warmup requests)
    if (!rawBody.trim()) {
      return NextResponse.json(
        { success: false, message: 'Empty request' },
        { status: 200 }
      );
    }
    
    let body;
    try {
      body = JSON.parse(rawBody);
    } catch (parseError) {
      return NextResponse.json(
        { error: 'Invalid JSON format' },
        { status: 400 }
      );
    }
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
    const formData: SubmissionFormData = {
      ...body,
      submissionDate: new Date().toISOString(),
      ipAddress: ip,
      selectedAddOns: body.selectedAddOns || [],
    };

    // Process Google Sheets and Email synchronously to ensure completion on Vercel
    const submissionId = `submission-${Date.now()}`;
    
    try {
      console.log('🔍 DEBUG: Starting synchronous processing for Vercel');
      console.log('🔍 DEBUG: Environment check - SHEET_ID exists:', !!process.env.GOOGLE_SHEET_ID);
      console.log('🔍 DEBUG: Environment check - EMAIL exists:', !!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL);
      console.log('🔍 DEBUG: Environment check - KEY exists:', !!process.env.GOOGLE_PRIVATE_KEY);
      
      // Process in parallel but wait for completion
      const results = await Promise.allSettled([
        (async () => {
          try {
            console.log('🔍 DEBUG: About to import Google Sheets module');
            const { submitToGoogleSheets } = await import('@/lib/google-sheets');
            console.log('🔍 DEBUG: Google Sheets module imported successfully');
            
            console.log('🔍 DEBUG: Calling submitToGoogleSheets with data:', JSON.stringify({
              agentName: formData.agentName,
              customerName: formData.customerName,
              email: formData.email
            }));
            
            const sheetsResult = await submitToGoogleSheets(formData);
            console.log('🔍 DEBUG: Google Sheets raw result:', JSON.stringify(sheetsResult));
            return sheetsResult;
          } catch (sheetsErr: any) {
            console.error('🔍 DEBUG: Google Sheets error details:', sheetsErr);
            console.error('🔍 DEBUG: Error stack:', sheetsErr?.stack);
            return { error: sheetsErr?.message || 'Unknown sheets error' };
          }
        })(),
        (async () => {
          try {
            console.log('🔍 DEBUG: About to import email service module');
            const { sendEmailWithResend } = await import('@/lib/email-service');
            console.log('🔍 DEBUG: Email service module imported successfully');
            
            const emailResult = await sendEmailWithResend(formData);
            console.log('🔍 DEBUG: Email result:', emailResult);
            return emailResult;
          } catch (emailErr: any) {
            console.error('🔍 DEBUG: Email error:', emailErr);
            return { error: emailErr?.message || 'Unknown email error' };
          }
        })()
      ]);

      const [sheetsResult, emailResult] = results;
      console.log('🔍 DEBUG: Final processing results:');
      console.log('🔍 DEBUG: - Sheets status:', sheetsResult.status);
      console.log('🔍 DEBUG: - Sheets value:', sheetsResult.status === 'fulfilled' ? JSON.stringify(sheetsResult.value) : 'rejected');
      console.log('🔍 DEBUG: - Email status:', emailResult.status);
      console.log('🔍 DEBUG: - Email value:', emailResult.status === 'fulfilled' ? JSON.stringify(emailResult.value) : 'rejected');
      
    } catch (processErr: any) {
      console.error('🔍 DEBUG: Synchronous processing error:', processErr);
      console.error('🔍 DEBUG: Error stack:', processErr?.stack);
    }

    const endTime = Date.now();
    const duration = endTime - startTime;
    console.log(`Form submission completed in ${duration}ms`);

    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Form submitted successfully',
      processingTime: `${duration}ms`,
      submissionId: submissionId,
      note: 'Google Sheets and email notifications processed'
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
