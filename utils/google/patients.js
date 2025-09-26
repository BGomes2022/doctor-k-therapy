/**
 * Patient Management Functions
 * Extracted from googleWorkspace.js for better modularity
 */

// Helper function to get session count from package
function getSessionCountFromPackage(sessionPackage) {
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

/**
 * Create patient record in calendar (visible as patient, not hidden placeholder)
 * @param {object} calendar - Google Calendar API instance
 * @param {object} params - Patient data
 * @param {string} params.bookingToken - Unique booking token
 * @param {string} params.patientEmail - Patient email address
 * @param {string} params.patientName - Patient name
 * @param {object} params.sessionPackage - Session package details
 * @param {object} params.medicalData - Medical form data
 * @returns {object} Result with success status and event ID
 */
async function createPatientRecord(calendar, { bookingToken, patientEmail, patientName, sessionPackage, medicalData }) {
  try {
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
Sessions: 0/${getSessionCountFromPackage(sessionPackage)}
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
          totalSessions: getSessionCountFromPackage(sessionPackage).toString(),
          medicalData: medicalDataString
        }
      }
    };

    const result = await calendar.events.insert({
      calendarId: 'primary',
      resource: event,
    });

    console.log('✅ Patient record created:', result.data.id);
    return { success: true, eventId: result.data.id };

  } catch (error) {
    console.error('❌ Failed to create patient record:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Check if patient email already exists
 * @param {object} calendar - Google Calendar API instance
 * @param {string} email - Patient email to check
 * @returns {object} Result with exists status and session count
 */
async function checkExistingPatient(calendar, email) {
  try {
    // Search for events with this email
    const result = await calendar.events.list({
      calendarId: 'primary',
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

/**
 * Delete all test therapy sessions and placeholders
 * @param {object} calendar - Google Calendar API instance
 * @returns {object} Result with deletion statistics
 */
async function deleteAllTestData(calendar) {
  try {
    // Get all therapy events (past and future)
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 6);

    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 6);

    const result = await calendar.events.list({
      calendarId: 'primary',
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
        await calendar.events.delete({
          calendarId: 'primary',
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

module.exports = {
  createPatientRecord,
  checkExistingPatient,
  deleteAllTestData
};