const { google } = require('googleapis');

/**
 * Availability Management Functions
 *
 * Extracted from GoogleWorkspaceService class to provide standalone
 * availability and slot management functionality for Google Calendar.
 *
 * All functions accept a calendar instance as the first parameter.
 * Timezone: Europe/Lisbon (Portuguese time)
 */

// Get available time slots from Google Calendar system
// Updated to use the new availability system with Portuguese time
async function getAvailableTimeSlots(calendar, startDate, endDate, useIntelligentFiltering = true) {
  try {
    // Use the new availability system
    const availabilityResult = await getAvailabilityFromCalendar(calendar, 90);

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
      const intelligentSlots = applyIntelligentSlotFiltering(availableSlots);
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
function applyIntelligentSlotFiltering(slots) {
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
      const canAccommodateTherapy = canSlotAccommodateSession(daySlots, slot, 50);

      // Check if this slot can accommodate a 30-minute session (consultation)
      const canAccommodateConsultation = canSlotAccommodateSession(daySlots, slot, 30);

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
function canSlotAccommodateSession(daySlots, slot, durationMinutes) {
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

// Get availability from Google Calendar events
async function getAvailabilityFromCalendar(calendar, daysAhead = 90) {
  try {
    if (!calendar) {
      throw new Error('Calendar instance not provided');
    }

    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + daysAhead);

    // Get all events in timeframe
    const result = await calendar.events.list({
      calendarId: 'primary',
      timeMin: startDate.toISOString(),
      timeMax: endDate.toISOString(),
      maxResults: 1000,
      singleEvents: true,
      orderBy: 'startTime'
    });

    const events = result.data.items || [];

    // Parse availability from calendar events
    const availability = parseAvailabilityFromEvents(events);

    return { success: true, availability };

  } catch (error) {
    console.error('❌ Failed to get availability from calendar:', error.message);
    return { success: false, error: error.message };
  }
}

// Parse calendar events to determine availability - ENHANCED VERSION
function parseAvailabilityFromEvents(events) {
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
        const slotStatus = getSlotStatus(dayEvents, dateStr, timeStr);

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
function getSlotStatus(events, date, time) {
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
function getExtraSlotsFromEvents(events) {
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
async function blockTimeSlot(calendar, { date, startTime, duration = 1, reason = 'Blocked', recurring = false }) {
  try {
    if (!calendar) {
      throw new Error('Calendar instance not provided');
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

    const result = await calendar.events.insert({
      calendarId: 'primary',
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
async function unblockTimeSlot(calendar, { date, time }) {
  try {
    if (!calendar) {
      throw new Error('Calendar instance not provided');
    }

    // Find the blocking event for this time slot
    const startDateTime = new Date(`${date}T${time}:00.000+01:00`);
    const endDateTime = new Date(startDateTime);
    endDateTime.setHours(endDateTime.getHours() + 1);

    const result = await calendar.events.list({
      calendarId: 'primary',
      timeMin: startDateTime.toISOString(),
      timeMax: endDateTime.toISOString(),
      maxResults: 10
    });

    const blockingEvent = result.data.items.find(event =>
      event.extendedProperties?.private?.availabilityType === 'BLOCKED_SLOT'
    );

    if (blockingEvent) {
      await calendar.events.delete({
        calendarId: 'primary',
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
async function blockEntireDay(calendar, { date, reason = 'Day blocked' }) {
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

    const result = await calendar.events.insert({
      calendarId: 'primary',
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
async function blockVacation(calendar, { startDate, endDate, reason = 'Vacation' }) {
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

    const result = await calendar.events.insert({
      calendarId: 'primary',
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
async function addExtraTimeSlot(calendar, { date, time, reason = 'Extra availability' }) {
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

    const result = await calendar.events.insert({
      calendarId: 'primary',
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
async function modifyWorkingDay(calendar, { date, startTime, endTime, reason = 'Modified hours' }) {
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

    const result = await calendar.events.insert({
      calendarId: 'primary',
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
async function addAvailabilitySlot(calendar, { date, startTime, duration = 0.5, reason = 'Available for booking' }) {
  try {
    if (!calendar) {
      throw new Error('Calendar instance not provided');
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

    const response = await calendar.events.insert({
      calendarId: 'primary',
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
async function removeAvailabilitySlot(calendar, { date, time }) {
  try {
    if (!calendar) {
      throw new Error('Calendar instance not provided');
    }

    // Find the availability event for this time slot
    const startDateTime = new Date(`${date}T${time}:00.000+01:00`);
    const endDateTime = new Date(startDateTime);
    endDateTime.setHours(endDateTime.getHours() + 1);

    const result = await calendar.events.list({
      calendarId: 'primary',
      timeMin: startDateTime.toISOString(),
      timeMax: endDateTime.toISOString(),
      maxResults: 10
    });

    const availabilityEvent = result.data.items.find(event =>
      event.extendedProperties?.private?.availabilityType === 'AVAILABLE_SLOT'
    );

    if (availabilityEvent) {
      await calendar.events.delete({
        calendarId: 'primary',
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

module.exports = {
  getAvailableTimeSlots,
  applyIntelligentSlotFiltering,
  canSlotAccommodateSession,
  getAvailabilityFromCalendar,
  parseAvailabilityFromEvents,
  getSlotStatus,
  getExtraSlotsFromEvents,
  blockTimeSlot,
  unblockTimeSlot,
  blockEntireDay,
  blockVacation,
  addExtraTimeSlot,
  modifyWorkingDay,
  addAvailabilitySlot,
  removeAvailabilitySlot
};