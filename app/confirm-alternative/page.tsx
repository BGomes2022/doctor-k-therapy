"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

function ConfirmAlternativeContent() {
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')
  
  const bookingToken = searchParams.get('token')
  const date = searchParams.get('date')
  const time = searchParams.get('time')
  const patientEmail = searchParams.get('email')
  const patientName = searchParams.get('name')

  useEffect(() => {
    if (bookingToken && date && time && patientEmail && patientName) {
      confirmAlternative()
    } else {
      setStatus('error')
      setMessage('Missing required information. Please use the link from your email.')
    }
  }, [bookingToken, date, time, patientEmail, patientName])

  const confirmAlternative = async () => {
    try {
      const response = await fetch('/api/confirm-alternative', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingToken,
          alternativeDate: date,
          alternativeTime: time,
          patientEmail,
          patientName
        })
      })

      const result = await response.json()

      if (result.success) {
        setStatus('success')
        setMessage('Your alternative appointment has been confirmed! You will receive a calendar invitation shortly.')
      } else {
        setStatus('error')
        setMessage(result.error || 'Failed to confirm appointment')
      }
    } catch (error) {
      setStatus('error')
      setMessage('An error occurred while confirming your appointment')
    }
  }

  const formatDateTime = (dateStr: string, timeStr: string) => {
    try {
      const dateTime = new Date(`${dateStr}T${timeStr}`)
      return {
        date: dateTime.toLocaleDateString('en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        }),
        time: dateTime.toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: true 
        })
      }
    } catch {
      return { date: dateStr, time: timeStr }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="max-w-lg w-full">
        <CardContent className="p-8 text-center">
          {status === 'loading' && (
            <>
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <h2 className="text-xl font-medium text-stone-800 mb-2">
                Confirming your appointment...
              </h2>
              <p className="text-stone-600">Please wait while we process your confirmation.</p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-medium text-stone-800 mb-2">
                ✅ Appointment Confirmed!
              </h2>
              <p className="text-stone-600 mb-4">{message}</p>
              
              {date && time && (
                <div className="bg-blue-50 rounded-lg p-4 mb-6">
                  <h3 className="font-medium text-blue-900 mb-2">Your New Appointment:</h3>
                  <p className="text-blue-800">
                    📅 {formatDateTime(date, time).date}<br/>
                    🕐 {formatDateTime(date, time).time}
                  </p>
                </div>
              )}
              
              <div className="space-y-3">
                <p className="text-sm text-stone-500">
                  📧 You will receive a calendar invitation with the Google Meet link
                </p>
                <Button
                  onClick={() => window.close()}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Close Window
                </Button>
              </div>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="X6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h2 className="text-2xl font-medium text-stone-800 mb-2">
                ❌ Confirmation Failed
              </h2>
              <p className="text-stone-600 mb-4">{message}</p>
              
              <div className="space-y-3">
                <p className="text-sm text-stone-500">
                  Please contact Dr. Katiuscia directly or use your original booking link to schedule a new appointment.
                </p>
                <Button
                  onClick={() => window.location.href = 'mailto:dr.k@doctorktherapy.com'}
                  variant="outline"
                  className="border-red-300 text-red-600 hover:bg-red-50"
                >
                  📧 Contact Support
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default function ConfirmAlternativePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <ConfirmAlternativeContent />
    </Suspense>
  )
}