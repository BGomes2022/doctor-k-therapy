"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default function TermsOfServicePage() {
  const [language, setLanguage] = useState<'en' | 'it'>('en')

  const content = {
    en: {
      title: "Terms of Service",
      lastUpdated: "Last updated: December 2024",
      sections: {
        acceptance: {
          title: "1. Acceptance of Terms",
          content: `
By accessing and using Dr. Katiuscia Mercogliano's online therapy services, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service and our Privacy Policy.

If you do not agree to these terms, please do not use our services.
          `
        },
        services: {
          title: "2. Description of Services",
          content: `
**Online Therapy Services Include:**
• Individual psychotherapy sessions via secure video conferencing
• Mental health consultations and assessments
• Treatment planning and therapeutic interventions
• Crisis support (within business hours)
• Follow-up communications via secure email

**What We Do NOT Provide:**
• Emergency psychiatric services
• 24/7 crisis intervention
• Medication prescription or management
• Services to individuals under 18 years of age
• Court-ordered evaluations or testimony
          `
        },
        eligibility: {
          title: "3. Eligibility and Age Requirements",
          content: `
• You must be at least 18 years of age
• You must have the legal capacity to enter into this agreement
• You must provide accurate and truthful information
• You must be located in a jurisdiction where online therapy is legally permitted
• You acknowledge that online therapy may not be suitable for all conditions
          `
        },
        responsibilities: {
          title: "4. Client Responsibilities",
          content: `
**You agree to:**
• Provide accurate and complete information during intake and sessions
• Maintain confidentiality of your login credentials
• Use services in a private, secure location during sessions
• Notify us immediately of any technical issues
• Pay fees according to the agreed schedule
• Follow treatment recommendations to the best of your ability

**You agree NOT to:**
• Share your account access with others
• Record sessions without explicit written consent
• Use services while under the influence of substances that impair judgment
• Engage in threatening or abusive behavior
• Misrepresent your identity or medical history
          `
        },
        limitations: {
          title: "5. Limitations of Online Therapy",
          content: `
**Important Limitations:**
• Online therapy cannot replace in-person care in all situations
• Technology failures may interrupt sessions
• Emergency services are not available through our platform
• Some severe mental health conditions may require in-person treatment
• Effectiveness may vary compared to traditional in-person therapy

**In Case of Emergency:**
If you are experiencing a mental health emergency, please contact:
• Emergency Services: 112 (EU) or 911 (US)
• Crisis Helpline: [Local Crisis Number]
• Go to your nearest emergency room
          `
        },
        confidentiality: {
          title: "6. Confidentiality and Privacy",
          content: `
We maintain strict confidentiality in accordance with professional ethical codes and GDPR requirements.

**Confidentiality May Be Broken:**
• If there is imminent danger to yourself or others
• In cases of suspected child or elder abuse (legal requirement)
• When required by court order
• With your written consent for consultation purposes

All communications are encrypted and stored securely according to our Privacy Policy.
          `
        },
        payment: {
          title: "7. Payment Terms",
          content: `
**Fees and Payment:**
• Consultation (20 min): €30
• Individual Session (50 min): €100
• Package deals available with advance payment
• Payment due at time of service via PayPal
• No refunds for completed sessions

**Cancellation Policy:**
• 24-hour notice required for cancellations
• Late cancellations may be subject to full fee
• Emergency cancellations will be considered on a case-by-case basis
          `
        },
        technology: {
          title: "8. Technology Requirements",
          content: `
**Client Requirements:**
• Reliable high-speed internet connection
• Device with camera and microphone (computer, tablet, or smartphone)
• Updated web browser with JavaScript enabled
• Private, secure location for sessions
• Backup communication method (phone/email)

**Technical Issues:**
We are not responsible for technical difficulties on the client's end that prevent or interrupt sessions.
          `
        },
        liability: {
          title: "9. Limitation of Liability",
          content: `
To the fullest extent permitted by law:
• Our liability is limited to the amount paid for services
• We are not liable for indirect, incidental, or consequential damages
• Technology failures, internet outages, or platform unavailability are not our responsibility
• We maintain professional liability insurance

**Disclaimer:**
Online therapy services are provided "as is" without warranties of any kind, express or implied.
          `
        },
        termination: {
          title: "10. Termination of Services",
          content: `
**Either party may terminate services:**
• With reasonable notice
• For breach of these terms
• For clinical reasons (therapeutic relationship not effective)
• For non-payment of fees

**Upon Termination:**
• Outstanding fees become immediately due
• Access to platform will be terminated
• Records will be retained according to professional requirements
• Referrals to other providers will be provided if appropriate
          `
        },
        modifications: {
          title: "11. Modifications to Terms",
          content: `
We reserve the right to modify these Terms of Service at any time. Changes will be effective immediately upon posting on our website.

Continued use of services after changes constitutes acceptance of new terms.
          `
        },
        governing: {
          title: "12. Governing Law",
          content: `
These terms are governed by the laws of [Jurisdiction] without regard to conflict of law principles.

Any disputes will be resolved through binding arbitration in accordance with the rules of [Arbitration Body].
          `
        }
      }
    },
    it: {
      title: "Termini di Servizio",
      lastUpdated: "Ultimo aggiornamento: Dicembre 2024",
      sections: {
        acceptance: {
          title: "1. Accettazione dei Termini",
          content: `
Accedendo e utilizzando i servizi di terapia online della Dott.ssa Katiuscia Mercogliano, riconoscete di aver letto, compreso e accettato di essere vincolati da questi Termini di Servizio e dalla nostra Informativa sulla Privacy.

Se non accettate questi termini, vi preghiamo di non utilizzare i nostri servizi.
          `
        },
        services: {
          title: "2. Descrizione dei Servizi",
          content: `
**I Servizi di Terapia Online Includono:**
• Sessioni di psicoterapia individuale tramite videoconferenza sicura
• Consultazioni e valutazioni di salute mentale
• Pianificazione del trattamento e interventi terapeutici
• Supporto per crisi (durante l'orario lavorativo)
• Comunicazioni di follow-up via email sicura

**Quello che NON Forniamo:**
• Servizi psichiatrici di emergenza
• Intervento in crisi 24/7
• Prescrizione o gestione di farmaci
• Servizi per individui sotto i 18 anni
• Valutazioni ordinate dal tribunale o testimonianze
          `
        },
        eligibility: {
          title: "3. Requisiti di Idoneità ed Età",
          content: `
• Dovete avere almeno 18 anni
• Dovete avere la capacità legale di stipulare questo accordo
• Dovete fornire informazioni accurate e veritiere
• Dovete trovarvi in una giurisdizione dove la terapia online è legalmente consentita
• Riconoscete che la terapia online potrebbe non essere adatta per tutte le condizioni
          `
        },
        responsibilities: {
          title: "4. Responsabilità del Cliente",
          content: `
**Vi impegnate a:**
• Fornire informazioni accurate e complete durante l'intake e le sessioni
• Mantenere la riservatezza delle vostre credenziali di accesso
• Utilizzare i servizi in un luogo privato e sicuro durante le sessioni
• Notificarci immediatamente eventuali problemi tecnici
• Pagare le tariffe secondo il programma concordato
• Seguire le raccomandazioni del trattamento al meglio delle vostre capacità

**Vi impegnate a NON:**
• Condividere l'accesso al vostro account con altri
• Registrare sessioni senza consenso scritto esplicito
• Utilizzare i servizi sotto l'influenza di sostanze che compromettono il giudizio
• Impegnarvi in comportamenti minacciosi o abusivi
• Falsificare la vostra identità o storia medica
          `
        },
        limitations: {
          title: "5. Limitazioni della Terapia Online",
          content: `
**Limitazioni Importanti:**
• La terapia online non può sostituire la cura di persona in tutte le situazioni
• I guasti tecnologici possono interrompere le sessioni
• I servizi di emergenza non sono disponibili attraverso la nostra piattaforma
• Alcune gravi condizioni di salute mentale possono richiedere trattamento di persona
• L'efficacia può variare rispetto alla terapia tradizionale di persona

**In Caso di Emergenza:**
Se state vivendo un'emergenza di salute mentale, contattate:
• Servizi di Emergenza: 112 (UE) o 911 (USA)
• Linea di Crisi: [Numero di Crisi Locale]
• Recatevi al pronto soccorso più vicino
          `
        },
        confidentiality: {
          title: "6. Riservatezza e Privacy",
          content: `
Manteniamo una rigida riservatezza in conformità con i codici etici professionali e i requisiti GDPR.

**La Riservatezza Può Essere Violata:**
• Se c'è pericolo imminente per voi stessi o per altri
• In casi di sospetto abuso su minori o anziani (requisito legale)
• Quando richiesto da ordine del tribunale
• Con il vostro consenso scritto per scopi di consultazione

Tutte le comunicazioni sono crittografate e archiviate in sicurezza secondo la nostra Informativa sulla Privacy.
          `
        },
        payment: {
          title: "7. Termini di Pagamento",
          content: `
**Tariffe e Pagamento:**
• Consultazione (20 min): €30
• Sessione Individuale (50 min): €100
• Pacchetti disponibili con pagamento anticipato
• Pagamento dovuto al momento del servizio tramite PayPal
• Nessun rimborso per sessioni completate

**Politica di Cancellazione:**
• Richiesto preavviso di 24 ore per cancellazioni
• Cancellazioni tardive possono essere soggette alla tariffa completa
• Cancellazioni per emergenza saranno considerate caso per caso
          `
        },
        technology: {
          title: "8. Requisiti Tecnologici",
          content: `
**Requisiti del Cliente:**
• Connessione internet ad alta velocità affidabile
• Dispositivo con fotocamera e microfono (computer, tablet o smartphone)
• Browser web aggiornato con JavaScript abilitato
• Luogo privato e sicuro per le sessioni
• Metodo di comunicazione di backup (telefono/email)

**Problemi Tecnici:**
Non siamo responsabili per difficoltà tecniche dal lato del cliente che impediscono o interrompono le sessioni.
          `
        },
        liability: {
          title: "9. Limitazione della Responsabilità",
          content: `
Nella massima misura consentita dalla legge:
• La nostra responsabilità è limitata all'importo pagato per i servizi
• Non siamo responsabili per danni indiretti, incidentali o consequenziali
• Guasti tecnologici, interruzioni di internet o indisponibilità della piattaforma non sono nostra responsabilità
• Manteniamo un'assicurazione di responsabilità professionale

**Disclaimer:**
I servizi di terapia online sono forniti "così come sono" senza garanzie di alcun tipo, espresse o implicite.
          `
        },
        termination: {
          title: "10. Cessazione dei Servizi",
          content: `
**Una delle parti può terminare i servizi:**
• Con ragionevole preavviso
• Per violazione di questi termini
• Per ragioni cliniche (rapporto terapeutico non efficace)
• Per mancato pagamento delle tariffe

**Alla Cessazione:**
• Le tariffe in sospeso diventano immediatamente dovute
• L'accesso alla piattaforma sarà terminato
• I registri saranno conservati secondo i requisiti professionali
• Saranno forniti riferimenti ad altri fornitori se appropriato
          `
        },
        modifications: {
          title: "11. Modifiche ai Termini",
          content: `
Ci riserviamo il diritto di modificare questi Termini di Servizio in qualsiasi momento. Le modifiche saranno effettive immediatamente dopo la pubblicazione sul nostro sito web.

L'uso continuato dei servizi dopo le modifiche costituisce accettazione dei nuovi termini.
          `
        },
        governing: {
          title: "12. Legge Applicabile",
          content: `
Questi termini sono governati dalle leggi di [Giurisdizione] senza riguardo ai principi di conflitto di leggi.

Qualsiasi disputa sarà risolta attraverso arbitrato vincolante in conformità con le regole di [Ente di Arbitrato].
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
              ? 'Dr. Katiuscia Mercogliano • Licensed Therapist • Professional Standards Compliant'
              : 'Dott.ssa Katiuscia Mercogliano • Terapeuta Autorizzata • Conforme agli Standard Professionali'
            }
          </p>
        </div>
      </div>
    </div>
  )
}