// Google Calendar utilities extracted from googleWorkspace.js
// These functions handle calendar operations as standalone utilities

const DOCTOR_EMAIL = process.env.DOCTOR_EMAIL;

/**
 * Generate a unique booking ID
 * @returns {string} Unique booking ID
 */
function generateBookingId() {
  return `booking-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Create a calendar event with Google Meet conference
 * @param {Object} calendar - Google Calendar API instance
 * @param {Object} params - Event parameters
 * @param {string} params.summary - Event title
 * @param {string} params.description - Event description
 * @param {string} params.startDateTime - Start date/time in ISO format
 * @param {string} params.endDateTime - End date/time in ISO format
 * @param {string} params.attendeeEmail - Patient email address
 * @param {string} params.bookingId - Unique booking identifier
 * @returns {Promise<Object>} Result object with success status and event details
 */
async function createCalendarEvent(calendar, { summary, description, startDateTime, endDateTime, attendeeEmail, bookingId }) {
  try {
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

    const result = await calendar.events.insert({
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

/**
 * Delete a calendar event
 * @param {Object} calendar - Google Calendar API instance
 * @param {string} eventId - ID of the event to delete
 * @returns {Promise<Object>} Result object with success status
 */
async function deleteCalendarEvent(calendar, eventId) {
  try {
    await calendar.events.delete({
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

/**
 * Get embeddable calendar URL
 * @returns {string} Google Calendar embed URL
 */
async function getCalendarEmbedUrl() {
  return `https://calendar.google.com/calendar/embed?src=${encodeURIComponent(DOCTOR_EMAIL)}&ctz=Europe/Zurich&mode=WEEK&showTitle=0&showDate=1&showPrint=0&showTabs=0&showCalendars=0`;
}

/**
 * Create therapy session booking in Google Calendar
 * @param {Object} calendar - Google Calendar API instance
 * @param {Object} params - Booking parameters
 * @param {string} params.bookingToken - Unique booking token
 * @param {string} params.patientEmail - Patient email address
 * @param {string} params.patientName - Patient name
 * @param {string} params.startDateTime - Start date/time in ISO format
 * @param {string} params.endDateTime - End date/time in ISO format
 * @param {number} params.sessionNumber - Current session number
 * @param {number} params.totalSessions - Total number of sessions
 * @param {Object} params.sessionPackage - Session package details
 * @returns {Promise<Object>} Result object with success status and booking details
 */
async function createTherapySessionBooking(calendar, {
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
    const bookingId = generateBookingId();

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

    const result = await calendar.events.insert({
      calendarId: 'primary',
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

module.exports = {
  createCalendarEvent,
  deleteCalendarEvent,
  getCalendarEmbedUrl,
  createTherapySessionBooking,
  generateBookingId
};