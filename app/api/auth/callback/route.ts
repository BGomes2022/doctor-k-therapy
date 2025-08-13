import { google } from 'googleapis';
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');

  if (!code) {
    return NextResponse.json({ error: 'Authorization code missing' }, { status: 400 });
  }

  try {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    // Exchange authorization code for tokens
    const { tokens } = await oauth2Client.getToken(code);
    
    console.log('✅ Received tokens:', {
      access_token: tokens.access_token ? 'EXISTS' : 'MISSING',
      refresh_token: tokens.refresh_token ? 'EXISTS' : 'MISSING',
      scope: tokens.scope
    });

    if (!tokens.refresh_token) {
      return NextResponse.json({ 
        error: 'No refresh token received. Try revoking access and try again.',
        tokens: tokens
      }, { status: 400 });
    }

    // Save refresh token to .env file
    const envPath = path.join(process.cwd(), '.env');
    let envContent = fs.readFileSync(envPath, 'utf8');
    
    // Update or add GOOGLE_REFRESH_TOKEN
    if (envContent.includes('GOOGLE_REFRESH_TOKEN=')) {
      envContent = envContent.replace(
        /GOOGLE_REFRESH_TOKEN=.*/,
        `GOOGLE_REFRESH_TOKEN=${tokens.refresh_token}`
      );
    } else {
      envContent += `\nGOOGLE_REFRESH_TOKEN=${tokens.refresh_token}\n`;
    }
    
    fs.writeFileSync(envPath, envContent);

    // Test the authentication
    oauth2Client.setCredentials(tokens);
    
    return NextResponse.json({
      success: true,
      message: 'OAuth2 setup completed successfully!',
      email: process.env.DOCTOR_EMAIL,
      refresh_token_saved: true,
      scopes_granted: tokens.scope,
      next_step: 'Restart the application to use the new OAuth2 authentication'
    });

  } catch (error: any) {
    console.error('❌ OAuth callback error:', error);
    return NextResponse.json({ 
      error: 'Failed to complete OAuth2 setup',
      details: error.message
    }, { status: 500 });
  }
}