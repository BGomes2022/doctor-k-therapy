"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, Calendar, Clock, CheckCircle, Globe, MapPin } from "lucide-react"
import { 
  getUserTimezone, 
  saveUserTimezone, 
  convertToUserTime,
  formatTimeForDisplay,
  getTimezoneAbbreviation,
  getFriendlyTimezoneName,
  COMMON_TIMEZONES,
  THERAPIST_TIMEZONE
} from "@/utils/timezone"

interface TimeSlot {
  time: string
  start: string
  end: string
}

interface AvailableDate {
  date: string
  dayOfWeek: string
  slots: TimeSlot[]
}

interface CalendarBookingProps {
  language: "en" | "it"
  bookingToken: string
  sessionPackage?: any
  onBookingComplete: (bookingDetails: any) => void
  sessionInfo?: {
    current: number
    total: number
    remaining: number
  }
}

export default function CalendarBooking({ 
  language, 
  bookingToken, 
  sessionPackage, 
  onBookingComplete, 
  sessionInfo 
}: CalendarBookingProps) {
  const [selectedDate, setSelectedDate] = useState<string>("")
  const [selectedTime, setSelectedTime] = useState<string>("")
  const [availableDates, setAvailableDates] = useState<AvailableDate[]>([])
  const [currentWeekStart, setCurrentWeekStart] = useState(new Date())
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [userTimezone, setUserTimezone] = useState<string>("")

  const texts = {
    en: {
      title: "Select Your Appointment Time",
      noSessions: "No sessions remaining",
      selectDate: "Select a date",
      selectTime: "Select a time",
      bookSession: "Book Session",
      loading: "Loading available times...",
      error: "Failed to load available times",
      confirmBooking: "Confirm Booking",
      sessionInfo: "Session {{current}} of {{total}}",
      duration: "50 minutes",
      previousWeek: "Previous week",
      nextWeek: "Next week",
      noAvailableTimes: "No available times in this period",
      timezoneInfo: "Times shown in your local timezone",
      originalTime: "Portugal time"
    },
    it: {
      title: "Seleziona l'orario del tuo appuntamento",
      noSessions: "Nessuna sessione rimanente",
      selectDate: "Seleziona una data",
      selectTime: "Seleziona un orario",
      bookSession: "Prenota Sessione",
      loading: "Caricamento orari disponibili...",
      error: "Impossibile caricare gli orari disponibili",
      confirmBooking: "Conferma Prenotazione",
      sessionInfo: "Sessione {{current}} di {{total}}",
      duration: "50 minuti",
      previousWeek: "Settimana precedente",
      nextWeek: "Settimana successiva",
      noAvailableTimes: "Nessun orario disponibile in questo periodo",
      timezoneInfo: "Orari mostrati nel tuo fuso orario locale",
      originalTime: "Ora del Portogallo"
    }
  }

  const t = texts[language]

  useEffect(() => {
    // Get user's timezone (from cookie or auto-detect)
    const tz = getUserTimezone()
    setUserTimezone(tz)
  }, [])

  useEffect(() => {
    fetchAvailableTimes()
  }, [currentWeekStart])

  const fetchAvailableTimes = async () => {
    try {
      setLoading(true)
      setError("")
      
      // Calculate date range for current 2-week period
      const startDate = new Date(currentWeekStart)
      const endDate = new Date(currentWeekStart)
      endDate.setDate(endDate.getDate() + 13) // 2 weeks
      
      const response = await fetch('/api/bookings/available-times', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookingToken,
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0]
        }),
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch available times')
      }
      
      const data = await response.json()
      
      if (data.success) {
        setAvailableDates(data.availableDates)
      } else {
        throw new Error(data.error || 'Unknown error')
      }
    } catch (error: any) {
      console.error('Error fetching available times:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleBooking = async () => {
    if (!selectedDate || !selectedTime) return
    
    try {
      setIsSubmitting(true)
      
      const response = await fetch('/api/bookings/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookingToken,
          selectedDate,
          selectedTime
        }),
      })

      const data = await response.json()

      if (data.success) {
        onBookingComplete(data.booking)
      } else {
        throw new Error(data.error || 'Booking failed')
      }
    } catch (error: any) {
      console.error('Booking error:', error)
      setError(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentWeekStart)
    newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7))
    setCurrentWeekStart(newDate)
    setSelectedDate("")
    setSelectedTime("")
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString(language === 'it' ? 'it-IT' : 'en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatTime = (timeStr: string, showOriginal: boolean = false) => {
    // If no timezone offset, return original time
    if (timezoneOffset === 0) {
      return timeStr
    }
    
    // Parse the Portugal time (HH:MM format)
    const [hours, minutes] = timeStr.split(':').map(Number)
    
    // Create a date object for today
    const date = new Date()
    date.setHours(hours, minutes, 0, 0)
    
    // Add timezone offset to get user's local time
    date.setHours(date.getHours() + timezoneOffset)
    
    // Format the local time
    const localHours = date.getHours()
    const localMinutes = date.getMinutes()
    const localTimeStr = `${localHours.toString().padStart(2, '0')}:${localMinutes.toString().padStart(2, '0')}`
    
    if (showOriginal) {
      return `${localTimeStr} (${timeStr} ${t.originalTime})`
    }
    
    return localTimeStr
  }

  const getTimezoneAbbreviation = () => {
    try {
      const date = new Date()
      const timeStr = date.toLocaleTimeString('en-US', { 
        timeZoneName: 'short',
        timeZone: userTimezone 
      })
      return timeStr.split(' ').pop() || userTimezone
    } catch {
      return userTimezone
    }
  }

  // Check if user has remaining sessions
  if (sessionInfo && sessionInfo.remaining <= 0) {
    return (
      <Card className="p-6">
        <div className="text-center">
          <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">{t.noSessions}</h3>
          <p className="text-gray-600">
            {t.sessionInfo.replace('{{current}}', sessionInfo.current.toString()).replace('{{total}}', sessionInfo.total.toString())}
          </p>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{t.title}</h2>
        
        {/* Timezone indicator (read-only) */}
        {userTimezone && (
          <div className="mb-4">
            <div className="flex items-center justify-center gap-2">
              <MapPin className="h-4 w-4 text-blue-600" />
              <span className="text-sm text-gray-600">
                Your timezone: <strong>{getFriendlyTimezoneName(userTimezone)}</strong> ({getTimezoneAbbreviation(userTimezone)})
              </span>
            </div>
          </div>
        )}
        
        {sessionInfo && (
          <p className="text-gray-600">
            {t.sessionInfo.replace('{{current}}', sessionInfo.current.toString()).replace('{{total}}', sessionInfo.total.toString())}
          </p>
        )}
      </div>

      {/* Week Navigation */}
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigateWeek('prev')}
          disabled={loading}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          {t.previousWeek}
        </Button>
        
        <div className="text-center">
          <div className="text-sm text-gray-600">
            {currentWeekStart.toLocaleDateString(language === 'it' ? 'it-IT' : 'en-US', {
              month: 'long',
              year: 'numeric'
            })}
          </div>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigateWeek('next')}
          disabled={loading}
        >
          {t.nextWeek}
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>

      {loading && (
        <Card className="p-8">
          <div className="text-center">
            <Clock className="mx-auto h-12 w-12 text-blue-500 animate-spin mb-4" />
            <p className="text-gray-600">{t.loading}</p>
          </div>
        </Card>
      )}

      {error && (
        <Card className="p-6 border-red-200 bg-red-50">
          <div className="text-center text-red-600">
            <p>{t.error}</p>
            <p className="text-sm mt-2">{error}</p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={fetchAvailableTimes}
              className="mt-4"
            >
              Retry
            </Button>
          </div>
        </Card>
      )}

      {!loading && !error && (
        <>
          {/* Available Dates */}
          {availableDates.length === 0 ? (
            <Card className="p-6">
              <div className="text-center text-gray-600">
                <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p>{t.noAvailableTimes}</p>
              </div>
            </Card>
          ) : (
            <div className="grid gap-4">
              {availableDates.map((dateInfo) => (
                <Card key={dateInfo.date} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {formatDate(dateInfo.date)}
                        </h3>
                        <p className="text-sm text-gray-600">{dateInfo.dayOfWeek}</p>
                      </div>
                      <div className="text-sm text-gray-500">
                        {dateInfo.slots.length} {dateInfo.slots.length === 1 ? 'slot' : 'slots'}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {dateInfo.slots.map((slot) => (
                        <Button
                          key={slot.time}
                          variant={selectedDate === dateInfo.date && selectedTime === slot.time ? "default" : "outline"}
                          size="sm"
                          onClick={() => {
                            setSelectedDate(dateInfo.date)
                            setSelectedTime(slot.time)
                          }}
                          className="justify-center relative flex flex-col py-2"
                        >
                          <span className="text-sm font-medium">
                            {(() => {
                              // Convert Portugal time to user's timezone
                              const [hours, minutes] = slot.time.split(':').map(Number)
                              const portugalTime = new Date(dateInfo.date)
                              portugalTime.setHours(hours, minutes, 0, 0)
                              const userTime = convertToUserTime(portugalTime, userTimezone)
                              return formatTimeForDisplay(userTime, userTimezone)
                            })()}
                          </span>
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Booking Confirmation */}
          {selectedDate && selectedTime && (
            <Card className="p-6 border-green-200 bg-green-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium text-green-900">
                      {formatDate(selectedDate)} at {(() => {
                        const [hours, minutes] = selectedTime.split(':').map(Number)
                        const portugalTime = new Date(selectedDate)
                        portugalTime.setHours(hours, minutes, 0, 0)
                        const userTime = convertToUserTime(portugalTime, userTimezone)
                        return formatTimeForDisplay(userTime, userTimezone)
                      })()}
                    </p>
                    <p className="text-sm text-green-700">{t.duration}</p>
                  </div>
                </div>
                
                <Button
                  onClick={handleBooking}
                  disabled={isSubmitting}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isSubmitting ? 'Booking...' : t.confirmBooking}
                </Button>
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  )
}