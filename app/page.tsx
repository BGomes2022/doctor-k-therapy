"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Heart,
  Shield,
  Users,
  Clock,
  Globe,
  Mail,
  ChevronRight,
  Star,
  CheckCircle,
  Calendar,
  Menu,
  X,
  ChevronDown,
  HeartHandshake,
  Phone,
  AlertTriangle,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useState, useEffect, useRef } from "react"
import VideoSection from "@/components/video-section"
import BookingModal from "@/components/BookingModal"
import TestimonialsCarousel from "@/components/TestimonialsCarousel"
import PaymentMethods from "@/components/PaymentMethods"
import EmergencyModal from "@/components/EmergencyModal"
import CredentialsModal from "@/components/CredentialsModal"

export default function TherapyWebsite() {
  const [language, setLanguage] = useState<"en" | "it">("en")
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [bookingModalOpen, setBookingModalOpen] = useState(false)
  const [selectedPackage, setSelectedPackage] = useState<any>(null)
  const [moreMenuOpen, setMoreMenuOpen] = useState(false)
  const [emergencyModalOpen, setEmergencyModalOpen] = useState(false)
  const [credentialsModalOpen, setCredentialsModalOpen] = useState(false)
  const moreMenuRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target as Node)) {
        setMoreMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const content = {
    en: {
      nav: {
        about: "About",
        services: "Services",
        pricing: "Pricing",
        contact: "Contact",
        more: "More",
        bookNow: "Book Now",
      },
      emergency: {
        title: "Get Help Right Now",
        subtitle: "If you are in crisis or immediate danger, please contact:",
        usa: {
          title: "🇺🇸 United States",
          emergency: "Emergency: 911",
          suicide: "Suicide & Crisis Lifeline: 988",
          crisis: "Crisis Text Line: Text HOME to 741741",
          veterans: "Veterans Crisis Line: 1-800-273-8255"
        },
        canada: {
          title: "🇨🇦 Canada",
          emergency: "Emergency: 911",
          suicide: "Talk Suicide Canada: 1-833-456-4566",
          crisis: "Crisis Text Line: Text TALK to 686868",
          kids: "Kids Help Phone: 1-800-668-6868"
        },
        uk: {
          title: "🇬🇧 United Kingdom",
          emergency: "Emergency: 999 or 112",
          suicide: "Samaritans: 116 123",
          crisis: "Crisis Text Line: Text SHOUT to 85258",
          nhs: "NHS Mental Health: 111 (select option 2)"
        },
        australia: {
          title: "🇦🇺 Australia",
          emergency: "Emergency: 000",
          suicide: "Lifeline: 13 11 14",
          beyondblue: "Beyond Blue: 1300 22 4636",
          kids: "Kids Helpline: 1800 55 1800"
        },
        eu: {
          title: "🇪🇺 European Union",
          emergency: "Emergency: 112 (all EU countries)",
          suicide: "European Lifeline: 116 123",
          germany: "🇩🇪 Germany - Telefonseelsorge: 0800-111 0 111",
          france: "🇫🇷 France - Numéro National: 3114",
          spain: "🇪🇸 Spain - Teléfono de la Esperanza: 717 003 717",
          netherlands: "🇳🇱 Netherlands - 113 Zelfmoordpreventie: 0800-0113"
        },
        italy: {
          title: "🇮🇹 Italy",
          emergency: "Emergenza: 112",
          suicide: "Telefono Amico: 02 2327 2327",
          samaritans: "Samaritans Onlus: 06 77208977",
          helpline: "Telefono Azzurro: 19696"
        },
        disclaimer: "This is not a substitute for emergency medical care. If you are having a medical emergency, call your local emergency number immediately."
      },
      hero: {
        badge: "Online sessions in English & Italian 🇬🇧 🇮🇹",
        title: "See clearly. Feel deeply.",
        subtitle: "Change intentionally.",
        description: "You deserve support—and you don't have to do this alone.",
        bookSession: "Book a Session",
        learnMore: "Learn More",
      },
      testimonials: {
        title: "What People Say",
        items: [
          "She helped me feel like myself again.",
          "I stopped waking up in panic.",
          "I finally found peace after years of confusion.",
        ],
      },
      services: {
        title: "How I Can Help You",
        subtitle: "Specialized support for the challenges that matter most to you",
        items: [
          { title: "Trauma & PTSD / Complex PTSD", icon: Shield },
          { title: "Depression, Burnout & Emotional Numbness", icon: Heart },
          { title: "Panic Attacks & Anxiety", icon: Clock },
          { title: "Narcissistic Abuse Recovery", icon: Shield },
          { title: "Identity & Spiritual Crisis", icon: Users },
          { title: "Grief & Loss", icon: Heart },
          { title: "Teen & Parent Relationship Guidance", icon: Users },
          { title: "Addiction, Eating Disorders, Emotional Dependency", icon: Shield },
          { title: "Couples Therapy & Relationship Support", icon: Heart },
        ],
      },
      about: {
        title: "About Me",
        slogan: "See, feel and change for a better life.",
        sloganSubtext: "My approach with every patient",
        text1:
          "Welcome. I'm Dr. Katiuscia Mercogliano, a licensed psychologist, bilingual in English and Italian, specializing in adult psychology, relationships, and trauma recovery. I hold a Ph.D in Psychology and a Master's Degree in Psychotherapy with a focus on Transactional Analysis (TA).",
        text2:
          "I am internationally certified in Anxiety Treatment, Trauma-Informed ACT, and Somatic Therapy, and I have also worked as a Forensic Psychologist, serving as an expert witness in legal cases. For over 18 years, across three countries, I've walked alongside people during some of the most difficult moments of their lives.",
        text3:
          "Together, we explore and identify life's deep emotional patterns that can keep us stuck in cycles of addiction, depression, or anxiety. Using a psychodynamic and personalized approach, we address past traumas, emotional triggers, and unconscious patterns, helping you understand and change maladaptive behaviors.",
        text4:
          "You'll learn practical tools to recognize emotional triggers and unhealthy relationship dynamics, manage anxiety, and most importantly, develop the independence and boundaries needed to maintain a healthy mental and emotional life.",
        text5:
          "I'm deeply passionate about supporting individuals, couples, parents, and young adults in redefining boundaries, rebalancing roles, and building greater self-awareness. Trauma isn't just a painful memory or hidden truth, it's the moment we felt unsafe and alone, and where insecurity began to shape our future choices. We'll go there together. To see, to feel, and to decide whether it's time to change a pattern that no longer belongs to you.",
        badges: [
          "Degree in Psychology",
          "18+ Years Experience",
          "Trauma-Informed"
        ],
        viewCertifications: "View All Certifications",
      },
      pricing: {
        title: "Investment in Your Healing",
        subtitle: "Clear, transparent pricing for your journey to wellness",
        packages: [
          {
            name: "Consultation",
            price: "€30",
            duration: "20 minutes",
            description: "",
          },
          {
            name: "1 Session",
            price: "€100",
            duration: "50 min",
            description: "",
          },
          {
            name: "4 Sessions",
            price: "€350",
            duration: "50 min each • Valid for 3 months",
            description: "*not valid for Couple Therapy",
          },
          {
            name: "6 Sessions",
            price: "€450",
            duration: "50 min each • Valid for 3 months",
            description: "*not valid for Couple Therapy",
          },
        ],
        couplesNote: "Couples therapy: €120 per session",
        terms: [
          "Payment upfront – no split payments",
          "24-hour cancellation policy applies",
          "Booking possible 30 days to 48h in advance",
        ],
        bookButton: "Book Your Session Now",
      },
      faq: {
        title: "Common Questions",
        items: [
          {
            question: "Is my privacy protected?",
            answer:
              "Absolutely. Your confidentiality is a top priority. Every session is conducted through secure, encrypted platforms to keep your information safe and private.",
          },
          {
            question: "How do online sessions work?",
            answer:
              "We meet via secure video call at your scheduled time. All you need is a quiet space and stable internet connection.",
          },
          {
            question: "What if I feel nervous?",
            answer:
              "Feeling nervous is completely natural. We'll take things at your pace, and I'll do my best to help you feel at ease from the very first session.",
          },
        ],
      },
      contact: {
        title: "Get in Touch",
        subtitle: "Have questions? I'm here to help.",
        info: "Contact Information",
        email: "hello@doctorktherapy.com",
        worldwide: "Online sessions worldwide",
        emergency:
          "This is not an emergency contact. If you're in crisis, please contact your local emergency services or crisis hotline.",
        suicidalDisclaimer:
          "My online counseling is not appropriate for all types of problems. If you have suicidal thoughts or are in a crisis situation, it's important that you seek help immediately. If you are in a crisis or any other person may be in danger - do not use this site.",
        consent:
          "I hereby agree that my data entered in the contact form will be stored electronically, and will be processed and used for the purpose of establishing contact. I am aware that I can revoke my consent at any time.",
        form: {
          title: "Send a Message",
          name: "Your Name",
          email: "Your Email",
          message: "Your Message",
          send: "Send Message",
        },
      },
      footer: {
        description: "Licensed therapist providing compassionate online therapy in English and Italian.",
        slogan: "See, feel and change for a better life.",
        quickLinks: "Quick Links",
        legal: "Legal",
        privacy: "Privacy Policy",
        terms: "Terms of Service",
        disclaimer: "Disclaimer",
        copyright: "All rights reserved.",
        security: "Security: We never request payment details or personal information via email. Please only provide such information through our secure booking system.",
      },
    },
    it: {
      nav: {
        about: "Chi Sono",
        services: "Servizi",
        pricing: "Prezzi",
        contact: "Contatti",
        more: "Altro",
        bookNow: "Prenota Ora",
      },
      emergency: {
        title: "Ottieni Aiuto Subito",
        subtitle: "Se sei in crisi o in pericolo immediato, contatta:",
        usa: {
          title: "🇺🇸 Stati Uniti",
          emergency: "Emergenza: 911",
          suicide: "Linea Suicidio e Crisi: 988",
          crisis: "Linea SMS Crisi: Invia HOME a 741741",
          veterans: "Linea Crisi Veterani: 1-800-273-8255"
        },
        canada: {
          title: "🇨🇦 Canada",
          emergency: "Emergenza: 911",
          suicide: "Talk Suicide Canada: 1-833-456-4566",
          crisis: "Linea SMS Crisi: Invia TALK a 686868",
          kids: "Telefono Aiuto Bambini: 1-800-668-6868"
        },
        uk: {
          title: "🇬🇧 Regno Unito",
          emergency: "Emergenza: 999 o 112",
          suicide: "Samaritans: 116 123",
          crisis: "Linea SMS Crisi: Invia SHOUT a 85258",
          nhs: "NHS Salute Mentale: 111 (seleziona opzione 2)"
        },
        australia: {
          title: "🇦🇺 Australia",
          emergency: "Emergenza: 000",
          suicide: "Lifeline: 13 11 14",
          beyondblue: "Beyond Blue: 1300 22 4636",
          kids: "Telefono Aiuto Bambini: 1800 55 1800"
        },
        eu: {
          title: "🇪🇺 Unione Europea",
          emergency: "Emergenza: 112 (tutti i paesi UE)",
          suicide: "Linea Europea: 116 123",
          germany: "🇩🇪 Germania - Telefonseelsorge: 0800-111 0 111",
          france: "🇫🇷 Francia - Numero Nazionale: 3114",
          spain: "🇪🇸 Spagna - Teléfono de la Esperanza: 717 003 717",
          netherlands: "🇳🇱 Paesi Bassi - 113 Zelfmoordpreventie: 0800-0113"
        },
        italy: {
          title: "🇮🇹 Italia",
          emergency: "Emergenza: 112",
          suicide: "Telefono Amico: 02 2327 2327",
          samaritans: "Samaritans Onlus: 06 77208977",
          helpline: "Telefono Azzurro: 19696"
        },
        disclaimer: "Questo non sostituisce le cure mediche di emergenza. Se hai un'emergenza medica, chiama immediatamente il tuo numero di emergenza locale."
      },
      hero: {
        badge: "Sessioni online in Inglese e Italiano 🇬🇧 🇮🇹",
        title: "Vedi chiaramente. Senti profondamente.",
        subtitle: "Cambia intenzionalmente.",
        description: "Meriti supporto—e non devi farlo da solo.",
        bookSession: "Prenota una Sessione",
        learnMore: "Scopri di Più",
      },
      testimonials: {
        title: "Cosa Dicono le Persone",
        items: [
          "Mi ha aiutato a sentirmi di nuovo me stesso.",
          "Ho smesso di svegliarmi nel panico.",
          "Finalmente ho trovato pace dopo anni di confusione.",
        ],
      },
      services: {
        title: "Come Posso Aiutarti",
        subtitle: "Supporto specializzato per le sfide che contano di più per te",
        items: [
          { title: "Trauma & PTSD / PTSD Complesso", icon: Shield },
          { title: "Depressione, Burnout & Intorpidimento Emotivo", icon: Heart },
          { title: "Attacchi di Panico & Ansia", icon: Clock },
          { title: "Recupero da Abuso Narcisistico", icon: Shield },
          { title: "Crisi di Identità & Spirituale", icon: Users },
          { title: "Lutto & Perdita", icon: Heart },
          { title: "Guida per Relazioni Adolescenti & Genitori", icon: Users },
          { title: "Dipendenze, Disturbi Alimentari, Dipendenza Emotiva", icon: Shield },
          { title: "Terapia di Coppia & Supporto Relazionale", icon: Heart },
        ],
      },
      about: {
        title: "Chi Sono",
        slogan: "Vedi, senti e cambia per una vita di significato.",
        sloganSubtext: "Il mio approccio con ogni paziente",
        text1:
          "Benvenuto. Sono la Dr.ssa Katiuscia Mercogliano, Psicologa Abilitata e psicologa bilingue Inglese e Italiano, specializzata in psicologia degli adulti, relazioni e recupero/ gestione dei traumi. Ho la laurea e licenza in Psicologia e un master in Psicoterapia con un focus sull'Analisi Transazionale (TA).",
        text2:
          "Sono certificata a livello internazionale nel trattamento dell'ansia, nell'ACT e nella terapia somatica, e ho anche lavorato come psicologo forense, fungendo da testimone esperto in casi legali. Per oltre 18 anni, in tre paesi, ho camminato al fianco delle persone durante alcuni dei momenti più difficili della loro vita.",
        text3:
          "Insieme, esploriamo e identifichiamo i profondi modelli emotivi della vita che possono tenerci bloccati in cicli di dipendenza, depressione o ansia. Utilizzando un approccio psicodinamico e personalizzato, affrontiamo i traumi passati, i fattori scatenanti emotivi e i modelli inconsci, aiutandoti a capire e cambiare i comportamenti disadattivi.",
        text4:
          "Imparerai strumenti pratici per riconoscere i fattori scatenanti emotivi e le dinamiche relazionali malsane, gestire l'ansia e, soprattutto, sviluppare l'indipendenza e i confini necessari per mantenere una vita mentale ed emotiva sana.",
        text5:
          "Sono profondamente appassionata nel sostenere individui, coppie, genitori e giovani adulti nel ridefinire i confini, riequilibrare i ruoli e costruire una maggiore consapevolezza di sé. Il trauma non è solo un ricordo doloroso o una verità nascosta, è il momento in cui ci siamo sentiti insicuri e soli, e dove l'insicurezza ha iniziato a plasmare le nostre scelte future. Andremo lì insieme. Per vedere, sentire e decidere se è il momento di cambiare uno schema che non ti appartiene più.",
        badges: [
          "Laurea in Psicologia",
          "18+ Anni di Esperienza",
          "Informata sul Trauma"
        ],
        viewCertifications: "Visualizza Tutte le Certificazioni",
      },
      pricing: {
        title: "Investimento nella Tua Guarigione",
        subtitle: "Prezzi chiari e trasparenti per il tuo viaggio verso il benessere",
        packages: [
          {
            name: "Consulenza",
            price: "€30",
            duration: "20 minuti",
            description: "",
          },
          {
            name: "1 Sessione",
            price: "€100",
            duration: "50 min",
            description: "",
          },
          {
            name: "4 Sessioni",
            price: "€350",
            duration: "50 min ciascuna • Valido per 3 mesi",
            description: "*non valido per Terapia di Coppia",
          },
          {
            name: "6 Sessioni",
            price: "€450",
            duration: "50 min ciascuna • Valido per 3 mesi",
            description: "*non valido per Terapia di Coppia",
          },
        ],
        couplesNote: "Terapia di coppia: €120 per sessione",
        terms: [
          "Pagamento anticipato – nessun pagamento rateale",
          "Si applica la politica di cancellazione di 24 ore",
          "Prenotazione possibile da 30 giorni a 48h in anticipo",
        ],
        bookButton: "Prenota la Tua Sessione Ora",
      },
      faq: {
        title: "Domande Comuni",
        items: [
          {
            question: "È davvero privato?",
            answer:
              "Assolutamente. Tutte le sessioni sono completamente confidenziali e condotte attraverso piattaforme sicure e crittografate.",
          },
          {
            question: "Come funzionano le sessioni online?",
            answer:
              "Ci incontriamo tramite videochiamata sicura all'orario programmato. Tutto ciò di cui hai bisogno è uno spazio tranquillo e una connessione internet stabile.",
          },
          {
            question: "E se mi sento nervoso?",
            answer:
              "È completamente normale sentirsi nervosi. Andremo al tuo ritmo, e ti aiuterò a sentirti a tuo agio fin dalla prima sessione.",
          },
        ],
      },
      contact: {
        title: "Mettiti in Contatto",
        subtitle: "Hai domande? Sono qui per aiutarti.",
        info: "Informazioni di Contatto",
        email: "hello@doctorktherapy.com",
        worldwide: "Sessioni online in tutto il mondo",
        emergency:
          "Questo non è un contatto di emergenza. Se sei in crisi, contatta i servizi di emergenza locali o la linea di crisi.",
        suicidalDisclaimer:
          "La mia consulenza online non è appropriata per tutti i tipi di problemi. Se hai pensieri suicidi o sei in una situazione di crisi, è importante che cerchi aiuto immediatamente. Se sei in crisi o qualsiasi altra persona potrebbe essere in pericolo - non utilizzare questo sito.",
        consent:
          "Acconsento che i miei dati inseriti nel modulo di contatto siano memorizzati elettronicamente e saranno elaborati e utilizzati allo scopo di stabilire un contatto. Sono consapevole di poter revocare il mio consenso in qualsiasi momento.",
        form: {
          title: "Invia un Messaggio",
          name: "Il Tuo Nome",
          email: "La Tua Email",
          message: "Il Tuo Messaggio",
          send: "Invia Messaggio",
        },
      },
      footer: {
        description: "Terapeuta autorizzata che fornisce terapia online compassionevole in inglese e italiano.",
        slogan: "Vedi, senti e cambia per una vita di significato.",
        quickLinks: "Link Rapidi",
        legal: "Legale",
        privacy: "Politica sulla Privacy",
        terms: "Termini di Servizio",
        disclaimer: "Disclaimer",
        copyright: "Tutti i diritti riservati.",
        security: "Sicurezza: Non richiediamo mai dettagli di pagamento o informazioni personali via email. Si prega di fornire tali informazioni solo attraverso il nostro sistema di prenotazione sicuro.",
      },
    },
  }

  const currentContent = content[language]

  return (
    <div className="min-h-screen bg-gradient-to-b from-cream-50 via-stone-50 to-cream-100/50 relative">
      {/* Mesh Background */}
      <div className="fixed inset-0 opacity-30 pointer-events-none">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="mesh" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
              <circle cx="25" cy="25" r="1" fill="#d6d3d1" opacity="0.4" />
              <circle cx="75" cy="75" r="1" fill="#a8a29e" opacity="0.3" />
              <circle cx="50" cy="10" r="0.5" fill="#78716c" opacity="0.2" />
              <circle cx="10" cy="60" r="0.5" fill="#57534e" opacity="0.2" />
              <circle cx="90" cy="40" r="0.5" fill="#d6d3d1" opacity="0.3" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#mesh)" />
        </svg>
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-cream-50/95 backdrop-blur-md z-50 border-b border-cream-200/50">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <Image
              src="/images/logo.png"
              alt="Doctor K. Psychologist"
              width={50}
              height={50}
              className="rounded-full"
            />
            <div>
              <div className="text-lg font-light text-stone-700">Dr. Katiuscia Mercogliano</div>
              <div className="text-sm text-stone-500">Licensed Psychologist, JW</div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-8 items-center">
            <Link href="#about" className="text-stone-500 hover:text-stone-700 transition-colors font-light">
              {currentContent.nav.about}
            </Link>
            <Link href="#services" className="text-stone-500 hover:text-stone-700 transition-colors font-light">
              {currentContent.nav.services}
            </Link>
            <Link href="#pricing" className="text-stone-500 hover:text-stone-700 transition-colors font-light">
              {currentContent.nav.pricing}
            </Link>
            <Link href="#contact" className="text-stone-500 hover:text-stone-700 transition-colors font-light">
              {currentContent.nav.contact}
            </Link>
            {/* More Dropdown */}
            <div className="relative" ref={moreMenuRef}>
              <button
                onClick={() => setMoreMenuOpen(!moreMenuOpen)}
                className="flex items-center text-stone-500 hover:text-stone-700 transition-colors font-light"
              >
                {currentContent.nav.more}
                <ChevronDown className="ml-1 h-4 w-4" />
              </button>
              {moreMenuOpen && (
                <div className="absolute top-full mt-2 right-0 bg-white shadow-lg rounded-lg border border-cream-200 w-64 py-2">
                  <button
                    onClick={() => {
                      setEmergencyModalOpen(true)
                      setMoreMenuOpen(false)
                    }}
                    className="w-full px-4 py-3 text-left hover:bg-cream-50 transition-colors flex items-center space-x-3"
                  >
                    <HeartHandshake className="h-5 w-5 text-red-500" />
                    <div>
                      <div className="font-medium text-stone-700">{currentContent.emergency.title}</div>
                      <div className="text-sm text-stone-500 mt-0.5">
                        {language === "en" ? "Emergency contacts" : "Contatti di emergenza"}
                      </div>
                    </div>
                  </button>
                </div>
              )}
            </div>
            {/* Desktop Language Switcher */}
            <Button
              onClick={() => setLanguage(language === "en" ? "it" : "en")}
              variant="outline"
              size="lg"
              className="border-stone-300 text-stone-600 hover:bg-cream-50 bg-white/80 rounded-full font-light px-4 py-2 shadow-sm flex items-center space-x-1"
            >
              <span className={language === "en" ? "text-base font-medium" : "text-sm font-light"}>English</span>
              <span className="text-stone-400">/</span>
              <span className={language === "it" ? "text-base font-medium" : "text-sm font-light"}>Italian</span>
            </Button>
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden flex items-center space-x-3">
            {/* Mobile Language Switcher */}
            <Button
              onClick={() => setLanguage(language === "en" ? "it" : "en")}
              variant="outline"
              size="sm"
              className="border-stone-300 text-stone-600 hover:bg-cream-50 bg-white/80 rounded-full font-light px-3 py-2 shadow-sm flex items-center space-x-1"
            >
              <span className={language === "en" ? "text-sm font-medium" : "text-xs font-light"}>EN</span>
              <span className="text-stone-400 text-xs">/</span>
              <span className={language === "it" ? "text-sm font-medium" : "text-xs font-light"}>IT</span>
            </Button>

            {/* Mobile Menu Button */}
            <Button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              variant="outline"
              size="sm"
              className="border-stone-300 text-stone-600 hover:bg-cream-50 bg-white/80 rounded-full p-2"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>

          {/* Desktop Book Now Button */}
          <Link href="#pricing">
            <Button className="hidden md:block bg-stone-600 hover:bg-stone-700 text-white font-light px-6 py-2 rounded-full">
              {currentContent.nav.bookNow}
            </Button>
          </Link>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-cream-50/98 backdrop-blur-md border-t border-cream-200/50">
            <div className="container mx-auto px-4 py-4 space-y-4">
              <Link
                href="#about"
                className="block text-stone-600 hover:text-stone-800 transition-colors font-light py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                {currentContent.nav.about}
              </Link>
              <Link
                href="#services"
                className="block text-stone-600 hover:text-stone-800 transition-colors font-light py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                {currentContent.nav.services}
              </Link>
              <Link
                href="#pricing"
                className="block text-stone-600 hover:text-stone-800 transition-colors font-light py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                {currentContent.nav.pricing}
              </Link>
              <Link
                href="#contact"
                className="block text-stone-600 hover:text-stone-800 transition-colors font-light py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                {currentContent.nav.contact}
              </Link>
              <button
                onClick={() => {
                  setEmergencyModalOpen(true)
                  setMobileMenuOpen(false)
                }}
                className="w-full text-left flex items-center space-x-3 text-stone-600 hover:text-stone-800 transition-colors font-light py-2"
              >
                <HeartHandshake className="h-5 w-5 text-red-500" />
                <span>{currentContent.emergency.title}</span>
              </button>
              <div className="pt-4 border-t border-cream-200">
                <Link href="#pricing" onClick={() => setMobileMenuOpen(false)}>
                  <Button
                    className="w-full bg-stone-600 hover:bg-stone-700 text-white font-light py-3 rounded-full"
                  >
                    {currentContent.nav.bookNow}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-20 pb-16 px-4 bg-gradient-to-br from-white via-cream-50/30 to-cream-100/20 relative overflow-hidden">
        {/* Animated background decoration */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-cream-200/15 to-cream-100/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-br from-cream-100/20 to-white/30 rounded-full blur-3xl animate-float-delay"></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-gradient-to-br from-cream-200/10 to-transparent rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 relative z-10">
              <div className="space-y-6">
                <Badge className="bg-cream-100 text-stone-600 hover:bg-cream-100 font-light border-cream-200">
                  {currentContent.hero.badge}
                </Badge>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-extralight text-stone-800 leading-tight tracking-tight">
                  {currentContent.hero.title}
                  <br />
                  <span className="text-stone-600">{currentContent.hero.subtitle}</span>
                </h1>
                <p className="text-xl text-stone-500 leading-relaxed font-light">{currentContent.hero.description}</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <a href="#pricing">
                  <Button
                    size="lg"
                    className="bg-stone-600 hover:bg-stone-700 text-white px-8 py-3 rounded-full font-light shadow-lg"
                  >
                    {currentContent.hero.bookSession}
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </a>
                <Link href="#about">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-amber-300 text-amber-700 hover:bg-amber-50 hover:border-amber-400 px-8 py-3 bg-transparent rounded-full font-light transition-all"
                  >
                    {currentContent.hero.learnMore}
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl" style={{ maxHeight: '500px' }}>
                <Image
                  src="/images/WhatsApp Image 2025-08-17 at 17.47.21.jpeg"
                  alt="Dr. Katiuscia Mercogliano"
                  width={600}
                  height={500}
                  className="w-full h-full object-cover object-center"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Carousel - After Hero */}
      <TestimonialsCarousel />

      {/* Video Section */}
      <VideoSection language={language} />

      {/* Services Section */}
      <section id="services" className="py-20 px-4 bg-gradient-to-b from-cream-50/40 via-white to-cream-100/20 relative">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-extralight text-stone-700 mb-6 tracking-wide">
              {currentContent.services.title}
            </h2>
            <p className="text-xl text-stone-500 max-w-2xl mx-auto font-light leading-relaxed">
              {currentContent.services.subtitle}
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {currentContent.services.items.map((service, index) => {
              const IconComponent = service.icon
              return (
                <Card
                  key={index}
                  className="bg-gradient-to-br from-white via-white to-amber-50/30 border-amber-100 hover:shadow-xl transition-all duration-300 hover:border-amber-200 backdrop-blur-sm hover:-translate-y-1"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="bg-gradient-to-br from-amber-100 to-orange-100 p-3 rounded-lg shadow-sm">
                        <IconComponent className="h-6 w-6 text-stone-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-stone-800 mb-2">{service.title}</h3>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-gradient-to-br from-cream-100/30 via-white to-cream-50/40 px-4 relative overflow-hidden">
        {/* Animated background decoration */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-amber-100/30 to-transparent rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-gradient-to-tl from-orange-100/20 to-transparent rounded-full blur-3xl animate-float"></div>
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-light text-stone-800 mb-6">{currentContent.about.title}</h2>
          </div>
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 md:p-12 shadow-xl border border-cream-200">
            <div className="space-y-6 text-lg text-stone-700 leading-relaxed">
              <p>{currentContent.about.text1}</p>
              <p>{currentContent.about.text2}</p>
              <p>{currentContent.about.text3}</p>
              <p>{currentContent.about.text4}</p>
              <p>{currentContent.about.text5}</p>
            </div>
            <div className="mt-8 flex flex-wrap gap-3 items-center justify-between">
              <div className="flex flex-wrap gap-3">
                {currentContent.about.badges.map((badge, index) => (
                  <Badge
                    key={index}
                    className={`${index % 2 === 0 ? "bg-cream-100 border-cream-200" : "bg-stone-100 border-stone-200"} text-stone-700`}
                  >
                    {badge}
                  </Badge>
                ))}
              </div>
              <Button 
                variant="outline" 
                className="border-cream-300 text-stone-700 hover:bg-cream-50"
                onClick={() => setCredentialsModalOpen(true)}
              >
                {currentContent.about.viewCertifications}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-12 bg-gradient-to-b from-white via-cream-50/30 to-cream-100/20 px-4 relative overflow-hidden">
        {/* Animated background decoration */}
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-orange-100/20 to-transparent rounded-full blur-3xl animate-float-delay"></div>
        <div className="absolute top-1/3 left-0 w-64 h-64 bg-gradient-to-br from-amber-100/15 to-transparent rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-10">
            <h2 className="text-4xl font-extralight text-stone-700 mb-6 tracking-wide">
              {currentContent.pricing.title}
            </h2>
            <p className="text-xl text-stone-500 max-w-2xl mx-auto font-light leading-relaxed">
              {currentContent.pricing.subtitle}
            </p>
          </div>

          {/* First Row - Main Services */}
          <div className="grid md:grid-cols-3 gap-6 mb-6">
            {[
              {
                id: "consultation",
                name: language === "en" ? "Consultation" : "Consulenza",
                price: 30,
                originalPrice: undefined,
                duration: language === "en" ? "20 minutes" : "20 minuti",
                description: language === "en"
                  ? "Initial assessment and therapy planning session"
                  : "Valutazione iniziale e pianificazione terapeutica",
                savings: undefined,
                coupleNote: undefined,
                icon: "",
                popular: false
              },
              {
                id: "single-session",
                name: language === "en" ? "Single Session" : "Sessione Singola",
                price: 100,
                originalPrice: undefined,
                duration: language === "en" ? "50 minutes" : "50 minuti",
                description: language === "en"
                  ? "One-on-one therapy session for immediate support"
                  : "Sessione di terapia individuale per supporto immediato",
                savings: undefined,
                coupleNote: undefined,
                icon: "",
                popular: false
              },
              {
                id: "couples-session",
                name: language === "en" ? "Couples Therapy" : "Terapia di Coppia",
                price: 120,
                originalPrice: undefined,
                duration: language === "en" ? "50 minutes" : "50 minuti",
                description: language === "en"
                  ? "Relationship counseling for couples seeking harmony"
                  : "Consulenza relazionale per coppie che cercano armonia",
                savings: undefined,
                coupleNote: undefined,
                icon: "",
                popular: false
              }
            ].map((pkg) => (
              <div key={pkg.id} className="relative">
                {pkg.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-30">
                    <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-2 rounded-full text-sm font-semibold shadow-lg">
                      {language === "en" ? "Most Popular" : "Più Popolare"}
                    </span>
                  </div>
                )}
                <Card
                  className={`group bg-gradient-to-br from-white via-white to-stone-50/50 border-2 hover:shadow-2xl transition-all duration-500 backdrop-blur-sm hover:-translate-y-2 cursor-pointer relative flex flex-col h-full ${
                    pkg.popular
                      ? "border-amber-400 shadow-2xl ring-2 ring-amber-200/50 scale-105 bg-gradient-to-br from-amber-50/80 via-white to-orange-50/60"
                      : "border-stone-200 hover:border-amber-300 hover:shadow-amber-100/50"
                  }`}
                  onClick={() => setSelectedPackage(pkg)}
                >
                  <CardContent className="p-6 text-center relative z-10 flex flex-col h-full">
                  
                  {pkg.icon && (
                    <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
                      {pkg.icon}
                    </div>
                  )}
                  
                  <h3 className="text-lg font-semibold text-stone-800 mb-2">{pkg.name}</h3>
                  
                  <div className="mb-4">
                    {pkg.originalPrice && (
                      <div className="text-lg text-stone-400 line-through mb-1">€{pkg.originalPrice}</div>
                    )}
                    <div className="text-3xl font-light text-stone-700 mb-1">€{pkg.price}</div>
                    {pkg.savings && (
                      <div className="inline-block bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                        {pkg.savings}
                      </div>
                    )}
                  </div>
                  
                  <p className="text-stone-600 mb-2 text-sm">{pkg.duration}</p>
                  {pkg.coupleNote && (
                    <p className="text-orange-600 text-xs mb-2 italic">{pkg.coupleNote}</p>
                  )}
                  <p className="text-stone-500 text-xs mb-4 leading-relaxed flex-grow">{pkg.description}</p>
                  
                  <Button
                    className="w-full bg-gradient-to-r from-stone-600 to-stone-700 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl shadow-lg font-medium transform transition-all duration-300 hover:scale-105 hover:shadow-xl py-2 text-sm mt-auto"
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedPackage(pkg)
                      setBookingModalOpen(true)
                    }}
                  >
                    <Calendar className="mr-1 h-4 w-4" />
                    {language === "en" ? "Book Now" : "Prenota Ora"}
                  </Button>
                  </CardContent>
                  
                  {/* Subtle background decoration */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-amber-100/20 to-transparent rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </Card>
              </div>
            ))}
          </div>

          {/* Second Row - Package Deals */}
          <div className="grid md:grid-cols-2 gap-6 mb-8 max-w-4xl mx-auto">
            {[
              {
                id: "four-sessions",
                name: language === "en" ? "4 Therapy Sessions" : "4 Sessioni di Terapia",
                price: 350,
                originalPrice: 400,
                duration: language === "en" ? "50 min each • Valid for 3 months" : "50 min ciascuna • Valido per 3 mesi",
                coupleNote: language === "en" ? "*not valid for Couple Therapy" : "*non valido per Terapia di Coppia",
                description: language === "en"
                  ? "Perfect for short-term focused therapy goals"
                  : "Perfetto per obiettivi terapeutici a breve termine",
                savings: language === "en" ? "Save €50" : "Risparmia €50",
                icon: "",
                popular: true
              },
              {
                id: "six-sessions",
                name: language === "en" ? "6 Therapy Sessions" : "6 Sessioni di Terapia",
                price: 450,
                originalPrice: 600,
                duration: language === "en" ? "50 min each • Valid for 3 months" : "50 min ciascuna • Valido per 3 mesi",
                coupleNote: language === "en" ? "*not valid for Couple Therapy" : "*non valido per Terapia di Coppia",
                description: language === "en"
                  ? "Comprehensive therapy program for deep transformation"
                  : "Programma terapeutico completo per trasformazione profonda",
                savings: language === "en" ? "Save €150" : "Risparmia €150",
                icon: "",
                popular: false
              }
            ].map((pkg) => (
              <div key={pkg.id} className="relative">
                {pkg.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-30">
                    <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-2 rounded-full text-sm font-semibold shadow-lg">
                      {language === "en" ? "Most Popular" : "Più Popolare"}
                    </span>
                  </div>
                )}
                <Card
                  className={`group bg-gradient-to-br from-white via-white to-stone-50/50 border-2 hover:shadow-2xl transition-all duration-500 backdrop-blur-sm hover:-translate-y-2 cursor-pointer relative flex flex-col h-full ${
                    pkg.popular
                      ? "border-amber-400 shadow-2xl ring-2 ring-amber-200/50 scale-105 bg-gradient-to-br from-amber-50/80 via-white to-orange-50/60"
                      : "border-stone-200 hover:border-amber-300 hover:shadow-amber-100/50"
                  }`}
                  onClick={() => setSelectedPackage(pkg)}
                >
                <CardContent className="p-6 text-center relative z-10 flex flex-col h-full">
                  {pkg.icon && (
                    <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
                      {pkg.icon}
                    </div>
                  )}
                  
                  <h3 className="text-lg font-semibold text-stone-800 mb-2">{pkg.name}</h3>
                  
                  <div className="mb-4">
                    {pkg.originalPrice && (
                      <div className="text-lg text-stone-400 line-through mb-1">€{pkg.originalPrice}</div>
                    )}
                    <div className="text-3xl font-light text-stone-700 mb-1">€{pkg.price}</div>
                    {pkg.savings && (
                      <div className="inline-block bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                        {pkg.savings}
                      </div>
                    )}
                  </div>
                  
                  <p className="text-stone-600 mb-2 text-sm">{pkg.duration}</p>
                  {pkg.coupleNote && (
                    <p className="text-orange-600 text-xs mb-2 italic">{pkg.coupleNote}</p>
                  )}
                  <p className="text-stone-500 text-xs mb-4 leading-relaxed flex-grow">{pkg.description}</p>
                  
                  <Button
                    className="w-full bg-gradient-to-r from-stone-600 to-stone-700 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl shadow-lg font-medium transform transition-all duration-300 hover:scale-105 hover:shadow-xl py-2 text-sm mt-auto"
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedPackage(pkg)
                      setBookingModalOpen(true)
                    }}
                  >
                    <Calendar className="mr-1 h-4 w-4" />
                    {language === "en" ? "Book Now" : "Prenota Ora"}
                  </Button>
                </CardContent>
                
                {/* Subtle background decoration */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-amber-100/20 to-transparent rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </Card>
              </div>
            ))}
          </div>


        </div>

        {/* Payment Methods Strip */}
        <div className="text-center py-8 border-t border-stone-200/50">
          <p className="text-sm text-stone-500 mb-4 font-light">
            {language === "en" ? "Secure Payment Methods" : "Metodi di Pagamento Sicuri"}
          </p>
          <div className="flex justify-center items-center gap-8 max-w-md mx-auto">
            <img 
              src="/images/Visa_Inc._logo.svg" 
              alt="Visa"
              className="h-6 opacity-70 hover:opacity-100 transition-opacity"
            />
            <img 
              src="/images/mastercard-3.svg" 
              alt="Mastercard"
              className="h-10 opacity-70 hover:opacity-100 transition-opacity"
            />
            <img 
              src="/images/674400.png" 
              alt="Bank Transfer"
              className="h-10 opacity-70 hover:opacity-100 transition-opacity"
            />
            <img 
              src="/images/PayPal.svg.png" 
              alt="PayPal"
              className="h-6 opacity-70 hover:opacity-100 transition-opacity"
            />
          </div>
        </div>
      </section>

      {/* Payment Methods Section */}
      <PaymentMethods language={language} />

      {/* FAQ Section */}
      <section className="py-16 px-4 bg-gradient-to-b from-cream-50/30 via-white to-cream-100/20 relative">
        {/* Subtle animated elements */}
        <div className="absolute top-20 right-10 w-32 h-32 bg-gradient-to-br from-amber-100/10 to-transparent rounded-full blur-2xl animate-pulse-slow"></div>
        <div className="absolute bottom-20 left-10 w-40 h-40 bg-gradient-to-tr from-orange-100/10 to-transparent rounded-full blur-2xl animate-float"></div>
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-light text-stone-800 mb-4">{currentContent.faq.title}</h2>
          </div>
          <div className="space-y-6">
            {currentContent.faq.items.map((faq, index) => (
              <Card key={index} className="bg-white/90 border-cream-200 backdrop-blur-sm">
                <CardContent className="p-6">
                  <h3 className="font-medium text-stone-800 mb-3">{faq.question}</h3>
                  <p className="text-stone-600">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Homepage Disclaimer */}
      <section className="py-8 px-4 bg-amber-50/30">
        <div className="container mx-auto max-w-4xl">
          <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 border border-amber-200">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-stone-700">
                <p>
                  {language === "en" 
                    ? "Online therapy is not appropriate in all situations or for all kinds of problems. If you are experiencing suicidal thoughts or are in a crisis, it's important that you seek help immediately. If you are in a crisis or any other person may be in danger - don't use this site."
                    : "La terapia online non è appropriata in tutte le situazioni o per tutti i tipi di problemi. Se stai vivendo pensieri suicidi o sei in una situazione di crisi, è importante che tu cerchi aiuto immediatamente. Se sei in crisi o qualsiasi altra persona potrebbe essere in pericolo - non utilizzare questo sito."}
                </p>
                <button
                  onClick={() => setEmergencyModalOpen(true)}
                  className="inline-flex items-center gap-1 text-amber-700 hover:text-amber-800 font-medium mt-2"
                >
                  {language === "en" ? "Get help right now" : "Ottieni aiuto subito"}
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-gradient-to-br from-cream-100/40 via-white to-cream-50/30 px-4 relative">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-light text-stone-800 mb-4">{currentContent.contact.title}</h2>
            <p className="text-xl text-stone-600">{currentContent.contact.subtitle}</p>
          </div>
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-cream-200">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <h3 className="text-xl font-medium text-stone-800">{currentContent.contact.info}</h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5 text-stone-600" />
                    <span className="text-stone-700">{currentContent.contact.email}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Globe className="h-5 w-5 text-stone-600" />
                    <span className="text-stone-700">{currentContent.contact.worldwide}</span>
                  </div>
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <p className="text-amber-800 text-sm">
                    <strong>{language === "en" ? "Important:" : "Importante:"}</strong>{" "}
                    {currentContent.contact.emergency}
                  </p>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-800 text-sm">
                    <strong>{language === "en" ? "Crisis Support:" : "Supporto di Crisi:"}</strong>{" "}
                    {currentContent.contact.suicidalDisclaimer}
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="text-xl font-medium text-stone-800">{currentContent.contact.form.title}</h3>
                <form className="space-y-4">
                  <Input placeholder={currentContent.contact.form.name} className="border-cream-300 bg-white/50" />
                  <Input
                    type="email"
                    placeholder={currentContent.contact.form.email}
                    className="border-cream-300 bg-white/50"
                  />
                  <textarea
                    placeholder={currentContent.contact.form.message}
                    rows={4}
                    className="w-full p-3 border border-cream-300 rounded-md focus:ring-2 focus:ring-stone-500 focus:border-stone-500 bg-white/50"
                  />
                  <Button className="w-full bg-stone-600 hover:bg-stone-700 text-white rounded-full">
                    {currentContent.contact.form.send}
                  </Button>
                  <div className="mt-4">
                    <label className="flex items-start space-x-3">
                      <input type="checkbox" required className="mt-1" />
                      <span className="text-sm text-stone-600">{currentContent.contact.consent}</span>
                    </label>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-br from-cream-100/60 via-white to-cream-50/40 text-stone-700 py-16 px-4 relative border-t border-cream-200">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-3 mb-6">
                <Image
                  src="/images/logo.png"
                  alt="Doctor K. Psychologist"
                  width={40}
                  height={40}
                  className="rounded-full opacity-90"
                />
                <h3 className="text-xl font-light">Dr. Katiuscia Mercogliano</h3>
              </div>
              <p className="text-stone-600 font-light leading-relaxed">{currentContent.footer.description}</p>
              <p className="text-stone-500 font-light italic text-sm">"{currentContent.footer.slogan}"</p>
            </div>
            <div>
              <h4 className="font-light mb-6 text-lg">{currentContent.footer.quickLinks}</h4>
              <div className="space-y-3">
                <Link href="#about" className="block text-stone-600 hover:text-stone-800 transition-colors font-light">
                  {currentContent.nav.about}
                </Link>
                <Link href="#services" className="block text-stone-600 hover:text-stone-800 transition-colors font-light">
                  {currentContent.nav.services}
                </Link>
                <Link href="#pricing" className="block text-stone-600 hover:text-stone-800 transition-colors font-light">
                  {currentContent.nav.pricing}
                </Link>
                <Link href="#contact" className="block text-stone-600 hover:text-stone-800 transition-colors font-light">
                  {currentContent.nav.contact}
                </Link>
              </div>
            </div>
            <div>
              <h4 className="font-light mb-6 text-lg">{currentContent.footer.legal}</h4>
              <div className="space-y-3">
                <Link href="/privacy-policy" className="block text-stone-600 hover:text-stone-800 transition-colors font-light">
                  {currentContent.footer.privacy}
                </Link>
                <Link href="/terms-of-service" className="block text-stone-600 hover:text-stone-800 transition-colors font-light">
                  {currentContent.footer.terms}
                </Link>
                <Link href="/disclaimer" className="block text-stone-600 hover:text-stone-800 transition-colors font-light">
                  {currentContent.footer.disclaimer}
                </Link>
                <Link href="/gdpr-data-request" className="block text-stone-600 hover:text-stone-800 transition-colors font-light">
                  🔒 GDPR Data Request
                </Link>
                <Link href="/data-processing-record" className="block text-stone-600 hover:text-stone-800 transition-colors font-light">
                  📋 Data Processing Record
                </Link>
              </div>
            </div>
          </div>
          <div className="border-t border-stone-600 mt-12 pt-8">
            <div className="flex justify-center space-x-6 mb-6">
              <Link href="https://www.instagram.com/i.amdoctork/" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity">
                <svg className="h-10 w-10" viewBox="0 0 24 24">
                  <defs>
                    <linearGradient id="instagram-gradient" x1="0%" y1="100%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#FDC468" />
                      <stop offset="50%" stopColor="#FD3E8D" />
                      <stop offset="100%" stopColor="#7F3FDB" />
                    </linearGradient>
                  </defs>
                  <path fill="url(#instagram-gradient)" d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </Link>
              <Link href="https://www.youtube.com/@I.am.DoctorK" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity">
                <svg className="h-10 w-10" fill="#FF0000" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </Link>
            </div>
            <div className="text-center text-stone-500">
              {/* Security Notice */}
              <div className="mb-4 p-3 bg-stone-50 rounded-lg border border-stone-200">
                <p className="text-xs font-light flex items-center justify-center gap-2">
                  <span>🔒</span>
                  <span>{currentContent.footer.security}</span>
                </p>
              </div>
              <p className="font-light">
                &copy; {new Date().getFullYear()} Dr. Katiuscia Mercogliano. {currentContent.footer.copyright}
              </p>
            </div>
          </div>
        </div>
      </footer>

      {/* Booking Modal */}
      <BookingModal 
        isOpen={bookingModalOpen}
        onClose={() => {
          setBookingModalOpen(false)
          setSelectedPackage(null)
        }}
        language={language}
        preSelectedPackage={selectedPackage}
      />

      {/* Emergency Help Modal */}
      <EmergencyModal 
        isOpen={emergencyModalOpen}
        onClose={() => setEmergencyModalOpen(false)}
        language={language}
      />

      {/* Credentials Modal */}
      <CredentialsModal 
        isOpen={credentialsModalOpen}
        onClose={() => setCredentialsModalOpen(false)}
        language={language}
      />
    </div>
  )
}
