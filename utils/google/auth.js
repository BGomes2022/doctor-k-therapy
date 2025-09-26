const { google } = require('googleapis');

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;
const REFRESH_TOKEN = process.env.GOOGLE_REFRESH_TOKEN;
const DOCTOR_EMAIL = process.env.DOCTOR_EMAIL;

async function authenticate() {
  try {
    if (!REFRESH_TOKEN) {
      console.error('❌ No refresh token found. Please complete OAuth2 setup first.');
      console.log('🔗 Visit: https://doctorktherapy.com/api/auth/google');
      return { success: false, auth: null, gmail: null, calendar: null };
    }

    const authClient = new google.auth.OAuth2(
      CLIENT_ID,
      CLIENT_SECRET,
      REDIRECT_URI
    );

    authClient.setCredentials({
      refresh_token: REFRESH_TOKEN
    });

    const gmail = google.gmail({ version: 'v1', auth: authClient });
    const calendar = google.calendar({ version: 'v3', auth: authClient });

    console.log('✅ Google OAuth2 authenticated successfully for:', DOCTOR_EMAIL);
    return { success: true, auth: authClient, gmail, calendar };
  } catch (error) {
    console.error('❌ Google OAuth2 authentication failed:', error.message);
    return { success: false, auth: null, gmail: null, calendar: null };
  }
}

module.exports = { authenticate, DOCTOR_EMAIL };