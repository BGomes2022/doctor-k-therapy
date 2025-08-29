"use client"

import { Phone, AlertTriangle, X, HeartHandshake } from "lucide-react"

interface EmergencyModalProps {
  isOpen: boolean
  onClose: () => void
  language: "en" | "it"
}

export default function EmergencyModal({ isOpen, onClose, language }: EmergencyModalProps) {
  if (!isOpen) return null

  const emergencyNumbers = [
    {
      country: language === "en" ? "United States" : "Stati Uniti",
      flag: "🇺🇸",
      lines: [
        { label: language === "en" ? "Emergency" : "Emergenza", number: "911" },
        { label: language === "en" ? "Suicide & Crisis Lifeline" : "Linea Suicidio e Crisi", number: "Call or text 988" }
      ]
    },
    {
      country: "Italia",
      flag: "🇮🇹",
      lines: [
        { label: language === "en" ? "Emergency" : "Emergenza", number: "112" },
        { label: language === "en" ? "Anti-Violence Hotline" : "Centro Antiviolenza Donne", number: "1522" }
      ]
    },
    {
      country: language === "en" ? "Spain" : "Spagna",
      flag: "🇪🇸",
      lines: [
        { label: language === "en" ? "Emergency" : "Emergenza", number: "112" }
      ]
    },
    {
      country: "Portugal",
      flag: "🇵🇹",
      lines: [
        { label: language === "en" ? "Emergency" : "Emergenza", number: "112" },
        { label: language === "en" ? "Psychological Support Line" : "Linha de Apoio Psicológico", number: "800 202 669" }
      ]
    },
    {
      country: language === "en" ? "United Kingdom" : "Regno Unito",
      flag: "🇬🇧",
      lines: [
        { label: language === "en" ? "Emergency" : "Emergenza", number: "112 or 999" },
        { label: language === "en" ? "24/7 Helpline" : "Linea di Aiuto 24/7", number: "116 123" }
      ]
    },
    {
      country: "Australia",
      flag: "🇦🇺",
      lines: [
        { label: language === "en" ? "Emergency" : "Emergenza", number: "000" },
        { label: "LifeLine Australia", number: "13 11 14" }
      ]
    },
    {
      country: language === "en" ? "Canada" : "Canada",
      flag: "🇨🇦",
      lines: [
        { label: language === "en" ? "Emergency" : "Emergenza", number: "911" },
        { label: language === "en" ? "Suicide Prevention" : "Prevenzione Suicidi", number: "https://suicideprevention.ca/need-help/" }
      ]
    },
    {
      country: language === "en" ? "Germany" : "Germania",
      flag: "🇩🇪",
      lines: [
        { label: language === "en" ? "Emergency" : "Emergenza", number: "112" },
        { label: "Hotline", number: "800 111 0111" }
      ]
    },
    {
      country: language === "en" ? "Sweden" : "Svezia",
      flag: "🇸🇪",
      lines: [
        { label: language === "en" ? "Emergency" : "Emergenza", number: "112" }
      ]
    },
    {
      country: language === "en" ? "Switzerland" : "Svizzera",
      flag: "🇨🇭",
      lines: [
        { label: language === "en" ? "Emergency" : "Emergenza", number: "112" }
      ]
    },
    {
      country: language === "en" ? "Finland" : "Finlandia",
      flag: "🇫🇮",
      lines: [
        { label: language === "en" ? "Emergency" : "Emergenza", number: "112" },
        { label: language === "en" ? "Crisis Line" : "Linea di Crisi", number: "010 195 202" }
      ]
    },
    {
      country: language === "en" ? "Ireland" : "Irlanda",
      flag: "🇮🇪",
      lines: [
        { label: language === "en" ? "Emergency" : "Emergenza", number: "112 or 999" },
        { label: language === "en" ? "Crisis Services" : "Servizi di Crisi", number: "1800 247 247" }
      ]
    },
    {
      country: "India",
      flag: "🇮🇳",
      lines: [
        { label: language === "en" ? "Emergency" : "Emergenza", number: "112" }
      ]
    }
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-cream-200">
          <div className="flex justify-between items-start">
            <div className="flex items-center space-x-3">
              <HeartHandshake className="h-8 w-8 text-red-500" />
              <div>
                <h2 className="text-2xl font-light text-stone-800">
                  {language === "en" ? "Get Help Right Now" : "Ottieni Aiuto Subito"}
                </h2>
                <p className="text-sm text-stone-600 mt-1">
                  {language === "en" 
                    ? "If you are in crisis or immediate danger, please contact:"
                    : "Se sei in crisi o in pericolo immediato, contatta:"}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-stone-400 hover:text-stone-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>
        
        <div className="p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
              <p className="text-red-800 font-medium">
                {language === "en" 
                  ? "This is for emergency situations only. If you are in immediate danger, call your local emergency services immediately."
                  : "Questo è solo per situazioni di emergenza. Se sei in pericolo immediato, chiama immediatamente i servizi di emergenza locali."}
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {emergencyNumbers.map((country, index) => (
              <div key={index} className="bg-white rounded-lg border border-stone-200 p-4 hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">{country.flag}</span>
                  <h3 className="font-medium text-stone-800">{country.country}</h3>
                </div>
                <div className="space-y-2">
                  {country.lines.map((line, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <Phone className="h-4 w-4 text-stone-500 mt-0.5 flex-shrink-0" />
                      <div className="text-sm">
                        <span className="text-stone-600">{line.label}:</span>
                        <span className="text-stone-800 font-medium ml-1">
                          {line.number.startsWith("http") ? (
                            <a href={line.number} target="_blank" rel="noopener noreferrer" 
                               className="text-blue-600 hover:underline">
                              {language === "en" ? "Visit website" : "Visita il sito"}
                            </a>
                          ) : (
                            line.number
                          )}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-sm text-amber-800 text-center">
              {language === "en"
                ? "This does not replace emergency medical care. If you have a medical emergency, immediately call your local emergency number."
                : "Questo non sostituisce le cure mediche di emergenza. Se hai un'emergenza medica, chiama immediatamente il tuo numero di emergenza locale."}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}