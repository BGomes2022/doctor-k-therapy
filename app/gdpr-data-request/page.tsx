"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"

export default function GDPRDataRequestPage() {
  const [language, setLanguage] = useState<'en' | 'it'>('en')
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    requestType: [] as string[],
    description: '',
    verificationDocument: null as File | null
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const content = {
    en: {
      title: "GDPR Data Request",
      subtitle: "Request access, modification, or deletion of your personal data",
      lastUpdated: "Last updated: December 2024",
      sections: {
        intro: {
          title: "Your Rights Under GDPR",
          content: `Under the General Data Protection Regulation (GDPR), you have specific rights regarding your personal data. This secure form allows you to exercise these rights.`
        },
        rights: {
          title: "Available Rights",
          items: [
            { id: 'access', label: 'Data Access', description: 'Request a copy of all personal data we hold about you' },
            { id: 'rectification', label: 'Data Rectification', description: 'Correct inaccurate or incomplete personal information' },
            { id: 'erasure', label: 'Data Erasure (Right to be Forgotten)', description: 'Delete your personal data (subject to legal limitations for medical records)' },
            { id: 'portability', label: 'Data Portability', description: 'Receive your data in a structured, machine-readable format' },
            { id: 'restriction', label: 'Restrict Processing', description: 'Limit how we process your personal data' },
            { id: 'objection', label: 'Object to Processing', description: 'Object to certain types of data processing' },
            { id: 'consent', label: 'Withdraw Consent', description: 'Withdraw consent for data processing (where applicable)' }
          ]
        },
        form: {
          title: "Data Request Form",
          fullName: "Full Name",
          email: "Email Address",
          emailHelp: "Must match the email used for your therapy services",
          requestType: "Type of Request",
          requestTypeHelp: "Select all that apply to your request",
          description: "Description of Request",
          descriptionPlaceholder: "Please provide specific details about your data request...",
          descriptionHelp: "The more specific you are, the better we can assist you",
          verification: "Identity Verification",
          verificationHelp: "For security, please upload a government-issued ID or other verification document",
          submit: "Submit Request",
          submitting: "Submitting..."
        },
        success: {
          title: "Request Submitted Successfully",
          message: "Your GDPR data request has been received. We will process your request and respond within 30 days as required by law.",
          nextSteps: "Next Steps:",
          steps: [
            "We will verify your identity using the information provided",
            "Your request will be reviewed by our data protection team", 
            "You will receive a response via email within 30 days",
            "For complex requests, we may contact you for clarification"
          ]
        },
        important: {
          title: "Important Information",
          items: [
            "Processing Time: We will respond to your request within 30 days",
            "Identity Verification: We may require additional verification for security",
            "Medical Records: Some data deletion requests may be limited by professional record-keeping requirements",
            "Third Parties: We will coordinate with third-party processors as needed",
            "Free Service: GDPR data requests are processed free of charge"
          ]
        }
      }
    },
    it: {
      title: "Richiesta Dati GDPR",
      subtitle: "Richiedi accesso, modifica o cancellazione dei tuoi dati personali",
      lastUpdated: "Ultimo aggiornamento: Dicembre 2024",
      sections: {
        intro: {
          title: "I Tuoi Diritti Sotto il GDPR",
          content: `Sotto il Regolamento Generale sulla Protezione dei Dati (GDPR), hai diritti specifici riguardo ai tuoi dati personali. Questo modulo sicuro ti permette di esercitare questi diritti.`
        },
        rights: {
          title: "Diritti Disponibili",
          items: [
            { id: 'access', label: 'Accesso ai Dati', description: 'Richiedi una copia di tutti i dati personali che conserviamo su di te' },
            { id: 'rectification', label: 'Rettifica dei Dati', description: 'Correggi informazioni personali inesatte o incomplete' },
            { id: 'erasure', label: 'Cancellazione dei Dati (Diritto all\'Oblio)', description: 'Elimina i tuoi dati personali (soggetto a limitazioni legali per i registri medici)' },
            { id: 'portability', label: 'Portabilità dei Dati', description: 'Ricevi i tuoi dati in formato strutturato e leggibile da macchina' },
            { id: 'restriction', label: 'Limitazione del Trattamento', description: 'Limita come trattiamo i tuoi dati personali' },
            { id: 'objection', label: 'Opposizione al Trattamento', description: 'Opponiti a certi tipi di trattamento dei dati' },
            { id: 'consent', label: 'Ritiro del Consenso', description: 'Ritira il consenso per il trattamento dei dati (dove applicabile)' }
          ]
        },
        form: {
          title: "Modulo Richiesta Dati",
          fullName: "Nome Completo",
          email: "Indirizzo Email",
          emailHelp: "Deve corrispondere all'email utilizzata per i tuoi servizi di terapia",
          requestType: "Tipo di Richiesta",
          requestTypeHelp: "Seleziona tutto ciò che si applica alla tua richiesta",
          description: "Descrizione della Richiesta",
          descriptionPlaceholder: "Si prega di fornire dettagli specifici sulla richiesta di dati...",
          descriptionHelp: "Più specifico sei, meglio possiamo assisterti",
          verification: "Verifica dell'Identità",
          verificationHelp: "Per sicurezza, carica un documento d'identità rilasciato dal governo o altro documento di verifica",
          submit: "Invia Richiesta",
          submitting: "Invio in corso..."
        },
        success: {
          title: "Richiesta Inviata con Successo",
          message: "La tua richiesta dati GDPR è stata ricevuta. Elaboreremo la tua richiesta e risponderemo entro 30 giorni come richiesto dalla legge.",
          nextSteps: "Prossimi Passi:",
          steps: [
            "Verificheremo la tua identità utilizzando le informazioni fornite",
            "La tua richiesta sarà esaminata dal nostro team per la protezione dei dati",
            "Riceverai una risposta via email entro 30 giorni",
            "Per richieste complesse, potremmo contattarti per chiarimenti"
          ]
        },
        important: {
          title: "Informazioni Importanti",
          items: [
            "Tempo di Elaborazione: Risponderemo alla tua richiesta entro 30 giorni",
            "Verifica dell'Identità: Potremmo richiedere verifica aggiuntiva per sicurezza",
            "Registri Medici: Alcune richieste di cancellazione dati possono essere limitate dai requisiti professionali di conservazione dei registri",
            "Terze Parti: Coordineremo con i processori di terze parti secondo necessità",
            "Servizio Gratuito: Le richieste dati GDPR sono elaborate gratuitamente"
          ]
        }
      }
    }
  }

  const currentContent = content[language]

  const handleRequestTypeChange = (requestId: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      requestType: checked 
        ? [...prev.requestType, requestId]
        : prev.requestType.filter(id => id !== requestId)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    setIsSubmitting(false)
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-50 to-green-50">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-light text-stone-800 mb-4">
              {currentContent.title}
            </h1>
            <div className="flex justify-center gap-4 mb-4">
              <Button
                variant={language === 'en' ? 'default' : 'outline'}
                onClick={() => setLanguage('en')}
                size="sm"
              >
                🇬🇧 English
              </Button>
              <Button
                variant={language === 'it' ? 'default' : 'outline'}
                onClick={() => setLanguage('it')}
                size="sm"
              >
                🇮🇹 Italiano
              </Button>
            </div>
          </div>

          <Card className="mb-8">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              
              <h2 className="text-2xl font-medium text-stone-800 mb-4">
                {currentContent.sections.success.title}
              </h2>
              <p className="text-stone-600 mb-6">
                {currentContent.sections.success.message}
              </p>

              <div className="bg-blue-50 rounded-lg p-6 mb-6 text-left">
                <h3 className="font-medium text-blue-900 mb-4">
                  {currentContent.sections.success.nextSteps}
                </h3>
                <ol className="text-blue-800 space-y-2 list-decimal list-inside">
                  {currentContent.sections.success.steps.map((step, index) => (
                    <li key={index}>{step}</li>
                  ))}
                </ol>
              </div>

              <Button
                onClick={() => {setSubmitted(false); setFormData({fullName: '', email: '', requestType: [], description: '', verificationDocument: null})}}
                variant="outline"
              >
                Submit Another Request
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 to-blue-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-light text-stone-800 mb-2">
            {currentContent.title}
          </h1>
          <p className="text-stone-600 mb-4">{currentContent.subtitle}</p>
          <div className="flex justify-center gap-4 mb-4">
            <Button
              variant={language === 'en' ? 'default' : 'outline'}
              onClick={() => setLanguage('en')}
              size="sm"
            >
              🇬🇧 English
            </Button>
            <Button
              variant={language === 'it' ? 'default' : 'outline'}
              onClick={() => setLanguage('it')}
              size="sm"
            >
              🇮🇹 Italiano
            </Button>
          </div>
          <p className="text-stone-500 text-sm">{currentContent.lastUpdated}</p>
        </div>

        {/* Intro Section */}
        <Card className="mb-8 border-blue-200 bg-blue-50">
          <CardContent className="p-6">
            <div className="flex items-start space-x-3">
              <div className="text-blue-600 text-2xl">🔒</div>
              <div>
                <h3 className="font-medium text-blue-800 mb-2">
                  {currentContent.sections.intro.title}
                </h3>
                <p className="text-blue-700 text-sm">
                  {currentContent.sections.intro.content}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Rights Section */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <h2 className="text-2xl font-medium text-stone-800 mb-6">
              {currentContent.sections.rights.title}
            </h2>
            <div className="grid gap-4">
              {currentContent.sections.rights.items.map((right) => (
                <div key={right.id} className="border border-stone-200 rounded-lg p-4 hover:bg-stone-50">
                  <h3 className="font-medium text-stone-800 mb-1">{right.label}</h3>
                  <p className="text-stone-600 text-sm">{right.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Form Section */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <h2 className="text-2xl font-medium text-stone-800 mb-6">
              {currentContent.sections.form.title}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Full Name */}
              <div>
                <Label htmlFor="fullName">{currentContent.sections.form.fullName}</Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => setFormData(prev => ({...prev, fullName: e.target.value}))}
                  required
                  className="mt-1"
                />
              </div>

              {/* Email */}
              <div>
                <Label htmlFor="email">{currentContent.sections.form.email}</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({...prev, email: e.target.value}))}
                  required
                  className="mt-1"
                />
                <p className="text-stone-500 text-sm mt-1">
                  {currentContent.sections.form.emailHelp}
                </p>
              </div>

              {/* Request Type */}
              <div>
                <Label className="text-base">{currentContent.sections.form.requestType}</Label>
                <p className="text-stone-500 text-sm mb-3">
                  {currentContent.sections.form.requestTypeHelp}
                </p>
                <div className="space-y-3">
                  {currentContent.sections.rights.items.map((right) => (
                    <div key={right.id} className="flex items-start space-x-3">
                      <Checkbox
                        id={right.id}
                        checked={formData.requestType.includes(right.id)}
                        onCheckedChange={(checked) => handleRequestTypeChange(right.id, checked as boolean)}
                      />
                      <div className="grid gap-1.5 leading-none">
                        <label
                          htmlFor={right.id}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                        >
                          {right.label}
                        </label>
                        <p className="text-xs text-stone-600">
                          {right.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <Label htmlFor="description">{currentContent.sections.form.description}</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({...prev, description: e.target.value}))}
                  placeholder={currentContent.sections.form.descriptionPlaceholder}
                  rows={4}
                  className="mt-1"
                  required
                />
                <p className="text-stone-500 text-sm mt-1">
                  {currentContent.sections.form.descriptionHelp}
                </p>
              </div>

              {/* File Upload Note */}
              <div>
                <Label>{currentContent.sections.form.verification}</Label>
                <div className="mt-1 p-4 border border-stone-200 rounded-lg bg-stone-50">
                  <p className="text-stone-600 text-sm">
                    📄 {currentContent.sections.form.verificationHelp}
                  </p>
                  <p className="text-stone-500 text-xs mt-2">
                    Note: For this demo, file upload is simulated. In production, please email your verification document to privacy@doctorktherapy.com
                  </p>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting || formData.requestType.length === 0}
                className="w-full"
              >
                {isSubmitting ? currentContent.sections.form.submitting : currentContent.sections.form.submit}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Important Information */}
        <Card>
          <CardContent className="p-8">
            <h2 className="text-2xl font-medium text-stone-800 mb-4">
              {currentContent.sections.important.title}
            </h2>
            <ul className="space-y-2">
              {currentContent.sections.important.items.map((item, index) => (
                <li key={index} className="flex items-start space-x-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span className="text-stone-700">{item}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-stone-500 text-sm">
            {language === 'en' 
              ? 'Dr. Katiuscia Mercogliano • Data Protection Officer • privacy@doctorktherapy.com'
              : 'Dott.ssa Katiuscia Mercogliano • Responsabile della Protezione dei Dati • privacy@doctorktherapy.com'
            }
          </p>
        </div>
      </div>
    </div>
  )
}