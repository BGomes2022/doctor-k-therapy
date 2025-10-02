'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Settings, X, Check } from 'lucide-react'

interface CookieConsent {
  necessary: boolean
  analytics: boolean
  marketing: boolean
  functional: boolean
}

interface CookieTexts {
  title: string
  description: string
  acceptAll: string
  necessary: string
  settings: string
  settingsTitle: string
  saveSettings: string
  cancel: string
  alwaysActive: string
  necessaryTitle: string
  necessaryDesc: string
  analyticsTitle: string
  analyticsDesc: string
  marketingTitle: string
  marketingDesc: string
  functionalTitle: string
  functionalDesc: string
}

const translations = {
  en: {
    title: 'Cookie Settings',
    description: 'This website uses cookies and similar technologies to provide you with the best possible experience. Some are necessary for the website to function, others help us improve the website.',
    acceptAll: 'Accept All',
    necessary: 'Necessary Only',
    settings: 'Settings',
    settingsTitle: 'Manage Cookie Settings',
    saveSettings: 'Save Settings',
    cancel: 'Cancel',
    alwaysActive: 'Always Active',
    necessaryTitle: 'Necessary Cookies',
    necessaryDesc: 'These cookies are required for the basic functionality of the website and cannot be disabled.',
    analyticsTitle: 'Analytics Cookies',
    analyticsDesc: 'Help us understand how visitors use the website to improve the user experience.',
    marketingTitle: 'Marketing Cookies',
    marketingDesc: 'Used to show relevant advertising and measure the effectiveness of advertising campaigns.',
    functionalTitle: 'Functional Cookies',
    functionalDesc: 'Enable advanced features and personalization, such as chat widgets or personalized content.'
  },
  it: {
    title: 'Impostazioni Cookie',
    description: 'Questo sito web utilizza cookie e tecnologie simili per offrirti la migliore esperienza possibile. Alcuni sono necessari per il funzionamento del sito, altri ci aiutano a migliorare il sito web.',
    acceptAll: 'Accetta Tutto',
    necessary: 'Solo Necessari',
    settings: 'Impostazioni',
    settingsTitle: 'Gestisci Impostazioni Cookie',
    saveSettings: 'Salva Impostazioni',
    cancel: 'Annulla',
    alwaysActive: 'Sempre Attivo',
    necessaryTitle: 'Cookie Necessari',
    necessaryDesc: 'Questi cookie sono necessari per la funzionalità di base del sito web e non possono essere disabilitati.',
    analyticsTitle: 'Cookie Analitici',
    analyticsDesc: 'Ci aiutano a capire come i visitatori utilizzano il sito web per migliorare l\'esperienza utente.',
    marketingTitle: 'Cookie di Marketing',
    marketingDesc: 'Utilizzati per mostrare pubblicità pertinenti e misurare l\'efficacia delle campagne pubblicitarie.',
    functionalTitle: 'Cookie Funzionali',
    functionalDesc: 'Abilitano funzionalità avanzate e personalizzazione, come widget di chat o contenuti personalizzati.'
  }
}

export default function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [language, setLanguage] = useState<'en' | 'it'>('en')
  const [consent, setConsent] = useState<CookieConsent>({
    necessary: true, // Always required
    analytics: false,
    marketing: false,
    functional: false
  })
  const [isClient, setIsClient] = useState(false)

  const texts = translations[language]

  useEffect(() => {
    // Mark as client-side to prevent hydration mismatch
    setIsClient(true)

    // Detect browser language
    const browserLang = navigator.language.toLowerCase()
    if (browserLang.startsWith('it')) {
      setLanguage('it')
    } else {
      setLanguage('en') // Default to English
    }

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

  // Prevent hydration mismatch by only rendering after client-side mount
  if (!isClient || !showBanner) return null

  return (
    <>
      {/* Cookie Banner */}
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-white border-t-2 border-emerald-500 shadow-xl">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-start gap-4">
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-2">{texts.title}</h3>
              <p className="text-sm text-gray-600 mb-4">
                {texts.description}
              </p>
              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={acceptAll}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  <Check className="h-4 w-4 mr-2" />
                  {texts.acceptAll}
                </Button>
                <Button
                  onClick={acceptNecessary}
                  variant="outline"
                  className="border-gray-300"
                >
                  {texts.necessary}
                </Button>
                <Button
                  onClick={() => setShowSettings(true)}
                  variant="outline"
                  className="border-gray-300"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  {texts.settings}
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
                <h2 className="text-xl font-semibold">{texts.settingsTitle}</h2>
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
                    <h3 className="font-medium">{texts.necessaryTitle}</h3>
                    <div className="bg-emerald-100 text-emerald-800 px-2 py-1 rounded text-sm">
                      {texts.alwaysActive}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">
                    {texts.necessaryDesc}
                  </p>
                </div>

                {/* Analytics Cookies */}
                <div className="border-b pb-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">{texts.analyticsTitle}</h3>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={consent.analytics}
                        onChange={() => toggleConsent('analytics')}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                    </label>
                  </div>
                  <p className="text-sm text-gray-600">
                    {texts.analyticsDesc}
                  </p>
                </div>

                {/* Marketing Cookies */}
                <div className="border-b pb-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">{texts.marketingTitle}</h3>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={consent.marketing}
                        onChange={() => toggleConsent('marketing')}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                    </label>
                  </div>
                  <p className="text-sm text-gray-600">
                    {texts.marketingDesc}
                  </p>
                </div>

                {/* Functional Cookies */}
                <div className="pb-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">{texts.functionalTitle}</h3>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={consent.functional}
                        onChange={() => toggleConsent('functional')}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                    </label>
                  </div>
                  <p className="text-sm text-gray-600">
                    {texts.functionalDesc}
                  </p>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button
                  onClick={() => saveConsent(consent)}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                >
                  {texts.saveSettings}
                </Button>
                <Button
                  onClick={() => setShowSettings(false)}
                  variant="outline"
                  className="border-gray-300"
                >
                  {texts.cancel}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </>
  )
}