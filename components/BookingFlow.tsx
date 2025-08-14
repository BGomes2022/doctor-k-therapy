"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import SessionSelector from "./SessionSelector"
import PayPalCheckout from "./PayPalCheckout"
import MedicalForm from "./MedicalForm"
import CalendarBooking from "./CalendarBooking"

interface SessionPackage {
  id: string
  name: string
  price: number
  duration?: string
  description?: string
}

interface MedicalFormData {
  fullName: string
  email: string
  phone: string
  dateOfBirth: string
  emergencyContactName: string
  emergencyContactPhone: string
  emergencyContactRelation: string
  doctorName: string
  doctorPhone: string
  currentMedications: string
  allergies: string
  medicalConditions: string
  currentProblems: string
  therapyHistory: string
  therapyGoals: string
  suicidalThoughts: string
  substanceUse: string
  dataConsent: boolean
  treatmentConsent: boolean
}

interface BookingFlowProps {
  language: "en" | "it"
  preSelectedPackage?: any
}

type FlowStep = "selection" | "confirmation" | "payment" | "medical-form" | "calendar" | "complete"

export default function BookingFlow({ language, preSelectedPackage }: BookingFlowProps) {
  const [currentStep, setCurrentStep] = useState<FlowStep>(preSelectedPackage ? "confirmation" : "selection")
  const [selectedPackage, setSelectedPackage] = useState<SessionPackage | null>(preSelectedPackage || null)
  const [paymentDetails, setPaymentDetails] = useState<any>(null)
  const [userId, setUserId] = useState<string>("")
  const [bookingToken, setBookingToken] = useState<string>("")
  const [bookingDetails, setBookingDetails] = useState<any>(null)

  const handleSessionSelect = (sessionPackage: SessionPackage) => {
    setSelectedPackage(sessionPackage)
    setCurrentStep("confirmation")
  }

  const handlePaymentSuccess = (details: any) => {
    setPaymentDetails(details)
    setUserId(details.userId)
    setCurrentStep("medical-form")
  }

  const handlePaymentError = (error: any) => {
    console.error("Payment error:", error)
    alert(language === "en" 
      ? "Payment failed. Please try again." 
      : "Pagamento fallito. Riprova."
    )
    setCurrentStep("selection")
  }

  const handleMedicalFormSubmit = async (formData: MedicalFormData) => {
    try {
      const response = await fetch('/api/medical-form/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId, 
          formData,
          sessionPackage: selectedPackage // Include the selected package info
        })
      })

      const result = await response.json()

      if (result.success) {
        setBookingToken(result.bookingToken)
        
        // Show upgrade message if this was a package upgrade
        if (result.upgraded) {
          alert(language === "en" 
            ? "✅ Package upgraded successfully! Your sessions have been added to your existing account." 
            : "✅ Pacchetto aggiornato con successo! Le tue sessioni sono state aggiunte al tuo account esistente."
          )
        }
        
        setCurrentStep("success")
      } else {
        throw new Error(result.error || 'Form submission failed')
      }
    } catch (error) {
      console.error('Form submission error:', error)
      alert(language === "en" 
        ? "Form submission failed. Please try again." 
        : "Invio modulo fallito. Riprova."
      )
    }
  }

  const handleCalendarBookingComplete = (details: any) => {
    setBookingDetails(details)
    setCurrentStep("complete")
  }

  const BookingComplete = () => (
    <div className="max-w-3xl mx-auto text-center">
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-cream-200">
        <div className="mb-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-4xl font-light text-stone-800 mb-4">
            {language === "en" ? "Thank You!" : "Grazie!"}
          </h2>
          <p className="text-xl text-stone-600 mb-6">
            {language === "en" 
              ? "Your payment and medical information have been successfully submitted."
              : "Il pagamento e le informazioni mediche sono stati inviati con successo."}
          </p>
        </div>

        {selectedPackage && (
          <div className="bg-gradient-to-br from-stone-50 to-stone-100 rounded-xl p-6 mb-8">
            <h3 className="text-xl font-medium text-stone-800 mb-4">
              {language === "en" ? "Your Package:" : "Il Tuo Pacchetto:"}
            </h3>
            <div className="text-2xl font-light text-stone-700 mb-2">{selectedPackage.name}</div>
            <div className="text-3xl font-light text-green-600 mb-2">€{selectedPackage.price}</div>
            <div className="text-stone-600">{selectedPackage.duration}</div>
          </div>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
          <div className="flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <h4 className="text-lg font-medium text-blue-800">
              {language === "en" ? "Check Your Email!" : "Controlla la Tua Email!"}
            </h4>
          </div>
          <p className="text-blue-700 mb-4">
            {language === "en" 
              ? "You will receive an email within the next few minutes containing:"
              : "Riceverai un'email entro i prossimi minuti contenente:"}
          </p>
          <div className="space-y-2 text-sm text-blue-800">
            <div className="flex items-center justify-center">
              <span className="mr-2">✅</span>
              <span>{language === "en" ? "Payment confirmation" : "Conferma del pagamento"}</span>
            </div>
            <div className="flex items-center justify-center">
              <span className="mr-2">📅</span>
              <span>{language === "en" ? "Your personal booking link" : "Il tuo link di prenotazione personale"}</span>
            </div>
            <div className="flex items-center justify-center">
              <span className="mr-2">📋</span>
              <span>{language === "en" ? "Instructions for scheduling sessions" : "Istruzioni per programmare le sessioni"}</span>
            </div>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-8">
          <h4 className="font-medium text-amber-800 mb-2">
            {language === "en" ? "Next Steps:" : "Prossimi Passi:"}
          </h4>
          <p className="text-amber-700 text-sm">
            {language === "en" 
              ? "Use the personal link in your email to schedule all sessions in your package. You can book them whenever convenient for you."
              : "Usa il link personale nella tua email per programmare tutte le sessioni del tuo pacchetto. Puoi prenotarle quando è più comodo per te."}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
          <Button
            onClick={() => window.location.href = '/'}
            className="bg-stone-600 hover:bg-stone-700 text-white px-8 py-3"
          >
            {language === "en" ? "Return Home" : "Torna alla Home"}
          </Button>
          <Button
            variant="outline"
            onClick={() => window.location.href = 'mailto:dr.k@doctorktherapy.com'}
            className="border-stone-300 text-stone-600 hover:bg-stone-50 px-8 py-3"
          >
            {language === "en" ? "📧 Email not received?" : "📧 Non hai ricevuto l'email?"}
          </Button>
        </div>

        <div className="text-center text-sm text-stone-500">
          {language === "en" 
            ? "If you don't receive the email within 10 minutes, please check your spam folder or contact us."
            : "Se non ricevi l'email entro 10 minuti, controlla la cartella spam o contattaci."}
        </div>
      </div>
    </div>
  )

  return (
    <div className="py-8 px-6">
      <div className="max-w-5xl mx-auto">
        {/* Progress Indicator */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="flex items-center justify-center space-x-4">
            {[
              { key: "selection", label: language === "en" ? "Select" : "Selezione" },
              { key: "confirmation", label: language === "en" ? "Confirm" : "Conferma" }, 
              { key: "payment", label: language === "en" ? "Payment" : "Pagamento" },
              { key: "medical-form", label: language === "en" ? "Medical Form" : "Modulo Medico" },
              { key: "success", label: language === "en" ? "Complete" : "Completo" }
            ].map((stepData, index) => (
              <div key={stepData.key} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    currentStep === stepData.key 
                      ? "bg-stone-600 text-white" 
                      : index < ["selection", "confirmation", "payment", "medical-form", "success"].indexOf(currentStep)
                      ? "bg-green-600 text-white"
                      : "bg-stone-200 text-stone-600"
                  }`}>
                    {index < ["selection", "confirmation", "payment", "medical-form", "success"].indexOf(currentStep) ? "✓" : index + 1}
                  </div>
                  <div className={`text-xs mt-1 ${
                    currentStep === stepData.key 
                      ? "text-stone-600 font-medium" 
                      : index < ["selection", "confirmation", "payment", "medical-form", "success"].indexOf(currentStep)
                      ? "text-green-600"
                      : "text-stone-400"
                  }`}>
                    {stepData.label}
                  </div>
                </div>
                {index < 4 && (
                  <div className={`w-12 h-0.5 mx-2 ${
                    index < ["selection", "confirmation", "payment", "medical-form", "success"].indexOf(currentStep)
                      ? "bg-green-600"
                      : "bg-stone-200"
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Current Step Content */}
        {currentStep === "selection" && (
          <SessionSelector
            language={language}
            onSessionSelect={handleSessionSelect}
          />
        )}

        {currentStep === "confirmation" && selectedPackage && (
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-extralight text-stone-700 mb-6 tracking-wide">
                {language === "en" ? "Confirm Your Selection" : "Conferma la Tua Selezione"}
              </h2>
              <p className="text-xl text-stone-500 max-w-2xl mx-auto font-light leading-relaxed">
                {language === "en" 
                  ? "Please review your session details before proceeding to payment"
                  : "Rivedi i dettagli della sessione prima di procedere al pagamento"}
              </p>
            </div>

            <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-cream-200 mb-8">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-medium text-stone-800 mb-4">
                  {selectedPackage.name}
                </h3>
                <div className="text-5xl font-light text-stone-700 mb-4">€{selectedPackage.price}</div>
                <p className="text-stone-600 text-lg">{selectedPackage.duration}</p>
              </div>

              <div className="bg-stone-50 rounded-xl p-6 mb-8">
                <h4 className="font-semibold text-stone-800 mb-4">
                  {language === "en" ? "Session Information:" : "Informazioni sulla Sessione:"}
                </h4>
                <div className="space-y-3 text-stone-600">
                  <div className="flex items-center">
                    <span className="font-medium mr-2">📹</span>
                    <span>{language === "en" ? "Online video session via secure platform" : "Sessione video online tramite piattaforma sicura"}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="font-medium mr-2">🔒</span>
                    <span>{language === "en" ? "Completely confidential and private" : "Completamente confidenziale e privato"}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="font-medium mr-2">📋</span>
                    <span>{language === "en" ? "Professional therapy session with Dr. Katiuscia" : "Sessione di terapia professionale con Dr. Katiuscia"}</span>
                  </div>
                </div>
              </div>

              {/* Crisis Support Warning */}
              <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8">
                <div className="flex items-start">
                  <span className="text-red-500 text-xl mr-3">⚠️</span>
                  <div>
                    <h4 className="font-semibold text-red-800 mb-2">
                      {language === "en" ? "Crisis Support Notice" : "Avviso Supporto Crisi"}
                    </h4>
                    <p className="text-red-700 text-sm leading-relaxed">
                      {language === "en" 
                        ? "My online counseling is not appropriate for all types of problems. If you have suicidal thoughts or are in a crisis situation, it's important that you seek help immediately. If you are in a crisis or any other person may be in danger - do not use this site."
                        : "La mia consulenza online non è appropriata per tutti i tipi di problemi. Se hai pensieri suicidi o sei in una situazione di crisi, è importante che cerchi aiuto immediatamente. Se sei in crisi o qualsiasi altra persona potrebbe essere in pericolo - non utilizzare questo sito."}
                    </p>
                    <p className="text-red-700 text-sm mt-2 font-medium">
                      {language === "en" 
                        ? "For immediate help: Emergency Services (112) or Crisis Hotline"
                        : "Per aiuto immediato: Servizi di Emergenza (112) o Linea Telefonica di Crisi"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <Button
                  onClick={() => setCurrentStep("payment")}
                  size="lg"
                  className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white px-12 py-3 rounded-full shadow-lg font-medium transform transition-all hover:scale-105"
                >
                  {language === "en" ? "Proceed to Payment" : "Procedi al Pagamento"}
                </Button>
              </div>
            </div>
          </div>
        )}

        {currentStep === "payment" && selectedPackage && (
          <PayPalCheckout
            sessionPackage={selectedPackage}
            language={language}
            onPaymentSuccess={handlePaymentSuccess}
            onPaymentError={handlePaymentError}
          />
        )}

        {currentStep === "medical-form" && userId && (
          <MedicalForm
            language={language}
            userId={userId}
            onSubmit={handleMedicalFormSubmit}
            selectedPackage={selectedPackage}
          />
        )}

        {currentStep === "success" && <BookingComplete />}

        {currentStep === "complete" && <BookingComplete />}
      </div>
    </div>
  )
}