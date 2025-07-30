import { google } from 'googleapis';
import { formatSSN, formatDateOfBirth } from './utils';

// Cache for Google Sheets client to avoid re-initializing for each request
let sheetsClientCache: any = null;
let authCache: any = null;

export interface SubmissionFormData {
  // Agent Information
  agentName: string;
  agentId: string;
  
  // Customer Information
  customerName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  ssn: string;
  
  // Service Address
  streetAddress: string;
  aptUnit?: string;
  city: string;
  state: string;
  zipCode: string;
  
  // Previous Address (if moved)
  movedLastYear: boolean;
  prevStreetAddress?: string;
  prevAptUnit?: string;
  prevCity?: string;
  prevState?: string;
  prevZipCode?: string;
  
  // Service Information
  selectedProvider: string;
  selectedPackage?: string;
  selectedDirectvPackage?: string;
  selectedAddOns: string[];
  
  // Metadata
  submissionDate: string;
  ipAddress?: string;
}

export async function submitToGoogleSheets(data: SubmissionFormData) {
  try {
    // Get environment variables at runtime
    const SHEET_ID = process.env.GOOGLE_SHEET_ID;
    const SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY;
    
    if (!SHEET_ID || !SERVICE_ACCOUNT_EMAIL || !PRIVATE_KEY) {
      console.warn('Google Sheets not configured - skipping submission');
      return {
        success: true,
        message: 'Form submitted successfully (Google Sheets not configured)',
        range: null,
        rowsAdded: 0,
      };
    }
    
    // Use cached auth client or initialize a new one
    if (!authCache) {
      authCache = new google.auth.JWT({
        email: SERVICE_ACCOUNT_EMAIL,
        key: PRIVATE_KEY.replace(/\\n/g, '\n'),
        scopes: ['https://www.googleapis.com/auth/spreadsheets']
      });
    }

    // Use cached sheets client or initialize a new one
    if (!sheetsClientCache) {
      sheetsClientCache = google.sheets({ version: 'v4', auth: authCache });
    }
    
    const sheets = sheetsClientCache;
    
    // Define headers exactly as specified
    const headers = [
      'Submission Date',
      'Agent Name', 
      'Agent ID',
      'Customer Name',
      'Email',
      'Phone',
      'Date of Birth',
      'SSN',
      'Street Address',
      'Apt/Unit',
      'City',
      'State',
      'ZIP Code',
      'Moved Last Year',
      'Previous Street Address',
      'Previous Apt/Unit', 
      'Previous City',
      'Previous State',
      'Previous ZIP Code',
      'Selected Provider',
      'Selected Package',
      'DirecTV Package',
      'Add-Ons',
      'IP Address'
    ];
    
    // Prepare the row data in exact order matching headers
    const rowData = [
      new Date(data.submissionDate).toLocaleString('en-US', {
        timeZone: 'America/New_York',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      }),
      data.agentName,
      data.agentId,
      data.customerName,
      data.email,
      data.phone,
      formatDateOfBirth(data.dateOfBirth),
      formatSSN(data.ssn),
      data.streetAddress,
      data.aptUnit || '',
      data.city,
      data.state,
      data.zipCode,
      data.movedLastYear ? 'Yes' : 'No',
      data.prevStreetAddress || '',
      data.prevAptUnit || '',
      data.prevCity || '',
      data.prevState || '',
      data.prevZipCode || '',
      data.selectedProvider,
      data.selectedPackage || '',
      data.selectedDirectvPackage || '',
      data.selectedAddOns.join(', '),
      data.ipAddress || ''
    ];

    const worksheetName = 'Form Submissions';
    
    // Check if sheet has headers, if not add them
    try {
      const headerCheck = await sheets.spreadsheets.values.get({
        spreadsheetId: SHEET_ID,
        range: `${worksheetName}!A1:X1`,
      });

      if (!headerCheck.data.values || headerCheck.data.values.length === 0) {
        // Add headers if they don't exist
        await sheets.spreadsheets.values.update({
          spreadsheetId: SHEET_ID,
          range: `${worksheetName}!A1:X1`,
          valueInputOption: 'USER_ENTERED',
          requestBody: {
            values: [headers],
          },
        });
      }
    } catch (error) {
      console.log('Could not check/add headers, sheet may not exist yet');
    }

    // Append the new row
    const result = await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: `${worksheetName}!A:X`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [rowData],
      },
    });

    return {
      success: true,
      range: result.data.updates?.updatedRange,
      rowsAdded: result.data.updates?.updatedRows,
    };
  } catch (error) {
    console.error('Error submitting to Google Sheets:', error);
    throw new Error('Failed to submit to Google Sheets');
  }
}
