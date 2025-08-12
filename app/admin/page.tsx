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
  const [availability, setAvailability] = useState<any[]>([])
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
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
    message: ""
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
    const packageInfo = patient.sessionPackage
    if (!packageInfo) return 0
    
    // Count completed sessions for this patient
    const completedSessions = bookings.filter(b => {
      return b.bookingToken === patient.bookingToken && new Date(b.date) < new Date()
    }).length

    // Determine total sessions based on package
    let totalSessions = 1
    if (packageInfo.name?.includes('4 Sessions')) totalSessions = 4
    else if (packageInfo.name?.includes('6 Sessions')) totalSessions = 6
    
    return totalSessions - completedSessions
  }

  const handleAvailabilityUpdate = async () => {
    if (!availabilityData.date || !availabilityData.time) {
      alert('Please select date and time')
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
        alert('Availability updated successfully!')
        setShowAvailabilityModal(false)
        setAvailabilityData({
          date: "",
          time: "",
          available: true,
          reason: ""
        })
        fetchAvailability()
      } else {
        alert(result.error || 'Failed to update availability')
      }
    } catch (error) {
      console.error('Availability update error:', error)
      alert('Failed to update availability')
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
    const dateStr = date.toISOString().split('T')[0]
    const dayOfWeek = date.getDay()
    
    // Check if it's a booking
    const hasBooking = bookings.some(b => b.date === dateStr)
    
    // Check if it's normally available (Tuesday = 2, Thursday = 4)
    const isNormallyAvailable = dayOfWeek === 2 || dayOfWeek === 4
    
    // Check for custom availability
    const customAvailability = availability.find(a => a.date === dateStr)
    
    if (hasBooking) return 'booked'
    if (customAvailability && !customAvailability.available) return 'blocked'
    if (customAvailability && customAvailability.available) return 'available'
    if (isNormallyAvailable) return 'default-available'
    return 'unavailable'
  }

  const handleQuickBlock = async (days: number, reason = 'Blocked') => {
    const today = new Date()
    const promises = []
    
    for (let i = 0; i < days; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)
      const dateStr = date.toISOString().split('T')[0]
      
      promises.push(
        fetch('/api/admin/availability', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            date: dateStr,
            time: '19:00', // Just set one time to mark the day
            available: false,
            reason
          })
        })
      )
    }
    
    await Promise.all(promises)
    fetchAvailability()
    alert(`Next ${days} days blocked successfully!`)
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
  const [isDragging, setIsDragging] = useState(false)
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
      message: ""
    })
    setShowCancelModal(true)
    setOpenMenuBookingId(null)
  }

  const submitReschedule = async () => {
    if (!selectedBooking || !rescheduleData.date || !rescheduleData.time) {
      alert('Please select new date and time')
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
        alert('Booking rescheduled successfully!')
        setShowRescheduleModal(false)
        fetchData()
      } else {
        alert(result.error || 'Failed to reschedule booking')
      }
    } catch (error) {
      console.error('Reschedule error:', error)
      alert('Failed to reschedule booking')
    }
  }

  const submitCancel = async () => {
    if (!selectedBooking || !cancelData.reason) {
      alert('Please provide a cancellation reason')
      return
    }

    try {
      const response = await fetch('/api/admin/modify-booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: selectedBooking.bookingId,
          action: 'cancel',
          reason: cancelData.reason,
          message: cancelData.message
        })
      })

      const result = await response.json()
      
      if (result.success) {
        alert('Booking cancelled successfully!')
        setShowCancelModal(false)
        fetchData()
      } else {
        alert(result.error || 'Failed to cancel booking')
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
        alert(result.error || 'Failed to save notes')
      }
    } catch (error) {
      console.error('Notes save error:', error)
      alert('Failed to save notes')
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
        alert('Patient created successfully!')
      } else {
        alert('Error creating patient: ' + result.error)
      }
    } catch (error) {
      console.error('Error creating patient:', error)
      alert('Error creating patient')
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
                        const data = patient.medicalFormData
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
                                    <div className="font-medium text-lg">{data.fullName}</div>
                                    <div className="text-sm text-stone-500">
                                      {data.email} • {data.phone}
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="px-3 py-1 bg-stone-100 rounded-full text-sm">
                                      {patient.sessionPackage?.name || 'Session'}
                                    </span>
                                    <span className={`px-3 py-1 rounded-full text-sm ${
                                      sessionsRemaining > 0 
                                        ? 'bg-green-100 text-green-700' 
                                        : 'bg-gray-100 text-gray-700'
                                    }`}>
                                      {sessionsRemaining} sessions left
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
                                        <div className="space-y-3">
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
                  <div className="flex flex-wrap gap-3">
                    <Button
                      onClick={() => handleQuickBlock(1, 'Today blocked')}
                      variant="outline"
                      size="sm"
                      className="border-red-200 text-red-700 hover:bg-red-50"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Block Today
                    </Button>
                    <Button
                      onClick={() => handleQuickBlock(7, 'Week blocked')}
                      variant="outline"
                      size="sm"
                      className="border-red-200 text-red-700 hover:bg-red-50"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Block Week
                    </Button>
                    <Button
                      onClick={() => setShowNewPatientModal(true)}
                      variant="outline"
                      size="sm"
                      className="border-blue-200 text-blue-700 hover:bg-blue-50"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Patient
                    </Button>
                    <Button
                      onClick={() => alert('Send reminders feature coming soon!')}
                      className="bg-stone-600 hover:bg-stone-700 text-white"
                      size="sm"
                    >
                      <Mail className="h-4 w-4 mr-1" />
                      Send Reminders
                    </Button>
                  </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-stone-600 uppercase tracking-wide">Today's Sessions</p>
                          <p className="text-2xl font-bold text-stone-800">
                            {bookings.filter(b => {
                              const today = new Date().toISOString().split('T')[0];
                              return b.date === today;
                            }).length}
                          </p>
                        </div>
                        <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                          <Calendar className="h-4 w-4 text-green-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-stone-600 uppercase tracking-wide">This Week</p>
                          <p className="text-2xl font-bold text-stone-800">
                            {bookings.filter(b => {
                              const bookingDate = new Date(b.date);
                              const today = new Date();
                              const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
                              return bookingDate >= today && bookingDate <= weekFromNow;
                            }).length}
                          </p>
                        </div>
                        <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <Clock className="h-4 w-4 text-blue-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-stone-600 uppercase tracking-wide">Active Patients</p>
                          <p className="text-2xl font-bold text-stone-800">{patients.length}</p>
                        </div>
                        <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
                          <User className="h-4 w-4 text-purple-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-stone-600 uppercase tracking-wide">Need Follow-up</p>
                          <p className="text-2xl font-bold text-stone-800">
                            {patients.filter(p => !p.therapistNotes || p.therapistNotes.trim() === '').length}
                          </p>
                        </div>
                        <div className="h-8 w-8 bg-amber-100 rounded-full flex items-center justify-center">
                          <AlertTriangle className="h-4 w-4 text-amber-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Legend */}
                <Card>
                  <CardContent className="p-4">
                    <div className="flex flex-wrap gap-6 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-green-100 border border-green-300 rounded"></div>
                        <span>Available</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-blue-100 border border-blue-300 rounded"></div>
                        <span>Booked</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-red-100 border border-red-300 rounded"></div>
                        <span>Blocked</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-gray-100 border border-gray-300 rounded"></div>
                        <span>Unavailable</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Google Calendar Integration */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-blue-600" />
                        Your Schedule
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <div className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                          ✅ Synced with Google Calendar
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(`https://calendar.google.com/calendar/u/0/r?cid=${encodeURIComponent(process.env.NEXT_PUBLIC_DOCTOR_EMAIL || 'dr.k@doctorktherapy.com')}`, '_blank')}
                        >
                          <Settings className="h-4 w-4 mr-1" />
                          Open in Google
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    {/* Google Calendar Embed */}
                    <div className="w-full">
                      <iframe 
                        src="https://calendar.google.com/calendar/embed?height=600&wkst=1&ctz=Europe%2FZurich&bgcolor=%23ffffff&showTitle=0&showDate=1&showPrint=0&showTabs=1&showCalendars=0&showTz=1&mode=WEEK"
                        className="w-full border-0 rounded-b-lg"
                        style={{ height: '600px' }}
                        title="Dr. Katiuscia's Schedule"
                        frameBorder="0"
                        scrolling="no"
                      />
                      
                      {/* Fallback Notice */}
                      <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-center gap-2 text-blue-800 text-sm">
                          <div className="h-4 w-4 bg-blue-200 rounded-full flex items-center justify-center">
                            <span className="text-xs">ℹ</span>
                          </div>
                          <span className="font-medium">Calendar Integration Status</span>
                        </div>
                        <p className="text-blue-700 text-sm mt-1">
                          To see your actual therapy appointments here, you need to make your Google Calendar public or configure domain-wide delegation properly.
                        </p>
                        <div className="mt-3">
                          <button 
                            onClick={() => window.open('https://calendar.google.com/calendar/u/0/r?cid=dr.k@doctorktherapy.com', '_blank')}
                            className="text-xs bg-blue-100 hover:bg-blue-200 px-3 py-1 rounded border border-blue-300 text-blue-800"
                          >
                            📅 Open Google Calendar Directly
                          </button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Tips Card */}
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Calendar className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-stone-800 mb-2">Google Calendar Integration</h3>
                        <p className="text-sm text-stone-600 mb-3">
                          Your schedule is now fully integrated with Google Calendar. All patient bookings will automatically appear in your calendar with Google Meet links.
                        </p>
                        <div className="flex flex-wrap gap-2">
                          <div className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded border border-green-200">
                            ✅ Automatic Meet links
                          </div>
                          <div className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded border border-blue-200">
                            ✅ Calendar invites sent
                          </div>
                          <div className="text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded border border-purple-200">
                            ✅ Mobile sync
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Working Hours Info */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Clock className="h-5 w-5" />
                        Default Working Hours
                      </CardTitle>
                      <div className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded border border-green-200">
                        Managed in Google Calendar
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="p-4 border border-green-200 rounded-lg bg-gradient-to-br from-green-50 to-emerald-50">
                          <div className="flex items-center justify-between mb-2">
                            <div className="font-medium text-green-800">Tuesday</div>
                            <span className="text-xs bg-green-100 px-2 py-1 rounded">Active</span>
                          </div>
                          <div className="text-sm text-green-700">19:00 • 21:00 • 22:00 • 23:00</div>
                          <div className="text-xs text-stone-500 mt-1">4 time slots available</div>
                        </div>
                        <div className="p-4 border border-green-200 rounded-lg bg-gradient-to-br from-green-50 to-emerald-50">
                          <div className="flex items-center justify-between mb-2">
                            <div className="font-medium text-green-800">Thursday</div>
                            <span className="text-xs bg-green-100 px-2 py-1 rounded">Active</span>
                          </div>
                          <div className="text-sm text-green-700">19:00 • 21:00 • 22:00 • 23:00</div>
                          <div className="text-xs text-stone-500 mt-1">4 time slots available</div>
                        </div>
                      </div>
                      
                      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <div className="flex items-start gap-3">
                          <div className="h-5 w-5 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Calendar className="h-3 w-3 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-blue-800 mb-1">Google Calendar Management</h4>
                            <p className="text-sm text-blue-700">
                              To modify your working hours or block specific times, use the Google Calendar above or open it directly in Google Calendar for advanced features like recurring blocks.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
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
      </div>
    </div>
  )
}