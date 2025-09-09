const { google } = require('googleapis');

// OAuth2 Configuration
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;
const REFRESH_TOKEN = process.env.GOOGLE_REFRESH_TOKEN;
const DOCTOR_EMAIL = process.env.DOCTOR_EMAIL;

class GoogleWorkspaceService {
  constructor() {
    this.auth = null;
    this.gmail = null;
    this.calendar = null;
  }

  async authenticate() {
    try {
      if (!REFRESH_TOKEN) {
        console.error('❌ No refresh token found. Please complete OAuth2 setup first.');
        console.log('🔗 Visit: https://doctorktherapy.com/api/auth/google');
        return false;
      }

      // Create OAuth2 client
      const authClient = new google.auth.OAuth2(
        CLIENT_ID,
        CLIENT_SECRET,
        REDIRECT_URI
      );

      // Set the refresh token
      authClient.setCredentials({
        refresh_token: REFRESH_TOKEN
      });
      
      // Store auth client
      this.auth = authClient;
      
      // Initialize APIs
      this.gmail = google.gmail({ version: 'v1', auth: authClient });
      this.calendar = google.calendar({ version: 'v3', auth: authClient });

      console.log('✅ Google OAuth2 authenticated successfully for:', DOCTOR_EMAIL);
      return true;
    } catch (error) {
      console.error('❌ Google OAuth2 authentication failed:', error.message);
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
          timeZone: 'Europe/Lisbon',
        },
        end: {
          dateTime: endDateTime,
          timeZone: 'Europe/Lisbon',
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
                    <h3>🗓️ Your Appointment Details</h3>
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
                    <h4>💬 Join Your Online Session</h4>
                    <p>Your session will be conducted via secure Google Meet. Click the button below at your appointment time:</p>
                    <a href="${meetLink}" class="meet-button">Join Therapy Session</a>
                    <p><small>Backup link: <a href="${meetLink}">${meetLink}</a></small></p>
                    <p><em>📧 A calendar invitation with the meeting details has also been sent to your email.</em></p>
                </div>
                
                <div class="preparation-section">
                    <h4>💡 Before Your Session</h4>
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
      subject: `Your Therapy Session is Confirmed - ${formattedDate} at ${appointmentTime}`,
      htmlContent: htmlContent
    });
  }

  async sendVideoSessionInvitation({ patientEmail, patientName, appointmentDate, appointmentTime, meetLink, bookingId, sessionType, sessionNumber, totalSessions, isFirstSession }) {
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
                background: linear-gradient(135deg, #2c5530 0%, #4a7c4e 100%); 
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
            .invitation-card { 
                background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); 
                padding: 25px; 
                border-radius: 12px; 
                margin: 25px 0; 
                border-left: 6px solid #2c5530; 
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
            }
            .video-section { 
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
            }
            .preparation-box {
                background: #f8fafc;
                padding: 20px;
                border-radius: 8px;
                margin: 20px 0;
            }
            .footer {
                text-align: center;
                padding: 30px;
                background: #f3f4f6;
                color: #6b7280;
                font-size: 12px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>📅 Video Session Invitation</h1>
                <p>Your therapy appointment has been scheduled</p>
            </div>
            
            <div class="content">
                <p>Dear ${patientName},</p>
                
                <p>Your video therapy session has been scheduled. Please find the details below:</p>
                
                <div class="invitation-card">
                    <h3>📍 Appointment Details</h3>
                    <p><strong>Date:</strong> ${formattedDate}</p>
                    <p><strong>Time:</strong> ${appointmentTime} (Lisbon Time)</p>
                    <p><strong>Duration:</strong> 50 minutes</p>
                    <p><strong>Session Type:</strong> ${sessionType}</p>
                    ${sessionNumber ? `<p><strong>Session:</strong> ${sessionNumber} of ${totalSessions}</p>` : ''}
                </div>
                
                <div class="video-section">
                    <h3>🎥 Join Your Video Session</h3>
                    <p>Click the button below at your appointment time to join the secure video call:</p>
                    <a href="${meetLink}" class="meet-button">Join Video Session</a>
                    <p style="font-size: 12px; color: #6b7280;">Link will be active 15 minutes before your appointment</p>
                </div>
                
                ${isFirstSession ? `
                <div class="preparation-box">
                    <h4>📋 Preparing for Your First Session</h4>
                    <ul style="text-align: left;">
                        <li>Test your camera and microphone in advance</li>
                        <li>Choose a quiet, private space</li>
                        <li>Ensure stable internet connection</li>
                        <li>Have water and tissues nearby</li>
                        <li>Prepare any questions or topics you'd like to discuss</li>
                        <li>Join 5 minutes early to settle in</li>
                    </ul>
                </div>
                ` : ''}
                
                <div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ef4444;">
                    <h4 style="margin-top: 0; color: #dc2626;">⚠️ Cancellation Policy</h4>
                    <p>Please provide at least 24 hours notice if you need to cancel or reschedule. Late cancellations may be charged.</p>
                </div>
                
                <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h4 style="margin-top: 0; color: #0369a1;">💡 Technical Support</h4>
                    <p>If you experience technical difficulties, please contact us immediately:</p>
                    <p>Email: support@doctorktherapy.com</p>
                </div>
                
                <p style="margin-top: 30px;">I look forward to our session together.</p>
                <p>Warm regards,<br><strong>Dr. Katiuscia</strong></p>
            </div>
            
            <div class="footer">
                <p><strong>Dr. Katiuscia - Professional Therapy Services</strong></p>
                <p>This email contains confidential information. Please do not forward.</p>
                <p>🔒 All sessions are conducted through secure, HIPAA-compliant video platform</p>
            </div>
        </div>
    </body>
    </html>
    `;

    return await this.sendEmail({
      to: patientEmail,
      subject: `Video Session Invitation - ${formattedDate} at ${appointmentTime}`,
      htmlContent: htmlContent
    });
  }

  async sendSimpleAppointmentConfirmation({ patientEmail, patientName, appointmentDate, appointmentTime, meetLink, isManualBooking = true }) {
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
                background: linear-gradient(135deg, #2c5530 0%, #4a7c4e 100%); 
                color: white; 
                padding: 40px 30px; 
                text-align: center; 
            }
            .header h1 {
                margin: 0 0 10px 0;
                font-size: 28px;
                font-weight: 300;
            }
            .practice-logo {
                font-size: 20px;
                font-weight: 600;
                margin-bottom: 5px;
            }
            .content { 
                padding: 40px 30px; 
            }
            .appointment-card { 
                background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); 
                padding: 30px; 
                border-radius: 15px; 
                margin: 25px 0; 
                border-left: 6px solid #2c5530; 
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                text-align: center;
            }
            .meet-button { 
                display: inline-block; 
                background: linear-gradient(135deg, #2c5530 0%, #4a7c4e 100%); 
                color: white; 
                padding: 18px 40px; 
                text-decoration: none; 
                border-radius: 10px; 
                margin: 20px 0;
                font-weight: 600;
                font-size: 18px;
                box-shadow: 0 4px 10px rgba(44, 85, 48, 0.3);
                transition: all 0.2s;
            }
            .info-box {
                background: #f8fafc;
                padding: 20px;
                border-radius: 10px;
                margin: 20px 0;
                border-left: 4px solid #2c5530;
            }
            .footer {
                text-align: center;
                padding: 30px;
                background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
                color: #6b7280;
                font-size: 12px;
                border-top: 1px solid #e5e7eb;
            }
            .contact-info {
                background: #f0f9ff;
                padding: 25px;
                border-radius: 10px;
                margin: 20px 0;
                border: 2px solid #0ea5e9;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="practice-logo">Dr. Katiuscia Mercogliano</div>
                <p style="margin: 0; opacity: 0.9;">Professional Therapy Services</p>
                <h1 style="margin-top: 20px;">📅 Appointment Confirmed</h1>
                <p>Your therapy session is scheduled</p>
            </div>
            
            <div class="content">
                <p>Dear ${patientName},</p>
                
                <p>Your appointment has been successfully scheduled. I look forward to our session together.</p>
                
                <div class="appointment-card">
                    <h3 style="color: #2c5530; margin-top: 0;">📍 Your Appointment</h3>
                    <div style="font-size: 20px; margin: 15px 0;">
                        <strong>${formattedDate}</strong>
                    </div>
                    <div style="font-size: 18px; color: #4a7c4e; margin: 10px 0;">
                        <strong>${appointmentTime}</strong> (Lisbon Time)
                    </div>
                    <div style="margin: 20px 0; color: #6b7280;">
                        Duration: 50 minutes • Video Session
                    </div>
                    
                    <a href="${meetLink}" class="meet-button">
                        🎥 Join Video Session
                    </a>
                    
                    <p style="font-size: 12px; color: #6b7280; margin-top: 10px;">
                        The meeting room will be available 15 minutes before your appointment
                    </p>
                </div>
                
                <div class="info-box">
                    <h4 style="margin-top: 0; color: #2c5530;">📋 Session Preparation</h4>
                    <ul style="margin: 10px 0; padding-left: 20px;">
                        <li>Find a quiet, private space</li>
                        <li>Test your camera and microphone</li>
                        <li>Ensure stable internet connection</li>
                        <li>Have water and tissues nearby</li>
                        <li>Join 5 minutes early</li>
                    </ul>
                </div>
                
                <div class="contact-info">
                    <h4 style="margin-top: 0; color: #0369a1;">📞 Need to Reschedule?</h4>
                    <p>If you need to reschedule or have any questions, please contact me at least 24 hours in advance:</p>
                    <p style="margin: 10px 0;">
                        📧 <strong>Email:</strong> ${process.env.DOCTOR_EMAIL || 'contact@doctorktherapy.com'}
                    </p>
                </div>
                
                <div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ef4444;">
                    <h4 style="margin-top: 0; color: #dc2626;">⚠️ Important Notes</h4>
                    <p style="margin-bottom: 0;">
                        • Cancellations with less than 24 hours notice may be charged<br>
                        • All sessions are confidential and conducted in a secure environment<br>
                        • Technical support is available if needed
                    </p>
                </div>
                
                <p style="margin-top: 30px;">I'm looking forward to our session together. If you have any questions beforehand, please don't hesitate to reach out.</p>
                
                <p style="margin-top: 20px;">
                    Warm regards,<br>
                    <strong>Dr. Katiuscia Mercogliano</strong><br>
                    <small>Licensed Clinical Psychologist</small>
                </p>
            </div>
            
            <div class="footer">
                <div style="font-weight: 600; margin-bottom: 10px;">Dr. Katiuscia Mercogliano</div>
                <p style="margin: 5px 0;">Professional Therapy Services</p>
                <p style="margin: 5px 0;">🔒 All communications are confidential and HIPAA compliant</p>
                <p style="margin: 10px 0; font-size: 10px;">
                    This appointment confirmation was sent automatically. Please save this email for your records.
                </p>
            </div>
        </div>
    </body>
    </html>
    `;

    return await this.sendEmail({
      to: patientEmail,
      subject: `Appointment Confirmed - ${formattedDate} at ${appointmentTime}`,
      htmlContent: htmlContent
    });
  }

  async deleteCalendarEvent(eventId) {
    try {
      if (!this.calendar) {
        const authSuccess = await this.authenticate();
        if (!authSuccess) {
          throw new Error('Authentication failed');
        }
      }

      await this.calendar.events.delete({
        calendarId: 'primary',
        eventId: eventId
      });

      console.log('✅ Calendar event deleted successfully:', eventId);
      return { success: true };
    } catch (error) {
      console.error('❌ Failed to delete calendar event:', error.message);
      return { success: false, error: error.message };
    }
  }

  async sendCancellationEmail({ patientEmail, patientName, appointmentDate, appointmentTime, reason }) {
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
                background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%); 
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
            .cancellation-card { 
                background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%); 
                padding: 25px; 
                border-radius: 12px; 
                margin: 25px 0; 
                border-left: 6px solid #dc2626; 
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
            }
            .reschedule-section { 
                background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); 
                padding: 25px; 
                border-radius: 12px; 
                margin: 25px 0; 
                text-align: center;
                border: 2px solid #0ea5e9;
            }
            .footer {
                text-align: center;
                padding: 30px;
                background: #f3f4f6;
                color: #6b7280;
                font-size: 12px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>❌ Appointment Cancelled</h1>
                <p>Your therapy session has been cancelled</p>
            </div>
            
            <div class="content">
                <p>Dear ${patientName},</p>
                
                <p>I'm writing to inform you that your scheduled therapy session has been cancelled.</p>
                
                <div class="cancellation-card">
                    <h3>📅 Cancelled Appointment</h3>
                    <p><strong>Date:</strong> ${formattedDate}</p>
                    <p><strong>Time:</strong> ${appointmentTime} (Lisbon Time)</p>
                    <p><strong>Reason:</strong> ${reason}</p>
                </div>
                
                <div class="reschedule-section">
                    <h3>💬 Let's Reschedule</h3>
                    <p>I apologize for any inconvenience this may cause. I'd be happy to help you reschedule your session at a time that works better for both of us.</p>
                    <p><strong>Please contact me to arrange a new appointment:</strong></p>
                    <p>📧 Email: ${process.env.DOCTOR_EMAIL}</p>
                    <p>📞 Phone: Available upon request</p>
                </div>
                
                <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h4 style="margin-top: 0; color: #374151;">💰 Refund Information</h4>
                    <p>If you have made any payment for this session, please contact me to arrange a refund or credit towards your next appointment.</p>
                </div>
                
                <p style="margin-top: 30px;">Thank you for your understanding, and I look forward to hearing from you soon.</p>
                <p>Best regards,<br><strong>Dr. Katiuscia</strong></p>
            </div>
            
            <div class="footer">
                <p><strong>Dr. Katiuscia - Professional Therapy Services</strong></p>
                <p>This email contains confidential information. Please do not forward.</p>
            </div>
        </div>
    </body>
    </html>
    `;

    return await this.sendEmail({
      to: patientEmail,
      subject: `Appointment Cancelled - ${formattedDate} at ${appointmentTime}`,
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
            .therapy-plan-card { 
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
            .therapy-price {
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
                
                <div class="therapy-plan-card">
                    <h3>🌱 Your Therapy Plan</h3>
                    <div>${sessionPackage.name.replace('Package', 'Plan')}</div>
                    <div class="therapy-price">€${sessionPackage.price}</div>
                    <small>Valid until ${expiryDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</small>
                </div>
                
                <div class="booking-section">
                    <h3>📅 Schedule Your Sessions</h3>
                    <p>Use your personal booking link below to schedule all your sessions:</p>
                    <a href="${bookingUrl}" class="booking-button">📅 Book Your Sessions</a>
                    <p><small>Link: <a href="${bookingUrl}">${bookingUrl}</a></small></p>
                </div>
                
                <div class="important-info">
                    <h4>ℹ️ Important Information</h4>
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
      subject: `Welcome - Your Personal Therapy Booking Link`,
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
                    <h3>🌟 Tomorrow: ${formattedDate}</h3>
                    <h3>⏰ Time: ${appointmentTime}</h3>
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
      subject: `Gentle Reminder: Your Therapy Session Tomorrow at ${appointmentTime}`,
      htmlContent: htmlContent
    });
  }

  async getCalendarEmbedUrl() {
    return `https://calendar.google.com/calendar/embed?src=${encodeURIComponent(DOCTOR_EMAIL)}&ctz=Europe/Zurich&mode=WEEK&showTitle=0&showDate=1&showPrint=0&showTabs=0&showCalendars=0`;
  }

  // Create therapy session booking in Google Calendar
  async createTherapySessionBooking({ 
    bookingToken, 
    patientEmail, 
    patientName, 
    startDateTime, 
    endDateTime, 
    sessionNumber, 
    totalSessions,
    sessionPackage 
  }) {
    try {
      if (!this.calendar) {
        const authSuccess = await this.authenticate();
        if (!authSuccess) {
          throw new Error('Authentication failed');
        }
      }

      const bookingId = `booking-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      const event = {
        summary: `Therapy Session - ${patientName}`,
        description: `
Therapy Session ${sessionNumber}/${totalSessions}
Patient: ${patientName}
Email: ${patientEmail}
Therapy Plan: ${sessionPackage?.name?.replace('Package', 'Plan') || 'Therapy Session'}
Booking Token: ${bookingToken}

This is a confidential therapy session.
        `.trim(),
        start: {
          dateTime: startDateTime,
          timeZone: 'Europe/Lisbon',
        },
        end: {
          dateTime: endDateTime,
          timeZone: 'Europe/Lisbon',
        },
        attendees: [
          { email: patientEmail, responseStatus: 'needsAction' },
          { email: DOCTOR_EMAIL, responseStatus: 'accepted' }
        ],
        conferenceData: {
          createRequest: {
            requestId: `therapy-${bookingToken}-${sessionNumber}-${Date.now()}`,
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
            bookingToken: bookingToken,
            bookingId: bookingId,
            therapySession: 'true',
            patientEmail: patientEmail,
            patientName: patientName,
            sessionNumber: sessionNumber.toString(),
            totalSessions: totalSessions.toString(),
            sessionPackage: JSON.stringify(sessionPackage)
          }
        }
      };

      const result = await this.calendar.events.insert({
        calendarId: DOCTOR_EMAIL,
        resource: event,
        conferenceDataVersion: 1,
        sendUpdates: 'all',
      });

      const meetLink = result.data.conferenceData?.entryPoints?.[0]?.uri || 'https://meet.google.com/new';
      
      console.log('✅ Therapy session booked in calendar:', result.data.id);
      console.log('📹 Meet link generated:', meetLink);

      return {
        success: true,
        eventId: result.data.id,
        meetLink: meetLink,
        htmlLink: result.data.htmlLink,
        bookingId: bookingId,
        startDateTime,
        endDateTime
      };
    } catch (error) {
      console.error('❌ Therapy session booking failed:', error.message);
      return { success: false, error: error.message };
    }
  }

  // Get available time slots from NEW Google Calendar system
  // Updated to use the new availability system with Portuguese time
  async getAvailableTimeSlots(startDate, endDate, useIntelligentFiltering = true) {
    try {
      // Use the new availability system
      const availabilityResult = await this.getAvailabilityFromCalendar(90);
      
      if (!availabilityResult.success) {
        throw new Error(availabilityResult.error);
      }

      const availability = availabilityResult.availability;
      const startDateObj = new Date(startDate);
      const endDateObj = new Date(endDate);
      
      // Filter availability within the requested date range and only available slots
      const availableSlots = availability
        .filter(slot => {
          const slotDate = new Date(slot.date);
          return slot.available && 
                 slotDate >= startDateObj && 
                 slotDate <= endDateObj;
        })
        .map(slot => {
          // Convert to format expected by booking system
          const slotStart = new Date(`${slot.date}T${slot.time}:00.000+01:00`); // Portuguese time
          const slotEnd = new Date(slotStart);
          slotEnd.setMinutes(slotEnd.getMinutes() + 50); // 50-minute sessions

          return {
            start: slotStart.toISOString(),
            end: slotEnd.toISOString(),
            date: slot.date,
            time: slot.time,
            timezone: 'Europe/Lisbon',
            dayOfWeek: slot.dayOfWeek,
            eventType: slot.eventType
          };
        });

      // Apply intelligent slot filtering only for patient bookings
      if (useIntelligentFiltering) {
        const intelligentSlots = this.applyIntelligentSlotFiltering(availableSlots);
        console.log(`✅ Found ${availableSlots.length} raw slots, filtered to ${intelligentSlots.length} bookable slots (PATIENT MODE)`);
        return { success: true, slots: intelligentSlots };
      } else {
        console.log(`✅ Found ${availableSlots.length} raw available slots (ADMIN MODE)`);
        return { success: true, slots: availableSlots };
      }
      
    } catch (error) {
      console.error('❌ Failed to get available slots:', error.message);
      return { success: false, error: error.message };
    }
  }

  // Apply intelligent slot filtering based on existing bookings and session types
  applyIntelligentSlotFiltering(slots) {
    const filteredSlots = [];
    
    // Group slots by date for easier processing
    const slotsByDate = slots.reduce((acc, slot) => {
      if (!acc[slot.date]) acc[slot.date] = [];
      acc[slot.date].push(slot);
      return acc;
    }, {});

    Object.keys(slotsByDate).forEach(date => {
      const daySlots = slotsByDate[date].sort((a, b) => a.time.localeCompare(b.time));
      
      // For each available slot, check if it can accommodate different session types
      daySlots.forEach(slot => {
        const slotTime = new Date(`${slot.date}T${slot.time}:00`);
        
        // Check if this slot can accommodate a 50-minute session (therapy)
        const canAccommodateTherapy = this.canSlotAccommodateSession(daySlots, slot, 50);
        
        // Check if this slot can accommodate a 30-minute session (consultation)  
        const canAccommodateConsultation = this.canSlotAccommodateSession(daySlots, slot, 30);
        
        // Only include slots that can accommodate at least one session type
        if (canAccommodateTherapy || canAccommodateConsultation) {
          filteredSlots.push({
            ...slot,
            canAccommodateTherapy,
            canAccommodateConsultation
          });
        }
      });
    });

    return filteredSlots;
  }

  // Check if a slot can accommodate a session of given duration
  canSlotAccommodateSession(daySlots, slot, durationMinutes) {
    const slotTime = new Date(`${slot.date}T${slot.time}:00`);
    const requiredEndTime = new Date(slotTime.getTime() + durationMinutes * 60 * 1000);
    
    // Check if we have consecutive available 30-min slots to cover the full duration
    const slotsNeeded = Math.ceil(durationMinutes / 30);
    
    for (let i = 0; i < slotsNeeded; i++) {
      const checkTime = new Date(slotTime.getTime() + i * 30 * 60 * 1000);
      const checkTimeStr = `${checkTime.getHours().toString().padStart(2, '0')}:${checkTime.getMinutes().toString().padStart(2, '0')}`;
      
      // Find if this time slot exists and is available
      const hasSlot = daySlots.find(s => s.time === checkTimeStr && s.available);
      if (!hasSlot) {
        return false; // Required slot is not available
      }
    }
    
    return true; // All required slots are available
  }

  // Get upcoming therapy sessions from Google Calendar
  async getUpcomingTherapySessions(limit = 50) {
    try {
      if (!this.calendar) {
        const authSuccess = await this.authenticate();
        if (!authSuccess) {
          throw new Error('Authentication failed');
        }
      }

      const now = new Date();
      const result = await this.calendar.events.list({
        calendarId: DOCTOR_EMAIL,
        timeMin: now.toISOString(),
        maxResults: limit,
        singleEvents: true,
        orderBy: 'startTime',
        q: 'Therapy Session', // Search for therapy sessions
      });

      const therapySessions = result.data.items?.filter(event => 
        event.extendedProperties?.private?.therapySession === 'true'
      ) || [];

      const sessions = therapySessions.map(event => ({
        eventId: event.id,
        summary: event.summary,
        start: event.start.dateTime,
        end: event.end.dateTime,
        patientEmail: event.extendedProperties?.private?.patientEmail,
        patientName: event.extendedProperties?.private?.patientName,
        sessionNumber: parseInt(event.extendedProperties?.private?.sessionNumber || '1'),
        totalSessions: parseInt(event.extendedProperties?.private?.totalSessions || '1'),
        bookingToken: event.extendedProperties?.private?.bookingToken,
        meetLink: event.conferenceData?.entryPoints?.[0]?.uri || event.hangoutLink,
        htmlLink: event.htmlLink
      }));

      console.log(`✅ Found ${sessions.length} upcoming therapy sessions`);
      return { success: true, sessions };
      
    } catch (error) {
      console.error('❌ Failed to get therapy sessions:', error.message);
      return { success: false, error: error.message };
    }
  }

  // Get all therapy sessions (past and future) from Google Calendar
  async getAllTherapySessions(limit = 200) {
    try {
      if (!this.calendar) {
        const authSuccess = await this.authenticate();
        if (!authSuccess) {
          throw new Error('Authentication failed');
        }
      }

      // Get events from 3 months ago to 6 months in future
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 3);
      
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 6);

      const result = await this.calendar.events.list({
        calendarId: DOCTOR_EMAIL,
        timeMin: startDate.toISOString(),
        timeMax: endDate.toISOString(),
        maxResults: limit,
        singleEvents: true,
        orderBy: 'startTime',
        // Remove q filter to get all events, then filter by extendedProperties
      });

      const allEvents = result.data.items || [];
      
      // Include therapy sessions and patient records
      const relevantEvents = allEvents.filter(event => 
        event.extendedProperties?.private?.therapySession === 'true' ||
        event.extendedProperties?.private?.patientRecord === 'true'
      );

      const sessions = relevantEvents.map(event => ({
        eventId: event.id,
        summary: event.summary,
        start: event.start.dateTime,
        end: event.end.dateTime,
        patientEmail: event.extendedProperties?.private?.patientEmail,
        patientName: event.extendedProperties?.private?.patientName,
        sessionNumber: parseInt(event.extendedProperties?.private?.sessionNumber || '1'),
        totalSessions: parseInt(event.extendedProperties?.private?.totalSessions || '1'),
        bookingToken: event.extendedProperties?.private?.bookingToken,
        meetLink: event.conferenceData?.entryPoints?.[0]?.uri || event.hangoutLink,
        htmlLink: event.htmlLink,
        sessionPackage: event.extendedProperties?.private?.sessionPackage ? 
          JSON.parse(event.extendedProperties.private.sessionPackage) : null,
        medicalData: event.extendedProperties?.private?.medicalData ? 
          JSON.parse(event.extendedProperties.private.medicalData) : null,
        isPatientRecord: event.extendedProperties?.private?.patientRecord === 'true'
      }));

      console.log(`✅ Found ${sessions.length} total therapy sessions and patient records`);
      return { success: true, sessions };
      
    } catch (error) {
      console.error('❌ Failed to get all therapy sessions:', error.message);
      return { success: false, error: error.message };
    }
  }

  // Get session info from booking token (Google Calendar only)
  async getSessionInfoFromBookingToken(bookingToken) {
    try {
      if (!this.calendar) {
        const authSuccess = await this.authenticate();
        if (!authSuccess) {
          throw new Error('Authentication failed');
        }
      }

      // Search for events with this booking token
      const result = await this.calendar.events.list({
        calendarId: DOCTOR_EMAIL,
        maxResults: 100,
        singleEvents: true,
        orderBy: 'startTime',
        privateExtendedProperty: `bookingToken=${bookingToken}`
      });

      const events = result.data.items || [];
      
      if (events.length === 0) {
        return null; // Token not found
      }

      // Get session info from first event (they all have same booking token)
      const firstEvent = events[0];
      const sessionPackage = JSON.parse(firstEvent.extendedProperties?.private?.sessionPackage || '{"name":"Unknown","price":0}');
      const totalSessions = parseInt(firstEvent.extendedProperties?.private?.totalSessions || '1');
      
      // Count only real therapy sessions (not placeholders)
      const realSessions = events.filter(event => 
        event.extendedProperties?.private?.placeholderEvent !== 'true' &&
        event.extendedProperties?.private?.therapySession === 'true'
      );
      const sessionsUsed = realSessions.length; // Count only real therapy sessions
      const sessionsRemaining = totalSessions - sessionsUsed;
      
      // Check expiry (3 months from creation)
      const createdAt = new Date(firstEvent.created);
      const expiresAt = new Date(createdAt);
      expiresAt.setMonth(expiresAt.getMonth() + 3);
      const isExpired = new Date() > expiresAt;

      return {
        bookingToken,
        patientEmail: firstEvent.extendedProperties?.private?.patientEmail,
        patientName: firstEvent.extendedProperties?.private?.patientName,
        sessionPackage,
        sessionsTotal: totalSessions,
        sessionsUsed,
        sessionsRemaining,
        expiresAt: expiresAt.toISOString(),
        isExpired,
        isValid: sessionsRemaining > 0 && !isExpired
      };
      
    } catch (error) {
      console.error('❌ Failed to get session info:', error.message);
      return null;
    }
  }

  // Get booking history for token (Google Calendar only)
  async getBookingHistoryForToken(bookingToken) {
    try {
      if (!this.calendar) {
        const authSuccess = await this.authenticate();
        if (!authSuccess) {
          throw new Error('Authentication failed');
        }
      }

      // Search for all events with this booking token
      const result = await this.calendar.events.list({
        calendarId: DOCTOR_EMAIL,
        maxResults: 100,
        singleEvents: true,
        orderBy: 'startTime',
        privateExtendedProperty: `bookingToken=${bookingToken}`
      });

      const events = result.data.items || [];
      
      return events.map(event => ({
        eventId: event.id,
        date: event.start.dateTime?.split('T')[0] || '',
        time: event.start.dateTime ? new Date(event.start.dateTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '',
        sessionPackage: JSON.parse(event.extendedProperties?.private?.sessionPackage || '{"name":"Unknown"}'),
        createdAt: event.created,
        meetLink: event.conferenceData?.entryPoints?.[0]?.uri || event.hangoutLink,
        sessionNumber: parseInt(event.extendedProperties?.private?.sessionNumber || '1'),
        status: event.status
      }));
      
    } catch (error) {
      console.error('❌ Failed to get booking history:', error.message);
      return [];
    }
  }

  // Create patient record in calendar (visible as patient, not hidden placeholder)
  async createPatientRecord({ bookingToken, patientEmail, patientName, sessionPackage, medicalData }) {
    try {
      if (!this.calendar) {
        const authSuccess = await this.authenticate();
        if (!authSuccess) {
          throw new Error('Authentication failed');
        }
      }

      // Create a visible patient record event (today, short duration)
      const now = new Date();
      const startTime = new Date(now);
      startTime.setHours(0, 0, 0, 0); // Start of today
      
      const endTime = new Date(startTime);
      endTime.setMinutes(endTime.getMinutes() + 1); // 1 minute duration

      // Store medical data (you could encrypt this if needed)
      const medicalDataString = JSON.stringify(medicalData);
      
      const event = {
        summary: `👤 PATIENT: ${patientName} (${sessionPackage.name})`,
        description: `
PATIENT RECORD
Medical form completed and ready for booking.

Patient: ${patientName}
Email: ${patientEmail}
Package: ${sessionPackage.name} (${sessionPackage.price}€)
Sessions: 0/${this.getSessionCountFromPackage(sessionPackage)}
Token: ${bookingToken}

Medical Data: ${medicalDataString}
        `.trim(),
        start: {
          dateTime: startTime.toISOString(),
          timeZone: 'Europe/Lisbon',
        },
        end: {
          dateTime: endTime.toISOString(),
          timeZone: 'Europe/Lisbon',
        },
        transparency: 'transparent', // Doesn't block time
        visibility: 'private',
        colorId: '2', // Green color for patients
        extendedProperties: {
          private: {
            bookingToken: bookingToken,
            patientRecord: 'true', // Changed from placeholderEvent
            patientEmail: patientEmail,
            patientName: patientName,
            sessionPackage: JSON.stringify(sessionPackage),
            totalSessions: this.getSessionCountFromPackage(sessionPackage).toString(),
            medicalData: medicalDataString
          }
        }
      };

      const result = await this.calendar.events.insert({
        calendarId: DOCTOR_EMAIL,
        resource: event,
      });

      console.log('✅ Patient record created:', result.data.id);
      return { success: true, eventId: result.data.id };
      
    } catch (error) {
      console.error('❌ Failed to create patient record:', error.message);
      return { success: false, error: error.message };
    }
  }

  // Helper to get session count from package
  getSessionCountFromPackage(sessionPackage) {
    if (typeof sessionPackage === 'string') {
      try {
        sessionPackage = JSON.parse(sessionPackage);
      } catch (e) {
        return 1; // Default fallback
      }
    }
    
    if (sessionPackage.id) {
      // Use package ID for exact matching
      switch (sessionPackage.id) {
        case 'consultation':
          return 1; // 1 consultation session
        case 'single-session':
          return 1; // 1 therapy session
        case 'four-sessions':
          return 4; // 4 therapy sessions
        case 'six-sessions':
          return 6; // 6 therapy sessions
        case 'couples-session':
          return 1; // 1 couples session
        default:
          break;
      }
    }
    
    if (sessionPackage.name) {
      // Fallback to name parsing
      if (sessionPackage.name.toLowerCase().includes('consultation')) {
        return 1;
      }
      const match = sessionPackage.name.match(/(\d+)\s*Session/i);
      if (match) {
        return parseInt(match[1], 10);
      }
    }
    
    return 1; // Default fallback
  }

  // Check if patient email already exists
  async checkExistingPatient(email) {
    try {
      if (!this.calendar) {
        const authSuccess = await this.authenticate();
        if (!authSuccess) {
          throw new Error('Authentication failed');
        }
      }

      // Search for events with this email
      const result = await this.calendar.events.list({
        calendarId: DOCTOR_EMAIL,
        maxResults: 100,
        singleEvents: true,
        orderBy: 'startTime',
        q: email // Search by email
      });

      const events = result.data.items || [];
      
      // Check if any active therapy sessions or patient records exist for this email
      const activeEvents = events.filter(event => 
        event.extendedProperties?.private?.patientEmail === email &&
        (event.extendedProperties?.private?.therapySession === 'true' ||
         event.extendedProperties?.private?.placeholderEvent === 'true' ||
         event.extendedProperties?.private?.patientRecord === 'true')
      );

      return {
        exists: activeEvents.length > 0,
        sessionCount: activeEvents.length
      };
      
    } catch (error) {
      console.error('❌ Failed to check existing patient:', error.message);
      return { exists: false, error: error.message };
    }
  }

  // Delete all test therapy sessions and placeholders
  async deleteAllTestData() {
    try {
      if (!this.calendar) {
        const authSuccess = await this.authenticate();
        if (!authSuccess) {
          throw new Error('Authentication failed');
        }
      }

      // Get all therapy events (past and future)
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 6);
      
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 6);

      const result = await this.calendar.events.list({
        calendarId: DOCTOR_EMAIL,
        timeMin: startDate.toISOString(),
        timeMax: endDate.toISOString(),
        maxResults: 500,
        singleEvents: true,
        orderBy: 'startTime'
      });

      const allEvents = result.data.items || [];
      
      // Find test events (therapy sessions and patient records)
      const testEvents = allEvents.filter(event => 
        event.extendedProperties?.private?.therapySession === 'true' ||
        event.extendedProperties?.private?.patientRecord === 'true' ||
        event.summary?.includes('Test Patient') ||
        event.summary?.includes('PATIENT:')
      );

      console.log(`🗑️ Found ${testEvents.length} test events to delete`);
      
      // Delete each test event
      let deletedCount = 0;
      for (const event of testEvents) {
        try {
          await this.calendar.events.delete({
            calendarId: DOCTOR_EMAIL,
            eventId: event.id
          });
          deletedCount++;
          console.log(`✅ Deleted: ${event.summary} (${event.id})`);
        } catch (error) {
          console.warn(`⚠️ Failed to delete ${event.id}:`, error.message);
        }
      }

      console.log(`🎉 Cleanup complete: ${deletedCount}/${testEvents.length} test events deleted`);
      return { success: true, deleted: deletedCount, total: testEvents.length };
      
    } catch (error) {
      console.error('❌ Failed to delete test data:', error.message);
      return { success: false, error: error.message };
    }
  }

  // ======================================
  // NEW GOOGLE CALENDAR-ONLY AVAILABILITY SYSTEM
  // ======================================

  // Get availability from Google Calendar events
  async getAvailabilityFromCalendar(daysAhead = 90) {
    try {
      if (!this.calendar) {
        const authSuccess = await this.authenticate();
        if (!authSuccess) {
          throw new Error('Authentication failed');
        }
      }

      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + daysAhead);

      // Get all events in timeframe
      const result = await this.calendar.events.list({
        calendarId: DOCTOR_EMAIL,
        timeMin: startDate.toISOString(),
        timeMax: endDate.toISOString(),
        maxResults: 1000,
        singleEvents: true,
        orderBy: 'startTime'
      });

      const events = result.data.items || [];
      
      // Parse availability from calendar events
      const availability = this.parseAvailabilityFromEvents(events);
      
      return { success: true, availability };
      
    } catch (error) {
      console.error('❌ Failed to get availability from calendar:', error.message);
      return { success: false, error: error.message };
    }
  }

  // Parse calendar events to determine availability - ENHANCED VERSION
  parseAvailabilityFromEvents(events) {
    const availability = [];
    const now = new Date();
    
    // First, collect ALL therapy sessions and other events by date
    const eventsByDate = new Map();
    
    events.forEach(event => {
      const eventStart = new Date(event.start.dateTime || event.start.date);
      const dateStr = eventStart.toISOString().split('T')[0];
      
      if (!eventsByDate.has(dateStr)) {
        eventsByDate.set(dateStr, []);
      }
      eventsByDate.get(dateStr).push(event);
    });
    
    // Generate availability for 90 days
    for (let i = 0; i < 90; i++) {
      const date = new Date(now);
      date.setDate(now.getDate() + i);
      const dayOfWeek = date.getDay();
      const dateStr = date.toISOString().split('T')[0];
      const dayEvents = eventsByDate.get(dateStr) || [];
      
      // Generate time slots for every day (00:00 to 23:30 in 30min intervals)
      for (let hour = 0; hour < 24; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
          const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
          const slotStatus = this.getSlotStatus(dayEvents, dateStr, timeStr);
          
          // Only add explicitly available slots or booked slots
          if (slotStatus.eventType === 'available' || slotStatus.eventType === 'booked') {
            availability.push({
              date: dateStr,
              time: timeStr,
              dayOfWeek: date.toLocaleDateString('en-US', { weekday: 'long' }),
              available: slotStatus.available,
              reason: slotStatus.reason,
              eventType: slotStatus.eventType,
              eventId: slotStatus.eventId
            });
          }
        }
      }
    }
    
    // Remove duplicates and sort
    const uniqueAvailability = availability.filter((slot, index, self) =>
      index === self.findIndex(s => s.date === slot.date && s.time === slot.time)
    );
    
    return uniqueAvailability.sort((a, b) => new Date(a.date + 'T' + a.time) - new Date(b.date + 'T' + b.time));
  }

  // Check status of specific time slot
  getSlotStatus(events, date, time) {
    const slotDateTime = new Date(`${date}T${time}:00.000+01:00`); // Portuguese time
    
    for (const event of events) {
      const eventStart = new Date(event.start.dateTime || event.start.date);
      const eventEnd = new Date(event.end.dateTime || event.end.date);
      
      // Check if slot overlaps with event
      if (slotDateTime >= eventStart && slotDateTime < eventEnd) {
        const eventType = event.extendedProperties?.private?.availabilityType;
        
        switch (eventType) {
          case 'AVAILABLE_SLOT':
            return { 
              available: true, 
              reason: 'Available for booking',
              eventType: 'available',
              eventId: event.id 
            };
          case 'BLOCKED_SLOT':
            return { 
              available: false, 
              reason: event.summary.replace('Dr. K - BLOCKED: ', '') || 'Blocked',
              eventType: 'blocked',
              eventId: event.id 
            };
          case 'VACATION':
            return { 
              available: false, 
              reason: 'Vacation',
              eventType: 'vacation',
              eventId: event.id 
            };
          case 'MODIFIED_DAY':
            return { 
              available: true, 
              reason: 'Modified working hours',
              eventType: 'modified',
              eventId: event.id 
            };
          default:
            // Regular therapy session - check both old and new format
            if (event.extendedProperties?.private?.therapySession === 'true' || 
                event.summary?.includes('Therapy Session') ||
                event.attendees?.some(a => a.email?.includes('@'))) {
              return { 
                available: false, 
                reason: 'Patient Session',
                eventType: 'booked',
                eventId: event.id 
              };
            }
        }
      }
    }
    
    // Default: not available (slots must be explicitly marked as available)
    return { available: false, reason: 'Not available', eventType: 'default', eventId: null };
  }

  // Get extra slots from calendar events (outside normal working hours)
  getExtraSlotsFromEvents(events) {
    const extraSlots = [];
    
    events.forEach(event => {
      if (event.extendedProperties?.private?.availabilityType === 'EXTRA_SLOT') {
        const eventStart = new Date(event.start.dateTime);
        const date = eventStart.toISOString().split('T')[0];
        const time = eventStart.toTimeString().split(' ')[0].substring(0, 5);
        
        extraSlots.push({
          date,
          time,
          dayOfWeek: eventStart.toLocaleDateString('en-US', { weekday: 'long' }),
          available: true,
          reason: 'Extra slot',
          eventType: 'extra',
          eventId: event.id
        });
      }
    });
    
    return extraSlots;
  }

  // Block a specific time slot
  async blockTimeSlot({ date, startTime, duration = 1, reason = 'Blocked', recurring = false }) {
    try {
      if (!this.calendar) {
        const authSuccess = await this.authenticate();
        if (!authSuccess) {
          throw new Error('Authentication failed');
        }
      }

      const startDateTime = new Date(`${date}T${startTime}:00.000+01:00`); // Portuguese time
      const endDateTime = new Date(startDateTime);
      endDateTime.setHours(endDateTime.getHours() + duration);

      const event = {
        summary: `Dr. K - BLOCKED: ${reason}`,
        description: `Time slot blocked: ${reason}`,
        start: {
          dateTime: startDateTime.toISOString(),
          timeZone: 'Europe/Lisbon'
        },
        end: {
          dateTime: endDateTime.toISOString(),
          timeZone: 'Europe/Lisbon'
        },
        colorId: '11', // Red color
        extendedProperties: {
          private: {
            availabilityType: 'BLOCKED_SLOT',
            reason: reason,
            createdBy: 'admin'
          }
        }
      };

      if (recurring) {
        event.recurrence = ['RRULE:FREQ=WEEKLY'];
      }

      const result = await this.calendar.events.insert({
        calendarId: DOCTOR_EMAIL,
        resource: event
      });

      console.log(`✅ Time slot blocked: ${date} ${startTime} - ${reason}`);
      return { success: true, eventId: result.data.id };
      
    } catch (error) {
      console.error('❌ Failed to block time slot:', error.message);
      return { success: false, error: error.message };
    }
  }

  // Unblock a specific time slot
  async unblockTimeSlot({ date, time }) {
    try {
      if (!this.calendar) {
        const authSuccess = await this.authenticate();
        if (!authSuccess) {
          throw new Error('Authentication failed');
        }
      }

      // Find the blocking event for this time slot
      const startDateTime = new Date(`${date}T${time}:00.000+01:00`);
      const endDateTime = new Date(startDateTime);
      endDateTime.setHours(endDateTime.getHours() + 1);

      const result = await this.calendar.events.list({
        calendarId: DOCTOR_EMAIL,
        timeMin: startDateTime.toISOString(),
        timeMax: endDateTime.toISOString(),
        maxResults: 10
      });

      const blockingEvent = result.data.items.find(event => 
        event.extendedProperties?.private?.availabilityType === 'BLOCKED_SLOT'
      );

      if (blockingEvent) {
        await this.calendar.events.delete({
          calendarId: DOCTOR_EMAIL,
          eventId: blockingEvent.id
        });

        console.log(`✅ Time slot unblocked: ${date} ${time}`);
        return { success: true, eventId: blockingEvent.id };
      } else {
        return { success: false, error: 'No blocking event found for this time slot' };
      }
      
    } catch (error) {
      console.error('❌ Failed to unblock time slot:', error.message);
      return { success: false, error: error.message };
    }
  }

  // Block entire working day
  async blockEntireDay({ date, reason = 'Day blocked' }) {
    try {
      const startDateTime = new Date(`${date}T09:00:00.000+01:00`);
      const endDateTime = new Date(`${date}T17:00:00.000+01:00`);

      const event = {
        summary: `Dr. K - DAY BLOCKED: ${reason}`,
        description: `Entire working day blocked: ${reason}`,
        start: {
          dateTime: startDateTime.toISOString(),
          timeZone: 'Europe/Lisbon'
        },
        end: {
          dateTime: endDateTime.toISOString(),
          timeZone: 'Europe/Lisbon'
        },
        colorId: '11', // Red color
        extendedProperties: {
          private: {
            availabilityType: 'BLOCKED_SLOT',
            reason: reason,
            blockType: 'FULL_DAY',
            createdBy: 'admin'
          }
        }
      };

      const result = await this.calendar.events.insert({
        calendarId: DOCTOR_EMAIL,
        resource: event
      });

      console.log(`✅ Full day blocked: ${date} - ${reason}`);
      return { success: true, eventId: result.data.id };
      
    } catch (error) {
      console.error('❌ Failed to block full day:', error.message);
      return { success: false, error: error.message };
    }
  }

  // Block vacation period
  async blockVacation({ startDate, endDate, reason = 'Vacation' }) {
    try {
      const startDateTime = new Date(`${startDate}T00:00:00.000+01:00`);
      const endDateTime = new Date(`${endDate}T23:59:59.000+01:00`);

      const event = {
        summary: `Dr. K - VACATION: ${reason}`,
        description: `Vacation period: ${reason}`,
        start: {
          date: startDate
        },
        end: {
          date: endDate
        },
        colorId: '11', // Red color
        extendedProperties: {
          private: {
            availabilityType: 'VACATION',
            reason: reason,
            createdBy: 'admin'
          }
        }
      };

      const result = await this.calendar.events.insert({
        calendarId: DOCTOR_EMAIL,
        resource: event
      });

      console.log(`✅ Vacation blocked: ${startDate} to ${endDate} - ${reason}`);
      return { success: true, eventId: result.data.id };
      
    } catch (error) {
      console.error('❌ Failed to block vacation:', error.message);
      return { success: false, error: error.message };
    }
  }

  // Add extra time slot outside normal working hours
  async addExtraTimeSlot({ date, time, reason = 'Extra availability' }) {
    try {
      const startDateTime = new Date(`${date}T${time}:00.000+01:00`);
      const endDateTime = new Date(startDateTime);
      endDateTime.setHours(endDateTime.getHours() + 1);

      const event = {
        summary: `Dr. K - EXTRA SLOT: ${reason}`,
        description: `Additional availability: ${reason}`,
        start: {
          dateTime: startDateTime.toISOString(),
          timeZone: 'Europe/Lisbon'
        },
        end: {
          dateTime: endDateTime.toISOString(),
          timeZone: 'Europe/Lisbon'
        },
        colorId: '10', // Green color
        extendedProperties: {
          private: {
            availabilityType: 'EXTRA_SLOT',
            reason: reason,
            createdBy: 'admin'
          }
        }
      };

      const result = await this.calendar.events.insert({
        calendarId: DOCTOR_EMAIL,
        resource: event
      });

      console.log(`✅ Extra slot added: ${date} ${time} - ${reason}`);
      return { success: true, eventId: result.data.id };
      
    } catch (error) {
      console.error('❌ Failed to add extra slot:', error.message);
      return { success: false, error: error.message };
    }
  }

  // Modify working hours for a specific day
  async modifyWorkingDay({ date, startTime, endTime, reason = 'Modified hours' }) {
    try {
      const startDateTime = new Date(`${date}T${startTime}:00.000+01:00`);
      const endDateTime = new Date(`${date}T${endTime}:00.000+01:00`);

      const event = {
        summary: `Dr. K - MODIFIED HOURS: ${startTime}-${endTime}`,
        description: `Working hours modified: ${reason}`,
        start: {
          dateTime: startDateTime.toISOString(),
          timeZone: 'Europe/Lisbon'
        },
        end: {
          dateTime: endDateTime.toISOString(),
          timeZone: 'Europe/Lisbon'
        },
        colorId: '5', // Yellow color
        extendedProperties: {
          private: {
            availabilityType: 'MODIFIED_DAY',
            originalStart: '09:00',
            originalEnd: '17:00',
            newStart: startTime,
            newEnd: endTime,
            reason: reason,
            createdBy: 'admin'
          }
        }
      };

      const result = await this.calendar.events.insert({
        calendarId: DOCTOR_EMAIL,
        resource: event
      });

      console.log(`✅ Working hours modified: ${date} ${startTime}-${endTime}`);
      return { success: true, eventId: result.data.id };
      
    } catch (error) {
      console.error('❌ Failed to modify working day:', error.message);
      return { success: false, error: error.message };
    }
  }

  // Add availability slot (mark time as available for booking)
  async addAvailabilitySlot({ date, startTime, duration = 0.5, reason = 'Available for booking' }) {
    try {
      if (!this.calendar) {
        const authSuccess = await this.authenticate();
        if (!authSuccess) {
          throw new Error('Authentication failed');
        }
      }

      const startDateTime = new Date(`${date}T${startTime}:00.000+01:00`);
      const endDateTime = new Date(startDateTime);
      endDateTime.setMinutes(endDateTime.getMinutes() + (duration * 60));

      const event = {
        summary: `🟢 AVAILABLE: ${startTime}`,
        description: `Available slot: ${reason}`,
        start: {
          dateTime: startDateTime.toISOString(),
          timeZone: 'Europe/Lisbon'
        },
        end: {
          dateTime: endDateTime.toISOString(),
          timeZone: 'Europe/Lisbon'
        },
        colorId: '11', // Light green color
        extendedProperties: {
          private: {
            availabilityType: 'AVAILABLE_SLOT',
            slotDuration: duration.toString(),
            reason: reason,
            createdBy: 'admin'
          }
        }
      };

      const response = await this.calendar.events.insert({
        calendarId: DOCTOR_EMAIL,
        resource: event
      });

      console.log(`✅ Availability slot created: ${date} ${startTime} (${duration}h)`);
      return { 
        success: true, 
        eventId: response.data.id,
        message: `Available slot created for ${date} at ${startTime}`
      };

    } catch (error) {
      console.error('❌ Failed to add availability slot:', error.message);
      return { success: false, error: error.message };
    }
  }

  // Remove availability slot
  async removeAvailabilitySlot({ date, time }) {
    try {
      if (!this.calendar) {
        const authSuccess = await this.authenticate();
        if (!authSuccess) {
          throw new Error('Authentication failed');
        }
      }

      // Find the availability event for this time slot
      const startDateTime = new Date(`${date}T${time}:00.000+01:00`);
      const endDateTime = new Date(startDateTime);
      endDateTime.setHours(endDateTime.getHours() + 1);

      const result = await this.calendar.events.list({
        calendarId: DOCTOR_EMAIL,
        timeMin: startDateTime.toISOString(),
        timeMax: endDateTime.toISOString(),
        maxResults: 10
      });

      const availabilityEvent = result.data.items.find(event => 
        event.extendedProperties?.private?.availabilityType === 'AVAILABLE_SLOT'
      );

      if (availabilityEvent) {
        await this.calendar.events.delete({
          calendarId: DOCTOR_EMAIL,
          eventId: availabilityEvent.id
        });

        console.log(`✅ Availability slot removed: ${date} ${time}`);
        return { 
          success: true, 
          eventId: availabilityEvent.id,
          message: `Availability removed for ${date} at ${time}`
        };
      } else {
        console.log(`⚠️ No availability slot found for ${date} ${time}`);
        return { 
          success: true, 
          message: `No availability slot found for ${date} at ${time} (already not available)`
        };
      }

    } catch (error) {
      console.error('❌ Failed to remove availability slot:', error.message);
      return { success: false, error: error.message };
    }
  }

  // Send cancellation email with alternative suggestion
  async sendCancellationEmail({ patientEmail, patientName, bookingToken, originalDate, originalTime, reason, message, alternativeDate, alternativeTime }) {
    try {
      console.log(`📧 Sending cancellation email to ${patientEmail}`)
      
      const bookingUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/booking/${bookingToken}`;
      const hasAlternative = alternativeDate && alternativeTime;
      
      const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
          <meta charset="utf-8">
          <style>
              body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
              .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
              .header { background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); color: white; padding: 40px 30px; text-align: center; }
              .header h1 { margin: 0; font-size: 28px; font-weight: 300; }
              .content { padding: 40px 30px; }
              .cancellation-box { background: #fef2f2; border: 2px solid #fca5a5; border-radius: 12px; padding: 25px; margin: 25px 0; text-align: center; }
              .alternative-box { background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%); border: 2px solid #3b82f6; border-radius: 12px; padding: 25px; margin: 25px 0; text-align: center; }
              .button { display: inline-block; padding: 15px 30px; margin: 10px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; text-align: center; }
              .button-confirm { background: #059669; color: white; }
              .button-decline { background: #dc2626; color: white; }
              .button-book { background: #3b82f6; color: white; }
              .footer { background: #f3f4f6; padding: 30px; text-align: center; font-size: 14px; color: #6b7280; }
              .logo { font-size: 20px; font-weight: bold; color: #374151; margin-bottom: 10px; }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="header">
                  <h1>Appointment Update</h1>
              </div>
              
              <div class="content">
                  <p>Dear ${patientName},</p>
                  
                  <div class="cancellation-box">
                      <h3 style="color: #dc2626; margin-top: 0;">Your appointment has been cancelled</h3>
                      <p><strong>Original appointment:</strong><br>
                      📅 ${originalDate} at ${originalTime}</p>
                      <p><strong>Reason:</strong> ${reason}</p>
                      ${message ? `<p><em>"${message}"</em></p>` : ''}
                  </div>
                  
                  <p><strong>📈 Good news:</strong> Your session has been automatically credited back to your account. You can use it to book a new appointment.</p>
                  
                  ${hasAlternative ? `
                  <div class="alternative-box">
                      <h3 style="color: #3b82f6; margin-top: 0;">📅 Alternative Suggestion</h3>
                      <p><strong>New proposed time:</strong><br>
                      📅 ${new Date(`${alternativeDate}T${alternativeTime}`).toLocaleDateString()} at ${new Date(`${alternativeDate}T${alternativeTime}`).toLocaleTimeString()}</p>
                      
                      <p>Would this alternative work for you?</p>
                      
                      <div style="margin: 20px 0;">
                          <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/confirm-alternative?token=${bookingToken}&date=${alternativeDate}&time=${alternativeTime}&email=${encodeURIComponent(patientEmail)}&name=${encodeURIComponent(patientName)}" class="button button-confirm">
                              ✅ Yes, this time works
                          </a>
                          <a href="${bookingUrl}" class="button button-decline">
                              ❌ No, choose different time
                          </a>
                      </div>
                  </div>
                  ` : `
                  <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
                      <h4 style="margin-top: 0; color: #374151;">📅 Book a New Appointment</h4>
                      <p>Please use your personal booking link to schedule a new session:</p>
                      <a href="${bookingUrl}" class="button button-book">
                          📅 Book New Appointment
                      </a>
                  </div>
                  `}
                  
                  <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
                      <h4 style="margin-top: 0; color: #374151;">💡 Session Credit Information</h4>
                      <ul style="margin: 0; padding-left: 20px;">
                          <li><strong>Your session has been automatically credited back to your account</strong></li>
                          <li>Session credit is valid for 3 months</li>
                          <li>You can book any available time slot</li>
                          <li>No additional payment required</li>
                      </ul>
                  </div>
                  
                  <p>I sincerely apologize for any inconvenience this cancellation may cause. I'm committed to providing you with the best possible care and look forward to our rescheduled session.</p>
                  
                  <p>If you have any questions or concerns, please don't hesitate to reach out.</p>
                  
                  <p>Warm regards,<br><strong>Dr. Katiuscia</strong><br>Licensed Therapist</p>
              </div>
              
              <div class="footer">
                  <div class="logo">Dr. Katiuscia</div>
                  <p>Licensed Therapist • Confidential & Secure Service</p>
                  <p><small>This is an automated notification. Please keep this email for your records.</small></p>
              </div>
          </div>
      </body>
      </html>
      `;

      const mailOptions = {
        from: process.env.DOCTOR_EMAIL,
        to: patientEmail,
        subject: `Appointment Update - ${hasAlternative ? 'Alternative Suggested' : 'Reschedule Needed'} | Dr. Katiuscia`,
        html: htmlContent
      };

      // Use the existing sendEmail function instead of transporter
      const result = await this.sendEmail({
        to: patientEmail,
        subject: `Appointment Update - ${hasAlternative ? 'Alternative Suggested' : 'Reschedule Needed'} | Dr. Katiuscia`,
        htmlContent: htmlContent
      });
      
      return result;
      
    } catch (error) {
      console.error('❌ Failed to send cancellation email:', error);
      return { success: false, error: error.message };
    }
  }
}

// Export singleton instance
const googleWorkspaceService = new GoogleWorkspaceService();
module.exports = googleWorkspaceService;