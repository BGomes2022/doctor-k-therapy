'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Cookie, Settings, X, Check } from 'lucide-react'

interface CookieConsent {
  necessary: boolean
  analytics: boolean
  marketing: boolean
  functional: boolean
}

export default function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [consent, setConsent] = useState<CookieConsent>({
    necessary: true, // Always required
    analytics: false,
    marketing: false,
    functional: false
  })

  useEffect(() => {
    // Check if user has already given consent
    const savedConsent = localStorage.getItem('cookie-consent')
    if (!savedConsent) {
      setShowBanner(true)
    } else {
      const parsed = JSON.parse(savedConsent)
      setConsent(parsed)
    }
  }, [])

  const saveConsent = (consentData: CookieConsent) => {
    localStorage.setItem('cookie-consent', JSON.stringify({
      ...consentData,
      timestamp: new Date().toISOString(),
      version: '1.0'
    }))
    
    // Set cookies based on consent
    if (consentData.analytics) {
      // Enable analytics cookies
      document.cookie = 'analytics_enabled=true; path=/; max-age=31536000; SameSite=Strict'
    }
    if (consentData.marketing) {
      // Enable marketing cookies
      document.cookie = 'marketing_enabled=true; path=/; max-age=31536000; SameSite=Strict'
    }
    if (consentData.functional) {
      // Enable functional cookies
      document.cookie = 'functional_enabled=true; path=/; max-age=31536000; SameSite=Strict'
    }
    
    setShowBanner(false)
    setShowSettings(false)
  }

  const acceptAll = () => {
    const allConsent = {
      necessary: true,
      analytics: true,
      marketing: true,
      functional: true
    }
    setConsent(allConsent)
    saveConsent(allConsent)
  }

  const acceptNecessary = () => {
    const necessaryOnly = {
      necessary: true,
      analytics: false,
      marketing: false,
      functional: false
    }
    setConsent(necessaryOnly)
    saveConsent(necessaryOnly)
  }

  const toggleConsent = (type: keyof CookieConsent) => {
    if (type === 'necessary') return // Cannot disable necessary cookies
    
    setConsent(prev => ({
      ...prev,
      [type]: !prev[type]
    }))
  }

  if (!showBanner) return null

  return (
    <>
      {/* Cookie Banner */}
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-white border-t-2 border-blue-500 shadow-xl">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-start gap-4">
            <Cookie className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-2">🍪 Cookie-Einstellungen</h3>
              <p className="text-sm text-gray-600 mb-4">
                Diese Website verwendet Cookies und ähnliche Technologien, um Ihnen die bestmögliche Erfahrung zu bieten. 
                Einige sind für die Funktion der Website erforderlich, andere helfen uns, die Website zu verbessern.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button 
                  onClick={acceptAll}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Alle akzeptieren
                </Button>
                <Button 
                  onClick={acceptNecessary}
                  variant="outline"
                  className="border-gray-300"
                >
                  Nur notwendige
                </Button>
                <Button 
                  onClick={() => setShowSettings(true)}
                  variant="outline"
                  className="border-gray-300"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Einstellungen
                </Button>
              </div>
            </div>
            <button 
              onClick={acceptNecessary}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Cookie Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-60 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Cookie-Einstellungen verwalten</h2>
                <button 
                  onClick={() => setShowSettings(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <div className="space-y-6">
                {/* Necessary Cookies */}
                <div className="border-b pb-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">Notwendige Cookies</h3>
                    <div className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                      Immer aktiv
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">
                    Diese Cookies sind für die grundlegende Funktionalität der Website erforderlich und können nicht deaktiviert werden.
                  </p>
                </div>

                {/* Analytics Cookies */}
                <div className="border-b pb-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">Analyse-Cookies</h3>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={consent.analytics}
                        onChange={() => toggleConsent('analytics')}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  <p className="text-sm text-gray-600">
                    Helfen uns zu verstehen, wie Besucher die Website nutzen, um die Benutzererfahrung zu verbessern.
                  </p>
                </div>

                {/* Marketing Cookies */}
                <div className="border-b pb-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">Marketing-Cookies</h3>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={consent.marketing}
                        onChange={() => toggleConsent('marketing')}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  <p className="text-sm text-gray-600">
                    Werden verwendet, um relevante Werbung anzuzeigen und die Effektivität von Werbekampagnen zu messen.
                  </p>
                </div>

                {/* Functional Cookies */}
                <div className="pb-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">Funktionale Cookies</h3>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={consent.functional}
                        onChange={() => toggleConsent('functional')}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  <p className="text-sm text-gray-600">
                    Ermöglichen erweiterte Funktionen und Personalisierung, wie Chat-Widgets oder personalisierte Inhalte.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button
                  onClick={() => saveConsent(consent)}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  Einstellungen speichern
                </Button>
                <Button
                  onClick={() => setShowSettings(false)}
                  variant="outline"
                  className="border-gray-300"
                >
                  Abbrechen
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </>
  )
}