"use client"

import React, { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Video, CheckCircle, AlertTriangle, User, Mail, Phone, ArrowLeft, Loader2 } from "lucide-react"
import CalendarBooking from "@/components/CalendarBooking"

interface SessionInfo {
  sessionsTotal: number
  sessionsUsed: number
  sessionsRemaining: number
  patientEmail: string
  patientName: string
  expiresAt: string
  isExpired: boolean
  isValid: boolean
}

interface BookingHistory {
  bookingId: string
  date: string
  time: string
  sessionPackage: any
  createdAt: string
  meetLink: string | null
  sessionNumber: number
  status: string
}

export default function MultiBookingPage() {
  const params = useParams()
  const token = params.token as string
  
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [sessionInfo, setSessionInfo] = useState<SessionInfo | null>(null)
  const [bookingHistory, setBookingHistory] = useState<BookingHistory[]>([])
  const [showCalendar, setShowCalendar] = useState(false)
  const [bookingSuccess, setBookingSuccess] = useState(false)
  const [newBookingDetails, setNewBookingDetails] = useState<any>(null)

  useEffect(() => {
    if (token) {
      loadTokenData()
    }
  }, [token])

  const loadTokenData = async () => {
    try {
      setLoading(true)
      setError("")
      
      const response = await fetch(`/api/booking-token/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ bookingToken: token })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to validate token')
      }

      setSessionInfo(data.sessionInfo)
      setBookingHistory(data.bookingHistory)
    } catch (err) {
      console.error('Token validation error:', err)
      setError(err instanceof Error ? err.message : 'Failed to load booking information')
    } finally {
      setLoading(false)
    }
  }

  const handleBookingComplete = async (bookingDetails: any) => {
    setNewBookingDetails(bookingDetails)
    setBookingSuccess(true)
    
    // Reload token data to update session count
    await loadTokenData()
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'bg-blue-100 text-blue-800'
      case 'today': return 'bg-green-100 text-green-800'
      case 'past': return 'bg-gray-100 text-gray-600'
      case 'completed': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-600'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream-50 to-stone-100 flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-stone-600 mx-auto mb-4" />
              <p className="text-stone-600">Loading your booking information...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream-50 to-stone-100 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="text-center py-12">
            <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="text-lg font-medium text-stone-800 mb-2">Booking Link Invalid</h3>
            <p className="text-stone-600 mb-6">{error}</p>
            <Button 
              onClick={() => window.location.href = '/'}
              className="bg-stone-600 hover:bg-stone-700"
            >
              Return Home
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (bookingSuccess && newBookingDetails) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream-50 to-stone-100 py-12">
        <div className="max-w-4xl mx-auto px-4">
          {/* Success Header */}
          <Card className="mb-8">
            <CardContent className="text-center py-12">
              <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h1 className="text-3xl font-light text-stone-800 mb-4">Booking Confirmed!</h1>
              <p className="text-xl text-stone-600 mb-6">
                Session {newBookingDetails.sessionNumber} of {newBookingDetails.totalSessions} has been scheduled
              </p>
              
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-medium text-stone-800 mb-3">Your Session Details</h3>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-blue-600" />
                    <span>Date: {formatDate(newBookingDetails.date || '')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-blue-600" />
                    <span>Time: {newBookingDetails.time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Video className="h-4 w-4 text-blue-600" />
                    <span>Google Meet link sent via email</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-blue-600" />
                    <span>{newBookingDetails.sessionsRemaining} sessions remaining</span>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-4 justify-center">
                <Button 
                  onClick={() => setBookingSuccess(false)}
                  variant="outline"
                  className="border-stone-300"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
                {newBookingDetails.meetLink && (
                  <Button 
                    onClick={() => window.open(newBookingDetails.meetLink, '_blank')}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Video className="h-4 w-4 mr-2" />
                    Join Session
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (showCalendar && sessionInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream-50 to-stone-100">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="mb-6">
            <Button 
              onClick={() => setShowCalendar(false)}
              variant="outline"
              className="border-stone-300 mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  Book Session {sessionInfo.sessionsUsed + 1} of {sessionInfo.sessionsTotal}
                </CardTitle>
                <p className="text-stone-600">
                  Hi {sessionInfo.patientName}! Select your preferred date and time for your next session.
                </p>
              </CardHeader>
            </Card>
          </div>

          <CalendarBooking
            language="en"
            bookingToken={token}
            onBookingComplete={handleBookingComplete}
            sessionInfo={{
              current: sessionInfo.sessionsUsed + 1,
              total: sessionInfo.sessionsTotal,
              remaining: sessionInfo.sessionsRemaining
            }}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-50 to-stone-100">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extralight text-stone-800 mb-4">
            Welcome back, {sessionInfo?.patientName}! 👋
          </h1>
          <p className="text-xl text-stone-600">
            Manage your therapy sessions and book new appointments
          </p>
        </div>

        {/* Session Package Overview */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <User className="h-5 w-5 text-blue-600" />
                Your Session Package
              </span>
              {sessionInfo?.isExpired ? (
                <Badge className="bg-red-100 text-red-800">Expired</Badge>
              ) : sessionInfo?.sessionsRemaining === 0 ? (
                <Badge className="bg-gray-100 text-gray-600">Completed</Badge>
              ) : (
                <Badge className="bg-green-100 text-green-800">Active</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-light text-stone-800 mb-2">
                  {sessionInfo?.sessionsTotal}
                </div>
                <div className="text-sm text-stone-600">Total Sessions</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-light text-green-600 mb-2">
                  {sessionInfo?.sessionsUsed}
                </div>
                <div className="text-sm text-stone-600">Used Sessions</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-light text-blue-600 mb-2">
                  {sessionInfo?.sessionsRemaining}
                </div>
                <div className="text-sm text-stone-600">Remaining Sessions</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-stone-600 mb-2">Valid Until</div>
                <div className="text-sm font-medium text-stone-800">
                  {sessionInfo ? formatDate(sessionInfo.expiresAt) : 'Loading...'}
                </div>
              </div>
            </div>

            {/* Book Next Session Button */}
            {sessionInfo?.isValid && sessionInfo?.sessionsRemaining > 0 && (
              <div className="mt-6 text-center">
                <Button 
                  onClick={() => setShowCalendar(true)}
                  size="lg"
                  className="bg-stone-600 hover:bg-stone-700 text-white px-8 py-3"
                >
                  <Calendar className="h-5 w-5 mr-2" />
                  Book Session {sessionInfo.sessionsUsed + 1}
                </Button>
              </div>
            )}

            {/* Warning Messages */}
            {sessionInfo?.isExpired && (
              <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2 text-red-800">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="font-medium">Package Expired</span>
                </div>
                <p className="text-red-700 text-sm mt-1">
                  Your session package expired on {formatDate(sessionInfo.expiresAt)}. Please contact Dr. Katiuscia to renew.
                </p>
              </div>
            )}

            {sessionInfo?.sessionsRemaining === 0 && !sessionInfo?.isExpired && (
              <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-center gap-2 text-amber-800">
                  <CheckCircle className="h-4 w-4" />
                  <span className="font-medium">All Sessions Used</span>
                </div>
                <p className="text-amber-700 text-sm mt-1">
                  You have completed all sessions in your package. Thank you! Contact Dr. Katiuscia to book additional sessions.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Booking History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-stone-600" />
              Your Session History
            </CardTitle>
          </CardHeader>
          <CardContent>
            {bookingHistory.length === 0 ? (
              <div className="text-center py-8 text-stone-500">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No sessions booked yet</p>
                <p className="text-sm">Click "Book Session" above to schedule your first appointment</p>
              </div>
            ) : (
              <div className="space-y-4">
                {bookingHistory.map((booking) => (
                  <div 
                    key={booking.bookingId}
                    className="flex items-center justify-between p-4 border border-stone-200 rounded-lg hover:bg-stone-50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <div className="text-lg font-medium text-stone-800">
                          {new Date(booking.date).getDate()}
                        </div>
                        <div className="text-xs text-stone-500 uppercase">
                          {new Date(booking.date).toLocaleDateString('en-US', { month: 'short' })}
                        </div>
                      </div>
                      
                      <div>
                        <div className="font-medium text-stone-800">
                          Session {booking.sessionNumber}
                        </div>
                        <div className="text-sm text-stone-600">
                          {formatDate(booking.date)} at {booking.time}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Badge className={getStatusColor(booking.status)}>
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </Badge>
                      
                      {booking.meetLink && booking.status !== 'past' && (
                        <Button
                          onClick={() => window.open(booking.meetLink!, '_blank')}
                          size="sm"
                          variant="outline"
                          className="border-blue-200 text-blue-700 hover:bg-blue-50"
                        >
                          <Video className="h-4 w-4 mr-1" />
                          Join
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Contact Info */}
        <Card className="mt-8">
          <CardContent className="py-6">
            <div className="text-center">
              <h3 className="text-lg font-medium text-stone-800 mb-4">Need Help?</h3>
              <p className="text-stone-600 mb-4">
                If you have questions about your sessions or need to make changes, feel free to reach out.
              </p>
              <div className="flex justify-center gap-4">
                <div className="flex items-center gap-2 text-sm text-stone-600">
                  <Mail className="h-4 w-4" />
                  <span>support@doctorktherapy.com</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}