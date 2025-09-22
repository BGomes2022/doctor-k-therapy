"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default function DisclaimerPage() {
  const [language, setLanguage] = useState<'en' | 'it'>('en')

  const content = {
    en: {
      title: "Professional Disclaimer",
      lastUpdated: "Last updated: December 2024",
      sections: {
        professional: {
          title: "1. Professional Qualification",
          content: `
Dr. Katiuscia Mercogliano is a licensed mental health professional authorized to provide psychotherapy services. This disclaimer outlines important information about the nature and limitations of online therapy services.

Licensing Information:
• Licensed Therapist in Italy and Portugal
• Professional Registration Number: 5899 (IT) / 30509 (PT)
• Member of the CNOP and ODP
• Continuing Education Requirements: Current and Up-to-Date
          `
        },
        nature: {
          title: "2. Nature of Online Therapy",
          content: `
Online therapy involves:
• Psychotherapy sessions conducted via secure video conferencing
• Real-time interaction between therapist and client
• Use of secure, HIPAA-compliant technology platforms
• Similar therapeutic techniques adapted for digital delivery

Key Differences from In-Person Therapy:
• Limited non-verbal communication cues
• Potential for technical interruptions
• Different emergency response protocols
• Reliance on client's private, secure environment
          `
        },
        effectiveness: {
          title: "3. Effectiveness and Suitability",
          content: `
Research indicates that online therapy can be effective for many mental health conditions, including:
• Depression and anxiety disorders
• Trauma and PTSD (with appropriate adaptations)
• Relationship and family issues
• Stress management and coping skills
• Life transitions and adjustment disorders

Online therapy may NOT be suitable for:
• Severe mental health crises requiring immediate intervention
• Active suicidal or homicidal ideation
• Severe substance use disorders requiring medical supervision
• Certain eating disorders requiring medical monitoring
• Individuals unable to maintain privacy during sessions
• Those with severe cognitive impairments
          `
        },
        risks: {
          title: "4. Potential Risks and Limitations",
          content: `
Technical Risks:
• Internet connectivity issues may interrupt sessions
• Platform failures could compromise session continuity
• Security breaches, though rare, are theoretically possible
• Recording capabilities may pose privacy risks if misused

Therapeutic Risks:
• Misunderstandings due to limited visual/audio quality
• Difficulty assessing non-verbal cues
• Challenges in crisis intervention
• Potential for distractions in client's environment
• Limited ability to provide immediate physical support

Legal and Ethical Considerations:
• Jurisdiction-specific regulations may apply
• Emergency protocols differ from in-person care
• Mandatory reporting requirements still apply
• Record-keeping and confidentiality standards maintained
          `
        },
        emergency: {
          title: "5. Emergency Procedures",
          content: `
If you experience a mental health emergency:

Immediate Risk to Self or Others:
1. Call emergency services immediately (112 in EU, 911 in US)
2. Go to your nearest emergency room
3. Contact a local crisis hotline
4. Reach out to a trusted friend or family member

After-Hours Support:
• This service does not provide 24/7 crisis intervention
• Emergency contacts will be established during intake
• Local resources and crisis numbers will be provided
• Crisis safety plan will be developed collaboratively

Therapist Availability:
• Sessions by appointment only
• Email responses within 24-48 hours during business days
• Emergency situations require immediate professional intervention
          `
        },
        technology: {
          title: "6. Technology Requirements and Responsibilities",
          content: `
Client Technology Responsibilities:
• Maintaining secure, private internet connection
• Using updated devices with proper audio/video capabilities
• Ensuring privacy during sessions
• Testing technology prior to appointments
• Having backup communication methods available

Platform Security:
We use HIPAA-compliant, end-to-end encrypted platforms. However, no technology is 100% secure, and you acknowledge this inherent risk.

Data Storage and Transmission:
• All data is encrypted in transit and at rest
• Session recordings (if any) require explicit consent
• Technical logs may be maintained for security purposes
• Data retention follows professional and legal requirements
          `
        },
        scope: {
          title: "7. Scope of Practice",
          content: `
Services Provided:
• Individual psychotherapy for adults (18+)
• Couples therapy
• Consultation and assessment
• Treatment planning and goal setting
• Therapeutic interventions and techniques
• Progress monitoring and evaluation

Services NOT Provided:
• Psychiatric medication management
• Court-ordered evaluations or legal testimony
• Emergency or crisis intervention
• Services for individuals under 18
• Group therapy sessions
• Family therapy
• Psychological testing or assessment batteries
          `
        },
        boundaries: {
          title: "8. Professional Boundaries",
          content: `
Therapeutic Relationship:
• Professional boundaries will be maintained at all times
• Dual relationships are avoided to maintain objectivity
• Social media connections are not appropriate
• Gift-giving is not encouraged
• Physical contact is not possible in online therapy

Communication Boundaries:
• Sessions are conducted during scheduled appointment times
• Email communication is for scheduling and brief check-ins
• Complex therapeutic content should be addressed in sessions
• Response times to emails: 24-48 hours during business days
          `
        },
        informed: {
          title: "9. Informed Consent",
          content: `
By using these services, you acknowledge that you have been informed about:
• The nature and limitations of online therapy
• Potential risks and benefits
• Alternative treatment options
• Emergency procedures and contacts
• Privacy and confidentiality protections
• Your rights as a client
• The therapist's qualifications and scope of practice

Your Right to Withdraw:
You may discontinue services at any time. If therapy is terminated, appropriate referrals will be provided when clinically indicated.
          `
        },
        limitation: {
          title: "10. Limitation of Liability",
          content: `
Professional Liability:
Dr. Katiuscia Mercogliano maintains professional liability insurance and adheres to established standards of care for online therapy.

Technology Limitations:
No guarantee is made regarding the reliability of internet connections, platform availability, or the absence of technical difficulties.

Outcome Disclaimer:
While therapy can be highly beneficial, no specific outcomes or timeframes can be guaranteed. Success depends on many factors including client engagement, specific circumstances, and therapeutic fit.

Third-Party Services:
We are not responsible for the actions or policies of third-party service providers (internet services, device manufacturers, etc.).
          `
        }
      }
    },
    it: {
      title: "Disclaimer Professionale",
      lastUpdated: "Ultimo aggiornamento: Dicembre 2024",
      sections: {
        professional: {
          title: "1. Qualifica Professionale",
          content: `
La Dott.ssa Katiuscia Mercogliano è una professionista della salute mentale autorizzata a fornire servizi di psicoterapia. Questo disclaimer delinea informazioni importanti sulla natura e le limitazioni dei servizi di terapia online.

Informazioni sulla Licenza:
• Terapeuta Autorizzata in Italia e Portogallo
• Numero di Registrazione Professionale: 5899 (IT) / 30509 (PT)
• Membro di CNOP e ODP
• Requisiti di Formazione Continua: Attuali e Aggiornati
          `
        },
        nature: {
          title: "2. Natura della Terapia Online",
          content: `
La terapia online comporta:
• Sessioni di psicoterapia condotte tramite videoconferenza sicura
• Interazione in tempo reale tra terapeuta e cliente
• Uso di piattaforme tecnologiche sicure e conformi HIPAA
• Tecniche terapeutiche simili adattate per la consegna digitale

Differenze Chiave dalla Terapia di Persona:
• Segnali di comunicazione non verbale limitati
• Potenziale per interruzioni tecniche
• Protocolli di risposta alle emergenze diversi
• Dipendenza dall'ambiente privato e sicuro del cliente
          `
        },
        effectiveness: {
          title: "3. Efficacia e Idoneità",
          content: `
La ricerca indica che la terapia online può essere efficace per molte condizioni di salute mentale, incluse:
• Disturbi di depressione e ansia
• Trauma e PTSD (con adattamenti appropriati)
• Questioni relazionali e familiari
• Gestione dello stress e abilità di coping
• Transizioni di vita e disturbi di adattamento

La terapia online potrebbe NON essere adatta per:
• Crisi di salute mentale gravi che richiedono intervento immediato
• Ideazione suicida o omicida attiva
• Disturbi gravi dell'uso di sostanze che richiedono supervisione medica
• Certi disturbi alimentari che richiedono monitoraggio medico
• Individui incapaci di mantenere la privacy durante le sessioni
• Quelli con gravi compromissioni cognitive
          `
        },
        risks: {
          title: "4. Rischi Potenziali e Limitazioni",
          content: `
Rischi Tecnici:
• Problemi di connettività Internet possono interrompere le sessioni
• Guasti della piattaforma potrebbero compromettere la continuità della sessione
• Violazioni della sicurezza, anche se rare, sono teoricamente possibili
• Le capacità di registrazione possono porre rischi per la privacy se mal utilizzate

Rischi Terapeutici:
• Malintesi dovuti alla qualità limitata di video/audio
• Difficoltà nel valutare segnali non verbali
• Sfide nell'intervento di crisi
• Potenziale per distrazioni nell'ambiente del cliente
• Capacità limitata di fornire supporto fisico immediato

Considerazioni Legali ed Etiche:
• Possono applicarsi regolamenti specifici della giurisdizione
• I protocolli di emergenza differiscono dalla cura di persona
• I requisiti di segnalazione obbligatoria si applicano ancora
• Standard di conservazione dei registri e riservatezza mantenuti
          `
        },
        emergency: {
          title: "5. Procedure di Emergenza",
          content: `
Se vivete un'emergenza di salute mentale:

Rischio Immediato per Sé o Altri:
1. Chiamate i servizi di emergenza immediatamente (112 nell'UE, 911 negli USA)
2. Andate al pronto soccorso più vicino
3. Contattate una linea di crisi locale
4. Rivolgetevi a un amico o familiare fidato

Supporto Fuori Orario:
• Questo servizio non fornisce intervento di crisi 24/7
• I contatti di emergenza saranno stabiliti durante l'intake
• Risorse locali e numeri di crisi saranno forniti
• Il piano di sicurezza in caso di crisi sarà sviluppato collaborativamente

Disponibilità del Terapeuta:
• Sessioni solo su appuntamento
• Risposte via email entro 24-48 ore durante i giorni lavorativi
• Le situazioni di emergenza richiedono intervento professionale immediato
          `
        },
        technology: {
          title: "6. Requisiti Tecnologici e Responsabilità",
          content: `
Responsabilità Tecnologiche del Cliente:
• Mantenere una connessione internet sicura e privata
• Utilizzare dispositivi aggiornati con capacità audio/video appropriate
• Assicurare la privacy durante le sessioni
• Testare la tecnologia prima degli appuntamenti
• Avere metodi di comunicazione di backup disponibili

Sicurezza della Piattaforma:
Utilizziamo piattaforme conformi HIPAA con crittografia end-to-end. Tuttavia, nessuna tecnologia è sicura al 100%, e riconoscete questo rischio intrinseco.

Archiviazione e Trasmissione Dati:
• Tutti i dati sono crittografati in transito e a riposo
• Le registrazioni delle sessioni (se presenti) richiedono consenso esplicito
• I log tecnici possono essere mantenuti per scopi di sicurezza
• La conservazione dei dati segue i requisiti professionali e legali
          `
        },
        scope: {
          title: "7. Ambito di Pratica",
          content: `
Servizi Forniti:
• Psicoterapia individuale per adulti (18+)
• Terapia di coppia
• Consultazione e valutazione
• Pianificazione del trattamento e definizione degli obiettivi
• Interventi e tecniche terapeutiche
• Monitoraggio e valutazione del progresso

Servizi NON Forniti:
• Gestione di farmaci psichiatrici
• Valutazioni ordinate dal tribunale o testimonianza legale
• Intervento di emergenza o crisi
• Servizi per individui sotto i 18 anni
• Sessioni di terapia di gruppo
• Terapia familiare
• Test psicologici o batterie di valutazione
          `
        },
        boundaries: {
          title: "8. Confini Professionali",
          content: `
Rapporto Terapeutico:
• I confini professionali saranno mantenuti in ogni momento
• I rapporti duali sono evitati per mantenere l'obiettività
• Le connessioni sui social media non sono appropriate
• La donazione di regali non è incoraggiata
• Il contatto fisico non è possibile nella terapia online

Confini di Comunicazione:
• Le sessioni sono condotte durante gli orari di appuntamento programmati
• La comunicazione via email è per programmazione e brevi check-in
• Il contenuto terapeutico complesso dovrebbe essere affrontato nelle sessioni
• Tempi di risposta alle email: 24-48 ore durante i giorni lavorativi
          `
        },
        informed: {
          title: "9. Consenso Informato",
          content: `
Utilizzando questi servizi, riconoscete di essere stati informati su:
• La natura e le limitazioni della terapia online
• Rischi e benefici potenziali
• Opzioni di trattamento alternative
• Procedure e contatti di emergenza
• Protezioni di privacy e riservatezza
• I vostri diritti come cliente
• Le qualifiche e l'ambito di pratica del terapeuta

Il Vostro Diritto di Ritiro:
Potete interrompere i servizi in qualsiasi momento. Se la terapia è terminata, saranno forniti riferimenti appropriati quando clinicamente indicato.
          `
        },
        limitation: {
          title: "10. Limitazione della Responsabilità",
          content: `
Responsabilità Professionale:
La Dott.ssa Katiuscia Mercogliano mantiene un'assicurazione di responsabilità professionale e aderisce agli standard stabiliti di cura per la terapia online.

Limitazioni Tecnologiche:
Non viene data alcuna garanzia riguardo all'affidabilità delle connessioni internet, alla disponibilità della piattaforma o all'assenza di difficoltà tecniche.

Disclaimer sui Risultati:
Mentre la terapia può essere altamente benefica, non possono essere garantiti risultati specifici o tempi. Il successo dipende da molti fattori inclusi l'impegno del cliente, le circostanze specifiche e la compatibilità terapeutica.

Servizi di Terze Parti:
Non siamo responsabili per le azioni o le politiche di fornitori di servizi di terze parti (servizi internet, produttori di dispositivi, ecc.).
          `
        }
      }
    }
  }

  const currentContent = content[language]

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 to-orange-50">
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

        {/* Important Notice */}
        <Card className="mb-8 border-orange-200 bg-orange-50">
          <CardContent className="p-6">
            <div className="flex items-start space-x-3">
              <div className="text-orange-600 text-2xl">⚠️</div>
              <div>
                <h3 className="font-medium text-orange-800 mb-2">
                  {language === 'en' ? 'Important Medical Disclaimer' : 'Importante Disclaimer Medico'}
                </h3>
                <p className="text-orange-700 text-sm">
                  {language === 'en' 
                    ? 'Please read this disclaimer carefully before using our online therapy services. By proceeding, you acknowledge understanding and acceptance of these terms.'
                    : 'Si prega di leggere attentamente questo disclaimer prima di utilizzare i nostri servizi di terapia online. Procedendo, riconoscete la comprensione e l\'accettazione di questi termini.'
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

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-stone-500 text-sm">
            {language === 'en' 
              ? 'Dr. Katiuscia Mercogliano • Licensed Therapist • Professional Liability Insurance Maintained'
              : 'Dott.ssa Katiuscia Mercogliano • Terapeuta Autorizzata • Assicurazione di Responsabilità Professionale Mantenuta'
            }
          </p>
        </div>
      </div>
    </div>
  )
}