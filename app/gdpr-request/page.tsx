'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Shield, Download, Trash2, FileText, AlertCircle, CheckCircle, Clock, Mail } from 'lucide-react'

export default function GDPRRequest() {
  const [email, setEmail] = useState('')
  const [requestType, setRequestType] = useState<'export' | 'deletion' | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')

  const handleDataExport = async () => {
    if (!email) {
      setError('Bitte geben Sie Ihre E-Mail-Adresse ein.')
      return
    }

    setLoading(true)
    setError('')
    setResult(null)

    try {
      const response = await fetch(`/api/gdpr/deletion?email=${encodeURIComponent(email)}`, {
        method: 'GET'
      })
      
      const data = await response.json()
      
      if (data.success) {
        setResult({
          type: 'export',
          ...data
        })
        
        // Download JSON file
        if (data.data) {
          const blob = new Blob([JSON.stringify(data.data, null, 2)], { type: 'application/json' })
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = `gdpr-data-export-${email}-${new Date().toISOString().split('T')[0]}.json`
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
          URL.revokeObjectURL(url)
        }
      } else {
        setError(data.error || 'Fehler beim Datenexport')
      }
    } catch (err) {
      setError('Netzwerkfehler. Bitte versuchen Sie es später erneut.')
    } finally {
      setLoading(false)
    }
  }

  const handleDataDeletion = async () => {
    if (!email) {
      setError('Bitte geben Sie Ihre E-Mail-Adresse ein.')
      return
    }

    setLoading(true)
    setError('')
    setResult(null)

    try {
      const response = await fetch('/api/gdpr/deletion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email,
          requestType: 'deletion'
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        setResult({
          type: 'deletion',
          ...data
        })
      } else {
        setError(data.error || 'Fehler bei der Datenlöschung')
      }
    } catch (err) {
      setError('Netzwerkfehler. Bitte versuchen Sie es später erneut.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-3">
            <Shield className="h-10 w-10 text-blue-600" />
            DSGVO Datenanfrage
          </h1>
          <p className="text-lg text-gray-600">
            Verwalten Sie Ihre persönlichen Daten gemäß EU-Datenschutz-Grundverordnung
          </p>
        </div>

        {/* Input Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-blue-600" />
              Ihre E-Mail-Adresse
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              type="email"
              placeholder="ihre.email@beispiel.de"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mb-4"
            />
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
                <AlertCircle className="h-5 w-5" />
                {error}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Data Export */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5 text-green-600" />
                Datenexport (Art. 20 DSGVO)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Laden Sie alle Ihre gespeicherten Daten in einem strukturierten, maschinenlesbaren Format herunter.
              </p>
              <div className="space-y-2 text-sm text-gray-500 mb-4">
                <p>• Persönliche Daten</p>
                <p>• Terminbuchungen</p>
                <p>• Medizinische Formulardaten</p>
                <p>• Zahlungsinformationen</p>
              </div>
              <Button
                onClick={handleDataExport}
                disabled={loading || !email}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                {loading && requestType === 'export' ? (
                  <>
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                    Exportiere Daten...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Daten exportieren
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Data Deletion */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trash2 className="h-5 w-5 text-red-600" />
                Datenlöschung (Art. 17 DSGVO)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Beantragen Sie die Löschung aller Ihrer gespeicherten Daten ("Recht auf Vergessenwerden").
              </p>
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg mb-4">
                <p className="text-sm text-yellow-800">
                  ⚠️ <strong>Wichtiger Hinweis:</strong> Medizinische Daten müssen gemäß § 630f BGB 10 Jahre aufbewahrt werden.
                </p>
              </div>
              <Button
                onClick={handleDataDeletion}
                disabled={loading || !email}
                variant="destructive"
                className="w-full"
              >
                {loading && requestType === 'deletion' ? (
                  <>
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                    Lösche Daten...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Löschung beantragen
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Results */}
        {result && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Ergebnis Ihrer Anfrage
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-800 font-medium">{result.message}</p>
                  {result.requestId && (
                    <p className="text-sm text-green-600 mt-2">
                      Anfrage-ID: <code className="bg-green-100 px-2 py-1 rounded">{result.requestId}</code>
                    </p>
                  )}
                </div>

                {result.details && (
                  <div className="space-y-3">
                    {result.type === 'deletion' && (
                      <>
                        {result.details.deletedBookings > 0 && (
                          <p className="text-sm text-gray-600">
                            ✅ {result.details.deletedBookings} Buchungen gelöscht
                          </p>
                        )}
                        {result.details.deletedTokens > 0 && (
                          <p className="text-sm text-gray-600">
                            ✅ {result.details.deletedTokens} Patientendatensätze gelöscht
                          </p>
                        )}
                        {result.details.medicalDataStatus === 'retention_period' && (
                          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <p className="text-sm text-yellow-800">
                              ⏰ <strong>Aufbewahrungsfrist:</strong> {result.details.retentionInfo}
                            </p>
                          </div>
                        )}
                      </>
                    )}

                    {result.type === 'export' && result.data && (
                      <div className="space-y-2">
                        {result.data.personalData && (
                          <p className="text-sm text-gray-600">
                            ✅ Persönliche Daten: {result.data.personalData.fullName}
                          </p>
                        )}
                        {result.data.bookings && result.data.bookings.length > 0 && (
                          <p className="text-sm text-gray-600">
                            ✅ {result.data.bookings.length} Buchungen exportiert
                          </p>
                        )}
                        <p className="text-sm text-green-600">
                          📁 Datei wurde automatisch heruntergeladen
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Legal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              Rechtliche Informationen
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2">⏱️ Bearbeitungszeit</h4>
                <p className="text-sm text-gray-600 mb-4">
                  Ihre Anfrage wird innerhalb von 30 Tagen gemäß Art. 12 DSGVO bearbeitet.
                </p>
                
                <h4 className="font-semibold mb-2">📋 Aufbewahrungsfristen</h4>
                <p className="text-sm text-gray-600">
                  Medizinische Daten: 10 Jahre (§ 630f BGB)<br />
                  Buchungsdaten: 10 Jahre (HGB/AO)<br />
                  Marketing-Daten: Bis zum Widerruf
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">📞 Kontakt</h4>
                <p className="text-sm text-gray-600 mb-4">
                  Bei Fragen zu Ihrer Anfrage:<br />
                  E-Mail: datenschutz@katyusha-therapy.de<br />
                  Telefon: [Telefonnummer]
                </p>
                
                <h4 className="font-semibold mb-2">⚖️ Beschwerderecht</h4>
                <p className="text-sm text-gray-600">
                  Sie haben das Recht, sich bei der zuständigen Datenschutz-Aufsichtsbehörde zu beschweren.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Back to Home */}
        <div className="text-center mt-8">
          <a 
            href="/"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            ← Zurück zur Website
          </a>
        </div>
      </div>
    </div>
  )
}