import { format } from 'date-fns'
import { utcToZonedTime, zonedTimeToUtc } from 'date-fns-tz'

// Dr. K's timezone (Portugal)
export const THERAPIST_TIMEZONE = 'Europe/Lisbon'

// Common timezones for quick selection
export const COMMON_TIMEZONES = [
  { label: 'Europe/Berlin (CET)', value: 'Europe/Berlin', offset: '+01:00' },
  { label: 'Europe/Paris (CET)', value: 'Europe/Paris', offset: '+01:00' },
  { label: 'Europe/London (GMT)', value: 'Europe/London', offset: '+00:00' },
  { label: 'Europe/Lisbon (WET)', value: 'Europe/Lisbon', offset: '+00:00' },
  { label: 'America/New York (EST)', value: 'America/New_York', offset: '-05:00' },
  { label: 'America/Chicago (CST)', value: 'America/Chicago', offset: '-06:00' },
  { label: 'America/Los Angeles (PST)', value: 'America/Los_Angeles', offset: '-08:00' },
  { label: 'Asia/Tokyo (JST)', value: 'Asia/Tokyo', offset: '+09:00' },
  { label: 'Asia/Shanghai (CST)', value: 'Asia/Shanghai', offset: '+08:00' },
  { label: 'Australia/Sydney (AEDT)', value: 'Australia/Sydney', offset: '+11:00' },
]

// Detect user's timezone
export function detectUserTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone
  } catch {
    return 'Europe/Berlin' // Default fallback
  }
}

// Get timezone from cookie or detect
export function getUserTimezone(): string {
  if (typeof window === 'undefined') return THERAPIST_TIMEZONE
  
  // Check cookie first
  const cookieTimezone = document.cookie
    .split('; ')
    .find(row => row.startsWith('userTimezone='))
    ?.split('=')[1]
  
  if (cookieTimezone) {
    return decodeURIComponent(cookieTimezone)
  }
  
  // Otherwise detect
  return detectUserTimezone()
}

// Save timezone to cookie
export function saveUserTimezone(timezone: string) {
  const maxAge = 365 * 24 * 60 * 60 // 1 year
  document.cookie = `userTimezone=${encodeURIComponent(timezone)}; max-age=${maxAge}; path=/; SameSite=Lax`
}

// Convert Portugal time to user's timezone - safe fallback
export function convertToUserTime(portugalDateTime: Date, userTimezone: string): Date {
  try {
    // For now, just calculate timezone offset difference
    const portugalOffset = new Date().toLocaleString('en', {timeZone: THERAPIST_TIMEZONE})
    const userOffset = new Date().toLocaleString('en', {timeZone: userTimezone})

    // Simple timezone conversion based on hour difference
    if (userTimezone === 'Europe/Berlin') {
      // Berlin is +1 hour from Portugal
      const newDate = new Date(portugalDateTime)
      newDate.setHours(newDate.getHours() + 1)
      return newDate
    }

    // Default: return original time for other timezones
    return portugalDateTime
  } catch {
    return portugalDateTime
  }
}

// Format time for display - safe version
export function formatTimeForDisplay(date: Date, timezone: string): string {
  try {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZone: timezone
    })
  } catch {
    return format(date, 'h:mm a')
  }
}

// Format date and time for display - safe version
export function formatDateTimeForDisplay(date: Date, timezone: string): string {
  try {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      timeZone: timezone
    }) + ' at ' + formatTimeForDisplay(date, timezone)
  } catch {
    return format(date, 'EEE, MMM d \'at\' h:mm a')
  }
}

// Get timezone abbreviation (e.g., CET, EST)
export function getTimezoneAbbreviation(timezone: string): string {
  const date = new Date()
  const formatted = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    timeZoneName: 'short'
  }).format(date)
  
  // Extract the abbreviation from the formatted string
  const match = formatted.match(/[A-Z]{2,5}$/)
  return match ? match[0] : timezone.split('/')[1] || timezone
}

// Get friendly timezone name
export function getFriendlyTimezoneName(timezone: string): string {
  const parts = timezone.split('/')
  if (parts.length === 2) {
    return parts[1].replace(/_/g, ' ')
  }
  return timezone
}