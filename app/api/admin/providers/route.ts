import { NextRequest, NextResponse } from 'next/server';
import { getProviderConfig, saveProviderConfig } from '../../../../lib/admin-settings';

export async function GET() {
  try {
    const providers = await getProviderConfig();
    return NextResponse.json({ providers });
  } catch (error) {
    console.error('Error fetching provider config:', error);
    return NextResponse.json(
      { error: 'Failed to fetch provider configuration' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { providers } = await request.json();
    
    if (!Array.isArray(providers)) {
      return NextResponse.json(
        { error: 'Invalid provider data format' },
        { status: 400 }
      );
    }

    const success = await saveProviderConfig(providers);
    
    if (success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { error: 'Failed to save provider configuration' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error saving provider config:', error);
    return NextResponse.json(
      { error: 'Failed to save provider configuration' },
      { status: 500 }
    );
  }
}
