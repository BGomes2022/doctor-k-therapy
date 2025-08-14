"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Clock, Stethoscope, User, Mail, Phone, ChevronDown, ChevronUp, Heart, Brain, AlertCircle, Settings, Video, Plus, X, Check, AlertTriangle, ChevronLeft, ChevronRight, Trash2, MoreVertical, Edit, Trash } from "lucide-react"

interface BookingData {
  bookingId: string
  date: string
  time: string
  sessionPackage: any
  medicalData?: any
}

interface PatientData {
  bookingToken: string
  userId: string
  medicalFormData: any
  sessionPackage: any
  createdAt: string
  therapistNotes?: string
}

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState("")
  const [bookings, setBookings] = useState<BookingData[]>([])
  const [patients, setPatients] = useState<PatientData[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [expandedPatients, setExpandedPatients] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState<"overview" | "schedule">("overview")
  const [showAvailabilityModal, setShowAvailabilityModal] = useState(false)
  const [showVacationModal, setShowVacationModal] = useState(false)
  const [showExtraSlotModal, setShowExtraSlotModal] = useState(false)
  const [showRecurringModal, setShowRecurringModal] = useState(false)
  const [recurringData, setRecurringData] = useState({
    dayOfWeek: 'Tuesday',
    startTime: '09:00',
    endTime: '17:00',
    action: 'block',
    duration: 4
  })
  const [vacationData, setVacationData] = useState({
    startDate: "",
    endDate: "",
    reason: ""
  })
  const [extraSlotData, setExtraSlotData] = useState({
    date: "",
    time: "",
    reason: ""
  })
  const [availability, setAvailability] = useState<any[]>([])
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [showDayDetailModal, setShowDayDetailModal] = useState(false)
  const [selectedDayData, setSelectedDayData] = useState<any>(null)
  const [calendarView, setCalendarView] = useState<'month' | 'week'>('month')
  const [selectedSlots, setSelectedSlots] = useState<string[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [dragStartSlot, setDragStartSlot] = useState<string | null>(null)
  const [dragEndSlot, setDragEndSlot] = useState<string | null>(null)
  const [filterMode, setFilterMode] = useState<'all' | 'available' | 'booked'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [quickBlockDays, setQuickBlockDays] = useState(7)
  const [inlineEditDate, setInlineEditDate] = useState<string | null>(null)
  const [inlineEditPosition, setInlineEditPosition] = useState({ x: 0, y: 0 })
  const [availabilityData, setAvailabilityData] = useState({
    date: "",
    time: "",
    available: true,
    reason: ""
  })
  const [openMenuBookingId, setOpenMenuBookingId] = useState<string | null>(null)
  const [showRescheduleModal, setShowRescheduleModal] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState<BookingData | null>(null)
  const [rescheduleData, setRescheduleData] = useState({
    date: "",
    time: "",
    message: ""
  })
  const [cancelData, setCancelData] = useState({
    reason: "",
    message: "",
    suggestAlternative: false,
    alternativeDate: "",
    alternativeTime: ""
  })
  const [editingNotes, setEditingNotes] = useState<string | null>(null)
  const [notesContent, setNotesContent] = useState("")
  const [showNewPatientModal, setShowNewPatientModal] = useState(false)
  const [newPatientData, setNewPatientData] = useState({
    fullName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    emergencyContactRelation: "",
    doctorName: "",
    doctorPhone: "",
    currentMedications: "",
    allergies: "",
    medicalConditions: "",
    currentProblems: "",
    therapyHistory: "",
    therapyGoals: "",
    suicidalThoughts: "",
    substanceUse: "",
    sessionPackage: {
      name: "Manual Entry",
      price: 0
    }
  })

  // Admin password from environment variable
  const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "therapy2024"

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true)
      setError("")
      fetchData()
    } else {
      setError("Incorrect password")
    }
  }

  const fetchData = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/data')
      const data = await response.json()
      
      if (data.success) {
        setBookings(data.bookings || [])
        setPatients(data.patients || [])
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      setError('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const fetchAvailability = async () => {
    try {
      const response = await fetch('/api/admin/availability')
      const data = await response.json()
      
      if (data.success) {
        setAvailability(data.availability || [])
      }
    } catch (error) {
      console.error('Error fetching availability:', error)
    }
  }

  const togglePatientExpand = (bookingId: string) => {
    setExpandedPatients(prev => 
      prev.includes(bookingId) 
        ? prev.filter(id => id !== bookingId)
        : [...prev, bookingId]
    )
  }

  const getSessionsRemaining = (patient: PatientData) => {
    // Use the correct data from backend instead of hardcoded logic
    return patient.sessionsRemaining || 0
  }

  const handleAvailabilityUpdate = async () => {
    if (!availabilityData.date || !availabilityData.time) {
      console.log('Please select date and time')
      return
    }

    try {
      const response = await fetch('/api/admin/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(availabilityData)
      })

      const result = await response.json()
      
      if (result.success) {
        console.log('Availability updated successfully!')
        setShowAvailabilityModal(false)
        setAvailabilityData({
          date: "",
          time: "",
          available: true,
          reason: ""
        })
        fetchAvailability()
      } else {
        console.error(result.error || 'Failed to update availability')
      }
    } catch (error) {
      console.error('Availability update error:', error)
      console.error('Failed to update availability')
    }
  }

  // Helper functions for calendar
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    // Convert Sunday=0 to Monday=0 format (Sunday becomes 6, Monday becomes 0)
    const startDay = (firstDay.getDay() + 6) % 7
    
    const days = []
    
    // Add empty cells for days before month starts
    for (let i = 0; i < startDay; i++) {
      days.push(null)
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day))
    }
    
    return days
  }

  const getDateStatus = (date: Date) => {
    const dateStr = getLocalDateString(date)
    const dayOfWeek = date.getDay()
    
    // Check if it's a booking
    const hasBooking = bookings.some(b => b.date === dateStr)
    
    // Check for custom availability
    const hasAvailability = availability.some(a => a.date === dateStr && a.available)
    
    if (hasBooking) return 'booked'
    if (hasAvailability) return 'available'
    return 'unavailable'
  }

  const getDayHourlySlots = (dateStr: string) => {
    const slots = []
    
    // Only show available or booked slots from the calendar
    const daySlots = availability.filter(a => a.date === dateStr)
    const dayBookings = bookings.filter(b => b.date === dateStr)
    
    daySlots.forEach(slot => {
      const booking = dayBookings.find(b => b.time === slot.time)
      
      let status = slot.available ? 'available' : 'blocked'
      let details = slot.reason || (slot.available ? 'Available for booking' : 'Not available')
      
      if (booking) {
        status = 'booked'
        details = `Booked: ${booking.patientName || 'Patient'}`
      }
      
      slots.push({
        time: slot.time,
        status,
        details,
        booking: booking || null,
        availabilityData: slot
      })
    })
    
    // Add booked sessions that don't have availability slots
    dayBookings.forEach(booking => {
      if (!slots.find(s => s.time === booking.time)) {
        slots.push({
          time: booking.time,
          status: 'booked',
          details: `Booked: ${booking.patientName || 'Patient'}`,
          booking,
          availabilityData: null
        })
      }
    })
    
    // Sort slots by time
    slots.sort((a, b) => a.time.localeCompare(b.time))
    
    return slots
  }

  // Helper function to get local date string without timezone issues
  const getLocalDateString = (date: Date) => {
    const year = date.getFullYear()
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const day = date.getDate().toString().padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const handleDayClick = (date: Date) => {
    const dateStr = getLocalDateString(date)
    const isCurrentMonth = date.getMonth() === currentMonth.getMonth()
    
    if (!isCurrentMonth) return
    
    setSelectedDate(dateStr)
    setSelectedDayData({
      date: dateStr,
      dateObj: date
    })
    setShowDayDetailModal(true)
  }

  // Generate time slots for a day (30min intervals, full day)
  const generateTimeSlots = (date: string) => {
    const slots = []
    const dayBookings = bookings.filter(b => b.date === date)
    const dayAvailability = availability.filter(a => a.date === date)
    
    // Generate slots from 00:00 to 23:30 with 30min intervals
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
        // Check if this slot is booked (either directly or part of a longer booking)
        let booking = dayBookings.find(b => b.time === timeStr)
        let isBookedSlot = !!booking
        
        // For 60-min sessions, also check if this is the second half of a booking
        if (!booking) {
          const hour = parseInt(timeStr.split(':')[0])
          const minute = parseInt(timeStr.split(':')[1])
          
          if (minute === 30) {
            // This is a :30 slot, check if there's a 60-min booking at :00
            const hourSlot = `${hour.toString().padStart(2, '0')}:00`
            const hourBooking = dayBookings.find(b => b.time === hourSlot)
            
            if (hourBooking && hourBooking.sessionPackage?.sessionType !== 'consultation') {
              // This :30 slot is blocked by a 60-min session that started at :00
              booking = hourBooking
              isBookedSlot = true
            }
          }
        }
        
        // Check if this slot is available (has AVAILABLE_SLOT event)
        const availabilitySlot = dayAvailability.find(a => a.time === timeStr)
        const isAvailable = availabilitySlot?.available === true // Only available if explicitly marked as available
        
        slots.push({
          time: timeStr,
          isBooked: !!booking,
          booking,
          isAvailable,
          availability: availabilitySlot
        })
      }
    }
    
    return slots
  }

  // Handle slot selection with drag and drop
  const handleSlotMouseDown = (time: string) => {
    setIsDragging(true)
    setDragStartSlot(time)
    setDragEndSlot(time)
    setSelectedSlots([time])
  }

  const handleSlotMouseEnter = (time: string) => {
    if (isDragging) {
      setDragEndSlot(time)
      
      // Calculate range between dragStartSlot and time
      const slots = generateTimeSlots(selectedDate!)
      const startIndex = slots.findIndex(s => s.time === dragStartSlot)
      const endIndex = slots.findIndex(s => s.time === time)
      
      if (startIndex !== -1 && endIndex !== -1) {
        const range = slots.slice(
          Math.min(startIndex, endIndex),
          Math.max(startIndex, endIndex) + 1
        ).map(s => s.time)
        setSelectedSlots(range)
      }
    }
  }

  const handleSlotMouseUp = () => {
    setIsDragging(false)
  }

  // Set availability for selected slots
  const handleSetAvailability = async (available: boolean) => {
    if (selectedSlots.length === 0) return
    
    console.log('Setting availability:', { available, selectedSlots, selectedDate })
    
    try {
      let successCount = 0
      
      for (const time of selectedSlots) {
        console.log(`Processing slot: ${time}`)
        
        if (available) {
          // Make available = create availability slot
          console.log('Calling make_available for:', { date: selectedDate, time })
          const result = await handleQuickAction('make_available', {
            date: selectedDate,
            time,
            hours: 0.5, // 30 minute slots
            reason: 'Available for booking'
          })
          console.log('Make available result:', result)
          if (result && result.success !== false) successCount++
        } else {
          // Make unavailable = remove availability slot
          console.log('Calling make_unavailable for:', { date: selectedDate, time })
          const result = await handleQuickAction('make_unavailable', {
            date: selectedDate,
            time
          })
          console.log('Make unavailable result:', result)
          if (result && result.success !== false) successCount++
        }
      }
      
      console.log('Refreshing data...')
      // Force refresh data and wait for completion
      await Promise.all([
        fetchAvailability(),
        fetchData()
      ])
      
      // Clear selection
      setSelectedSlots([])
      
      // No alert needed - just update completed
      
    } catch (error) {
      console.error('Failed to update availability:', error)
    }
  }

  // New Google Calendar-based availability management
  const handleQuickAction = async (action: string, params: any = {}) => {
    try {
      console.log('handleQuickAction called:', { action, params })
      
      const requestBody = { action, ...params }
      console.log('Request body:', requestBody)
      
      const response = await fetch('/api/admin/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      })
      
      console.log('Response status:', response.status)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const result = await response.json()
      console.log('Response result:', result)
      
      if (result.success) {
        // Don't refresh here to avoid double refresh
        return result
      } else {
        throw new Error(result.error || 'Action failed')
      }
    } catch (error) {
      console.error('Quick action error:', error)
      console.error(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
      return false
    }
  }

  const handleBlockToday = () => {
    const today = new Date().toISOString().split('T')[0]
    handleQuickAction('block_day', { 
      date: today, 
      reason: 'Day blocked from admin' 
    })
  }

  const handleBlockWeek = () => {
    const today = new Date()
    const nextWeek = new Date(today)
    nextWeek.setDate(today.getDate() + 6)
    
    handleQuickAction('block_vacation', { 
      startDate: today.toISOString().split('T')[0], 
      endDate: nextWeek.toISOString().split('T')[0],
      reason: 'Week blocked from admin' 
    })
  }

  const handleDateClick = (date: Date, event: React.MouseEvent) => {
    const dateStr = date.toISOString().split('T')[0]
    const rect = (event.target as HTMLElement).getBoundingClientRect()
    
    setInlineEditDate(dateStr)
    setInlineEditPosition({
      x: rect.left + rect.width / 2,
      y: rect.bottom + 5
    })
    setAvailabilityData(prev => ({...prev, date: dateStr}))
  }

  const handleInlineAction = async (action: 'block' | 'available' | 'addTime', time?: string) => {
    if (!inlineEditDate) return

    try {
      if (action === 'block') {
        await fetch('/api/admin/availability', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            date: inlineEditDate,
            time: '19:00',
            available: false,
            reason: 'Day blocked'
          })
        })
      } else if (action === 'available') {
        await fetch('/api/admin/availability', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            date: inlineEditDate,
            time: '19:00',
            available: true,
            reason: ''
          })
        })
      } else if (action === 'addTime' && time) {
        await fetch('/api/admin/availability', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            date: inlineEditDate,
            time: time,
            available: true,
            reason: ''
          })
        })
      }
      
      fetchAvailability()
      setInlineEditDate(null)
    } catch (error) {
      console.error('Error updating availability:', error)
    }
  }

  // State for drag selection
  const [dragStart, setDragStart] = useState<string | null>(null)
  const [dragEnd, setDragEnd] = useState<string | null>(null)
  // isDragging is already declared above at line 63
  const [dragAction, setDragAction] = useState<'available' | 'blocked' | null>(null)

  // Helper function to convert time to minutes for comparison
  const timeToMinutes = (time: string): number => {
    const [hours, minutes] = time.split(':').map(Number)
    return hours * 60 + minutes
  }

  // Helper function to get time range between two times
  const getTimeRange = (start: string, end: string): string[] => {
    const startMinutes = timeToMinutes(start)
    const endMinutes = timeToMinutes(end)
    const range = []
    
    for (let minutes = Math.min(startMinutes, endMinutes); minutes <= Math.max(startMinutes, endMinutes); minutes += 15) {
      const hours = Math.floor(minutes / 60)
      const mins = minutes % 60
      range.push(`${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`)
    }
    return range
  }

  // Handle mouse down on time slot (start drag)
  const handleTimeSlotMouseDown = (time: string, status: string) => {
    if (status === 'booked') return // Cannot modify booked slots
    
    setDragStart(time)
    setDragEnd(time)
    setIsDragging(true)
    
    // Determine action based on current status
    if (status === 'unavailable') {
      setDragAction('available')
    } else if (status === 'available') {
      setDragAction('blocked')
    } else if (status === 'blocked') {
      setDragAction('available') // Allow unblocking back to free
    }
  }

  // Handle mouse enter during drag
  const handleTimeSlotMouseEnter = (time: string) => {
    if (isDragging && dragStart) {
      setDragEnd(time)
    }
  }

  // Handle mouse up (end drag)
  const handleTimeSlotMouseUp = async () => {
    if (!isDragging || !dragStart || !dragEnd || !inlineEditDate || !dragAction) return
    
    try {
      const timeRange = getTimeRange(dragStart, dragEnd)
      
      // Check the original status of the drag start to determine what we're doing
      const dayAvailability = availability.filter(a => a.date === inlineEditDate)
      const startSlotBlocked = dayAvailability.some(a => a.time === dragStart && !a.available)
      
      for (const time of timeRange) {
        if (startSlotBlocked && dragAction === 'available') {
          // Special case: unblocking a blocked slot should make it "free" (no entry in availability)
          // We'll create a DELETE request to remove the availability entry entirely
          // For now, set available=false with empty reason to simulate "free" state
          await fetch('/api/admin/availability', {
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              date: inlineEditDate,
              time: time,
              available: false,
              reason: 'FREE' // Special marker to indicate this should be treated as "free"
            })
          })
        } else {
          // Normal behavior: set available or blocked
          await fetch('/api/admin/availability', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              date: inlineEditDate,
              time: time,
              available: dragAction === 'available',
              reason: dragAction === 'blocked' ? 'Blocked' : ''
            })
          })
        }
      }
      
      fetchAvailability()
    } catch (error) {
      console.error('Error updating time range:', error)
    } finally {
      setDragStart(null)
      setDragEnd(null)
      setIsDragging(false)
      setDragAction(null)
    }
  }

  // Check if time is in current drag selection
  const isInDragSelection = (time: string): boolean => {
    if (!isDragging || !dragStart || !dragEnd) return false
    const timeRange = getTimeRange(dragStart, dragEnd)
    return timeRange.includes(time)
  }

  // Handler for day-level actions
  const handleDayAction = async (action: 'block-all' | 'clear-all') => {
    if (!inlineEditDate) return
    
    try {
      if (action === 'block-all') {
        // Block entire day - add blocked entries for common time slots
        const timeSlots = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00']
        
        for (const time of timeSlots) {
          await fetch('/api/admin/availability', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              date: inlineEditDate,
              time: time,
              available: false,
              reason: 'Day blocked'
            })
          })
        }
      } else if (action === 'clear-all') {
        // Clear all availability settings for this day
        // Use a special API call to clear all entries for the date
        await fetch('/api/admin/availability', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            date: inlineEditDate,
            time: 'CLEAR_ALL', // Special marker to clear all entries for this date
            available: false,
            reason: 'CLEAR_DAY'
          })
        })
      }
      
      fetchAvailability()
      setInlineEditDate(null)
    } catch (error) {
      console.error('Error with day action:', error)
    }
  }

  const closeInlineEdit = () => {
    setInlineEditDate(null)
  }

  // Booking menu handlers
  const handleReschedulBooking = (booking: BookingData) => {
    setSelectedBooking(booking)
    setRescheduleData({
      date: booking.date,
      time: booking.time,
      message: ""
    })
    setShowRescheduleModal(true)
    setOpenMenuBookingId(null)
  }

  const handleCancelBooking = (booking: BookingData) => {
    setSelectedBooking(booking)
    setCancelData({
      reason: "",
      message: "",
      suggestAlternative: false,
      alternativeDate: "",
      alternativeTime: ""
    })
    setShowCancelModal(true)
    setOpenMenuBookingId(null)
  }

  const submitReschedule = async () => {
    if (!selectedBooking || !rescheduleData.date || !rescheduleData.time) {
      console.log('Please select new date and time')
      return
    }

    try {
      const response = await fetch('/api/admin/modify-booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: selectedBooking.bookingId,
          action: 'reschedule',
          newDate: rescheduleData.date,
          newTime: rescheduleData.time,
          message: rescheduleData.message
        })
      })

      const result = await response.json()
      
      if (result.success) {
        console.log('Booking rescheduled successfully!')
        setShowRescheduleModal(false)
        fetchData()
      } else {
        console.error(result.error || 'Failed to reschedule booking')
      }
    } catch (error) {
      console.error('Reschedule error:', error)
      console.error('Failed to reschedule booking')
    }
  }

  const submitCancel = async () => {
    if (!selectedBooking || !cancelData.reason) {
      console.log('Please provide a cancellation reason')
      return
    }

    try {
      const response = await fetch('/api/admin/modify-booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: selectedBooking.bookingId,
          action: 'cancel',
          reason: cancelData.reason,
          message: cancelData.message,
          newDate: cancelData.suggestAlternative ? cancelData.alternativeDate : null,
          newTime: cancelData.suggestAlternative ? cancelData.alternativeTime : null
        })
      })

      const result = await response.json()
      
      if (result.success) {
        console.log('Booking cancelled successfully!')
        setShowCancelModal(false)
        fetchData()
      } else {
        console.error(result.error || 'Failed to cancel booking')
      }
    } catch (error) {
      console.error('Cancel error:', error)
      alert('Failed to cancel booking')
    }
  }

  // Notes handlers
  const handleEditNotes = (patient: PatientData) => {
    setEditingNotes(patient.bookingToken)
    setNotesContent(patient.therapistNotes || "")
  }

  const handleSaveNotes = async (bookingToken: string) => {
    try {
      const response = await fetch('/api/admin/therapist-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingToken,
          notes: notesContent
        })
      })

      const result = await response.json()
      
      if (result.success) {
        setEditingNotes(null)
        setNotesContent("")
        fetchData() // Refresh data to show updated notes
      } else {
        console.error(result.error || 'Failed to save notes')
      }
    } catch (error) {
      console.error('Notes save error:', error)
      console.error('Failed to save notes')
    }
  }

  const handleCancelNotes = () => {
    setEditingNotes(null)
    setNotesContent("")
  }

  const handleCreateNewPatient = async () => {
    try {
      // Generate unique IDs
      const bookingToken = crypto.randomUUID()
      const userId = `MANUAL-${Date.now()}`

      const response = await fetch('/api/admin/create-patient', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingToken,
          userId,
          medicalFormData: newPatientData,
          sessionPackage: newPatientData.sessionPackage
        })
      })

      const result = await response.json()
      
      if (result.success) {
        // Reset form and close modal
        setNewPatientData({
          fullName: "",
          email: "",
          phone: "",
          dateOfBirth: "",
          emergencyContactName: "",
          emergencyContactPhone: "",
          emergencyContactRelation: "",
          doctorName: "",
          doctorPhone: "",
          currentMedications: "",
          allergies: "",
          medicalConditions: "",
          currentProblems: "",
          therapyHistory: "",
          therapyGoals: "",
          suicidalThoughts: "",
          substanceUse: "",
          sessionPackage: {
            name: "Manual Entry",
            price: 0
          }
        })
        setShowNewPatientModal(false)
        
        // Refresh data
        fetchData()
      } else {
        console.error('Error creating patient:', result.error)
      }
    } catch (error) {
      console.error('Error creating patient:', error)
      console.error('Error creating patient')
    }
  }

  // Load availability when switching to schedule tab
  React.useEffect(() => {
    if (activeTab === "schedule" && isAuthenticated) {
      fetchAvailability()
    }
  }, [activeTab, isAuthenticated])

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-stone-50 to-cream-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl font-light text-center">Admin Dashboard</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">
                  Password
                </label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password"
                  required
                />
              </div>
              {error && (
                <p className="text-red-600 text-sm">{error}</p>
              )}
              <Button 
                type="submit"
                className="w-full bg-stone-600 hover:bg-stone-700 text-white"
              >
                Login
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 to-cream-50 p-4">
      <div className="container mx-auto max-w-7xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-light text-stone-800">Admin Dashboard</h1>
          <Button 
            onClick={() => setIsAuthenticated(false)}
            variant="outline"
            className="border-stone-300"
          >
            Logout
          </Button>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-8 bg-stone-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              activeTab === "overview" 
                ? "bg-white text-stone-800 shadow-sm" 
                : "text-stone-600 hover:text-stone-800"
            }`}
          >
            <User className="inline h-4 w-4 mr-2" />
            Overview
          </button>
          <button
            onClick={() => setActiveTab("schedule")}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              activeTab === "schedule" 
                ? "bg-white text-stone-800 shadow-sm" 
                : "text-stone-600 hover:text-stone-800"
            }`}
          >
            <Calendar className="inline h-4 w-4 mr-2" />
            Calendar Management
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-stone-600 mx-auto"></div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Overview Tab */}
            {activeTab === "overview" && (
              <div className="space-y-8">
                {/* Summary Cards */}
                <div className="grid md:grid-cols-3 gap-6">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-stone-600">Total Bookings</p>
                          <p className="text-2xl font-semibold text-stone-800">{bookings.length}</p>
                        </div>
                        <span className="text-2xl">📅</span>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-stone-600">Total Patients</p>
                          <p className="text-2xl font-semibold text-stone-800">{patients.length}</p>
                        </div>
                        <span className="text-2xl">👥</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-stone-600">Upcoming Sessions</p>
                          <p className="text-2xl font-semibold text-stone-800">
                            {bookings.filter(b => new Date(b.date) >= new Date()).length}
                          </p>
                        </div>
                        <span className="text-2xl">🕐</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Bookings Table with Expandable Patient Details */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl font-medium">Upcoming Bookings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left p-2 font-medium text-stone-700">Date</th>
                            <th className="text-left p-2 font-medium text-stone-700">Time</th>
                            <th className="text-left p-2 font-medium text-stone-700">Patient</th>
                            <th className="text-left p-2 font-medium text-stone-700">Package</th>
                            <th className="text-left p-2 font-medium text-stone-700">Video Link</th>
                            <th className="text-left p-2 font-medium text-stone-700">Status</th>
                            <th className="text-left p-2 font-medium text-stone-700"></th>
                          </tr>
                        </thead>
                        <tbody>
                          {bookings.map((booking, index) => {
                            const patient = patients.find(p => p.bookingToken === booking.bookingToken)
                            const medicalData = patient?.medicalFormData
                            
                            // Generate Google Meet link for each booking
                            const meetLink = `https://meet.google.com/new`
                            const bookingDate = new Date(booking.date)
                            const isUpcoming = bookingDate >= new Date()
                            
                            return (
                              <tr key={index} className="border-b hover:bg-stone-50">
                                <td className="p-2">
                                  {new Date(booking.date).toLocaleDateString('en-US', {
                                    weekday: 'short',
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric'
                                  })}
                                </td>
                                <td className="p-2">{booking.time}</td>
                                <td className="p-2">
                                  {medicalData?.fullName || 'Unknown'}
                                  <div className="text-xs text-stone-500">
                                    {medicalData?.email || ''}
                                  </div>
                                </td>
                                <td className="p-2">
                                  <span className="mr-1">🩺</span>
                                  {booking.sessionPackage?.name || 'Session'}
                                </td>
                                <td className="p-2">
                                  {isUpcoming ? (
                                    <a 
                                      href={meetLink}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-md text-sm transition-colors"
                                    >
                                      Google Meet
                                    </a>
                                  ) : (
                                    <span className="text-xs text-stone-400">Session ended</span>
                                  )}
                                </td>
                                <td className="p-2">
                                  <span className={`px-2 py-1 rounded-full text-xs ${
                                    isUpcoming
                                      ? 'bg-green-100 text-green-700' 
                                      : 'bg-gray-100 text-gray-700'
                                  }`}>
                                    {isUpcoming ? 'Upcoming' : 'Past'}
                                  </span>
                                </td>
                                <td className="p-2 relative">
                                  {isUpcoming && (
                                    <div className="relative">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          setOpenMenuBookingId(openMenuBookingId === booking.bookingId ? null : booking.bookingId)
                                        }}
                                        className="h-8 w-8 p-0 hover:bg-stone-100"
                                      >
                                        <MoreVertical className="h-4 w-4" />
                                      </Button>
                                      
                                      {openMenuBookingId === booking.bookingId && (
                                        <>
                                          <div 
                                            className="fixed inset-0 z-[100] bg-black bg-opacity-10" 
                                            onClick={() => setOpenMenuBookingId(null)}
                                          />
                                          <div className="fixed z-[101] bg-white border-2 border-stone-400 rounded-lg shadow-2xl py-3 min-w-[200px]" 
                                               style={{ 
                                                 top: '50%', 
                                                 left: '50%', 
                                                 transform: 'translate(-50%, -50%)' 
                                               }}>
                                            <div className="px-4 py-2 text-xs font-medium text-stone-500 uppercase tracking-wide border-b border-stone-100">
                                              Appointment Options
                                            </div>
                                            <button
                                              onClick={() => handleReschedulBooking(booking)}
                                              className="w-full px-4 py-3 text-left text-sm hover:bg-blue-50 flex items-center gap-3 transition-colors"
                                            >
                                              <span>✏️</span>
                                              <span className="text-stone-700">Reschedule</span>
                                            </button>
                                            <button
                                              onClick={() => handleCancelBooking(booking)}
                                              className="w-full px-4 py-3 text-left text-sm hover:bg-red-50 flex items-center gap-3 transition-colors"
                                            >
                                              <span>🗑️</span>
                                              <span className="text-red-600">Cancel</span>
                                            </button>
                                          </div>
                                        </>
                                      )}
                                    </div>
                                  )}
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                      {bookings.length === 0 && (
                        <p className="text-center py-8 text-stone-500">No bookings yet</p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Patient Details Section */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-xl font-medium">Patient Details</CardTitle>
                    <button
                      onClick={() => setShowNewPatientModal(true)}
                      className="bg-gradient-to-r from-stone-600 to-stone-700 hover:from-amber-600 hover:to-orange-600 text-white rounded-full w-12 h-12 flex items-center justify-center transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 border-2 border-stone-200 hover:border-amber-300"
                      title="Add New Patient"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {patients.map((patient, index) => {
                        const data = patient.medicalFormData || {}
                        const isExpanded = expandedPatients.includes(patient.userId)
                        const sessionsRemaining = getSessionsRemaining(patient)
                        const patientBookings = bookings.filter(b => {
                          return b.bookingToken === patient.bookingToken
                        })
                        
                        return (
                          <div key={index} className="border rounded-lg hover:shadow-md transition-shadow">
                            <div 
                              className="p-4 cursor-pointer hover:bg-stone-50"
                              onClick={() => togglePatientExpand(patient.userId)}
                            >
                              <div className="flex justify-between items-center">
                                <div className="flex items-center gap-4">
                                  <div>
                                    <div className="font-medium text-lg">{patient.medicalFormData?.fullName || patient.patientName}</div>
                                    <div className="text-sm text-stone-500">
                                      {patient.medicalFormData?.email || patient.patientEmail} • {patient.medicalFormData?.phone || 'N/A'}
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="px-3 py-1 bg-stone-100 rounded-full text-sm">
                                      {patient.sessionPackage?.name || 'Session'}
                                    </span>
                                    <span className={`px-3 py-1 rounded-full text-sm ${
                                      sessionsRemaining > 0 
                                        ? 'bg-blue-100 text-blue-700' 
                                        : 'bg-gray-100 text-gray-700'
                                    }`}>
                                      {patientBookings.length} bookings
                                    </span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm text-stone-500">
                                    {patientBookings.length} bookings
                                  </span>
                                  {isExpanded ? <ChevronUp /> : <ChevronDown />}
                                </div>
                              </div>
                            </div>
                            
                            {isExpanded && (
                              <div className="px-6 pb-6 border-t bg-gradient-to-br from-cream-50 via-white to-stone-50">
                                <div className="grid md:grid-cols-2 gap-8 mt-6 auto-rows-fr">
                                  {/* Personal Info */}
                                  <div className="bg-gradient-to-br from-cream-100/50 to-stone-100/30 rounded-xl p-5 border border-cream-200 shadow-sm">
                                    <h4 className="font-medium text-stone-700 mb-4 flex items-center gap-2">
                                      <span className="text-lg">👤</span>
                                      Personal Information
                                    </h4>
                                    <div className="space-y-3 text-sm">
                                      <div className="flex justify-between py-1">
                                        <span className="text-stone-600">Age:</span>
                                        <span className="font-medium text-stone-700">{data.dateOfBirth ? 
                                          new Date().getFullYear() - new Date(data.dateOfBirth).getFullYear() 
                                          : 'Not provided'} years</span>
                                      </div>
                                      <div className="flex justify-between py-1">
                                        <span className="text-stone-600">Emergency Contact:</span>
                                        <span className="font-medium text-stone-700">{data.emergencyContactName}</span>
                                      </div>
                                      <div className="flex justify-between py-1">
                                        <span className="text-stone-600">Emergency Phone:</span>
                                        <span className="font-medium text-stone-700">{data.emergencyContactPhone}</span>
                                      </div>
                                      <div className="flex justify-between py-1">
                                        <span className="text-stone-600">Relationship:</span>
                                        <span className="font-medium text-stone-700">{data.emergencyContactRelation || 'Not specified'}</span>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Medical Info */}
                                  <div className="bg-gradient-to-br from-stone-100/40 to-cream-100/60 rounded-xl p-5 border border-stone-200 shadow-sm">
                                    <h4 className="font-medium text-stone-700 mb-4 flex items-center gap-2">
                                      <span className="text-lg">🏥</span>
                                      Medical Information
                                    </h4>
                                    <div className="space-y-3 text-sm">
                                      <div className="flex justify-between py-1">
                                        <span className="text-stone-600">Doctor:</span>
                                        <span className="font-medium text-stone-700">{data.doctorName || 'Not provided'}</span>
                                      </div>
                                      <div className="flex justify-between py-1">
                                        <span className="text-stone-600">Doctor Phone:</span>
                                        <span className="font-medium text-stone-700">{data.doctorPhone || 'Not provided'}</span>
                                      </div>
                                      <div className="flex justify-between py-1">
                                        <span className="text-stone-600">Medications:</span>
                                        <span className="font-medium text-stone-700">{data.currentMedications || 'None'}</span>
                                      </div>
                                      <div className="flex justify-between py-1">
                                        <span className="text-stone-600">Allergies:</span>
                                        <span className="font-medium text-stone-700">{data.allergies || 'None'}</span>
                                      </div>
                                      <div className="flex justify-between py-1">
                                        <span className="text-stone-600">Medical Conditions:</span>
                                        <span className="font-medium text-stone-700">{data.medicalConditions || 'None'}</span>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Therapist Notes */}
                                  <div className="bg-gradient-to-br from-amber-50/50 to-orange-50/30 rounded-xl p-5 border border-amber-200/60 shadow-sm">
                                    <h4 className="font-medium text-stone-700 mb-4 flex items-center gap-2">
                                      <span className="text-lg">📝</span>
                                      Therapist Notes
                                    </h4>
                                    <div className="bg-gradient-to-br from-white to-cream-50/50 border border-amber-200/40 rounded-lg p-4">
                                      {editingNotes === patient.bookingToken ? (
                                        <div className="space-y-2">
                                          <textarea
                                            className="w-full p-3 border border-amber-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white"
                                            rows={6}
                                            placeholder="Add your clinical notes here..."
                                            value={notesContent}
                                            onChange={(e) => setNotesContent(e.target.value)}
                                          />
                                          <div className="flex gap-2">
                                            <Button
                                              onClick={() => handleSaveNotes(patient.bookingToken)}
                                              size="sm"
                                              className="bg-amber-600 hover:bg-amber-700 text-white"
                                            >
                                              <span className="mr-1">💾</span>
                                              Save Notes
                                            </Button>
                                            <Button
                                              onClick={handleCancelNotes}
                                              size="sm"
                                              variant="outline"
                                              className="border-amber-300"
                                            >
                                              <span className="mr-1">❌</span>
                                              Cancel
                                            </Button>
                                          </div>
                                        </div>
                                      ) : (
                                        <div>
                                          <div className="mb-3">
                                            {patient.therapistNotes ? (
                                              <div className="text-sm text-stone-600 whitespace-pre-wrap bg-gradient-to-br from-white to-cream-50 p-3 rounded border border-cream-200">
                                                {patient.therapistNotes}
                                              </div>
                                            ) : (
                                              <div className="text-sm text-stone-500 italic">
                                                No notes yet. Click "Add Notes" to start documenting.
                                              </div>
                                            )}
                                          </div>
                                          <Button
                                            onClick={() => handleEditNotes(patient)}
                                            size="sm"
                                            variant="outline"
                                            className="border-amber-300 text-amber-700 hover:bg-amber-50"
                                          >
                                            <span className="mr-1">✏️</span>
                                            {patient.therapistNotes ? 'Edit Notes' : 'Add Notes'}
                                          </Button>
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  {/* Therapy Info */}
                                  <div className="bg-gradient-to-br from-stone-50/60 to-cream-50/40 rounded-xl p-5 border border-stone-200/50 shadow-sm">
                                    <h4 className="font-medium text-stone-700 mb-4 flex items-center gap-2">
                                      <span className="text-lg">🧠</span>
                                      Therapy Information
                                    </h4>
                                    <div className="space-y-4 text-sm">
                                      <div className="bg-gradient-to-r from-cream-50 to-white p-3 rounded-lg border border-cream-200">
                                        <strong className="text-stone-700">Current Problems:</strong>
                                        <p className="mt-2 text-stone-600 leading-relaxed">{data.currentProblems}</p>
                                      </div>
                                      <div className="bg-gradient-to-r from-white to-cream-50 p-3 rounded-lg border border-cream-200">
                                        <strong className="text-stone-700">Therapy Goals:</strong>
                                        <p className="mt-2 text-stone-600 leading-relaxed">{data.therapyGoals}</p>
                                      </div>
                                      <div className="bg-gradient-to-r from-cream-50 to-white p-3 rounded-lg border border-cream-200">
                                        <strong className="text-stone-700">Previous Therapy:</strong>
                                        <p className="mt-2 text-stone-600 leading-relaxed">{data.therapyHistory || 'No previous therapy'}</p>
                                      </div>
                                      <div className="bg-gradient-to-r from-white to-cream-50 p-3 rounded-lg border border-cream-200">
                                        <strong className="text-stone-700">Substance Use:</strong>
                                        <p className="mt-2 text-stone-600 leading-relaxed">{data.substanceUse || 'None reported'}</p>
                                      </div>
                                      {data.suicidalThoughts && (
                                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                                          <div className="flex items-center gap-2 text-red-700">
                                            <span>⚠️</span>
                                            <strong>Suicidal Thoughts:</strong>
                                          </div>
                                          <p className="mt-1 text-red-600">{data.suicidalThoughts}</p>
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  {/* Booking History */}
                                  <div className="md:col-span-2 bg-gradient-to-br from-cream-50/30 to-stone-50/20 rounded-xl p-5 border border-cream-200/60 shadow-sm">
                                    <h4 className="font-medium text-stone-700 mb-4 flex items-center gap-2">
                                      <span className="text-lg">📅</span>
                                      Booking History
                                    </h4>
                                    <div className="space-y-2">
                                      {patientBookings.length > 0 ? (
                                        patientBookings.map((booking, bIndex) => (
                                          <div key={bIndex} className="flex justify-between items-center p-3 bg-gradient-to-r from-white to-cream-50/50 rounded-lg border border-cream-200/50 shadow-sm">
                                            <div className="text-sm">
                                              {new Date(booking.date).toLocaleDateString('en-US', {
                                                weekday: 'short',
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric'
                                              })} at {booking.time}
                                            </div>
                                            <span className={`px-2 py-1 rounded-full text-xs ${
                                              new Date(booking.date) >= new Date() 
                                                ? 'bg-green-100 text-green-700' 
                                                : 'bg-gray-100 text-gray-700'
                                            }`}>
                                              {new Date(booking.date) >= new Date() ? 'Upcoming' : 'Completed'}
                                            </span>
                                          </div>
                                        ))
                                      ) : (
                                        <p className="text-sm text-stone-500">No bookings yet</p>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        )
                      })}
                      {patients.length === 0 && (
                        <p className="text-center py-8 text-stone-500">No patients registered yet</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Calendar Management Tab */}
            {activeTab === "schedule" && (
              <div className="space-y-6">
                {/* Header with Quick Actions */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h2 className="text-2xl font-light text-stone-800">Calendar Management</h2>
                    <p className="text-sm text-stone-600">Your schedule integrated with Google Calendar</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      onClick={() => setShowVacationModal(true)}
                      variant="outline"
                      size="sm"
                      className="border-orange-200 text-orange-700 hover:bg-orange-50"
                    >
                      <Calendar className="h-4 w-4 mr-1" />
                      Plan Vacation
                    </Button>
                    <Button
                      onClick={() => setShowRecurringModal(true)}
                      variant="outline"
                      size="sm"
                      className="border-purple-200 text-purple-700 hover:bg-purple-50"
                    >
                      <Clock className="h-4 w-4 mr-1" />
                      Recurring Rules
                    </Button>
                    <Button
                      onClick={() => window.open('https://calendar.google.com/calendar/u/0/r?cid=dr.k@doctorktherapy.com', '_blank')}
                      className="bg-stone-600 hover:bg-stone-700 text-white"
                      size="sm"
                    >
                      <Calendar className="h-4 w-4 mr-1" />
                      Google Calendar
                    </Button>
                  </div>
                </div>


                {/* Calendar Management Interface */}
                <Card>
                  <CardHeader>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Calendar className="h-5 w-5 text-blue-600" />
                          Calendar Overview (Portuguese Time)
                        </CardTitle>
                        <div className="flex items-center gap-2">
                          <div className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                            ✅ Live Data from Google Calendar
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              fetchAvailability()
                              fetchData()
                            }}
                          >
                            <Clock className="h-4 w-4 mr-1" />
                            Refresh
                          </Button>
                        </div>
                      </div>
                      
                      {/* View Toggle & Filters */}
                      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                        
                        <div className="flex gap-2 items-center">
                          <select
                            value={filterMode}
                            onChange={(e) => setFilterMode(e.target.value as any)}
                            className="px-3 py-1 border border-stone-300 rounded-md text-sm"
                          >
                            <option value="all">All Days</option>
                            <option value="available">Available Only</option>
                            <option value="booked">Booked Only</option>
                          </select>
                          
                          <Input
                            type="text"
                            placeholder="Search patient..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-40"
                          />
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    {loading ? (
                      <div className="flex items-center justify-center py-12">
                        <div className="text-stone-500">Loading calendar...</div>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {/* Calendar Navigation */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <Button
                              onClick={() => {
                                const newMonth = new Date(currentMonth)
                                newMonth.setMonth(newMonth.getMonth() - 1)
                                setCurrentMonth(newMonth)
                              }}
                              variant="outline"
                              size="sm"
                            >
                              ◀️ Previous
                            </Button>
                            <h3 className="text-xl font-semibold text-stone-800">
                              {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                            </h3>
                            <Button
                              onClick={() => {
                                const newMonth = new Date(currentMonth)
                                newMonth.setMonth(newMonth.getMonth() + 1)
                                setCurrentMonth(newMonth)
                              }}
                              variant="outline"
                              size="sm"
                            >
                              Next ▶️
                            </Button>
                          </div>
                          <Button
                            onClick={() => setCurrentMonth(new Date())}
                            variant="outline"
                            size="sm"
                            className="text-blue-600"
                          >
                            Today
                          </Button>
                        </div>

                        {/* Calendar Views */}
                        {calendarView === 'month' && (
                        <div className="rounded-lg overflow-hidden shadow-md border border-gray-200/60 bg-white/90">
                          {/* Week header */}
                          <div className="grid grid-cols-7 bg-gradient-to-r from-stone-100/80 to-stone-200/80">
                            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day, idx) => {
                              return (
                                <div 
                                  key={day} 
                                  className="p-2.5 text-center text-sm font-medium border-r last:border-r-0 text-stone-600 border-gray-200/60"
                                >
                                  <div>{day.slice(0, 3)}</div>
                                </div>
                              )
                            })}
                          </div>

                          {/* Calendar days */}
                          {(() => {
                            const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
                            const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0)
                            const startOfCalendar = new Date(startOfMonth)
                            // Start from Monday (getDay() returns 0=Sunday, 1=Monday, etc.)
                            const mondayOffset = (startOfMonth.getDay() + 6) % 7 // Convert to Monday=0, Sunday=6
                            startOfCalendar.setDate(startOfCalendar.getDate() - mondayOffset)
                            
                            const weeks = []
                            const currentDate = new Date(startOfCalendar)
                            
                            while (currentDate <= endOfMonth || weeks.length < 6) {
                              const week = []
                              for (let i = 0; i < 7; i++) {
                                week.push(new Date(currentDate))
                                currentDate.setDate(currentDate.getDate() + 1)
                              }
                              weeks.push(week)
                              if (currentDate > endOfMonth && weeks.length >= 5) break
                            }
                            
                            return weeks.map((week, weekIndex) => (
                              <div key={weekIndex} className="grid grid-cols-7">
                                {week.map((date) => {
                                  const dateStr = getLocalDateString(date)
                                  const isCurrentMonth = date.getMonth() === currentMonth.getMonth()
                                  const isToday = dateStr === getLocalDateString(new Date())
                                  const dayOfWeek = date.getDay()
                                  const isWorkingDay = dayOfWeek === 2 || dayOfWeek === 4 // Tuesday or Thursday
                                  
                                  // Check availability status for this day
                                  const daySlots = availability.filter(a => a.date === dateStr)
                                  const dayBookings = bookings.filter(b => b.date === dateStr)
                                  const hasBookedSessions = dayBookings.length > 0
                                  const hasAvailableSlots = daySlots.some(s => s.available)
                                  
                                  let dayClass = 'relative p-2.5 border border-gray-200/60 min-h-[100px] cursor-pointer transition-all duration-200 group overflow-hidden'
                                  let statusClass = ''
                                  let statusText = ''
                                  
                                  if (!isCurrentMonth) {
                                    dayClass += ' text-gray-400 bg-gray-50 opacity-50'
                                  } else if (hasBookedSessions) {
                                    dayClass += ' bg-gradient-to-br from-blue-50/70 to-blue-100/70 hover:from-blue-100/80 hover:to-blue-200/80 hover:shadow-md border-blue-200/70'
                                    statusClass = 'bg-blue-500/90 text-white text-xs px-1.5 py-0.5 rounded-full font-medium shadow-sm'
                                    statusText = `${dayBookings.length} Session${dayBookings.length > 1 ? 's' : ''}`
                                  } else if (hasAvailableSlots) {
                                    dayClass += ' bg-gradient-to-br from-green-50/70 to-green-100/70 hover:from-green-100/80 hover:to-green-200/80 hover:shadow-md border-green-200/70'
                                    statusClass = 'bg-green-500/90 text-white text-xs px-1.5 py-0.5 rounded-full font-medium shadow-sm'
                                    statusText = 'Available'
                                  } else {
                                    dayClass += ' bg-white/50 hover:bg-gray-50/70'
                                  }
                                  
                                  if (isToday) {
                                    dayClass += ' bg-gradient-to-br from-blue-50/80 to-blue-100/80 border-blue-300/80 shadow-md ring-1 ring-blue-300/50'
                                  }
                                  
                                  return (
                                    <div
                                      key={dateStr}
                                      className={dayClass}
                                      onClick={() => handleDayClick(date)}
                                    >
                                      {/* Day header */}
                                      <div className="flex justify-between items-start mb-2">
                                        <span className={`text-lg font-bold ${!isCurrentMonth ? 'text-gray-400' : 'text-stone-800'}`}>
                                          {date.getDate()}
                                        </span>
                                        {statusText && isCurrentMonth && (
                                          <span className={statusClass}>{statusText}</span>
                                        )}
                                      </div>
                                      
                                      {/* Show booked sessions with patient names */}
                                      {isCurrentMonth && dayBookings.length > 0 && (
                                        <div className="space-y-1 mt-2">
                                          {dayBookings.slice(0, 3).map((booking, idx) => (
                                            <div key={idx} className="bg-white bg-opacity-90 rounded px-2 py-1 text-xs shadow-sm border border-blue-200">
                                              <div className="flex items-center gap-1">
                                                <span className="font-bold text-blue-700">{booking.time}</span>
                                                <span className="text-stone-600 truncate">{booking.patientName || 'Patient'}</span>
                                              </div>
                                            </div>
                                          ))}
                                          {dayBookings.length > 3 && (
                                            <div className="text-xs font-bold text-blue-600 text-center">+{dayBookings.length - 3} more</div>
                                          )}
                                        </div>
                                      )}
                                      
                                      {/* Hover overlay */}
                                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-5 transition-all duration-200 pointer-events-none" />
                                      
                                      {/* Click indicator on hover */}
                                      <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                        <div className="bg-white rounded-full p-1 shadow-lg">
                                          <svg className="w-4 h-4 text-stone-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                          </svg>
                                        </div>
                                      </div>
                                      
                                      {/* Show number of sessions/slots */}
                                      {isWorkingDay && isCurrentMonth && daySlots.length > 0 && !dayBookings.length && (
                                        <div className="mt-1 text-xs text-stone-600">
                                          {daySlots.filter(s => s.eventType === 'booked').length > 0 && (
                                            <div>Sessions: {daySlots.filter(s => s.eventType === 'booked').length}</div>
                                          )}
                                          {daySlots.filter(s => s.eventType === 'blocked').length > 0 && (
                                            <div>Blocked: {daySlots.filter(s => s.eventType === 'blocked').length}</div>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  )
                                })}
                              </div>
                            ))
                          })()}
                        </div>
                        )}
                        
                        
                        
                        {/* Quick Overview */}
                        <div className="bg-gradient-to-r from-blue-50/70 to-green-50/70 rounded-lg p-3 mb-4 border border-blue-200/60 backdrop-blur-sm">
                          <div className="flex items-center justify-between">
                            <div className="flex gap-6">
                              <div className="text-center">
                                <div className="text-2xl font-bold text-blue-800">
                                  {bookings.filter(b => b.date >= new Date().toISOString().split('T')[0]).length}
                                </div>
                                <div className="text-xs text-blue-600">Upcoming Sessions</div>
                              </div>
                              <div className="text-center">
                                <div className="text-2xl font-bold text-green-800">
                                  {patients.length}
                                </div>
                                <div className="text-xs text-green-600">Total Patients</div>
                              </div>
                              <div className="text-center">
                                <div className="text-2xl font-bold text-purple-800">
                                  {bookings.filter(b => b.date === new Date().toISOString().split('T')[0]).length}
                                </div>
                                <div className="text-xs text-purple-600">Today's Sessions</div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm text-stone-600">
                                🔄 Synced with Google Calendar
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>



              </div>
            )}
          </div>
        )}

        {/* Reschedule Modal */}
        {showRescheduleModal && selectedBooking && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-medium mb-4">Reschedule Appointment</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">
                    Current: {new Date(selectedBooking.date).toLocaleDateString()} at {selectedBooking.time}
                  </label>
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">
                    New Date
                  </label>
                  <Input
                    type="date"
                    value={rescheduleData.date}
                    onChange={(e) => setRescheduleData(prev => ({...prev, date: e.target.value}))}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">
                    New Time
                  </label>
                  <Input
                    type="time"
                    value={rescheduleData.time}
                    onChange={(e) => setRescheduleData(prev => ({...prev, time: e.target.value}))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">
                    Message to Patient (optional)
                  </label>
                  <textarea
                    className="w-full p-2 border border-stone-300 rounded-md"
                    rows={3}
                    placeholder="Sorry for any inconvenience..."
                    value={rescheduleData.message}
                    onChange={(e) => setRescheduleData(prev => ({...prev, message: e.target.value}))}
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={submitReschedule}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Reschedule
                  </Button>
                  <Button
                    onClick={() => setShowRescheduleModal(false)}
                    variant="outline"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Cancel Modal */}
        {showCancelModal && selectedBooking && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-medium mb-4 text-red-600">Cancel Appointment</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">
                    Appointment: {new Date(selectedBooking.date).toLocaleDateString()} at {selectedBooking.time}
                  </label>
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">
                    Cancellation Reason *
                  </label>
                  <select
                    className="w-full p-2 border border-stone-300 rounded-md"
                    value={cancelData.reason}
                    onChange={(e) => setCancelData(prev => ({...prev, reason: e.target.value}))}
                    required
                  >
                    <option value="">Select reason...</option>
                    <option value="illness">Illness</option>
                    <option value="emergency">Emergency</option>
                    <option value="schedule_conflict">Schedule Conflict</option>
                    <option value="patient_request">Patient Request</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">
                    Message to Patient (optional)
                  </label>
                  <textarea
                    className="w-full p-2 border border-stone-300 rounded-md"
                    rows={3}
                    placeholder="I apologize for the inconvenience..."
                    value={cancelData.message}
                    onChange={(e) => setCancelData(prev => ({...prev, message: e.target.value}))}
                  />
                </div>
                
                {/* Alternative Suggestion Section */}
                <div className="border-t pt-4">
                  <label className="flex items-center space-x-2 mb-3">
                    <input
                      type="checkbox"
                      checked={cancelData.suggestAlternative}
                      onChange={(e) => setCancelData(prev => ({...prev, suggestAlternative: e.target.checked}))}
                      className="rounded"
                    />
                    <span className="text-sm font-medium text-stone-700">
                      Suggest alternative appointment time
                    </span>
                  </label>
                  
                  {cancelData.suggestAlternative && (
                    <div className="space-y-3 ml-6">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-stone-700 mb-1">
                            Alternative Date
                          </label>
                          <input
                            type="date"
                            value={cancelData.alternativeDate}
                            onChange={(e) => setCancelData(prev => ({...prev, alternativeDate: e.target.value}))}
                            min={new Date().toISOString().split('T')[0]}
                            className="w-full p-2 border border-stone-300 rounded-md text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-stone-700 mb-1">
                            Alternative Time
                          </label>
                          <input
                            type="time"
                            value={cancelData.alternativeTime}
                            onChange={(e) => setCancelData(prev => ({...prev, alternativeTime: e.target.value}))}
                            className="w-full p-2 border border-stone-300 rounded-md text-sm"
                          />
                        </div>
                      </div>
                      <p className="text-xs text-stone-500">
                        💡 Patient will receive email with "Yes/No" buttons for the suggested time
                      </p>
                    </div>
                  )}
                </div>
                
                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={submitCancel}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                  >
                    Cancel Appointment
                  </Button>
                  <Button
                    onClick={() => setShowCancelModal(false)}
                    variant="outline"
                    className="flex-1"
                  >
                    Keep Appointment
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* New Patient Modal */}
        {showNewPatientModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-stone-200">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-semibold text-stone-800">Add New Patient</h3>
                  <button
                    onClick={() => setShowNewPatientModal(false)}
                    className="text-stone-400 hover:text-stone-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Personal Information */}
                <div>
                  <h4 className="text-lg font-medium text-stone-800 mb-4">Personal Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-2">Full Name *</label>
                      <Input
                        value={newPatientData.fullName}
                        onChange={(e) => setNewPatientData(prev => ({...prev, fullName: e.target.value}))}
                        placeholder="Enter full name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-2">Email *</label>
                      <Input
                        type="email"
                        value={newPatientData.email}
                        onChange={(e) => setNewPatientData(prev => ({...prev, email: e.target.value}))}
                        placeholder="Enter email"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-2">Phone</label>
                      <Input
                        value={newPatientData.phone}
                        onChange={(e) => setNewPatientData(prev => ({...prev, phone: e.target.value}))}
                        placeholder="Enter phone number"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-2">Date of Birth</label>
                      <Input
                        type="date"
                        value={newPatientData.dateOfBirth}
                        onChange={(e) => setNewPatientData(prev => ({...prev, dateOfBirth: e.target.value}))}
                      />
                    </div>
                  </div>
                </div>

                {/* Emergency Contact */}
                <div>
                  <h4 className="text-lg font-medium text-stone-800 mb-4">Emergency Contact</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-2">Contact Name</label>
                      <Input
                        value={newPatientData.emergencyContactName}
                        onChange={(e) => setNewPatientData(prev => ({...prev, emergencyContactName: e.target.value}))}
                        placeholder="Emergency contact name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-2">Contact Phone</label>
                      <Input
                        value={newPatientData.emergencyContactPhone}
                        onChange={(e) => setNewPatientData(prev => ({...prev, emergencyContactPhone: e.target.value}))}
                        placeholder="Emergency contact phone"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-2">Relationship</label>
                      <Input
                        value={newPatientData.emergencyContactRelation}
                        onChange={(e) => setNewPatientData(prev => ({...prev, emergencyContactRelation: e.target.value}))}
                        placeholder="Relationship to patient"
                      />
                    </div>
                  </div>
                </div>

                {/* Medical Information */}
                <div>
                  <h4 className="text-lg font-medium text-stone-800 mb-4">Medical Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-2">Doctor Name</label>
                      <Input
                        value={newPatientData.doctorName}
                        onChange={(e) => setNewPatientData(prev => ({...prev, doctorName: e.target.value}))}
                        placeholder="Primary doctor name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-2">Doctor Phone</label>
                      <Input
                        value={newPatientData.doctorPhone}
                        onChange={(e) => setNewPatientData(prev => ({...prev, doctorPhone: e.target.value}))}
                        placeholder="Doctor phone number"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-stone-700 mb-2">Current Medications</label>
                      <textarea
                        className="w-full p-3 border border-stone-300 rounded-md"
                        rows={3}
                        value={newPatientData.currentMedications}
                        onChange={(e) => setNewPatientData(prev => ({...prev, currentMedications: e.target.value}))}
                        placeholder="List current medications..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-2">Allergies</label>
                      <textarea
                        className="w-full p-3 border border-stone-300 rounded-md"
                        rows={3}
                        value={newPatientData.allergies}
                        onChange={(e) => setNewPatientData(prev => ({...prev, allergies: e.target.value}))}
                        placeholder="List allergies..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-2">Medical Conditions</label>
                      <textarea
                        className="w-full p-3 border border-stone-300 rounded-md"
                        rows={3}
                        value={newPatientData.medicalConditions}
                        onChange={(e) => setNewPatientData(prev => ({...prev, medicalConditions: e.target.value}))}
                        placeholder="List medical conditions..."
                      />
                    </div>
                  </div>
                </div>

                {/* Therapy Information */}
                <div>
                  <h4 className="text-lg font-medium text-stone-800 mb-4">Therapy Information</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-2">Current Problems</label>
                      <textarea
                        className="w-full p-3 border border-stone-300 rounded-md"
                        rows={3}
                        value={newPatientData.currentProblems}
                        onChange={(e) => setNewPatientData(prev => ({...prev, currentProblems: e.target.value}))}
                        placeholder="Describe current problems..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-2">Therapy History</label>
                      <textarea
                        className="w-full p-3 border border-stone-300 rounded-md"
                        rows={3}
                        value={newPatientData.therapyHistory}
                        onChange={(e) => setNewPatientData(prev => ({...prev, therapyHistory: e.target.value}))}
                        placeholder="Previous therapy experience..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-2">Therapy Goals</label>
                      <textarea
                        className="w-full p-3 border border-stone-300 rounded-md"
                        rows={3}
                        value={newPatientData.therapyGoals}
                        onChange={(e) => setNewPatientData(prev => ({...prev, therapyGoals: e.target.value}))}
                        placeholder="What do you hope to achieve..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-2">Suicidal Thoughts</label>
                      <textarea
                        className="w-full p-3 border border-stone-300 rounded-md"
                        rows={2}
                        value={newPatientData.suicidalThoughts}
                        onChange={(e) => setNewPatientData(prev => ({...prev, suicidalThoughts: e.target.value}))}
                        placeholder="Any thoughts of self-harm..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-2">Substance Use</label>
                      <textarea
                        className="w-full p-3 border border-stone-300 rounded-md"
                        rows={2}
                        value={newPatientData.substanceUse}
                        onChange={(e) => setNewPatientData(prev => ({...prev, substanceUse: e.target.value}))}
                        placeholder="Alcohol/drug use history..."
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-stone-200 flex gap-3">
                <Button
                  onClick={handleCreateNewPatient}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                  disabled={!newPatientData.fullName || !newPatientData.email}
                >
                  Create Patient
                </Button>
                <Button
                  onClick={() => setShowNewPatientModal(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Modern Time Slot Selection Modal */}
        {showDayDetailModal && selectedDayData && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden border border-gray-200">
              {/* Modal Header */}
              <div className="bg-gradient-to-br from-stone-100 to-cream-50 border-b border-stone-200 px-6 py-5">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-2xl font-light text-stone-800 mb-1">
                      {new Date(selectedDayData.date + 'T00:00:00').toLocaleDateString('de-DE', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </h3>
                    <div className="flex items-center gap-4 mt-3">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                        <span className="text-xs text-stone-600">Available</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-xs text-stone-600">Booked</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                        <span className="text-xs text-stone-600">Selected</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setShowDayDetailModal(false)
                      setSelectedSlots([])
                    }}
                    className="text-stone-400 hover:text-stone-600 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Modern Vertical Time Schedule */}
              <div className="flex flex-col h-full">
                {/* Time picker info */}
                {selectedSlots.length > 0 && (
                  <div className="px-6 py-3 bg-amber-50 border-b border-amber-200">
                    <span className="text-sm text-amber-800 font-medium">
                      {selectedSlots.length} slots selected • {selectedSlots[0]} - {selectedSlots[selectedSlots.length - 1]}
                    </span>
                  </div>
                )}
                
                {/* Scrollable time slots */}
                <div className="flex-1 max-h-[55vh] overflow-y-auto bg-white" onMouseLeave={handleSlotMouseUp}>
                  {generateTimeSlots(selectedDayData.date).map((slot, index) => {
                    const isSelected = selectedSlots.includes(slot.time)
                    
                    return (
                      <div
                        key={slot.time}
                        className={`group flex items-center h-12 border-b border-stone-100 last:border-b-0 cursor-pointer transition-all duration-150 select-none ${
                          slot.isBooked 
                            ? 'bg-blue-50 cursor-not-allowed'
                            : isSelected
                              ? 'bg-amber-50 border-l-4 border-l-amber-400'
                              : slot.isAvailable
                                ? 'bg-emerald-50/50'
                                : 'hover:bg-stone-50'
                        }`}
                        onMouseDown={() => !slot.isBooked && handleSlotMouseDown(slot.time)}
                        onMouseEnter={() => !slot.isBooked && handleSlotMouseEnter(slot.time)}
                        onMouseUp={handleSlotMouseUp}
                      >
                        {/* Time Column */}
                        <div className="w-24 flex-shrink-0 px-4 flex items-center">
                          <span className="font-light text-stone-700 text-base tracking-wide">
                            {slot.time}
                          </span>
                        </div>
                        
                        {/* Status Indicator */}
                        <div className="flex-1 px-4 flex items-center">
                          {slot.isBooked ? (
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              <span className="text-sm text-blue-700 font-medium">{slot.booking?.patientName || 'Booked'}</span>
                            </div>
                          ) : isSelected ? (
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
                              <span className="text-sm text-amber-700">Selected</span>
                            </div>
                          ) : slot.isAvailable ? (
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                              <span className="text-sm text-emerald-700">Available</span>
                            </div>
                          ) : (
                            <div className="w-1.5 h-1.5 bg-stone-300 rounded-full"></div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Modern Action Buttons */}
                {selectedSlots.length > 0 && (
                  <div className="px-6 py-4 bg-gradient-to-t from-stone-50 to-white border-t border-stone-200">
                    <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-amber-500 rounded-full animate-pulse"></div>
                        <span className="text-slate-700 font-medium">
                          {selectedSlots.length} time slot{selectedSlots.length > 1 ? 's' : ''} selected
                        </span>
                        <div className="hidden sm:block text-xs text-slate-500">
                          ({selectedSlots[0]} - {selectedSlots[selectedSlots.length - 1]})
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleSetAvailability(true)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-5 py-2 rounded-lg transition-colors"
                        >
                          Set Available
                        </Button>
                        <Button
                          onClick={() => handleSetAvailability(false)}
                          className="bg-stone-600 hover:bg-stone-700 text-white font-medium px-5 py-2 rounded-lg transition-colors"
                        >
                          Remove
                        </Button>
                        <Button
                          onClick={() => setSelectedSlots([])}
                          variant="outline"
                          className="border-stone-300 text-stone-600 hover:bg-stone-100 px-4 py-2 rounded-lg transition-colors"
                        >
                          Clear
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Quick Actions for no selection */}
                {selectedSlots.length === 0 && (
                  <div className="px-6 py-4 bg-gradient-to-t from-stone-50 to-white border-t border-stone-200">
                    <div className="text-center text-stone-500">
                      <p className="mb-3 text-sm">Drag over time slots to select them</p>
                      <div className="flex justify-center gap-4 text-sm">
                        <button 
                          onClick={() => {
                            const workingHours = generateTimeSlots(selectedDayData.date).filter(s => {
                              const hour = parseInt(s.time.split(':')[0])
                              return hour >= 9 && hour <= 17
                            }).map(s => s.time)
                            setSelectedSlots(workingHours)
                          }}
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          Select Working Hours (9-17)
                        </button>
                        <button 
                          onClick={() => {
                            const allSlots = generateTimeSlots(selectedDayData.date).map(s => s.time)
                            setSelectedSlots(allSlots)
                          }}
                          className="text-purple-600 hover:text-purple-800 font-medium"
                        >
                          Select All Day
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
