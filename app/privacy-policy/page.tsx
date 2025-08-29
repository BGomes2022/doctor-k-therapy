"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default function PrivacyPolicyPage() {
  const [language, setLanguage] = useState<'en' | 'it'>('en')

  const content = {
    en: {
      title: "Privacy Policy",
      lastUpdated: "Last updated: December 2024",
      sections: {
        introduction: {
          title: "1. Introduction",
          content: `
Dr. Katiuscia Mercogliano ("we," "our," or "us") is committed to protecting your privacy and personal data. This Privacy Policy explains how we collect, use, store, and protect your information when you use our online therapy services.

We are the data controller for your personal information and are committed to complying with the General Data Protection Regulation (GDPR) and other applicable privacy laws.
          `
        },
        dataCollection: {
          title: "2. Information We Collect",
          content: `
**Personal Information:**
• Full name and contact details (email, phone number)
• Date of birth and demographic information
• Emergency contact information

**Medical Information:**
• Current health concerns and symptoms
• Medical history and current medications
• Mental health information and therapy goals
• Previous therapy or treatment history
• Information about substance use (if applicable)

**Technical Information:**
• IP address and browser information
• Session data and cookies
• Payment transaction data (processed securely by PayPal)

**Communication Records:**
• Therapy session recordings (with explicit consent)
• Email communications
• Appointment scheduling data
          `
        },
        lawfulBasis: {
          title: "3. Legal Basis for Processing",
          content: `
We process your personal data based on:

• **Consent:** For therapy services and communications
• **Contract:** To fulfill our therapy service agreement
• **Legitimate Interest:** For administrative purposes and service improvement
• **Legal Obligation:** For record-keeping requirements in healthcare
          `
        },
        dataUse: {
          title: "4. How We Use Your Information",
          content: `
• Provide online therapy services
• Schedule and manage appointments
• Maintain therapy session records
• Process payments securely
• Communicate about your treatment
• Comply with professional and legal obligations
• Improve our services (anonymized data only)
          `
        },
        dataProtection: {
          title: "5. Data Security",
          content: `
We implement industry-standard security measures:

• **AES-256 encryption** for all medical data storage
• **Secure HTTPS connections** for all communications
• **Access controls** limiting data access to authorized personnel only
• **Regular security audits** and vulnerability assessments
• **Encrypted backups** with secure storage
• **Two-factor authentication** for admin access
          `
        },
        dataRetention: {
          title: "6. Data Retention",
          content: `
• **Active therapy records:** Retained for the duration of treatment plus 7 years
• **Medical information:** Retained for 10 years after last contact (professional requirement)
• **Financial records:** Retained for 7 years (legal requirement)
• **Communication logs:** Retained for 3 years
• **Technical logs:** Retained for 1 year

Data is securely deleted after retention periods expire.
          `
        },
        thirdParties: {
          title: "7. Third-Party Services",
          content: `
We may share limited information with:

• **PayPal:** For secure payment processing
• **Google Workspace:** For calendar management and secure email
• **Hosting providers:** For secure data storage (encrypted)

All third parties are bound by strict data protection agreements and GDPR compliance.
          `
        },
        yourRights: {
          title: "8. Your Rights Under GDPR",
          content: `
You have the right to:

• **Access** your personal data
• **Rectify** inaccurate information
• **Erase** your data (with limitations for medical records)
• **Restrict** processing of your data
• **Data portability** (receive your data in a structured format)
• **Object** to certain processing activities
• **Withdraw consent** at any time

To exercise these rights, contact us using the information below.
          `
        },
        contact: {
          title: "9. Contact Information",
          content: `
For privacy concerns or data requests:

**Dr. Katiuscia Mercogliano**
Email: privacy@doctorktherapy.com

**Data Protection Officer:** privacy@doctorktherapy.com

We will respond to all requests within 30 days as required by GDPR.
          `
        }
      }
    },
    it: {
      title: "Informativa sulla Privacy",
      lastUpdated: "Ultimo aggiornamento: Dicembre 2024",
      sections: {
        introduction: {
          title: "1. Introduzione",
          content: `
La Dott.ssa Katiuscia Mercogliano ("noi," "nostro," o "ci") si impegna a proteggere la vostra privacy e i dati personali. Questa Informativa sulla Privacy spiega come raccogliamo, utilizziamo, conserviamo e proteggiamo le vostre informazioni quando utilizzate i nostri servizi di terapia online.

Siamo il titolare del trattamento per le vostre informazioni personali e ci impegniamo a rispettare il Regolamento Generale sulla Protezione dei Dati (GDPR) e altre leggi sulla privacy applicabili.
          `
        },
        dataCollection: {
          title: "2. Informazioni che Raccogliamo",
          content: `
**Informazioni Personali:**
• Nome completo e dettagli di contatto (email, numero di telefono)
• Data di nascita e informazioni demografiche
• Informazioni di contatto di emergenza

**Informazioni Mediche:**
• Preoccupazioni e sintomi di salute attuali
• Storia medica e farmaci attuali
• Informazioni sulla salute mentale e obiettivi terapeutici
• Storia di terapie o trattamenti precedenti
• Informazioni sull'uso di sostanze (se applicabile)

**Informazioni Tecniche:**
• Indirizzo IP e informazioni del browser
• Dati di sessione e cookie
• Dati delle transazioni di pagamento (elaborati in sicurezza da PayPal)

**Registrazioni delle Comunicazioni:**
• Registrazioni delle sessioni terapeutiche (con consenso esplicito)
• Comunicazioni via email
• Dati di programmazione degli appuntamenti
          `
        },
        lawfulBasis: {
          title: "3. Base Legale per il Trattamento",
          content: `
Trattiamo i vostri dati personali basandoci su:

• **Consenso:** Per servizi terapeutici e comunicazioni
• **Contratto:** Per adempiere al nostro accordo di servizio terapeutico
• **Interesse Legittimo:** Per scopi amministrativi e miglioramento del servizio
• **Obbligo Legale:** Per requisiti di conservazione dei registri in ambito sanitario
          `
        },
        dataUse: {
          title: "4. Come Utilizziamo le Vostre Informazioni",
          content: `
• Fornire servizi di terapia online
• Programmare e gestire appuntamenti
• Mantenere registri delle sessioni terapeutiche
• Elaborare pagamenti in sicurezza
• Comunicare riguardo al vostro trattamento
• Rispettare obblighi professionali e legali
• Migliorare i nostri servizi (solo dati anonimizzati)
          `
        },
        dataProtection: {
          title: "5. Sicurezza dei Dati",
          content: `
Implementiamo misure di sicurezza standard del settore:

• **Crittografia AES-256** per tutti i dati medici memorizzati
• **Connessioni HTTPS sicure** per tutte le comunicazioni
• **Controlli di accesso** che limitano l'accesso ai dati solo al personale autorizzato
• **Audit di sicurezza regolari** e valutazioni delle vulnerabilità
• **Backup crittografati** con archiviazione sicura
• **Autenticazione a due fattori** per l'accesso amministrativo
          `
        },
        dataRetention: {
          title: "6. Conservazione dei Dati",
          content: `
• **Registri terapeutici attivi:** Conservati per la durata del trattamento più 7 anni
• **Informazioni mediche:** Conservate per 10 anni dopo l'ultimo contatto (requisito professionale)
• **Registri finanziari:** Conservati per 7 anni (requisito legale)
• **Log delle comunicazioni:** Conservati per 3 anni
• **Log tecnici:** Conservati per 1 anno

I dati vengono eliminati in modo sicuro dopo la scadenza dei periodi di conservazione.
          `
        },
        thirdParties: {
          title: "7. Servizi di Terze Parti",
          content: `
Potremmo condividere informazioni limitate con:

• **PayPal:** Per l'elaborazione sicura dei pagamenti
• **Google Workspace:** Per la gestione del calendario e email sicura
• **Provider di hosting:** Per l'archiviazione sicura dei dati (crittografati)

Tutte le terze parti sono vincolate da rigidi accordi di protezione dei dati e conformità GDPR.
          `
        },
        yourRights: {
          title: "8. I Vostri Diritti Sotto il GDPR",
          content: `
Avete il diritto di:

• **Accedere** ai vostri dati personali
• **Rettificare** informazioni inesatte
• **Cancellare** i vostri dati (con limitazioni per i registri medici)
• **Limitare** il trattamento dei vostri dati
• **Portabilità dei dati** (ricevere i vostri dati in formato strutturato)
• **Opporvi** a certe attività di trattamento
• **Ritirare il consenso** in qualsiasi momento

Per esercitare questi diritti, contattateci utilizzando le informazioni qui sotto.
          `
        },
        contact: {
          title: "9. Informazioni di Contatto",
          content: `
Per questioni di privacy o richieste di dati:

**Dott.ssa Katiuscia Mercogliano**
Email: privacy@doctorktherapy.com

**Responsabile della Protezione dei Dati:** privacy@doctorktherapy.com

Risponderemo a tutte le richieste entro 30 giorni come richiesto dal GDPR.
          `
        }
      }
    }
  }

  const currentContent = content[language]

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 to-blue-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
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
          <p className="text-stone-600 text-sm">{currentContent.lastUpdated}</p>
        </div>

        {/* Content */}
        <Card>
          <CardContent className="p-8">
            <div className="prose prose-stone max-w-none">
              {Object.entries(currentContent.sections).map(([key, section]) => (
                <div key={key} className="mb-8">
                  <h2 className="text-2xl font-medium text-stone-800 mb-4">
                    {section.title}
                  </h2>
                  <div className="text-stone-700 leading-relaxed whitespace-pre-line">
                    {section.content.trim()}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-stone-500 text-sm">
            {language === 'en' 
              ? 'Dr. Katiuscia Mercogliano • Licensed Therapist • GDPR Compliant'
              : 'Dott.ssa Katiuscia Mercogliano • Terapeuta Autorizzata • Conforme GDPR'
            }
          </p>
        </div>
      </div>
    </div>
  )
}