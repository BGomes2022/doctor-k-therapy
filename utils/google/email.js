const { DOCTOR_EMAIL } = require('./auth');

// Basic email sending function
async function sendEmail(gmail, doctorEmail, { to, subject, htmlContent, textContent }) {
  console.log('🔴 [SENDMAIL] sendEmail called');
  console.log('🔴 [SENDMAIL] gmail:', !!gmail, typeof gmail);
  console.log('🔴 [SENDMAIL] doctorEmail:', doctorEmail);
  console.log('🔴 [SENDMAIL] to:', to);
  console.log('🔴 [SENDMAIL] subject:', subject);

  try {
    if (!gmail) {
      console.error('🔴 [SENDMAIL] ERROR: Gmail service not initialized');
      throw new Error('Gmail service not initialized');
    }

    const message = [
      `From: Dr. Katiuscia <${doctorEmail}>`,
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

    console.log('🔴 [SENDMAIL] Calling gmail.users.messages.send...');
    const result = await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encodedMessage,
      },
    });

    console.log('✅ [SENDMAIL] Email sent successfully:', result.data.id);
    return { success: true, messageId: result.data.id };
  } catch (error) {
    console.error('❌ [SENDMAIL] Email sending failed:', error.message);
    console.error('❌ [SENDMAIL] Full error:', error);
    return { success: false, error: error.message };
  }
}

// Send bulk emails to multiple recipients (for admin panel)
async function sendBulkEmails(gmail, doctorEmail, { recipients, subject, htmlContent, textContent }) {
  try {
    if (!gmail) {
      throw new Error('Gmail service not initialized');
    }

    const emailPromises = recipients.map(async (recipient) => {
      const message = [
        `From: Dr. Katiuscia <${doctorEmail}>`,
        `To: ${recipient}`,
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

      try {
        const result = await gmail.users.messages.send({
          userId: 'me',
          requestBody: {
            raw: encodedMessage,
          },
        });

        console.log(`✅ Email sent to ${recipient}:`, result.data.id);
        return { success: true, recipient, messageId: result.data.id };
      } catch (error) {
        console.error(`❌ Failed to send email to ${recipient}:`, error.message);
        return { success: false, recipient, error: error.message };
      }
    });

    const results = await Promise.all(emailPromises);
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    console.log(`📧 Bulk email results: ${successful} sent, ${failed} failed`);

    return {
      success: failed === 0,
      results,
      summary: { successful, failed, total: recipients.length }
    };
  } catch (error) {
    console.error('❌ Bulk email sending failed:', error.message);
    return { success: false, error: error.message };
  }
}

async function sendBookingConfirmation(gmail, doctorEmail, { patientEmail, patientName, appointmentDate, appointmentTime, meetLink, bookingId, sessionType, sessionNumber, totalSessions }) {
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

  return await sendEmail(gmail, doctorEmail, {
    to: patientEmail,
    subject: `Your Therapy Session is Confirmed - ${formattedDate} at ${appointmentTime}`,
    htmlContent: htmlContent
  });
}

async function sendVideoSessionInvitation(gmail, doctorEmail, { patientEmail, patientName, appointmentDate, appointmentTime, meetLink, bookingId, sessionType, sessionNumber, totalSessions, isFirstSession }) {
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

  return await sendEmail(gmail, doctorEmail, {
    to: patientEmail,
    subject: `Video Session Invitation - ${formattedDate} at ${appointmentTime}`,
    htmlContent: htmlContent
  });
}

async function sendSimpleAppointmentConfirmation(gmail, doctorEmail, { patientEmail, patientName, appointmentDate, appointmentTime, meetLink, isManualBooking = true }) {
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
          }
          .content {
              padding: 40px 30px;
          }
          .footer {
              text-align: center;
              padding: 30px;
              background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
              color: #6b7280;
              font-size: 12px;
              border-top: 1px solid #e5e7eb;
          }
      </style>
  </head>
  <body>
      <div class="container">
          <div class="header">
              <div style="font-size: 20px; font-weight: 600; margin-bottom: 5px;">Dr. Katiuscia Mercogliano</div>
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

              <div style="background: #f8fafc; padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #2c5530;">
                  <h4 style="margin-top: 0; color: #2c5530;">📋 Session Preparation</h4>
                  <ul style="margin: 10px 0; padding-left: 20px;">
                      <li>Find a quiet, private space</li>
                      <li>Test your camera and microphone</li>
                      <li>Ensure stable internet connection</li>
                      <li>Have water and tissues nearby</li>
                      <li>Join 5 minutes early</li>
                  </ul>
              </div>

              <div style="background: #f0f9ff; padding: 25px; border-radius: 10px; margin: 20px 0; border: 2px solid #0ea5e9;">
                  <h4 style="margin-top: 0; color: #0369a1;">📞 Need to Reschedule?</h4>
                  <p>If you need to reschedule or have any questions, please contact me at least 24 hours in advance:</p>
                  <p style="margin: 10px 0;">
                      📧 <strong>Email:</strong> ${doctorEmail || 'contact@doctorktherapy.com'}
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
          </div>
      </div>
  </body>
  </html>
  `;

  return await sendEmail(gmail, doctorEmail, {
    to: patientEmail,
    subject: `Appointment Confirmed - ${formattedDate} at ${appointmentTime}`,
    htmlContent: htmlContent
  });
}

async function sendCancellationEmail(gmail, doctorEmail, { patientEmail, patientName, appointmentDate, appointmentTime, reason }) {
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
          .footer {
              background: #f3f4f6;
              padding: 30px;
              text-align: center;
              font-size: 14px;
              color: #6b7280;
              border-top: 1px solid #e5e7eb;
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

              <p>I'm writing to inform you that your therapy appointment has been cancelled.</p>

              <div class="cancellation-card">
                  <h3>📅 Cancelled Appointment Details</h3>
                  <p><strong>Date:</strong> ${formattedDate}</p>
                  <p><strong>Time:</strong> ${appointmentTime}</p>
                  ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
              </div>

              <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <h4 style="margin-top: 0; color: #0369a1;">📞 Rescheduling</h4>
                  <p>If you'd like to schedule a new appointment, please contact me:</p>
                  <p><strong>Email:</strong> ${doctorEmail}</p>
              </div>

              <p style="margin-top: 30px;">I apologize for any inconvenience this may cause.</p>
              <p>Best regards,<br><strong>Dr. Katiuscia</strong></p>
          </div>

          <div class="footer">
              <p>Dr. Katiuscia - Professional Therapy Services</p>
              <p>🔒 All communications are confidential and HIPAA compliant</p>
          </div>
      </div>
  </body>
  </html>
  `;

  return await sendEmail(gmail, doctorEmail, {
    to: patientEmail,
    subject: `Appointment Cancelled - ${formattedDate} at ${appointmentTime}`,
    htmlContent: htmlContent
  });
}

async function sendAdminPackageNotification(gmail, doctorEmail, { patientName, patientEmail, sessionPackage, purchaseDate }) {
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
          .content {
              padding: 40px 30px;
          }
          .package-card {
              background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
              padding: 25px;
              border-radius: 12px;
              margin: 25px 0;
              border-left: 6px solid #059669;
          }
      </style>
  </head>
  <body>
      <div class="container">
          <div class="header">
              <h1>💳 New Package Purchase</h1>
              <p>Admin Notification</p>
          </div>

          <div class="content">
              <p>A new session package has been purchased:</p>

              <div class="package-card">
                  <h3>Package Details</h3>
                  <p><strong>Patient:</strong> ${patientName}</p>
                  <p><strong>Email:</strong> ${patientEmail}</p>
                  <p><strong>Package:</strong> ${sessionPackage}</p>
                  <p><strong>Purchase Date:</strong> ${purchaseDate}</p>
              </div>

              <p>Please update the patient records accordingly.</p>
          </div>
      </div>
  </body>
  </html>
  `;

  return await sendEmail(gmail, doctorEmail, {
    to: doctorEmail,
    subject: `New Package Purchase - ${patientName}`,
    htmlContent: htmlContent
  });
}

async function sendAdminBookingNotification(gmail, doctorEmail, { patientName, appointmentDate, appointmentTime, sessionPackage, remainingSessions }) {
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
              background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%);
              color: white;
              padding: 40px 30px;
              text-align: center;
          }
          .content {
              padding: 40px 30px;
          }
          .booking-card {
              background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
              padding: 25px;
              border-radius: 12px;
              margin: 25px 0;
              border-left: 6px solid #2563eb;
          }
      </style>
  </head>
  <body>
      <div class="container">
          <div class="header">
              <h1>📅 New Booking</h1>
              <p>Admin Notification</p>
          </div>

          <div class="content">
              <p>A new appointment has been booked:</p>

              <div class="booking-card">
                  <h3>Booking Details</h3>
                  <p><strong>Patient:</strong> ${patientName}</p>
                  <p><strong>Date:</strong> ${formattedDate}</p>
                  <p><strong>Time:</strong> ${appointmentTime}</p>
                  <p><strong>Package:</strong> ${sessionPackage}</p>
                  <p><strong>Remaining Sessions:</strong> ${remainingSessions}</p>
              </div>

              <p>Please prepare for the upcoming session.</p>
          </div>
      </div>
  </body>
  </html>
  `;

  return await sendEmail(gmail, doctorEmail, {
    to: doctorEmail,
    subject: `New Booking - ${patientName} on ${formattedDate}`,
    htmlContent: htmlContent
  });
}

async function sendBookingLinkEmail(gmail, doctorEmail, { patientEmail, patientName, bookingToken, sessionPackage, language = 'en' }) {
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
              background: linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%);
              color: white;
              padding: 40px 30px;
              text-align: center;
          }
          .content {
              padding: 40px 30px;
          }
          .booking-section {
              background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
              padding: 25px;
              border-radius: 12px;
              margin: 25px 0;
              text-align: center;
              border: 2px solid #7c3aed;
          }
          .booking-button {
              display: inline-block;
              background: linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%);
              color: white;
              padding: 15px 35px;
              text-decoration: none;
              border-radius: 8px;
              margin: 15px 0;
              font-weight: 600;
              font-size: 16px;
              box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          }
      </style>
  </head>
  <body>
      <div class="container">
          <div class="header">
              <h1>🔗 Book Your Session</h1>
              <p>Your booking link is ready</p>
          </div>

          <div class="content">
              <p>Dear ${patientName},</p>

              <p>Thank you for purchasing your ${sessionPackage} package. You can now book your sessions using the link below.</p>

              <div class="booking-section">
                  <h3>📅 Book Your Appointment</h3>
                  <p>Click the button below to select your preferred date and time:</p>
                  <a href="https://doctorktherapy.com/booking/${bookingToken}" class="booking-button">Book Session</a>
                  <p style="font-size: 12px; color: #6b7280;">This link is personal and secure - please don't share it</p>
              </div>

              <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <h4 style="margin-top: 0; color: #0369a1;">📝 Important Notes</h4>
                  <ul style="text-align: left;">
                      <li>Sessions are conducted via secure video call</li>
                      <li>Each session lasts 50 minutes</li>
                      <li>Please book at least 24 hours in advance</li>
                      <li>Cancellation policy: 24 hours notice required</li>
                  </ul>
              </div>

              <p>If you have any questions or need assistance, please don't hesitate to contact me.</p>

              <p>Looking forward to working with you!</p>
              <p>Best regards,<br><strong>Dr. Katiuscia</strong></p>
          </div>
      </div>
  </body>
  </html>
  `;

  return await sendEmail(gmail, doctorEmail, {
    to: patientEmail,
    subject: `Your Booking Link - ${sessionPackage}`,
    htmlContent: htmlContent
  });
}

async function send24HourReminder(gmail, doctorEmail, { patientEmail, patientName, appointmentDate, appointmentTime, meetLink }) {
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
              background: linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%);
              color: white;
              padding: 40px 30px;
              text-align: center;
          }
          .content {
              padding: 40px 30px;
          }
          .reminder-card {
              background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
              padding: 25px;
              border-radius: 12px;
              margin: 25px 0;
              border-left: 6px solid #f59e0b;
              text-align: center;
          }
          .meet-button {
              display: inline-block;
              background: linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%);
              color: white;
              padding: 15px 35px;
              text-decoration: none;
              border-radius: 8px;
              margin: 15px 0;
              font-weight: 600;
              font-size: 16px;
              box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          }
      </style>
  </head>
  <body>
      <div class="container">
          <div class="header">
              <h1>⏰ Session Reminder</h1>
              <p>Your appointment is tomorrow</p>
          </div>

          <div class="content">
              <p>Dear ${patientName},</p>

              <p>This is a friendly reminder that you have a therapy session scheduled for tomorrow.</p>

              <div class="reminder-card">
                  <h3>🗓️ Tomorrow's Appointment</h3>
                  <div style="font-size: 20px; margin: 15px 0;">
                      <strong>${formattedDate}</strong>
                  </div>
                  <div style="font-size: 18px; margin: 10px 0;">
                      <strong>${appointmentTime}</strong> (Lisbon Time)
                  </div>

                  <a href="${meetLink}" class="meet-button">Join Session</a>

                  <p style="font-size: 12px; color: #6b7280; margin-top: 10px;">
                      Meeting room will be available 15 minutes before your appointment
                  </p>
              </div>

              <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <h4 style="margin-top: 0; color: #374151;">📋 Quick Checklist</h4>
                  <ul style="text-align: left;">
                      <li>✓ Test your camera and microphone</li>
                      <li>✓ Find a quiet, private space</li>
                      <li>✓ Ensure stable internet connection</li>
                      <li>✓ Have water and tissues nearby</li>
                      <li>✓ Join 5 minutes early</li>
                  </ul>
              </div>

              <p>If you need to reschedule, please contact me as soon as possible.</p>

              <p>Looking forward to our session!</p>
              <p>Best regards,<br><strong>Dr. Katiuscia</strong></p>
          </div>
      </div>
  </body>
  </html>
  `;

  return await sendEmail(gmail, doctorEmail, {
    to: patientEmail,
    subject: `Reminder: Session Tomorrow - ${formattedDate} at ${appointmentTime}`,
    htmlContent: htmlContent
  });
}

async function sendCancellationEmailV2(gmail, doctorEmail, { patientEmail, patientName, bookingToken, originalDate, originalTime, reason, message, alternativeDate, alternativeTime }) {
  const formattedOriginalDate = new Date(originalDate).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const formattedAlternativeDate = alternativeDate ? new Date(alternativeDate).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }) : null;

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
          .content {
              padding: 40px 30px;
          }
          .cancellation-card {
              background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
              padding: 25px;
              border-radius: 12px;
              margin: 25px 0;
              border-left: 6px solid #dc2626;
          }
          .alternative-card {
              background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
              padding: 25px;
              border-radius: 12px;
              margin: 25px 0;
              border-left: 6px solid #059669;
              text-align: center;
          }
          .book-button {
              display: inline-block;
              background: linear-gradient(135deg, #059669 0%, #10b981 100%);
              color: white;
              padding: 15px 35px;
              text-decoration: none;
              border-radius: 8px;
              margin: 15px 0;
              font-weight: 600;
              font-size: 16px;
              box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          }
      </style>
  </head>
  <body>
      <div class="container">
          <div class="header">
              <h1>📅 Session Rescheduled</h1>
              <p>Important update about your appointment</p>
          </div>

          <div class="content">
              <p>Dear ${patientName},</p>

              <p>I need to reschedule your upcoming therapy session. I apologize for any inconvenience this may cause.</p>

              <div class="cancellation-card">
                  <h3>❌ Original Appointment</h3>
                  <p><strong>Date:</strong> ${formattedOriginalDate}</p>
                  <p><strong>Time:</strong> ${originalTime}</p>
                  ${reason ? `<p><strong>Reason for change:</strong> ${reason}</p>` : ''}
              </div>

              ${message ? `
              <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <p style="margin: 0; font-style: italic;">${message}</p>
              </div>
              ` : ''}

              ${alternativeDate && alternativeTime ? `
              <div class="alternative-card">
                  <h3>✅ Suggested Alternative</h3>
                  <p><strong>Date:</strong> ${formattedAlternativeDate}</p>
                  <p><strong>Time:</strong> ${alternativeTime}</p>
                  <p>If this works for you, I'll send you a confirmation.</p>
              </div>
              ` : ''}

              <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <h4 style="margin-top: 0; color: #0369a1;">📞 Next Steps</h4>
                  <p>Please reply to this email or contact me to:</p>
                  <ul>
                      <li>Confirm the suggested alternative time</li>
                      <li>Propose a different time that works better for you</li>
                      <li>Access your booking portal for more options</li>
                  </ul>
                  ${bookingToken ? `<a href="https://doctorktherapy.com/booking/${bookingToken}" class="book-button">View Available Times</a>` : ''}
              </div>

              <p>Thank you for your understanding and flexibility.</p>

              <p>Best regards,<br><strong>Dr. Katiuscia</strong></p>
          </div>
      </div>
  </body>
  </html>
  `;

  return await sendEmail(gmail, doctorEmail, {
    to: patientEmail,
    subject: `Session Rescheduled - ${formattedOriginalDate}`,
    htmlContent: htmlContent
  });
}

async function sendSimpleBookingLinkEmail(gmail, doctorEmail, { patientEmail, patientName, bookingToken, language = 'en' }) {
  console.log('🟢 [EMAIL.JS] sendSimpleBookingLinkEmail called');
  console.log('🟢 [EMAIL.JS] gmail:', !!gmail);
  console.log('🟢 [EMAIL.JS] doctorEmail:', doctorEmail);
  console.log('🟢 [EMAIL.JS] patientEmail:', patientEmail);
  console.log('🟢 [EMAIL.JS] patientName:', patientName);
  console.log('🟢 [EMAIL.JS] bookingToken:', bookingToken);
  console.log('🟢 [EMAIL.JS] language:', language);

  const translations = {
    en: {
      subject: 'Your Dr. K Therapy Booking Link',
      greeting: 'Hello',
      message: 'Welcome to Dr. K Therapy! Use your personal booking portal to schedule your therapy sessions.',
      buttonText: 'Book Your Sessions',
      securityNote: 'This link is personal and secure - please don\'t share it',
      importantNotes: 'Important Notes',
      note1: 'Sessions are conducted via secure video call',
      note2: 'Please book at least 24 hours in advance',
      note3: 'Cancellation policy: 24 hours notice required',
      helpText: 'If you have any questions or need assistance, please don\'t hesitate to contact me.',
      lookingForward: 'Looking forward to working with you!',
      regards: 'Best regards'
    },
    it: {
      subject: 'Il Tuo Link di Prenotazione Dr. K Therapy',
      greeting: 'Ciao',
      message: 'Benvenuto/a a Dr. K Therapy! Usa il tuo portale personale per prenotare le tue sessioni di terapia.',
      buttonText: 'Prenota le Tue Sessioni',
      securityNote: 'Questo link è personale e sicuro - per favore non condividerlo',
      importantNotes: 'Note Importanti',
      note1: 'Le sessioni si svolgono tramite videochiamata sicura',
      note2: 'Prenota con almeno 24 ore di anticipo',
      note3: 'Politica di cancellazione: richiesto preavviso di 24 ore',
      helpText: 'Se hai domande o hai bisogno di assistenza, non esitare a contattarmi.',
      lookingForward: 'Non vedo l\'ora di lavorare con te!',
      regards: 'Cordiali saluti'
    },
    de: {
      subject: 'Dein Dr. K Therapy Buchungslink',
      greeting: 'Hallo',
      message: 'Herzlich willkommen bei Dr. K Therapy! Nutze dein persönliches Buchungsportal, um deine Therapiesitzungen zu planen.',
      buttonText: 'Sitzungen Buchen',
      securityNote: 'Dieser Link ist persönlich und sicher - bitte nicht teilen',
      importantNotes: 'Wichtige Hinweise',
      note1: 'Sitzungen finden über sichere Videokonferenz statt',
      note2: 'Bitte mindestens 24 Stunden im Voraus buchen',
      note3: 'Stornierungsrichtlinie: 24 Stunden Vorlaufzeit erforderlich',
      helpText: 'Bei Fragen oder Unterstützungsbedarf zögere nicht, mich zu kontaktieren.',
      lookingForward: 'Ich freue mich auf die Zusammenarbeit mit dir!',
      regards: 'Viele Grüße'
    }
  }

  const t = translations[language] || translations.en
  const bookingUrl = `https://doctorktherapy.com/booking/${bookingToken}`

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
              background: linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%);
              color: white;
              padding: 40px 30px;
              text-align: center;
          }
          .content {
              padding: 40px 30px;
          }
          .button {
              display: inline-block;
              padding: 15px 40px;
              background: linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%);
              color: white;
              text-decoration: none;
              border-radius: 8px;
              font-weight: 600;
              margin: 20px 0;
          }
          .notes-box {
              background: #f0f9ff;
              padding: 20px;
              border-radius: 8px;
              margin: 20px 0;
          }
          .footer {
              background-color: #f3f4f6;
              padding: 20px 30px;
              text-align: center;
              color: #6b7280;
              font-size: 14px;
          }
      </style>
  </head>
  <body>
      <div class="container">
          <div class="header">
              <h1 style="margin: 0; font-size: 28px;">Dr. K Therapy</h1>
          </div>
          <div class="content">
              <p style="font-size: 18px; color: #1f2937;"><strong>${t.greeting} ${patientName},</strong></p>
              <p style="font-size: 16px; color: #4b5563;">${t.message}</p>
              <div style="text-align: center; margin: 30px 0;">
                  <a href="${bookingUrl}" class="button">${t.buttonText}</a>
                  <p style="font-size: 12px; color: #6b7280; margin-top: 10px;">${t.securityNote}</p>
              </div>

              <div class="notes-box">
                  <h4 style="margin-top: 0; color: #0369a1;">📝 ${t.importantNotes}</h4>
                  <ul style="text-align: left; margin: 10px 0;">
                      <li>${t.note1}</li>
                      <li>${t.note2}</li>
                      <li>${t.note3}</li>
                  </ul>
              </div>

              <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">${t.helpText}</p>
              <p style="font-size: 14px; color: #6b7280;">${t.lookingForward}</p>
              <p style="font-size: 14px; color: #1f2937; margin-top: 20px;">${t.regards},<br><strong>Dr. Katiuscia</strong></p>
          </div>
          <div class="footer">
              <p style="margin: 5px 0;">Dr. Katiuscia Mercogliano</p>
              <p style="margin: 5px 0;">Professional Therapist</p>
          </div>
      </div>
  </body>
  </html>
  `

  console.log('🟢 [EMAIL.JS] About to call sendEmail with:');
  console.log('🟢 [EMAIL.JS] - gmail:', !!gmail);
  console.log('🟢 [EMAIL.JS] - doctorEmail:', doctorEmail);
  console.log('🟢 [EMAIL.JS] - to:', patientEmail);
  console.log('🟢 [EMAIL.JS] - subject:', t.subject);

  const emailResult = await sendEmail(gmail, doctorEmail, {
    to: patientEmail,
    subject: t.subject,
    htmlContent: htmlContent
  });

  console.log('🟢 [EMAIL.JS] sendEmail returned:', emailResult);
  return emailResult;
}

module.exports = {
  sendEmail,
  sendBulkEmails,
  sendBookingConfirmation,
  sendVideoSessionInvitation,
  sendSimpleAppointmentConfirmation,
  sendCancellationEmail,
  sendAdminPackageNotification,
  sendAdminBookingNotification,
  sendBookingLinkEmail,
  send24HourReminder,
  sendCancellationEmailV2,
  sendSimpleBookingLinkEmail
};