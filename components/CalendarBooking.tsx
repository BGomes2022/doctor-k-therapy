"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface TimeSlot {
  time: string
  available: boolean
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

export default function CalendarBooking({ language, bookingToken, sessionPackage, onBookingComplete, sessionInfo }: CalendarBookingProps) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = useState<string>("")
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([])
  const [bookedDates, setBookedDates] = useState<string[]>([])
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [isSubmitting, setIsSubmitting] = useState(false)

  const timeSlots = ["19:00", "21:00", "22:00", "23:00"]

  useEffect(() => {
    fetchBookedDates()
  }, [])

  useEffect(() => {
    if (selectedDate) {
      checkAvailableSlots(selectedDate)
    }
  }, [selectedDate])

  const fetchBookedDates = async () => {
    try {
      const response = await fetch('/api/bookings/list')
      const data = await response.json()
      setBookedDates(data.bookedDates || [])
    } catch (error) {
      console.error('Error fetching booked dates:', error)
    }
  }

  const checkAvailableSlots = async (date: Date) => {
    try {
      const dateStr = date.toISOString().split('T')[0]
      const response = await fetch(`/api/bookings/check?date=${dateStr}`)
      const data = await response.json()
      
      const slots = timeSlots.map(time => ({
        time,
        available: !data.bookedSlots.includes(time)
      }))
      setAvailableSlots(slots)
    } catch (error) {
      console.error('Error checking slots:', error)
      setAvailableSlots(timeSlots.map(time => ({ time, available: true })))
    }
  }

  const isDayAvailable = (date: Date) => {
    const day = date.getDay()
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    // Only Tuesday (2) and Thursday (4) are available
    if (day !== 2 && day !== 4) return false
    
    // Can't book past dates
    if (date < today) return false
    
    // Can't book more than 90 days ahead
    const maxDate = new Date()
    maxDate.setDate(maxDate.getDate() + 90)
    if (date > maxDate) return false
    
    return true
  }

  const getDateStatus = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0]
    const bookedCount = bookedDates.filter(d => d.startsWith(dateStr)).length
    
    if (!isDayAvailable(date)) return "unavailable"
    if (bookedCount >= 4) return "full"
    if (bookedCount > 0) return "partial"
    return "available"
  }

  const handleDateClick = (date: Date) => {
    if (isDayAvailable(date)) {
      setSelectedDate(date)
      setSelectedTime("")
    }
  }

  const handleBooking = async () => {
    if (!selectedDate || !selectedTime || !bookingToken) return

    setIsSubmitting(true)
    try {
      const response = await fetch('/api/bookings/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingToken,
          date: selectedDate.toISOString().split('T')[0],
          time: selectedTime,
          sessionPackage
        })
      })

      const result = await response.json()
      
      if (result.success) {
        onBookingComplete({
          date: selectedDate.toISOString().split('T')[0],
          time: selectedTime,
          bookingId: result.bookingId,
          meetLink: result.meetLink,
          sessionNumber: result.sessionNumber,
          sessionsRemaining: result.sessionsRemaining,
          totalSessions: result.totalSessions,
          message: result.message
        })
      } else {
        alert(language === "en" ? "Booking failed. Please try again." : "Prenotazione fallita. Riprova.")
      }
    } catch (error) {
      console.error('Booking error:', error)
      alert(language === "en" ? "An error occurred." : "Si è verificato un errore.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderCalendar = () => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startOffset = firstDay.getDay()
    
    const days = []
    
    // Empty cells for alignment
    for (let i = 0; i < startOffset; i++) {
      days.push(<div key={`empty-${i}`} className="h-10" />)
    }
    
    // Calendar days
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const date = new Date(year, month, day)
      const status = getDateStatus(date)
      const isSelected = selectedDate?.toDateString() === date.toDateString()
      
      days.push(
        <button
          key={day}
          onClick={() => handleDateClick(date)}
          disabled={status === "unavailable"}
          className={`
            h-10 rounded-lg text-sm font-medium transition-all
            ${status === "unavailable" ? "bg-gray-100 text-gray-400 cursor-not-allowed" : ""}
            ${status === "available" ? "bg-green-100 text-green-700 hover:bg-green-200" : ""}
            ${status === "partial" ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-200" : ""}
            ${status === "full" ? "bg-red-100 text-red-700" : ""}
            ${isSelected ? "ring-2 ring-stone-600" : ""}
          `}
        >
          {day}
        </button>
      )
    }
    
    return days
  }

  const monthNames = {
    en: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
    it: ["Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno", "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"]
  }

  const content = {
    en: {
      title: "Select Your Session Date & Time",
      selectDate: "Select a date",
      selectTime: "Select a time",
      availableOnly: "Sessions available only on Tuesdays and Thursdays",
      legend: {
        available: "Available",
        partial: "Partially booked",
        full: "Fully booked"
      },
      confirm: "Confirm Booking",
      processing: "Processing..."
    },
    it: {
      title: "Seleziona Data e Ora della Sessione",
      selectDate: "Seleziona una data",
      selectTime: "Seleziona un orario",
      availableOnly: "Sessioni disponibili solo martedì e giovedì",
      legend: {
        available: "Disponibile",
        partial: "Parzialmente prenotato",
        full: "Completo"
      },
      confirm: "Conferma Prenotazione",
      processing: "Elaborazione..."
    }
  }

  const t = content[language]

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-light text-stone-800 mb-4">{t.title}</h2>
        <p className="text-stone-600">{t.availableOnly}</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Calendar */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-xl font-medium text-stone-800 mb-4">{t.selectDate}</h3>
            
            {/* Month Navigation */}
            <div className="flex justify-between items-center mb-4">
              <button
                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                className="p-2 hover:bg-stone-100 rounded"
              >
                ←
              </button>
              <h4 className="text-lg font-medium">
                {monthNames[language][currentMonth.getMonth()]} {currentMonth.getFullYear()}
              </h4>
              <button
                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                className="p-2 hover:bg-stone-100 rounded"
              >
                →
              </button>
            </div>

            {/* Days of week */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {["S", "M", "T", "W", "T", "F", "S"].map((day, i) => (
                <div key={i} className="text-center text-xs font-medium text-stone-600 h-8 flex items-center justify-center">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
              {renderCalendar()}
            </div>

            {/* Legend */}
            <div className="mt-4 flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-100 rounded" />
                <span>{t.legend.available}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-yellow-100 rounded" />
                <span>{t.legend.partial}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-100 rounded" />
                <span>{t.legend.full}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Time Selection */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-xl font-medium text-stone-800 mb-4">{t.selectTime}</h3>
            
            {selectedDate ? (
              <div>
                <p className="text-stone-600 mb-4">
                  {selectedDate.toLocaleDateString(language === "en" ? "en-US" : "it-IT", {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>

                <div className="space-y-2">
                  {availableSlots.map((slot) => (
                    <button
                      key={slot.time}
                      onClick={() => setSelectedTime(slot.time)}
                      disabled={!slot.available}
                      className={`
                        w-full p-3 rounded-lg transition-all
                        ${!slot.available ? "bg-gray-100 text-gray-400 cursor-not-allowed" : ""}
                        ${slot.available && selectedTime === slot.time ? "bg-stone-600 text-white" : ""}
                        ${slot.available && selectedTime !== slot.time ? "bg-stone-100 hover:bg-stone-200" : ""}
                      `}
                    >
                      {slot.time} {!slot.available && "(Booked)"}
                    </button>
                  ))}
                </div>

                {selectedTime && (
                  <Button
                    onClick={handleBooking}
                    disabled={isSubmitting}
                    className="w-full mt-6 bg-stone-600 hover:bg-stone-700 text-white"
                  >
                    {isSubmitting ? t.processing : t.confirm}
                  </Button>
                )}
              </div>
            ) : (
              <p className="text-stone-500 text-center py-8">
                {language === "en" ? "Please select a date first" : "Seleziona prima una data"}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}