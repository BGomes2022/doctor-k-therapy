// Local booking cache to handle Google Calendar API sync delays
// This stores manual bookings immediately so they appear in the dashboard
// while waiting for Google Calendar API sync (5-30 minutes delay)

const fs = require('fs').promises
const path = require('path')

class BookingCache {
  constructor() {
    this.cacheFile = path.join(process.cwd(), 'cache', 'pending-bookings.json')
    this.maxAge = 24 * 60 * 60 * 1000 // 24 hours in milliseconds
  }

  async ensureCacheDir() {
    try {
      const cacheDir = path.dirname(this.cacheFile)
      await fs.mkdir(cacheDir, { recursive: true })
    } catch (error) {
      console.error('Failed to create cache directory:', error)
    }
  }

  async loadCache() {
    try {
      await this.ensureCacheDir()
      const data = await fs.readFile(this.cacheFile, 'utf8')
      const cache = JSON.parse(data)

      // Clean up expired entries
      const now = Date.now()
      const validBookings = cache.filter(booking => {
        const age = now - booking.cachedAt
        return age < this.maxAge
      })

      if (validBookings.length !== cache.length) {
        await this.saveCache(validBookings)
      }

      return validBookings
    } catch (error) {
      // File doesn't exist or is invalid - return empty array
      return []
    }
  }

  async saveCache(bookings) {
    try {
      await this.ensureCacheDir()
      await fs.writeFile(this.cacheFile, JSON.stringify(bookings, null, 2))
    } catch (error) {
      console.error('Failed to save booking cache:', error)
    }
  }

  async addBooking(booking) {
    try {
      const cache = await this.loadCache()

      // Add timestamp
      const cachedBooking = {
        ...booking,
        cachedAt: Date.now(),
        isFromCache: true
      }

      cache.push(cachedBooking)
      await this.saveCache(cache)

      console.log('✅ Booking added to cache:', booking.bookingToken)
      return true
    } catch (error) {
      console.error('Failed to add booking to cache:', error)
      return false
    }
  }

  async removeBooking(eventId) {
    try {
      const cache = await this.loadCache()
      const filteredCache = cache.filter(booking => booking.eventId !== eventId)

      if (filteredCache.length !== cache.length) {
        await this.saveCache(filteredCache)
        console.log('✅ Booking removed from cache:', eventId)
        return true
      }

      return false
    } catch (error) {
      console.error('Failed to remove booking from cache:', error)
      return false
    }
  }

  async getCachedBookings() {
    try {
      const cache = await this.loadCache()

      // Convert to session format expected by dashboard
      const sessions = cache.map(booking => ({
        eventId: booking.eventId,
        summary: `Therapy Session - ${booking.patientName}`,
        start: booking.startDateTime,
        end: booking.endDateTime,
        patientEmail: booking.patientEmail,
        patientName: booking.patientName,
        sessionNumber: 1,
        totalSessions: booking.totalSessions || 1,
        bookingToken: booking.bookingToken,
        meetLink: booking.meetLink,
        htmlLink: booking.calendarLink,
        sessionPackage: booking.sessionPackage || null,
        medicalData: booking.medicalData || null,
        isPatientRecord: false,
        isFromCache: true, // Flag to identify cached items
        cachedAt: booking.cachedAt
      }))

      console.log(`📋 Retrieved ${sessions.length} cached bookings`)
      return sessions
    } catch (error) {
      console.error('Failed to get cached bookings:', error)
      return []
    }
  }

  async clearExpiredBookings() {
    try {
      const cache = await this.loadCache()
      const now = Date.now()
      const validBookings = cache.filter(booking => {
        const age = now - booking.cachedAt
        return age < this.maxAge
      })

      if (validBookings.length !== cache.length) {
        await this.saveCache(validBookings)
        console.log(`🧹 Cleared ${cache.length - validBookings.length} expired cached bookings`)
      }

      return validBookings.length
    } catch (error) {
      console.error('Failed to clear expired bookings:', error)
      return 0
    }
  }
}

module.exports = new BookingCache()