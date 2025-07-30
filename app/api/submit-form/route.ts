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

    // Process Google Sheets and Email truly asynchronously using the queue system
    // This gives immediate response to user by offloading processing
    
    // Write submission to queue file for background processing
    try {
      // Create a unique ID for this submission
      const submissionId = `submission-${Date.now()}`;
      
      console.log('Preparing to write submission to queue file');
      
      // Import fs with dynamic import to prevent it from affecting edge runtime
      const { writeFile } = await import('fs/promises');
      const { mkdir } = await import('fs/promises');
      
      // Make sure the temp-queue directory exists
      try {
        await mkdir('./temp-queue', { recursive: true });
        console.log('Queue directory exists or was created');
      } catch (mkdirErr) {
        console.error('Failed to create queue directory:', mkdirErr);
      }
      
      const queueFilePath = `./temp-queue/${submissionId}.json`;
      console.log(`Writing to queue file: ${queueFilePath}`);
      
      try {
        // Write the formData to a temporary queue file for processing later
        await writeFile(queueFilePath, JSON.stringify(formData), 'utf-8');
        console.log(`Successfully wrote to queue file ${queueFilePath}`);
      } catch (writeErr) {
        console.error('Failed to write to queue file:', writeErr);
      }
        
      console.log(`Queued submission ${submissionId} for background processing`);
      
      // Process Google Sheets and Email synchronously to ensure completion
      try {
        console.log('Processing submission synchronously for Vercel compatibility');
        
        // Process in parallel but wait for completion
        const results = await Promise.allSettled([
          (async () => {
            try {
              console.log('Submitting to Google Sheets...');
              const { submitToGoogleSheets } = await import('@/lib/google-sheets');
              const sheetsResult = await submitToGoogleSheets(formData);
              console.log('Google Sheets result:', sheetsResult);
              return sheetsResult;
            } catch (sheetsErr) {
              console.error('Google Sheets error:', sheetsErr);
              return null;
            }
          })(),
          (async () => {
            try {
              console.log('Sending email notification...');
              const { sendEmailWithResend } = await import('@/lib/email-service');
              const emailResult = await sendEmailWithResend(formData);
              console.log('Email result:', emailResult);
              return emailResult;
            } catch (emailErr) {
              console.error('Email error:', emailErr);
              return null;
            }
          })()
        ]);

        const [sheetsResult, emailResult] = results;
        console.log('Processing completed - Sheets:', sheetsResult.status, 'Email:', emailResult.status);
        
      } catch (processErr) {
        console.error('Synchronous processing error:', processErr);
      }
    } catch (error) {
      console.error('Queue error:', error);
      // Continue with response even if queuing fails
    }

    const endTime = Date.now();
    const duration = endTime - startTime;
    console.log(`Form submission completed in ${duration}ms`);

    // Return immediate success response
    return NextResponse.json({
      success: true,
      message: 'Form submitted successfully - processing in background',
      processingTime: `${duration}ms`,
      submissionId: `submission-${Date.now()}`,
      note: 'Google Sheets and email notifications are being processed in the background'
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
