// Session/booking management functions extracted from googleWorkspace.js
// These are standalone functions that accept calendar as the first parameter

// Get upcoming therapy sessions from Google Calendar
async function getUpcomingTherapySessions(calendar, limit = 50) {
  try {
    const now = new Date();
    const result = await calendar.events.list({
      calendarId: 'primary',
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
async function getAllTherapySessions(calendar, limit = 200) {
  try {
    // Get events from 2 weeks ago to 3 months forward (avoid pagination trap with very old events)
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 14); // 2 weeks back

    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 3); // 3 months forward

    console.log(`🔍 getAllTherapySessions: Searching from ${startDate.toISOString()} to ${endDate.toISOString()}`);

    const result = await calendar.events.list({
      calendarId: 'primary',
      timeMin: startDate.toISOString(),
      timeMax: endDate.toISOString(),
      maxResults: limit,
      singleEvents: true,
      orderBy: 'startTime',
    });

    // Ensure result exists and has data property
    if (!result || !result.data) {
      throw new Error('Invalid response from Google Calendar API');
    }

    // Only proceed if API call was successful
    const allEvents = result.data.items || [];

    // Show ALL events - no filtering
    console.log(`🔍 RAW API: Found ${allEvents.length} total events`);
    if (allEvents.length > 0) {
      allEvents.slice(0, 3).forEach((event, i) => {
        console.log(`📅 Event ${i+1}: "${event.summary || 'No title'}"`);
      });
    }

    // Filter for actual therapy sessions only (like in getUpcomingTherapySessions)
    const therapySessions = allEvents.filter(event =>
      event.extendedProperties?.private?.therapySession === 'true'
    ) || [];

    const sessions = therapySessions.map(event => ({
      eventId: event.id,
      summary: event.summary,
      start: event.start?.dateTime,
      end: event.end?.dateTime,
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
async function getSessionInfoFromBookingToken(calendar, bookingToken) {
  try {
    // Search for events with this booking token
    const result = await calendar.events.list({
      calendarId: 'primary',
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
async function getBookingHistoryForToken(calendar, bookingToken) {
  try {
    // Search for all events with this booking token
    const result = await calendar.events.list({
      calendarId: 'primary',
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

// Helper to get session count from package
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

module.exports = {
  getUpcomingTherapySessions,
  getAllTherapySessions,
  getSessionInfoFromBookingToken,
  getBookingHistoryForToken,
  getSessionCountFromPackage
};