"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface MedicalFormData {
  // Personal Information
  fullName: string
  email: string
  emailConfirm: string
  phone: string
  dateOfBirth: string
  
  // Emergency Contact
  emergencyContactName: string
  emergencyContactPhone: string
  emergencyContactRelation: string
  
  // Medical Information
  doctorName: string
  doctorPhone: string
  currentMedications: string
  allergies: string
  medicalConditions: string
  
  // Mental Health Information
  currentProblems: string
  therapyHistory: string
  therapyGoals: string
  suicidalThoughts: string
  substanceUse: string
  
  // Consent
  dataConsent: boolean
  treatmentConsent: boolean
}

interface MedicalFormProps {
  language: "en" | "it"
  userId: string
  onSubmit: (formData: MedicalFormData) => void
  selectedPackage?: any // Add package info for upgrade
}

export default function MedicalForm({ language, userId, onSubmit, selectedPackage }: MedicalFormProps) {
  const [formData, setFormData] = useState<MedicalFormData>({
    fullName: "",
    email: "",
    emailConfirm: "",
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
    dataConsent: false,
    treatmentConsent: false
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<string[]>([])
  
  // Upgrade system states
  const [emailCheckStatus, setEmailCheckStatus] = useState<'idle' | 'checking' | 'found' | 'not-found'>('idle')
  const [showUpgradeOption, setShowUpgradeOption] = useState(false)
  const [isUpgrading, setIsUpgrading] = useState(false)
  const [formCollapsed, setFormCollapsed] = useState(false)

  // Debounced email check function
  const checkEmailExists = useCallback(async (email: string) => {
    if (!email || email.length < 5) {
      setEmailCheckStatus('idle')
      setShowUpgradeOption(false)
      return
    }

    setEmailCheckStatus('checking')
    
    try {
      const response = await fetch('/api/check-email-exists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
      
      const result = await response.json()
      
      if (result.success && result.exists) {
        setEmailCheckStatus('found')
        setShowUpgradeOption(true)
        setFormCollapsed(true)
      } else {
        setEmailCheckStatus('not-found')
        setShowUpgradeOption(false)
        setFormCollapsed(false)
      }
    } catch (error) {
      console.error('Email check failed:', error)
      setEmailCheckStatus('idle')
      setShowUpgradeOption(false)
    }
  }, [])

  // Debounce effect for email checking
  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.email) {
        checkEmailExists(formData.email)
      }
    }, 500) // 500ms debounce

    return () => clearTimeout(timer)
  }, [formData.email, checkEmailExists])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  // Handle upgrade for existing patients
  const handleUpgrade = async () => {
    setIsUpgrading(true)
    
    try {
      const response = await fetch('/api/medical-form/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId, 
          formData: { email: formData.email }, // Only email for upgrade
          sessionPackage: selectedPackage
        })
      })

      const result = await response.json()

      if (result.success) {
        alert(language === "en" 
          ? "✅ Sessions added successfully! Check your email for updated booking information." 
          : "✅ Sessioni aggiunte con successo! Controlla la tua email per informazioni aggiornate."
        )
        // Navigate to success page or close modal
        window.location.href = '/'
      } else {
        throw new Error(result.error || 'Upgrade failed')
      }
    } catch (error) {
      console.error('Upgrade error:', error)
      alert(language === "en" 
        ? "Upgrade failed. Please try again." 
        : "Aggiornamento fallito. Riprova."
      )
    }
    
    setIsUpgrading(false)
  }

  // Handle creating new account (expand form again)
  const handleCreateNewAccount = () => {
    setShowUpgradeOption(false)
    setFormCollapsed(false)
    setEmailCheckStatus('not-found')
  }

  const validateForm = () => {
    const newErrors: string[] = []
    
    if (!formData.fullName.trim()) newErrors.push("Full name is required")
    if (!formData.email.trim()) newErrors.push("Email is required")
    if (!formData.emailConfirm.trim()) newErrors.push("Email confirmation is required")
    if (formData.email !== formData.emailConfirm) newErrors.push("Email addresses do not match")
    if (!formData.phone.trim()) newErrors.push("Phone number is required")
    if (!formData.emergencyContactName.trim()) newErrors.push("Emergency contact name is required")
    if (!formData.emergencyContactPhone.trim()) newErrors.push("Emergency contact phone is required")
    if (!formData.currentProblems.trim()) newErrors.push("Current problems description is required")
    if (!formData.therapyGoals.trim()) newErrors.push("Therapy goals are required")
    if (!formData.dataConsent) newErrors.push("Data consent is required")
    if (!formData.treatmentConsent) newErrors.push("Treatment consent is required")

    setErrors(newErrors)
    return newErrors.length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Don't submit if form is collapsed (upgrade option is shown)
    if (formCollapsed) {
      return
    }
    
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    try {
      await onSubmit(formData)
    } catch (error) {
      console.error('Form submission error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const content = {
    en: {
      title: "Medical & Personal Information",
      subtitle: "Please complete this form to finalize your booking",
      personalInfo: "Personal Information",
      emergencyContact: "Emergency Contact",
      medicalInfo: "Medical Information",
      mentalHealthInfo: "Mental Health Information",
      consent: "Consent & Authorization",
      submit: "Complete Booking",
      processing: "Processing..."
    },
    it: {
      title: "Informazioni Mediche e Personali",
      subtitle: "Completa questo modulo per finalizzare la tua prenotazione",
      personalInfo: "Informazioni Personali",
      emergencyContact: "Contatto di Emergenza",
      medicalInfo: "Informazioni Mediche",
      mentalHealthInfo: "Informazioni sulla Salute Mentale",
      consent: "Consenso e Autorizzazione",
      submit: "Completa Prenotazione",
      processing: "Elaborazione..."
    }
  }

  const currentContent = content[language]

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <Badge className="bg-green-100 text-green-700 mb-4">
          {language === "en" ? "Payment Confirmed ✓" : "Pagamento Confermato ✓"}
        </Badge>
        <h2 className="text-3xl font-light text-stone-800 mb-4">{currentContent.title}</h2>
        <p className="text-stone-600">{currentContent.subtitle}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {errors.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <ul className="text-red-700 text-sm space-y-1">
              {errors.map((error, index) => (
                <li key={index}>• {error}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Personal Information */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-xl font-medium text-stone-800 mb-4">{currentContent.personalInfo}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">
                  {language === "en" ? "Full Name *" : "Nome Completo *"}
                </label>
                <Input
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">
                    {language === "en" ? "Email *" : "Email *"}
                  </label>
                  <Input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder={language === "en" ? "your.email@example.com" : "tua.email@esempio.com"}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">
                    {language === "en" ? "Confirm Email *" : "Conferma Email *"}
                  </label>
                  <Input
                    type="email"
                    name="emailConfirm"
                    value={formData.emailConfirm}
                    onChange={handleChange}
                    placeholder={language === "en" ? "Re-enter your email" : "Reinserisci la tua email"}
                    required
                  />
                </div>
              </div>

              {/* Email Status & Upgrade Option */}
              {emailCheckStatus === 'checking' && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    <span className="text-blue-700 text-sm">
                      {language === "en" ? "Checking email..." : "Controllo email..."}
                    </span>
                  </div>
                </div>
              )}

              {showUpgradeOption && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <div className="text-center space-y-4">
                    <div className="flex items-center justify-center space-x-2">
                      <span className="text-green-600 text-xl">✅</span>
                      <span className="text-green-800 font-medium">
                        {language === "en" ? "Existing account found" : "Account esistente trovato"}
                      </span>
                    </div>
                    
                    <p className="text-green-700">
                      {language === "en" 
                        ? `Your ${selectedPackage?.name || 'sessions'} will be added to your existing account.`
                        : `Le tue ${selectedPackage?.name || 'sessioni'} saranno aggiunte al tuo account esistente.`
                      }
                    </p>
                    
                    <p className="text-green-600 text-sm">
                      {language === "en" 
                        ? "📧 Confirmation will be sent to this email address"
                        : "📧 La conferma sarà inviata a questo indirizzo email"
                      }
                    </p>

                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <Button
                        type="button"
                        onClick={handleUpgrade}
                        disabled={isUpgrading}
                        className="bg-green-600 hover:bg-green-700 text-white px-6 py-2"
                      >
                        {isUpgrading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            {language === "en" ? "Adding..." : "Aggiungendo..."}
                          </>
                        ) : (
                          language === "en" ? "Yes, add sessions" : "Sì, aggiungi sessioni"
                        )}
                      </Button>
                      
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleCreateNewAccount}
                        className="border-green-300 text-green-700 hover:bg-green-50"
                      >
                        {language === "en" ? "No, create new account" : "No, crea nuovo account"}
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              <div className={`grid md:grid-cols-2 gap-4 transition-all duration-300 ${formCollapsed ? 'opacity-30 pointer-events-none max-h-0 overflow-hidden' : 'opacity-100 max-h-none'}`}>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">
                    {language === "en" ? "Phone Number *" : "Numero di Telefono *"}
                  </label>
                  <Input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">
                    {language === "en" ? "Date of Birth" : "Data di Nascita"}
                  </label>
                  <Input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Emergency Contact */}
        <Card className={`transition-all duration-300 ${formCollapsed ? 'opacity-30 pointer-events-none max-h-0 overflow-hidden' : 'opacity-100 max-h-none'}`}>
          <CardContent className="p-6">
            <h3 className="text-xl font-medium text-stone-800 mb-4">{currentContent.emergencyContact}</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">
                  {language === "en" ? "Contact Name *" : "Nome Contatto *"}
                </label>
                <Input
                  name="emergencyContactName"
                  value={formData.emergencyContactName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">
                  {language === "en" ? "Contact Phone *" : "Telefono Contatto *"}
                </label>
                <Input
                  type="tel"
                  name="emergencyContactPhone"
                  value={formData.emergencyContactPhone}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">
                  {language === "en" ? "Relationship" : "Relazione"}
                </label>
                <Input
                  name="emergencyContactRelation"
                  value={formData.emergencyContactRelation}
                  onChange={handleChange}
                  placeholder={language === "en" ? "e.g., Spouse, Parent" : "es. Coniuge, Genitore"}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Medical Information */}
        <Card className={`transition-all duration-300 ${formCollapsed ? 'opacity-30 pointer-events-none max-h-0 overflow-hidden' : 'opacity-100 max-h-none'}`}>
          <CardContent className="p-6">
            <h3 className="text-xl font-medium text-stone-800 mb-4">{currentContent.medicalInfo}</h3>
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">
                    {language === "en" ? "Doctor Name" : "Nome Dottore"}
                  </label>
                  <Input
                    name="doctorName"
                    value={formData.doctorName}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">
                    {language === "en" ? "Doctor Phone" : "Telefono Dottore"}
                  </label>
                  <Input
                    type="tel"
                    name="doctorPhone"
                    value={formData.doctorPhone}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">
                  {language === "en" ? "Current Medications" : "Farmaci Attuali"}
                </label>
                <textarea
                  name="currentMedications"
                  value={formData.currentMedications}
                  onChange={handleChange}
                  className="w-full p-3 border border-stone-300 rounded-md"
                  rows={3}
                  placeholder={language === "en" ? "List any current medications..." : "Elenca i farmaci attuali..."}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">
                  {language === "en" ? "Allergies" : "Allergie"}
                </label>
                <textarea
                  name="allergies"
                  value={formData.allergies}
                  onChange={handleChange}
                  className="w-full p-3 border border-stone-300 rounded-md"
                  rows={2}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Mental Health Information */}
        <Card className={`transition-all duration-300 ${formCollapsed ? 'opacity-30 pointer-events-none max-h-0 overflow-hidden' : 'opacity-100 max-h-none'}`}>
          <CardContent className="p-6">
            <h3 className="text-xl font-medium text-stone-800 mb-4">{currentContent.mentalHealthInfo}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">
                  {language === "en" ? "Current Problems/Concerns *" : "Problemi/Preoccupazioni Attuali *"}
                </label>
                <textarea
                  name="currentProblems"
                  value={formData.currentProblems}
                  onChange={handleChange}
                  className="w-full p-3 border border-stone-300 rounded-md"
                  rows={4}
                  required
                  placeholder={language === "en" ? "Describe what brings you to therapy..." : "Descrivi cosa ti porta in terapia..."}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">
                  {language === "en" ? "Therapy Goals *" : "Obiettivi della Terapia *"}
                </label>
                <textarea
                  name="therapyGoals"
                  value={formData.therapyGoals}
                  onChange={handleChange}
                  className="w-full p-3 border border-stone-300 rounded-md"
                  rows={3}
                  required
                  placeholder={language === "en" ? "What do you hope to achieve..." : "Cosa speri di raggiungere..."}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">
                  {language === "en" ? "Previous Therapy Experience" : "Esperienza Terapeutica Precedente"}
                </label>
                <textarea
                  name="therapyHistory"
                  value={formData.therapyHistory}
                  onChange={handleChange}
                  className="w-full p-3 border border-stone-300 rounded-md"
                  rows={3}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Consent */}
        <Card className={`transition-all duration-300 ${formCollapsed ? 'opacity-30 pointer-events-none max-h-0 overflow-hidden' : 'opacity-100 max-h-none'}`}>
          <CardContent className="p-6">
            <h3 className="text-xl font-medium text-stone-800 mb-4">{currentContent.consent}</h3>
            <div className="space-y-4">
              <label className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  name="dataConsent"
                  checked={formData.dataConsent}
                  onChange={handleChange}
                  className="mt-1"
                  required
                />
                <span className="text-sm text-stone-700">
                  {language === "en" 
                    ? "I consent to the collection and processing of my personal and medical information for the purpose of receiving therapy services. *"
                    : "Acconsento alla raccolta e al trattamento delle mie informazioni personali e mediche ai fini della ricezione di servizi terapeutici. *"}
                </span>
              </label>
              <label className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  name="treatmentConsent"
                  checked={formData.treatmentConsent}
                  onChange={handleChange}
                  className="mt-1"
                  required
                />
                <span className="text-sm text-stone-700">
                  {language === "en" 
                    ? "I understand the nature of online therapy and consent to treatment via secure video sessions. *"
                    : "Comprendo la natura della terapia online e acconsento al trattamento tramite sessioni video sicure. *"}
                </span>
              </label>
            </div>
          </CardContent>
        </Card>

        <div className={`text-center transition-all duration-300 ${formCollapsed ? 'opacity-30 pointer-events-none max-h-0 overflow-hidden' : 'opacity-100 max-h-none'}`}>
          <Button
            type="submit"
            disabled={isSubmitting}
            size="lg"
            className="bg-stone-600 hover:bg-stone-700 text-white px-12 py-3 rounded-full shadow-lg font-light"
          >
            {isSubmitting ? currentContent.processing : currentContent.submit}
          </Button>
        </div>
      </form>
    </div>
  )
}