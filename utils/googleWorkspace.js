const { google } = require('googleapis');
const path = require('path');

// Environment Configuration
const SERVICE_ACCOUNT_KEY_PATH = process.env.GOOGLE_SERVICE_ACCOUNT_KEY_PATH;
const DOCTOR_EMAIL = process.env.DOCTOR_EMAIL;

class GoogleWorkspaceService {
  constructor() {
    this.auth = null;
    this.gmail = null;
    this.calendar = null;
  }

  async authenticate() {
    try {
      // Service Account Authentication with Domain-Wide Delegation
      this.auth = new google.auth.GoogleAuth({
        keyFile: SERVICE_ACCOUNT_KEY_PATH,
        scopes: [
          'https://www.googleapis.com/auth/gmail.send',
          'https://www.googleapis.com/auth/calendar',
          'https://www.googleapis.com/auth/calendar.events',
          'https://www.googleapis.com/auth/meetings.space.created'
        ],
        subject: DOCTOR_EMAIL // Impersonate Dr. Katiuscia
      });

      const authClient = await this.auth.getClient();
      
      // Initialize APIs
      this.gmail = google.gmail({ version: 'v1', auth: authClient });
      this.calendar = google.calendar({ version: 'v3', auth: authClient });

      console.log('✅ Google Workspace authenticated successfully for:', DOCTOR_EMAIL);
      return true;
    } catch (error) {
      console.error('❌ Google Workspace authentication failed:', error.message);
      return false;
    }
  }

  async sendEmail({ to, subject, htmlContent, textContent }) {
    try {
      if (!this.gmail) {
        const authSuccess = await this.authenticate();
        if (!authSuccess) {
          throw new Error('Authentication failed');
        }
      }

      const message = [
        `From: Dr. Katiuscia <${DOCTOR_EMAIL}>`,
        `To: ${to}`,
        `Subject: ${subject}`,
        'MIME-Version: 1.0',
        'Content-Type: text/html; charset=utf-8',
        '',
        htmlContent || textContent
      ].join('\n');

      const encodedMessage = Buffer.from(message)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

      const result = await this.gmail.users.messages.send({
        userId: 'me',
        requestBody: {
          raw: encodedMessage,
        },
      });

      console.log('✅ Email sent successfully:', result.data.id);
      return { success: true, messageId: result.data.id };
    } catch (error) {
      console.error('❌ Email sending failed:', error.message);
      return { success: false, error: error.message };
    }
  }

  async createCalendarEvent({ summary, description, startDateTime, endDateTime, attendeeEmail, bookingId }) {
    try {
      if (!this.calendar) {
        const authSuccess = await this.authenticate();
        if (!authSuccess) {
          throw new Error('Authentication failed');
        }
      }

      const event = {
        summary: summary,
        description: description,
        start: {
          dateTime: startDateTime,
          timeZone: 'Europe/Zurich',
        },
        end: {
          dateTime: endDateTime,
          timeZone: 'Europe/Zurich',
        },
        attendees: [
          { email: attendeeEmail, responseStatus: 'needsAction' },
          { email: DOCTOR_EMAIL, responseStatus: 'accepted' }
        ],
        conferenceData: {
          createRequest: {
            requestId: `therapy-${bookingId}-${Date.now()}`,
            conferenceSolutionKey: { type: 'hangoutsMeet' },
          },
        },
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 24 * 60 }, // 24 hours before
            { method: 'email', minutes: 60 }, // 1 hour before
            { method: 'popup', minutes: 15 }, // 15 minutes before
          ],
        },
        extendedProperties: {
          private: {
            bookingId: bookingId,
            therapySession: 'true',
            patientEmail: attendeeEmail
          }
        }
      };

      const result = await this.calendar.events.insert({
        calendarId: 'primary',
        resource: event,
        conferenceDataVersion: 1, // Required for Meet links
        sendUpdates: 'all', // Send invites to attendees
      });

      const meetLink = result.data.conferenceData?.entryPoints?.[0]?.uri || 'https://meet.google.com/new';
      
      console.log('✅ Calendar event created:', result.data.id);
      console.log('📹 Meet link generated:', meetLink);

      return {
        success: true,
        eventId: result.data.id,
        meetLink: meetLink,
        htmlLink: result.data.htmlLink
      };
    } catch (error) {
      console.error('❌ Calendar event creation failed:', error.message);
      return { success: false, error: error.message };
    }
  }

  async sendBookingConfirmation({ patientEmail, patientName, appointmentDate, appointmentTime, meetLink, bookingId, sessionType, sessionNumber, totalSessions }) {
    const formattedDate = new Date(appointmentDate).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body { 
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                color: #374151; 
                line-height: 1.6; 
                margin: 0; 
                padding: 0;
                background-color: #f9fafb;
            }
            .container { 
                max-width: 600px; 
                margin: 0 auto; 
                background-color: white;
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            }
            .header { 
                background: linear-gradient(135deg, #78716c 0%, #a8a29e 100%); 
                color: white; 
                padding: 40px 30px; 
                text-align: center; 
            }
            .header h1 {
                margin: 0 0 10px 0;
                font-size: 28px;
                font-weight: 300;
            }
            .content { 
                padding: 40px 30px; 
            }
            .appointment-card { 
                background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); 
                padding: 25px; 
                border-radius: 12px; 
                margin: 25px 0; 
                border-left: 6px solid #78716c; 
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
            }
            .appointment-card h3 {
                margin-top: 0;
                color: #1f2937;
                font-size: 20px;
            }
            .detail-row {
                display: flex;
                justify-content: space-between;
                margin: 12px 0;
                padding: 8px 0;
                border-bottom: 1px solid #e5e7eb;
            }
            .detail-row:last-child {
                border-bottom: none;
            }
            .detail-label {
                font-weight: 600;
                color: #6b7280;
            }
            .detail-value {
                color: #1f2937;
                font-weight: 500;
            }
            .meet-section { 
                background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%); 
                padding: 25px; 
                border-radius: 12px; 
                margin: 25px 0; 
                text-align: center;
                border: 2px solid #3b82f6;
            }
            .meet-button { 
                display: inline-block; 
                background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); 
                color: white; 
                padding: 15px 35px; 
                text-decoration: none; 
                border-radius: 8px; 
                margin: 15px 0;
                font-weight: 600;
                font-size: 16px;
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                transition: all 0.2s;
            }
            .meet-button:hover {
                transform: translateY(-1px);
                box-shadow: 0 6px 8px -1px rgba(0, 0, 0, 0.15);
            }
            .preparation-section {
                background: #fef3c7;
                padding: 20px;
                border-radius: 8px;
                margin: 20px 0;
                border-left: 4px solid #f59e0b;
            }
            .preparation-section h4 {
                margin-top: 0;
                color: #92400e;
            }
            .preparation-list {
                margin: 15px 0;
                padding-left: 0;
                list-style: none;
            }
            .preparation-list li {
                margin: 8px 0;
                padding-left: 25px;
                position: relative;
            }
            .preparation-list li:before {
                content: "✓";
                position: absolute;
                left: 0;
                color: #059669;
                font-weight: bold;
            }
            .footer { 
                background: #f3f4f6; 
                padding: 30px; 
                text-align: center; 
                font-size: 14px; 
                color: #6b7280; 
                border-top: 1px solid #e5e7eb;
            }
            .logo {
                font-size: 18px;
                font-weight: 600;
                color: #78716c;
                margin-bottom: 8px;
            }
            .session-progress {
                background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
                padding: 15px;
                border-radius: 8px;
                margin: 15px 0;
                text-align: center;
                border: 2px solid #10b981;
            }
            .session-progress strong {
                color: #059669;
                font-size: 18px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🎯 Session Confirmed</h1>
                <p>Your therapy appointment has been successfully scheduled</p>
            </div>
            
            <div class="content">
                <p>Dear <strong>${patientName}</strong>,</p>
                
                <p>Thank you for scheduling your therapy session. Your appointment has been confirmed and added to both our calendars.</p>
                
                ${totalSessions > 1 ? `
                <div class="session-progress">
                    <strong>Session ${sessionNumber} of ${totalSessions}</strong><br>
                    <small>You have ${totalSessions - sessionNumber} more sessions available in your package</small>
                </div>
                ` : ''}
                
                <div class="appointment-card">
                    <h3>📅 Your Appointment Details</h3>
                    <div class="detail-row">
                        <span class="detail-label">Date:</span>
                        <span class="detail-value">${formattedDate}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Time:</span>
                        <span class="detail-value">${appointmentTime} (50 minutes)</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Session Type:</span>
                        <span class="detail-value">${sessionType}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Booking ID:</span>
                        <span class="detail-value">${bookingId}</span>
                    </div>
                </div>
                
                <div class="meet-section">
                    <h4>🎥 Join Your Online Session</h4>
                    <p>Your session will be conducted via secure Google Meet. Click the button below at your appointment time:</p>
                    <a href="${meetLink}" class="meet-button">Join Therapy Session</a>
                    <p><small>Backup link: <a href="${meetLink}">${meetLink}</a></small></p>
                    <p><em>📧 A calendar invitation with the meeting details has also been sent to your email.</em></p>
                </div>
                
                <div class="preparation-section">
                    <h4>📋 Before Your Session</h4>
                    <ul class="preparation-list">
                        <li>Test your camera and microphone beforehand</li>
                        <li>Find a quiet, private space where you won't be interrupted</li>
                        <li>Ensure you have a stable internet connection</li>
                        <li>Join the meeting 2-3 minutes early</li>
                        <li>Have a glass of water nearby</li>
                    </ul>
                </div>
                
                <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h4 style="margin-top: 0; color: #374151;">📞 Need to Reschedule?</h4>
                    <p style="margin-bottom: 0;">If you need to reschedule, please contact us at least 24 hours in advance. We understand that life happens and we're here to accommodate your needs.</p>
                </div>
                
                <p style="margin-top: 30px;">Looking forward to our session together!</p>
                <p>Warm regards,<br><strong>Dr. Katiuscia</strong></p>
            </div>
            
            <div class="footer">
                <div class="logo">Dr. Katiuscia</div>
                <p>Licensed Therapist • Confidential & HIPAA Compliant Service</p>
                <p><small>This is an automated confirmation. Please save this email for your records.</small></p>
                <p><small>🔒 All communications are encrypted and HIPAA compliant</small></p>
            </div>
        </div>
    </body>
    </html>
    `;

    return await this.sendEmail({
      to: patientEmail,
      subject: `✅ Therapy Session Confirmed - ${formattedDate} at ${appointmentTime}`,
      htmlContent: htmlContent
    });
  }

  async sendBookingLinkEmail({ patientEmail, patientName, bookingToken, sessionPackage }) {
    const bookingUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/booking/${bookingToken}`;
    const expiryDate = new Date();
    expiryDate.setMonth(expiryDate.getMonth() + 3);

    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body { 
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                color: #374151; 
                line-height: 1.6; 
                margin: 0; 
                padding: 0;
                background-color: #f9fafb;
            }
            .container { 
                max-width: 600px; 
                margin: 0 auto; 
                background-color: white;
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            }
            .header { 
                background: linear-gradient(135deg, #059669 0%, #10b981 100%); 
                color: white; 
                padding: 40px 30px; 
                text-align: center; 
            }
            .header h1 {
                margin: 0 0 10px 0;
                font-size: 28px;
                font-weight: 300;
            }
            .content { 
                padding: 40px 30px; 
            }
            .package-card { 
                background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); 
                padding: 25px; 
                border-radius: 12px; 
                margin: 25px 0; 
                border-left: 6px solid #059669; 
                text-align: center;
            }
            .package-card h3 {
                margin-top: 0;
                color: #065f46;
                font-size: 24px;
            }
            .package-price {
                font-size: 32px;
                font-weight: 300;
                color: #059669;
                margin: 15px 0;
            }
            .booking-section { 
                background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%); 
                padding: 30px; 
                border-radius: 12px; 
                margin: 25px 0; 
                text-align: center;
                border: 2px solid #3b82f6;
            }
            .booking-button { 
                display: inline-block; 
                background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); 
                color: white; 
                padding: 18px 40px; 
                text-decoration: none; 
                border-radius: 8px; 
                margin: 20px 0;
                font-weight: 600;
                font-size: 18px;
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            }
            .important-info {
                background: #fef3c7;
                padding: 20px;
                border-radius: 8px;
                margin: 20px 0;
                border-left: 4px solid #f59e0b;
            }
            .footer { 
                background: #f3f4f6; 
                padding: 30px; 
                text-align: center; 
                font-size: 14px; 
                color: #6b7280; 
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🗓️ Your Personal Booking Link</h1>
                <p>Ready to schedule your therapy sessions</p>
            </div>
            
            <div class="content">
                <p>Dear <strong>${patientName}</strong>,</p>
                
                <p>Thank you for completing your medical form! Your payment has been processed and you're all set to book your therapy sessions.</p>
                
                <div class="package-card">
                    <h3>📦 Your Package</h3>
                    <div>${sessionPackage.name}</div>
                    <div class="package-price">€${sessionPackage.price}</div>
                    <small>Valid until ${expiryDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</small>
                </div>
                
                <div class="booking-section">
                    <h3>🎯 Schedule Your Sessions</h3>
                    <p>Use your personal booking link below to schedule all your sessions:</p>
                    <a href="${bookingUrl}" class="booking-button">📅 Book Your Sessions</a>
                    <p><small>Link: <a href="${bookingUrl}">${bookingUrl}</a></small></p>
                </div>
                
                <div class="important-info">
                    <h4>📝 Important Information</h4>
                    <ul>
                        <li><strong>Availability:</strong> Sessions are available Tuesday & Thursday, 19:00-23:00</li>
                        <li><strong>Booking:</strong> You can book one session at a time</li>
                        <li><strong>Link Validity:</strong> Keep this link safe - you'll need it for each session</li>
                        <li><strong>Meet Links:</strong> You'll receive Google Meet links for each session</li>
                    </ul>
                </div>
                
                <p style="margin-top: 30px;">I'm looking forward to working with you!</p>
                <p>Best regards,<br><strong>Dr. Katiuscia</strong></p>
            </div>
            
            <div class="footer">
                <p>Dr. Katiuscia • Licensed Therapist</p>
                <p><small>🔒 HIPAA Compliant • Confidential Service</small></p>
            </div>
        </div>
    </body>
    </html>
    `;

    return await this.sendEmail({
      to: patientEmail,
      subject: `🗓️ Your Personal Booking Link - ${sessionPackage.name}`,
      htmlContent: htmlContent
    });
  }

  async send24HourReminder({ patientEmail, patientName, appointmentDate, appointmentTime, meetLink }) {
    const formattedDate = new Date(appointmentDate).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #374151; line-height: 1.6; margin: 0; padding: 0; background-color: #f9fafb; }
            .container { max-width: 600px; margin: 0 auto; background-color: white; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
            .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 30px; text-align: center; }
            .header h1 { margin: 0 0 10px 0; font-size: 26px; font-weight: 300; }
            .content { padding: 30px; }
            .reminder-card { background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); padding: 25px; border-radius: 12px; margin: 20px 0; text-align: center; border: 2px solid #f59e0b; }
            .meet-button { display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; margin: 15px 0; font-weight: 600; font-size: 16px; }
            .footer { background: #f3f4f6; padding: 20px; text-align: center; font-size: 14px; color: #6b7280; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>⏰ Session Reminder</h1>
                <p>Your therapy session is tomorrow</p>
            </div>
            
            <div class="content">
                <p>Dear <strong>${patientName}</strong>,</p>
                
                <p>This is a friendly reminder that you have a therapy session scheduled for tomorrow.</p>
                
                <div class="reminder-card">
                    <h3>📅 Tomorrow: ${formattedDate}</h3>
                    <h3>🕐 Time: ${appointmentTime}</h3>
                    <a href="${meetLink}" class="meet-button">Join Session Tomorrow</a>
                </div>
                
                <p><strong>Quick preparation checklist:</strong></p>
                <ul>
                    <li>✓ Test your camera & microphone</li>
                    <li>✓ Find a quiet, private space</li>
                    <li>✓ Ensure stable internet connection</li>
                    <li>✓ Join 2-3 minutes early</li>
                </ul>
                
                <p>Looking forward to seeing you tomorrow!</p>
                <p>Best regards,<br><strong>Dr. Katiuscia</strong></p>
            </div>
            
            <div class="footer">
                <p>Dr. Katiuscia • Licensed Therapist</p>
            </div>
        </div>
    </body>
    </html>
    `;

    return await this.sendEmail({
      to: patientEmail,
      subject: `⏰ Reminder: Therapy Session Tomorrow - ${appointmentTime}`,
      htmlContent: htmlContent
    });
  }

  async getCalendarEmbedUrl() {
    return `https://calendar.google.com/calendar/embed?src=${encodeURIComponent(DOCTOR_EMAIL)}&ctz=Europe/Zurich&mode=WEEK&showTitle=0&showDate=1&showPrint=0&showTabs=0&showCalendars=0`;
  }
}

// Export singleton instance
const googleWorkspaceService = new GoogleWorkspaceService();
module.exports = googleWorkspaceService;