"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default function DataProcessingRecordPage() {
  const [language, setLanguage] = useState<'en' | 'it'>('en')

  const content = {
    en: {
      title: "Data Processing Record (Article 30 GDPR)",
      subtitle: "Transparency record of personal data processing activities",
      lastUpdated: "Last updated: December 2024",
      sections: {
        controller: {
          title: "1. Data Controller Information",
          content: `
Name: Dr. Katiuscia Mercogliano
Profession: Licensed Mental Health Therapist
Contact: privacy@doctorktherapy.com
Registration: 5899 (IT) / 30509 (PT)
DPO Contact: privacy@doctorktherapy.com
          `
        },
        purpose: {
          title: "2. Purposes of Processing",
          content: `
Primary Purposes:
• Providing online psychotherapy services
• Managing patient appointments and scheduling
• Maintaining clinical records for continuity of care
• Processing payments for services
• Communication regarding treatment

Legal Basis:
• Consent (Art. 6(1)(a) GDPR) - for therapy services
• Contract (Art. 6(1)(b) GDPR) - service delivery
• Legal obligation (Art. 6(1)(c) GDPR) - professional record keeping
• Legitimate interests (Art. 6(1)(f) GDPR) - administrative purposes

Special Category Data (Art. 9 GDPR):
• Processing health data for healthcare purposes
• Legal basis: Art. 9(2)(h) - healthcare provision
• Consent obtained for all therapy-related processing
          `
        },
        categories: {
          title: "3. Categories of Personal Data",
          content: `
Identity Data:
• Full name, date of birth
• Contact information (email, phone)
• Emergency contact details

Health Data (Special Category):
• Mental health symptoms and concerns
• Treatment history and current medications
• Therapy session notes and records
• Progress assessments and treatment plans
• Risk assessments and safety planning

Technical Data:
• IP addresses and session logs
• Device and browser information
• Platform usage statistics (anonymized)

Financial Data:
• Payment transaction records
• Billing information and invoices
• Package purchase history

Communication Data:
• Email correspondence
• Appointment scheduling communications
• Session recordings (with explicit consent)
          `
        },
        recipients: {
          title: "4. Categories of Recipients",
          content: `
Internal Recipients:
• Dr. Katiuscia Mercogliano (primary therapist)
• Administrative staff (appointment scheduling only)

External Recipients:
• PayPal (payment processing) - EU-US adequacy decision
• Google Workspace (email, calendar) - EU-US DPA
• Hosting providers (encrypted data storage) - EU-based
• Professional supervisors (anonymized data for clinical supervision)

Conditional Recipients:
• Medical professionals (with explicit consent for referrals)
• Emergency services (only in imminent risk situations)
• Legal authorities (only when legally required)

No data is shared without legal basis or explicit consent
          `
        },
        retention: {
          title: "5. Data Retention Periods",
          content: `
Clinical Records: 10 years after last contact
• Required by professional standards for mental health records
• Ensures continuity of care if treatment resumes
• Allows for legitimate follow-up and outcome tracking

Administrative Records: 7 years after last service
• Appointment histories and scheduling data
• Payment records and financial documentation
• General correspondence and administrative notes

Technical Logs: 1 year maximum
• Security logs and access records
• Platform usage statistics
• Error logs and system diagnostics

Communication Records: 3 years
• Email correspondence related to treatment
• Appointment confirmations and reminders
• Non-clinical administrative communications

Deletion Process:
All data is securely deleted using cryptographic erasure methods after retention periods expire. Backups are included in deletion schedules.
          `
        },
        security: {
          title: "6. Security Measures (Article 32 GDPR)",
          content: `
Technical Measures:
• AES-256 encryption for all data at rest
• TLS 1.3 encryption for all data in transit
• Multi-factor authentication for all admin access
• Regular automated backups with encryption
• Secure data centers with 24/7 monitoring
• Regular security vulnerability assessments

Organizational Measures:
• Staff training on GDPR and data protection
• Incident response procedures and breach protocols
• Regular policy reviews and updates
• Access controls based on need-to-know principle
• Data minimization policies and procedures
• Privacy by design in all system implementations

Pseudonymization:
• Patient identifiers separated from clinical data where possible
• Statistical analysis performed on anonymized datasets
• Research and quality improvement use anonymized data only

Data Protection Impact Assessments:
• Conducted for all high-risk processing activities
• Regular reviews of processing activities for compliance
• Third-party processor agreements include GDPR requirements
          `
        },
        transfers: {
          title: "7. International Data Transfers",
          content: `
Primary Data Storage: European Union
All patient data is stored within EU data centers with GDPR compliance.

Third-Party Processors:
• PayPal: EU-US adequacy decision provides adequate protection
• Google Workspace: Standard Contractual Clauses (SCCs) in place
• Backup Services: EU-based providers with GDPR compliance

Transfer Safeguards:
• Standard Contractual Clauses for all non-EU transfers
• Regular assessment of adequacy decisions
• Encryption requirements for all transferred data
• Right to object to international transfers

No data transfers to countries without adequate protection measures
          `
        },
        monitoring: {
          title: "8. Monitoring and Review",
          content: `
Regular Reviews:
• Quarterly review of processing activities
• Annual comprehensive GDPR compliance audit
• Continuous monitoring of data protection measures
• Regular assessment of third-party processors

Breach Detection:
• Automated monitoring systems for unauthorized access
• Regular log analysis and anomaly detection
• Staff training on identifying potential breaches
• 24-hour breach notification procedures

Compliance Verification:
• Internal audits of data processing activities
• Third-party security assessments annually
• Staff competency assessments on data protection
• Documentation and record-keeping validation

Updates and Changes:
This record is updated whenever processing activities change, at minimum annually, and is available for supervisory authority inspection.
          `
        }
      }
    },
    it: {
      title: "Registro delle Attività di Trattamento (Articolo 30 GDPR)",
      subtitle: "Registro trasparente delle attività di trattamento dei dati personali",
      lastUpdated: "Ultimo aggiornamento: Dicembre 2024",
      sections: {
        controller: {
          title: "1. Informazioni del Titolare del Trattamento",
          content: `
Nome: Dott.ssa Katiuscia Mercogliano
Professione: Terapeuta Autorizzata per la Salute Mentale
Contatto: privacy@doctorktherapy.com
Registrazione: 5899 (IT) / 30509 (PT)
Contatto DPO: privacy@doctorktherapy.com
          `
        },
        purpose: {
          title: "2. Finalità del Trattamento",
          content: `
Finalità Principali:
• Fornire servizi di psicoterapia online
• Gestire appuntamenti e programmazione pazienti
• Mantenere registri clinici per la continuità delle cure
• Elaborare pagamenti per i servizi
• Comunicazione riguardo al trattamento

Base Giuridica:
• Consenso (Art. 6(1)(a) GDPR) - per i servizi terapeutici
• Contratto (Art. 6(1)(b) GDPR) - erogazione del servizio
• Obbligo legale (Art. 6(1)(c) GDPR) - tenuta registri professionali
• Interessi legittimi (Art. 6(1)(f) GDPR) - scopi amministrativi

Dati Particolari (Art. 9 GDPR):
• Trattamento dati sanitari per finalità sanitarie
• Base giuridica: Art. 9(2)(h) - erogazione assistenza sanitaria
• Consenso ottenuto per tutti i trattamenti terapeutici
          `
        },
        categories: {
          title: "3. Categorie di Dati Personali",
          content: `
Dati Identificativi:
• Nome completo, data di nascita
• Informazioni di contatto (email, telefono)
• Dettagli contatto di emergenza

Dati Sanitari (Categoria Particolare):
• Sintomi e preoccupazioni di salute mentale
• Storia del trattamento e farmaci attuali
• Note e registri delle sessioni terapeutiche
• Valutazioni del progresso e piani di trattamento
• Valutazioni del rischio e pianificazione della sicurezza

Dati Tecnici:
• Indirizzi IP e log delle sessioni
• Informazioni dispositivo e browser
• Statistiche d'uso piattaforma (anonimizzate)

Dati Finanziari:
• Registri transazioni di pagamento
• Informazioni fatturazione e fatture
• Storico acquisti pacchetti

Dati di Comunicazione:
• Corrispondenza email
• Comunicazioni programmazione appuntamenti
• Registrazioni sessioni (con consenso esplicito)
          `
        },
        recipients: {
          title: "4. Categorie di Destinatari",
          content: `
Destinatari Interni:
• Dott.ssa Katiuscia Mercogliano (terapeuta principale)
• Staff amministrativo (solo programmazione appuntamenti)

Destinatari Esterni:
• PayPal (elaborazione pagamenti) - decisione di adeguatezza EU-US
• Google Workspace (email, calendario) - DPA EU-US
• Provider hosting (archiviazione dati crittografati) - basati EU
• Supervisori professionali (dati anonimizzati per supervisione clinica)

Destinatari Condizionali:
• Professionisti medici (con consenso esplicito per referral)
• Servizi di emergenza (solo in situazioni di rischio imminente)
• Autorità legali (solo quando legalmente richiesto)

Nessun dato è condiviso senza base giuridica o consenso esplicito
          `
        },
        retention: {
          title: "5. Periodi di Conservazione",
          content: `
Registri Clinici: 10 anni dopo l'ultimo contatto
• Richiesto da standard professionali per registri salute mentale
• Assicura continuità cure se il trattamento riprende
• Permette follow-up legittimo e tracciamento risultati

Registri Amministrativi: 7 anni dopo l'ultimo servizio
• Storico appuntamenti e dati programmazione
• Registri pagamenti e documentazione finanziaria
• Corrispondenza generale e note amministrative

Log Tecnici: Massimo 1 anno
• Log sicurezza e registri accesso
• Statistiche utilizzo piattaforma
• Log errori e diagnostica sistema

Registri Comunicazioni: 3 anni
• Corrispondenza email relativa al trattamento
• Conferme appuntamenti e promemoria
• Comunicazioni amministrative non cliniche

Processo di Cancellazione:
Tutti i dati sono cancellati in modo sicuro usando metodi di cancellazione crittografica dopo la scadenza dei periodi di conservazione. I backup sono inclusi nei programmi di cancellazione.
          `
        },
        security: {
          title: "6. Misure di Sicurezza (Articolo 32 GDPR)",
          content: `
Misure Tecniche:
• Crittografia AES-256 per tutti i dati a riposo
• Crittografia TLS 1.3 per tutti i dati in transito
• Autenticazione multi-fattore per tutti gli accessi admin
• Backup automatici regolari con crittografia
• Data center sicuri con monitoraggio 24/7
• Valutazioni regolari vulnerabilità sicurezza

Misure Organizzative:
• Formazione staff su GDPR e protezione dati
• Procedure risposta incidenti e protocolli violazione
• Revisioni regolari politiche e aggiornamenti
• Controlli accesso basati su principio need-to-know
• Politiche e procedure minimizzazione dati
• Privacy by design in tutte le implementazioni sistema

Pseudonimizzazione:
• Identificatori pazienti separati da dati clinici dove possibile
• Analisi statistica eseguita su dataset anonimizzati
• Ricerca e miglioramento qualità usano solo dati anonimizzati

Valutazioni Impatto Protezione Dati:
• Condotte per tutte le attività trattamento ad alto rischio
• Revisioni regolari attività trattamento per conformità
• Accordi responsabili esterni includono requisiti GDPR
          `
        },
        transfers: {
          title: "7. Trasferimenti Internazionali di Dati",
          content: `
Archiviazione Dati Principale: Unione Europea
Tutti i dati pazienti sono archiviati in data center UE con conformità GDPR.

Responsabili Terzi:
• PayPal: Decisione adeguatezza EU-US fornisce protezione adeguata
• Google Workspace: Clausole Contrattuali Standard (SCC) in vigore
• Servizi Backup: Provider basati UE con conformità GDPR

Salvaguardie Trasferimento:
• Clausole Contrattuali Standard per tutti i trasferimenti non-UE
• Valutazione regolare decisioni di adeguatezza
• Requisiti crittografia per tutti i dati trasferiti
• Diritto di opposizione ai trasferimenti internazionali

Nessun trasferimento dati a paesi senza misure protezione adeguate
          `
        },
        monitoring: {
          title: "8. Monitoraggio e Revisione",
          content: `
Revisioni Regolari:
• Revisione trimestrale attività di trattamento
• Audit annuale completo conformità GDPR
• Monitoraggio continuo misure protezione dati
• Valutazione regolare responsabili terzi

Rilevamento Violazioni:
• Sistemi monitoraggio automatico per accessi non autorizzati
• Analisi regolare log e rilevamento anomalie
• Formazione staff su identificazione potenziali violazioni
• Procedure notifica violazioni 24 ore

Verifica Conformità:
• Audit interni attività trattamento dati
• Valutazioni sicurezza terze parti annuali
• Valutazioni competenze staff su protezione dati
• Validazione documentazione e tenuta registri

Aggiornamenti e Modifiche:
Questo registro è aggiornato ogni volta che le attività di trattamento cambiano, almeno annualmente, ed è disponibile per l'ispezione dell'autorità di controllo.
          `
        }
      }
    }
  }

  const currentContent = content[language]

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 to-purple-50">
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

        {/* Important Notice */}
        <Card className="mb-8 border-purple-200 bg-purple-50">
          <CardContent className="p-6">
            <div className="flex items-start space-x-3">
              <div className="text-purple-600 text-2xl">📋</div>
              <div>
                <h3 className="font-medium text-purple-800 mb-2">
                  {language === 'en' ? 'GDPR Article 30 Compliance' : 'Conformità Articolo 30 GDPR'}
                </h3>
                <p className="text-purple-700 text-sm">
                  {language === 'en' 
                    ? 'This record is maintained in compliance with GDPR Article 30 requirements for data controllers to maintain records of processing activities. It is available for supervisory authority inspection upon request.'
                    : 'Questo registro è mantenuto in conformità ai requisiti dell\'Articolo 30 del GDPR per i titolari del trattamento di mantenere registri delle attività di trattamento. È disponibile per l\'ispezione dell\'autorità di controllo su richiesta.'
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

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

        {/* Compliance Footer */}
        <Card className="mt-8 border-green-200 bg-green-50">
          <CardContent className="p-6 text-center">
            <div className="text-green-600 text-2xl mb-2">✅</div>
            <h3 className="font-medium text-green-800 mb-2">
              {language === 'en' ? 'GDPR Compliant Processing' : 'Trattamento Conforme GDPR'}
            </h3>
            <p className="text-green-700 text-sm">
              {language === 'en' 
                ? 'All data processing activities described in this record are conducted in full compliance with GDPR requirements, professional standards, and applicable healthcare regulations.'
                : 'Tutte le attività di trattamento dati descritte in questo registro sono condotte in piena conformità ai requisiti GDPR, standard professionali e regolamenti sanitari applicabili.'
              }
            </p>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-stone-500 text-sm">
            {language === 'en' 
              ? 'Dr. Katiuscia Mercogliano • Data Controller • Last Review: December 2024 • Next Review: December 2025'
              : 'Dott.ssa Katiuscia Mercogliano • Titolare del Trattamento • Ultima Revisione: Dicembre 2024 • Prossima Revisione: Dicembre 2025'
            }
          </p>
        </div>
      </div>
    </div>
  )
}