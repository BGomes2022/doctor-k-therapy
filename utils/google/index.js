const { authenticate, DOCTOR_EMAIL } = require('./auth');
const emailFunctions = require('./email');
const calendarFunctions = require('./calendar');
const sessionFunctions = require('./sessions');
const availabilityFunctions = require('./availability');
const patientFunctions = require('./patients');

class GoogleWorkspaceService {
  constructor() {
    this.auth = null;
    this.gmail = null;
    this.calendar = null;
  }

  async authenticate() {
    const result = await authenticate();
    if (result.success) {
      this.auth = result.auth;
      this.gmail = result.gmail;
      this.calendar = result.calendar;
      return true;
    }
    return false;
  }

  async sendEmail(params) {
    if (!this.gmail) {
      const authSuccess = await this.authenticate();
      if (!authSuccess) throw new Error('Authentication failed');
    }
    return emailFunctions.sendEmail(this.gmail, DOCTOR_EMAIL, params);
  }

  async sendBulkEmails(params) {
    if (!this.gmail) {
      const authSuccess = await this.authenticate();
      if (!authSuccess) throw new Error('Authentication failed');
    }
    return emailFunctions.sendBulkEmails(this.gmail, DOCTOR_EMAIL, params);
  }

  async sendBookingConfirmation(params) {
    if (!this.gmail) {
      const authSuccess = await this.authenticate();
      if (!authSuccess) throw new Error('Authentication failed');
    }
    return emailFunctions.sendBookingConfirmation(this.gmail, DOCTOR_EMAIL, params);
  }

  async sendVideoSessionInvitation(params) {
    if (!this.gmail) {
      const authSuccess = await this.authenticate();
      if (!authSuccess) throw new Error('Authentication failed');
    }
    return emailFunctions.sendVideoSessionInvitation(this.gmail, DOCTOR_EMAIL, params);
  }

  async sendSimpleAppointmentConfirmation(params) {
    if (!this.gmail) {
      const authSuccess = await this.authenticate();
      if (!authSuccess) throw new Error('Authentication failed');
    }
    return emailFunctions.sendSimpleAppointmentConfirmation(this.gmail, DOCTOR_EMAIL, params);
  }

  async sendCancellationEmail(params) {
    if (!this.gmail) {
      const authSuccess = await this.authenticate();
      if (!authSuccess) throw new Error('Authentication failed');
    }
    return emailFunctions.sendCancellationEmail(this.gmail, DOCTOR_EMAIL, params);
  }

  async sendAdminPackageNotification(params) {
    if (!this.gmail) {
      const authSuccess = await this.authenticate();
      if (!authSuccess) throw new Error('Authentication failed');
    }
    return emailFunctions.sendAdminPackageNotification(this.gmail, DOCTOR_EMAIL, params);
  }

  async sendAdminBookingNotification(params) {
    if (!this.gmail) {
      const authSuccess = await this.authenticate();
      if (!authSuccess) throw new Error('Authentication failed');
    }
    return emailFunctions.sendAdminBookingNotification(this.gmail, DOCTOR_EMAIL, params);
  }

  async sendBookingLinkEmail(params) {
    if (!this.gmail) {
      const authSuccess = await this.authenticate();
      if (!authSuccess) throw new Error('Authentication failed');
    }
    return emailFunctions.sendBookingLinkEmail(this.gmail, DOCTOR_EMAIL, params);
  }

  async sendSimpleBookingLinkEmail(params) {
    console.log('🔵 [INDEX.JS] sendSimpleBookingLinkEmail called with params:', params);
    console.log('🔵 [INDEX.JS] DOCTOR_EMAIL:', DOCTOR_EMAIL);
    console.log('🔵 [INDEX.JS] this.gmail exists?', !!this.gmail);

    if (!this.gmail) {
      console.log('🔵 [INDEX.JS] Gmail not initialized, authenticating...');
      const authSuccess = await this.authenticate();
      console.log('🔵 [INDEX.JS] Authentication result:', authSuccess);
      if (!authSuccess) throw new Error('Authentication failed');
    }

    console.log('🔵 [INDEX.JS] Calling emailFunctions.sendSimpleBookingLinkEmail...');
    const result = await emailFunctions.sendSimpleBookingLinkEmail(this.gmail, DOCTOR_EMAIL, params);
    console.log('🔵 [INDEX.JS] Email result:', result);
    return result;
  }

  async send24HourReminder(params) {
    if (!this.gmail) {
      const authSuccess = await this.authenticate();
      if (!authSuccess) throw new Error('Authentication failed');
    }
    return emailFunctions.send24HourReminder(this.gmail, DOCTOR_EMAIL, params);
  }

  async createCalendarEvent(params) {
    if (!this.calendar) {
      const authSuccess = await this.authenticate();
      if (!authSuccess) throw new Error('Authentication failed');
    }
    return calendarFunctions.createCalendarEvent(this.calendar, params);
  }

  async deleteCalendarEvent(eventId) {
    if (!this.calendar) {
      const authSuccess = await this.authenticate();
      if (!authSuccess) throw new Error('Authentication failed');
    }
    return calendarFunctions.deleteCalendarEvent(this.calendar, eventId);
  }

  async getCalendarEmbedUrl() {
    return calendarFunctions.getCalendarEmbedUrl();
  }

  async createTherapySessionBooking(params) {
    if (!this.calendar) {
      const authSuccess = await this.authenticate();
      if (!authSuccess) throw new Error('Authentication failed');
    }
    return calendarFunctions.createTherapySessionBooking(this.calendar, params);
  }

  async getUpcomingTherapySessions(limit) {
    if (!this.calendar) {
      const authSuccess = await this.authenticate();
      if (!authSuccess) throw new Error('Authentication failed');
    }
    return sessionFunctions.getUpcomingTherapySessions(this.calendar, limit);
  }

  async getAllTherapySessions(limit) {
    if (!this.calendar) {
      const authSuccess = await this.authenticate();
      if (!authSuccess) throw new Error('Authentication failed');
    }
    return sessionFunctions.getAllTherapySessions(this.calendar, limit);
  }

  async getSessionInfoFromBookingToken(bookingToken) {
    if (!this.calendar) {
      const authSuccess = await this.authenticate();
      if (!authSuccess) throw new Error('Authentication failed');
    }
    return sessionFunctions.getSessionInfoFromBookingToken(this.calendar, bookingToken);
  }

  async getBookingHistoryForToken(bookingToken) {
    if (!this.calendar) {
      const authSuccess = await this.authenticate();
      if (!authSuccess) throw new Error('Authentication failed');
    }
    return sessionFunctions.getBookingHistoryForToken(this.calendar, bookingToken);
  }

  getSessionCountFromPackage(sessionPackage) {
    return sessionFunctions.getSessionCountFromPackage(sessionPackage);
  }

  async getAvailableTimeSlots(startDate, endDate, useIntelligentFiltering) {
    if (!this.calendar) {
      const authSuccess = await this.authenticate();
      if (!authSuccess) throw new Error('Authentication failed');
    }
    return availabilityFunctions.getAvailableTimeSlots(this.calendar, startDate, endDate, useIntelligentFiltering);
  }

  applyIntelligentSlotFiltering(slots) {
    return availabilityFunctions.applyIntelligentSlotFiltering(slots);
  }

  canSlotAccommodateSession(daySlots, slot, durationMinutes) {
    return availabilityFunctions.canSlotAccommodateSession(daySlots, slot, durationMinutes);
  }

  async getAvailabilityFromCalendar(daysAhead) {
    if (!this.calendar) {
      const authSuccess = await this.authenticate();
      if (!authSuccess) throw new Error('Authentication failed');
    }
    return availabilityFunctions.getAvailabilityFromCalendar(this.calendar, daysAhead);
  }

  parseAvailabilityFromEvents(events) {
    return availabilityFunctions.parseAvailabilityFromEvents(events);
  }

  getSlotStatus(events, date, time) {
    return availabilityFunctions.getSlotStatus(events, date, time);
  }

  getExtraSlotsFromEvents(events) {
    return availabilityFunctions.getExtraSlotsFromEvents(events);
  }

  async blockTimeSlot(params) {
    if (!this.calendar) {
      const authSuccess = await this.authenticate();
      if (!authSuccess) throw new Error('Authentication failed');
    }
    return availabilityFunctions.blockTimeSlot(this.calendar, params);
  }

  async unblockTimeSlot(params) {
    if (!this.calendar) {
      const authSuccess = await this.authenticate();
      if (!authSuccess) throw new Error('Authentication failed');
    }
    return availabilityFunctions.unblockTimeSlot(this.calendar, params);
  }

  async blockEntireDay(params) {
    if (!this.calendar) {
      const authSuccess = await this.authenticate();
      if (!authSuccess) throw new Error('Authentication failed');
    }
    return availabilityFunctions.blockEntireDay(this.calendar, params);
  }

  async blockVacation(params) {
    if (!this.calendar) {
      const authSuccess = await this.authenticate();
      if (!authSuccess) throw new Error('Authentication failed');
    }
    return availabilityFunctions.blockVacation(this.calendar, params);
  }

  async addExtraTimeSlot(params) {
    if (!this.calendar) {
      const authSuccess = await this.authenticate();
      if (!authSuccess) throw new Error('Authentication failed');
    }
    return availabilityFunctions.addExtraTimeSlot(this.calendar, params);
  }

  async modifyWorkingDay(params) {
    if (!this.calendar) {
      const authSuccess = await this.authenticate();
      if (!authSuccess) throw new Error('Authentication failed');
    }
    return availabilityFunctions.modifyWorkingDay(this.calendar, params);
  }

  async addAvailabilitySlot(params) {
    if (!this.calendar) {
      const authSuccess = await this.authenticate();
      if (!authSuccess) throw new Error('Authentication failed');
    }
    return availabilityFunctions.addAvailabilitySlot(this.calendar, params);
  }

  async removeAvailabilitySlot(params) {
    if (!this.calendar) {
      const authSuccess = await this.authenticate();
      if (!authSuccess) throw new Error('Authentication failed');
    }
    return availabilityFunctions.removeAvailabilitySlot(this.calendar, params);
  }

  async createPatientRecord(params) {
    if (!this.calendar) {
      const authSuccess = await this.authenticate();
      if (!authSuccess) throw new Error('Authentication failed');
    }
    return patientFunctions.createPatientRecord(this.calendar, params);
  }

  async checkExistingPatient(email) {
    if (!this.calendar) {
      const authSuccess = await this.authenticate();
      if (!authSuccess) throw new Error('Authentication failed');
    }
    return patientFunctions.checkExistingPatient(this.calendar, email);
  }

  async deleteAllTestData() {
    if (!this.calendar) {
      const authSuccess = await this.authenticate();
      if (!authSuccess) throw new Error('Authentication failed');
    }
    return patientFunctions.deleteAllTestData(this.calendar);
  }
}

const googleWorkspaceService = new GoogleWorkspaceService();
module.exports = googleWorkspaceService;