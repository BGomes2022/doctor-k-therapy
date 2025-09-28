import { format } from 'date-fns'

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
    return 'Europe/Lisbon' // Default fallback to therapist timezone
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

// Convert Portugal time to user's timezone using native JavaScript
export function convertToUserTime(portugalDateTime: Date, userTimezone: string): Date {
  try {
    // Use Intl API to get the time in the target timezone
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: userTimezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    })

    const parts = formatter.formatToParts(portugalDateTime)
    const getValue = (type: string) => parts.find(p => p.type === type)?.value || '0'

    return new Date(
      parseInt(getValue('year')),
      parseInt(getValue('month')) - 1,
      parseInt(getValue('day')),
      parseInt(getValue('hour')),
      parseInt(getValue('minute')),
      parseInt(getValue('second'))
    )
  } catch (error) {
    console.error('Error converting to user time:', error)
    return portugalDateTime
  }
}

// Convert user's local time to Portugal time
export function convertUserTimeToPortugal(userDateTime: Date, userTimezone: string): Date {
  try {
    // Create a date string in user's timezone
    const userTimeStr = userDateTime.toLocaleString('en-US', {
      timeZone: userTimezone,
      hour12: false
    })

    // Parse it back treating it as Portugal time
    const portugalDate = new Date(userTimeStr)
    return portugalDate
  } catch (error) {
    console.error('Error converting to Portugal time:', error)
    return userDateTime
  }
}

// Convert time string (HH:MM) from one timezone to another on a specific date
export function convertTimeStringBetweenTimezones(
  dateStr: string,
  timeStr: string,
  fromTimezone: string,
  toTimezone: string
): string {
  try {
    // Create a Date object representing the time in the source timezone
    // We need to create it as if it's in the source timezone, then convert
    const [hours, minutes] = timeStr.split(':').map(Number)

    // Create a date object for midnight on the given date
    const baseDate = new Date(dateStr + 'T00:00:00')
    baseDate.setHours(hours, minutes, 0, 0)

    // Now treat this Date as if it represents time in the fromTimezone
    // Convert it to the target timezone using our existing function
    const convertedDate = convertToUserTime(baseDate, toTimezone)

    // Format as HH:MM
    const convertedHours = convertedDate.getHours().toString().padStart(2, '0')
    const convertedMinutes = convertedDate.getMinutes().toString().padStart(2, '0')

    return `${convertedHours}:${convertedMinutes}`
  } catch (error) {
    console.error('Error converting time string:', error)
    return timeStr
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