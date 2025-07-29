import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { submitToGoogleSheets } from '@/lib/google-sheets';
import { sendEmailWithResend } from '@/lib/email-service';

// This endpoint processes queued form submissions asynchronously

// Handle warmup requests
export async function GET() {
  return NextResponse.json({ 
    success: true, 
    message: 'Queue processor endpoint ready' 
  });
}
export async function POST(request: NextRequest) {
  console.log('Process queue endpoint called');
  try {
    // Check for Edge Runtime
    const isEdgeRuntime = process.env.NEXT_RUNTIME === 'edge';
    if (isEdgeRuntime) {
      console.log('Running in Edge Runtime - cannot access file system');
      return NextResponse.json({
        success: false,
        message: 'File system operations not supported in Edge Runtime',
      });
    }
    
    const queueDir = path.join(process.cwd(), 'temp-queue');
    console.log(`Queue directory path: ${queueDir}`);
    
    // Ensure queue directory exists
    try {
      await fs.mkdir(queueDir, { recursive: true });
      console.log('Queue directory created or already exists');
    } catch (err) {
      console.log('Queue directory error:', err);
    }
    
    // Get all queued files
    const queueFiles = await fs.readdir(queueDir);
    const jsonFiles = queueFiles.filter(file => file.endsWith('.json'));
    
    if (jsonFiles.length === 0) {
      return NextResponse.json({ 
        success: true, 
        message: 'No submissions in queue',
        processed: 0
      });
    }
    
    console.log(`Processing ${jsonFiles.length} queued submissions`);
    let processedCount = 0;
    
    // Process each submission in sequence
    for (const file of jsonFiles) {
      try {
        const filePath = path.join(queueDir, file);
        const fileContent = await fs.readFile(filePath, 'utf-8');
        const formData = JSON.parse(fileContent);
        
        // Process the submission with detailed logging
        console.log(`Processing submission from file: ${file}`);
        console.log('Form data:', JSON.stringify(formData, null, 2).substring(0, 500) + '...');
        
        // Process Google Sheets submission with error handling
        let sheetsResult, emailResult;
        try {
          console.log('Submitting to Google Sheets...');
          sheetsResult = await submitToGoogleSheets(formData);
          console.log('Google Sheets submission result:', sheetsResult);
        } catch (sheetsError) {
          console.error('Google Sheets submission failed with error:', sheetsError);
          const errorMessage = sheetsError instanceof Error ? sheetsError.message : 'Unknown error';
          sheetsResult = { success: false, error: errorMessage };
        }
        
        // Process email with error handling
        try {
          console.log('Sending email notification...');
          emailResult = await sendEmailWithResend(formData);
          console.log('Email sending result:', emailResult);
        } catch (emailError) {
          console.error('Email sending failed with error:', emailError);
          emailResult = false;
        }
        
        // Log results
        console.log(`Processed ${file}:`, {
          sheets: sheetsResult,
          email: emailResult
        });
        
        // Delete the processed file
        try {
          await fs.unlink(filePath);
        } catch (unlinkError) {
          console.log(`Warning: Could not delete file ${file} - it may have been already processed`);
        }
        processedCount++;
      } catch (error) {
        console.error(`Failed to process submission ${file}:`, error);
        // Keep the file in the queue if processing failed
      }
    }
    
    return NextResponse.json({
      success: true,
      message: `Processed ${processedCount} submissions`,
      processed: processedCount
    });
    
  } catch (error) {
    console.error('Queue processing error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
