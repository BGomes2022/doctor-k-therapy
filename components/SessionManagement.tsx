import React, { useState, useCallback, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Plus, Minus, Loader2, Check } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

interface SessionManagementProps {
  patient: {
    bookingToken: string
    userId: string
    patientName?: string
    patientEmail?: string
    sessionPackage?: {
      name: string
      price: number
      id: string
    }
    sessionsTotal?: number
    sessionsUsed?: number
    sessionsRemaining?: number
  }
  onUpdate?: () => void
}

export function SessionManagement({ patient, onUpdate }: SessionManagementProps) {
  const { toast } = useToast()
  const [sessionsTotal, setSessionsTotal] = useState(patient.sessionsTotal || 1)
  const [sessionsUsed, setSessionsUsed] = useState(patient.sessionsUsed || 0)
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)

  const sessionsRemaining = sessionsTotal - sessionsUsed
  const progressPercentage = sessionsTotal > 0 ? (sessionsUsed / sessionsTotal) * 100 : 0

  useEffect(() => {
    setSessionsTotal(patient.sessionsTotal || 1)
    setSessionsUsed(patient.sessionsUsed || 0)
  }, [patient])

  const saveChanges = useCallback(async (newTotal: number, newUsed: number) => {
    setLoading(true)
    setSaved(false)

    try {
      const response = await fetch('/api/admin/update-sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookingToken: patient.bookingToken,
          sessionsTotal: newTotal,
          sessionsUsed: newUsed,
        }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setSaved(true)

        toast({
          title: 'Sessions Updated',
          description: `Successfully updated sessions for ${patient.patientName || 'patient'}`,
        })

        if (onUpdate) onUpdate()

        // Hide saved indicator after 2 seconds
        setTimeout(() => setSaved(false), 2000)
      } else {
        throw new Error(data.error || 'Failed to update sessions')
      }
    } catch (error: any) {
      console.error('Error updating sessions:', error)
      toast({
        title: 'Update Failed',
        description: error.message || 'Failed to update sessions',
        variant: 'destructive',
      })

      // Revert values on error
      setSessionsTotal(patient.sessionsTotal || 1)
      setSessionsUsed(patient.sessionsUsed || 0)
    } finally {
      setLoading(false)
    }
  }, [patient, toast, onUpdate])

  const adjustTotal = useCallback((delta: number) => {
    const newTotal = Math.max(sessionsUsed, sessionsTotal + delta)
    setSessionsTotal(newTotal)
    saveChanges(newTotal, sessionsUsed)
  }, [sessionsTotal, sessionsUsed, saveChanges])

  const adjustUsed = useCallback((delta: number) => {
    const newUsed = Math.max(0, Math.min(sessionsTotal, sessionsUsed + delta))
    setSessionsUsed(newUsed)
    saveChanges(sessionsTotal, newUsed)
  }, [sessionsTotal, sessionsUsed, saveChanges])

  return (
    <div className="bg-gradient-to-br from-stone-100/40 to-cream-100/60 rounded-lg p-3 border border-stone-200 shadow-sm">
      <h4 className="font-medium text-stone-700 mb-3 flex items-center gap-2 text-sm">
        <span className="text-sm">📊</span>
        Session Management
        {loading && <Loader2 className="h-3 w-3 animate-spin text-stone-500" />}
        {saved && <Check className="h-3 w-3 text-green-600" />}
      </h4>

      {/* Session Overview - Compact Design */}
      <div className="grid grid-cols-3 gap-2 mb-3 p-2 bg-white/50 rounded border border-stone-200/50">
        <div className="text-center">
          <p className="text-xs text-stone-500">Total</p>
          <p className="text-lg font-semibold text-stone-700">{sessionsTotal}</p>
        </div>
        <div className="text-center border-x border-stone-200/50">
          <p className="text-xs text-stone-500">Used</p>
          <p className="text-lg font-semibold text-amber-600">{sessionsUsed}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-stone-500">Remaining</p>
          <p className={`text-lg font-semibold ${
            sessionsRemaining > 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {sessionsRemaining}
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-3">
        <div className="flex justify-between text-xs text-stone-600 mb-1">
          <span>Session Progress</span>
          <span>{Math.round(progressPercentage)}%</span>
        </div>
        <div className="w-full bg-stone-200 rounded-full h-1.5">
          <div
            className="bg-gradient-to-r from-amber-500 to-orange-500 h-1.5 rounded-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Controls - Simplified Design */}
      <div className="space-y-2 text-sm">
        {/* Total Sessions */}
        <div className="flex justify-between items-center py-1">
          <span className="text-stone-600">Total Sessions:</span>
          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => adjustTotal(-1)}
              disabled={loading || sessionsTotal <= sessionsUsed}
              className="h-6 w-6 p-0 hover:bg-stone-200"
            >
              <Minus className="h-3 w-3" />
            </Button>
            <span className="w-8 text-center font-medium text-stone-700">
              {sessionsTotal}
            </span>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => adjustTotal(1)}
              disabled={loading}
              className="h-6 w-6 p-0 hover:bg-stone-200"
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Used Sessions */}
        <div className="flex justify-between items-center py-1">
          <span className="text-stone-600">Used Sessions:</span>
          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => adjustUsed(-1)}
              disabled={loading || sessionsUsed <= 0}
              className="h-6 w-6 p-0 hover:bg-stone-200"
            >
              <Minus className="h-3 w-3" />
            </Button>
            <span className="w-8 text-center font-medium text-stone-700">
              {sessionsUsed}
            </span>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => adjustUsed(1)}
              disabled={loading || sessionsUsed >= sessionsTotal}
              className="h-6 w-6 p-0 hover:bg-stone-200"
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>

      {/* Package Info */}
      <div className="mt-3 pt-2 border-t border-stone-200/50">
        <div className="flex justify-between items-center">
          <span className="text-xs text-stone-500">Package:</span>
          <span className="text-xs font-medium text-stone-600">
            {patient.sessionPackage?.name || 'Standard Session'}
          </span>
        </div>
      </div>

      {/* Warning for no remaining sessions */}
      {sessionsRemaining === 0 && (
        <div className="mt-2 p-2 bg-red-50 text-red-700 rounded text-xs">
          ⚠️ No sessions remaining
        </div>
      )}
    </div>
  )
}