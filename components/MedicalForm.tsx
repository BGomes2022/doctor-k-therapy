"use client"

import { useState } from "react"
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
}

export default function MedicalForm({ language, userId, onSubmit }: MedicalFormProps) {
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
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
              <div className="grid md:grid-cols-2 gap-4">
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
        <Card>
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
        <Card>
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
        <Card>
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
        <Card>
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

        <div className="text-center">
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