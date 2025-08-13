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
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import VideoSection from "@/components/video-section"
import BookingModal from "@/components/BookingModal"

export default function TherapyWebsite() {
  const [language, setLanguage] = useState<"en" | "it">("en")
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [bookingModalOpen, setBookingModalOpen] = useState(false)
  const [selectedPackage, setSelectedPackage] = useState(null)

  const content = {
    en: {
      nav: {
        about: "About",
        services: "Services",
        pricing: "Pricing",
        contact: "Contact",
        bookNow: "Book Now",
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
          "I'm Dr. Katiuscia Mercogliano, and I've been walking alongside people through their most difficult moments for over 18 years across three countries.",
        text2:
          "My approach combines psychodynamic therapy, trauma-informed care, ACT, and EMDR techniques – but what matters most is that I want you to feel seen, safe, and strong again.",
        text3:
          "Whether you're struggling with trauma, depression, anxiety, or relationship challenges, you don't have to face it alone. Together, we'll find your path to healing.",
        badges: ["PhD in Psychology", "18+ Years Experience", "Trauma-Informed", "EMDR Training Completed"],
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
            duration: "Valid for 3 months",
            description: "",
          },
          {
            name: "6 Sessions",
            price: "€450",
            duration: "Valid for 3 months",
            description: "",
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
            question: "Is this really private?",
            answer:
              "Absolutely. All sessions are completely confidential and conducted through secure, encrypted platforms.",
          },
          {
            question: "How do online sessions work?",
            answer:
              "We meet via secure video call at your scheduled time. All you need is a quiet space and stable internet connection.",
          },
          {
            question: "What if I feel nervous?",
            answer:
              "It's completely normal to feel nervous. We'll go at your pace, and I'll help you feel comfortable from the very first session.",
          },
        ],
      },
      contact: {
        title: "Get in Touch",
        subtitle: "Have questions? I'm here to help.",
        info: "Contact Information",
        email: "hello@drkatyushagrey.com",
        worldwide: "Online sessions worldwide",
        emergency:
          "Important: This is not an emergency contact. If you're in crisis, please contact your local emergency services or crisis hotline.",
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
      },
    },
    it: {
      nav: {
        about: "Chi Sono",
        services: "Servizi",
        pricing: "Prezzi",
        contact: "Contatti",
        bookNow: "Prenota Ora",
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
          "Sono la Dr.ssa Katiuscia Mercogliano, e ho camminato accanto alle persone nei loro momenti più difficili per oltre 18 anni in tre paesi.",
        text2:
          "Il mio approccio combina terapia psicodinamica, cura informata sul trauma, ACT e tecniche EMDR – ma ciò che conta di più è che voglio che tu ti senta visto, al sicuro e forte di nuovo.",
        text3:
          "Che tu stia lottando con traumi, depressione, ansia o sfide relazionali, non devi affrontarlo da solo. Insieme, troveremo il tuo percorso verso la guarigione.",
        badges: [
          "Dottorato in Psicologia",
          "18+ Anni di Esperienza",
          "Informata sul Trauma",
          "Formazione EMDR Completata",
        ],
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
            duration: "Valido per 3 mesi",
            description: "",
          },
          {
            name: "6 Sessioni",
            price: "€450",
            duration: "Valido per 3 mesi",
            description: "",
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
        email: "hello@drkatyushagrey.com",
        worldwide: "Sessioni online in tutto il mondo",
        emergency:
          "Importante: Questo non è un contatto di emergenza. Se sei in crisi, contatta i servizi di emergenza locali o la linea di crisi.",
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
            <div className="space-y-8">
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
                <Button
                  onClick={() => setBookingModalOpen(true)}
                  size="lg"
                  className="bg-stone-600 hover:bg-stone-700 text-white px-8 py-3 rounded-full font-light shadow-lg"
                >
                  {currentContent.hero.bookSession}
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
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
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src="/images/kat-Hero2.jpeg"
                  alt="Dr. Katiuscia Mercogliano"
                  width={600}
                  height={600}
                  className="w-full h-auto object-cover object-bottom"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section - Moved before Services */}
      <section className="py-16 px-4 bg-gradient-to-b from-white via-cream-50/20 to-cream-100/30 relative">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-light text-stone-800 mb-4">{currentContent.testimonials.title}</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {currentContent.testimonials.items.map((testimonial, index) => (
              <Card key={index} className="bg-white/90 border-cream-200 backdrop-blur-sm">
                <CardContent className="p-6 text-center">
                  <div className="flex justify-center mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-stone-700 italic">"{testimonial}"</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

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

              <div className="text-center py-6">
                <p className="text-2xl font-light text-stone-600 italic">"{currentContent.about.slogan}"</p>
                <p className="text-sm text-stone-500 mt-2">{currentContent.about.sloganSubtext}</p>
              </div>

              <p>{currentContent.about.text2}</p>
              <p>{currentContent.about.text3}</p>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              {currentContent.about.badges.map((badge, index) => (
                <Badge
                  key={index}
                  className={`${index % 2 === 0 ? "bg-cream-100 border-cream-200" : "bg-stone-100 border-stone-200"} text-stone-700`}
                >
                  {badge}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-gradient-to-b from-white via-cream-50/30 to-cream-100/20 px-4 relative overflow-hidden">
        {/* Animated background decoration */}
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-orange-100/20 to-transparent rounded-full blur-3xl animate-float-delay"></div>
        <div className="absolute top-1/3 left-0 w-64 h-64 bg-gradient-to-br from-amber-100/15 to-transparent rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extralight text-stone-700 mb-6 tracking-wide">
              {currentContent.pricing.title}
            </h2>
            <p className="text-xl text-stone-500 max-w-2xl mx-auto font-light leading-relaxed">
              {currentContent.pricing.subtitle}
            </p>
          </div>

          {/* First Row - Main Services */}
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            {[
              {
                id: "consultation",
                name: language === "en" ? "Consultation" : "Consulenza",
                price: 30,
                duration: language === "en" ? "20 minutes" : "20 minuti",
                description: language === "en" 
                  ? "Initial assessment and therapy planning session"
                  : "Valutazione iniziale e pianificazione terapeutica",
                icon: "",
                popular: false
              },
              {
                id: "single-session",
                name: language === "en" ? "Single Session" : "Sessione Singola",
                price: 100,
                duration: language === "en" ? "50 minutes" : "50 minuti",
                description: language === "en"
                  ? "One-on-one therapy session for immediate support"
                  : "Sessione di terapia individuale per supporto immediato",
                icon: "",
                popular: false
              },
              {
                id: "four-sessions",
                name: language === "en" ? "4 Therapy Sessions" : "4 Sessioni di Terapia",
                price: 350,
                originalPrice: 400,
                duration: language === "en" ? "Valid for 3 months" : "Valido per 3 mesi",
                description: language === "en"
                  ? "Perfect for short-term focused therapy goals"
                  : "Perfetto per obiettivi terapeutici a breve termine",
                savings: language === "en" ? "Save €50" : "Risparmia €50",
                icon: "",
                popular: true
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
                  <CardContent className="p-8 text-center relative z-10 flex flex-col h-full">
                  
                  {pkg.icon && (
                    <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
                      {pkg.icon}
                    </div>
                  )}
                  
                  <h3 className="text-xl font-semibold text-stone-800 mb-3">{pkg.name}</h3>
                  
                  <div className="mb-4">
                    {pkg.originalPrice && (
                      <div className="text-lg text-stone-400 line-through mb-1">€{pkg.originalPrice}</div>
                    )}
                    <div className="text-5xl font-light text-stone-700 mb-1">€{pkg.price}</div>
                    {pkg.savings && (
                      <div className="inline-block bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                        {pkg.savings}
                      </div>
                    )}
                  </div>
                  
                  <p className="text-stone-600 mb-3 font-medium">{pkg.duration}</p>
                  <p className="text-stone-500 text-sm mb-6 leading-relaxed flex-grow">{pkg.description}</p>
                  
                  <Button
                    className="w-full bg-gradient-to-r from-stone-600 to-stone-700 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl shadow-lg font-medium transform transition-all duration-300 hover:scale-105 hover:shadow-xl py-3 mt-auto"
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedPackage(pkg)
                      setBookingModalOpen(true)
                    }}
                  >
                    <Calendar className="mr-2 h-5 w-5" />
                    {language === "en" ? "Book Now" : "Prenota Ora"}
                  </Button>
                  </CardContent>
                  
                  {/* Subtle background decoration */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-amber-100/20 to-transparent rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </Card>
              </div>
            ))}
          </div>

          {/* Second Row - Additional Services */}
          <div className="grid md:grid-cols-2 gap-8 mb-12 max-w-4xl mx-auto">
            {[
              {
                id: "six-sessions",
                name: language === "en" ? "6 Therapy Sessions" : "6 Sessioni di Terapia",
                price: 450,
                originalPrice: 600,
                duration: language === "en" ? "Valid for 3 months" : "Valido per 3 mesi",
                description: language === "en"
                  ? "Comprehensive therapy program for deep transformation"
                  : "Programma terapeutico completo per trasformazione profonda",
                savings: language === "en" ? "Save €150" : "Risparmia €150",
                icon: "",
                popular: false
              },
              {
                id: "couples-session",
                name: language === "en" ? "Couples Therapy" : "Terapia di Coppia",
                price: 120,
                duration: language === "en" ? "50 minutes" : "50 minuti",
                description: language === "en"
                  ? "Relationship counseling for couples seeking harmony"
                  : "Consulenza relazionale per coppie che cercano armonia",
                icon: "",
                popular: false
              }
            ].map((pkg) => (
              <Card
                key={pkg.id}
                className="group bg-gradient-to-br from-white via-white to-stone-50/50 border-2 hover:shadow-2xl transition-all duration-500 backdrop-blur-sm hover:-translate-y-2 cursor-pointer relative overflow-hidden border-stone-200 hover:border-amber-300 hover:shadow-amber-100/50 flex flex-col h-full"
                onClick={() => setSelectedPackage(pkg)}
              >
                <CardContent className="p-8 text-center relative z-10 flex flex-col h-full">
                  {pkg.icon && (
                    <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
                      {pkg.icon}
                    </div>
                  )}
                  
                  <h3 className="text-xl font-semibold text-stone-800 mb-3">{pkg.name}</h3>
                  
                  <div className="mb-4">
                    {pkg.originalPrice && (
                      <div className="text-lg text-stone-400 line-through mb-1">€{pkg.originalPrice}</div>
                    )}
                    <div className="text-5xl font-light text-stone-700 mb-1">€{pkg.price}</div>
                    {pkg.savings && (
                      <div className="inline-block bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                        {pkg.savings}
                      </div>
                    )}
                  </div>
                  
                  <p className="text-stone-600 mb-3 font-medium">{pkg.duration}</p>
                  <p className="text-stone-500 text-sm mb-6 leading-relaxed flex-grow">{pkg.description}</p>
                  
                  <Button
                    className="w-full bg-gradient-to-r from-stone-600 to-stone-700 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl shadow-lg font-medium transform transition-all duration-300 hover:scale-105 hover:shadow-xl py-3 mt-auto"
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedPackage(pkg)
                      setBookingModalOpen(true)
                    }}
                  >
                    <Calendar className="mr-2 h-5 w-5" />
                    {language === "en" ? "Book Now" : "Prenota Ora"}
                  </Button>
                </CardContent>
                
                {/* Subtle background decoration */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-amber-100/20 to-transparent rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </Card>
            ))}
          </div>

          {/* Quality Guarantee & Quick Testimonial */}
          <div className="bg-gradient-to-r from-stone-50 to-amber-50/50 rounded-2xl p-8 mb-12 border border-stone-200/50 shadow-lg">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="text-center md:text-left">
                <div className="text-3xl mb-4"></div>
                <h3 className="text-2xl font-semibold text-stone-800 mb-3">
                  {language === "en" ? "Quality Guarantee" : "Garanzia di Qualità"}
                </h3>
                <p className="text-stone-600 leading-relaxed">
                  {language === "en" 
                    ? "If you're not satisfied with your first session, we'll provide a full refund. Your mental health journey is our priority."
                    : "Se non sei soddisfatto della tua prima sessione, ti rimborseremo completamente. Il tuo percorso di salute mentale è la nostra priorità."}
                </p>
              </div>
              <div className="text-center md:text-right">
                <div className="bg-white/80 rounded-xl p-6 shadow-md">
                  <div className="flex justify-center md:justify-end mb-3">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className="text-yellow-400 text-xl">★</span>
                    ))}
                  </div>
                  <p className="text-stone-700 italic text-sm mb-2">
                    "{language === "en" 
                      ? "Dr. Katiuscia helped me transform my anxiety into confidence. Highly recommended!"
                      : "La Dott.ssa Katiuscia mi ha aiutato a trasformare la mia ansia in fiducia. Altamente raccomandato!"}"
                  </p>
                  <p className="text-stone-500 text-xs">
                    {language === "en" ? "- Sarah M., verified patient" : "- Sarah M., paziente verificata"}
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

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
                <Link href="/privacy" className="block text-stone-600 hover:text-stone-800 transition-colors font-light">
                  {currentContent.footer.privacy}
                </Link>
                <Link href="/terms" className="block text-stone-600 hover:text-stone-800 transition-colors font-light">
                  {currentContent.footer.terms}
                </Link>
                <Link href="/disclaimer" className="block text-stone-600 hover:text-stone-800 transition-colors font-light">
                  {currentContent.footer.disclaimer}
                </Link>
                <Link href="/gdpr-request" className="block text-stone-600 hover:text-stone-800 transition-colors font-light">
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
              <Link href="https://linkedin.com" className="text-stone-500 hover:text-stone-700 transition-colors">
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </Link>
              <Link href="https://instagram.com" className="text-stone-500 hover:text-stone-700 transition-colors">
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987s11.987-5.367 11.987-11.987C24.014 5.367 18.647.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.323-1.297C4.198 14.926 3.708 13.775 3.708 12.478s.49-2.448 1.418-3.323c.875-.807 2.026-1.297 3.323-1.297s2.448.49 3.323 1.297c.928.875 1.418 2.026 1.418 3.323s-.49 2.448-1.418 3.213c-.875.807-2.026 1.297-3.323 1.297zm7.83-9.608h-1.507V5.873h1.507v1.507zm-.49 5.123c0-1.507-1.226-2.733-2.733-2.733s-2.733 1.226-2.733 2.733 1.226 2.733 2.733 2.733 2.733-1.226 2.733-2.733z" />
                </svg>
              </Link>
              <Link href="https://facebook.com" className="text-stone-500 hover:text-stone-700 transition-colors">
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </Link>
            </div>
            <div className="text-center text-stone-500">
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
    </div>
  )
}
