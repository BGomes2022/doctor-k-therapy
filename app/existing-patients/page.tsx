"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronRight, Calendar, Heart } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useState, useEffect } from "react"
import BookingModal from "@/components/BookingModal"
import Head from "next/head"

export default function ExistingPatientsPage() {
  const [language, setLanguage] = useState<"en" | "it">("en")
  const [bookingModalOpen, setBookingModalOpen] = useState(false)

  // SEO: Prevent search engine indexing via useEffect
  useEffect(() => {
    // Add noindex meta tag dynamically
    const metaRobots = document.createElement('meta')
    metaRobots.name = 'robots'
    metaRobots.content = 'noindex, nofollow'
    document.head.appendChild(metaRobots)

    return () => {
      document.head.removeChild(metaRobots)
    }
  }, [])

  const content = {
    en: {
      hero: {
        badge: "Exclusive Offer for Our Valued Patients 💙",
        title: "Thank you for being with us since day one.",
        subtitle: "Your trust means everything.",
        description: "As a token of our gratitude, we're offering you an exclusive session at a special rate.",
      },
      specialOffer: {
        title: "Your Special Offer",
        subtitle: "Exclusive rate for existing patients",
        packageName: "Single Session",
        price: "€63",
        originalPrice: "€100",
        duration: "50 minutes",
        savings: "Save €37",
        description: "A full therapy session exclusively for you at our special appreciation rate",
        bookNow: "Book Your Session Now",
      },
      learnMore: {
        title: "Want to Learn More?",
        description: "Visit our main website to explore all our services, read testimonials, and discover how we can continue supporting your journey.",
        button: "Visit Main Website",
      },
    },
    it: {
      hero: {
        badge: "Offerta Esclusiva per i Nostri Pazienti Stimati 💙",
        title: "Grazie per essere con noi dal primo giorno.",
        subtitle: "La tua fiducia significa tutto.",
        description: "Come segno della nostra gratitudine, ti offriamo una sessione esclusiva a una tariffa speciale.",
      },
      specialOffer: {
        title: "La Tua Offerta Speciale",
        subtitle: "Tariffa esclusiva per pazienti esistenti",
        packageName: "Sessione Singola",
        price: "€63",
        originalPrice: "€100",
        duration: "50 minuti",
        savings: "Risparmia €37",
        description: "Una sessione di terapia completa esclusivamente per te alla nostra tariffa speciale di apprezzamento",
        bookNow: "Prenota la Tua Sessione Ora",
      },
      learnMore: {
        title: "Vuoi Saperne di Più?",
        description: "Visita il nostro sito principale per esplorare tutti i nostri servizi, leggere le testimonianze e scoprire come possiamo continuare a supportare il tuo percorso.",
        button: "Visita il Sito Principale",
      },
    },
  }

  const currentContent = content[language]

  // Special package for existing patients
  const specialPackage = {
    id: "existing-patient-session",
    name: currentContent.specialOffer.packageName,
    price: 63,
    originalPrice: 100,
    duration: currentContent.specialOffer.duration,
    description: currentContent.specialOffer.description,
    savings: currentContent.specialOffer.savings,
    isExistingPatientOffer: true, // Flag to handle this in booking flow
  }

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

      {/* Navigation Bar */}
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

          {/* Language Switcher */}
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
      </nav>

      {/* Hero Section with Thank You Message */}
      <section className="pt-20 pb-16 px-4 bg-gradient-to-br from-white via-cream-50/30 to-cream-100/20 relative overflow-hidden">
        {/* Animated background decoration */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-cream-200/15 to-cream-100/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-br from-cream-100/20 to-white/30 rounded-full blur-3xl animate-float-delay"></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-gradient-to-br from-cream-200/10 to-transparent rounded-full blur-3xl animate-pulse-slow"></div>

        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 relative z-10">
              <div className="space-y-6">
                <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 font-light border-amber-200">
                  {currentContent.hero.badge}
                </Badge>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-extralight text-stone-800 leading-tight tracking-tight">
                  {currentContent.hero.title}
                  <br />
                  <span className="text-stone-600">{currentContent.hero.subtitle}</span>
                </h1>
                <p className="text-xl text-stone-500 leading-relaxed font-light">{currentContent.hero.description}</p>
              </div>
              <div className="flex items-center gap-3">
                <Heart className="h-6 w-6 text-red-400 animate-pulse" />
                <span className="text-stone-600 font-light italic">
                  {language === "en" ? "With gratitude," : "Con gratitudine,"} Dr. K
                </span>
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

      {/* Special Offer Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-white via-cream-50/30 to-cream-100/20 relative overflow-hidden">
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-amber-100/20 to-transparent rounded-full blur-3xl animate-float-delay"></div>

        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-extralight text-stone-700 mb-4 tracking-wide">
              {currentContent.specialOffer.title}
            </h2>
            <p className="text-xl text-stone-500 font-light leading-relaxed">
              {currentContent.specialOffer.subtitle}
            </p>
          </div>

          {/* Special Offer Card */}
          <div className="max-w-md mx-auto">
            <div className="relative">
              {/* "Special Offer" Badge */}
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-30">
                <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-8 py-2 rounded-full text-sm font-semibold shadow-lg">
                  {language === "en" ? "Exclusive Offer" : "Offerta Esclusiva"}
                </span>
              </div>

              {/* Main Card */}
              <div className="bg-gradient-to-br from-amber-50/80 via-white to-orange-50/60 border-2 border-amber-400 shadow-2xl ring-2 ring-amber-200/50 rounded-2xl p-8 mt-6">
                <div className="text-center space-y-6">
                  {/* Price Display */}
                  <div>
                    <div className="text-2xl text-stone-400 line-through mb-2">
                      {currentContent.specialOffer.originalPrice}
                    </div>
                    <div className="text-5xl font-light text-stone-700 mb-3">
                      {currentContent.specialOffer.price}
                    </div>
                    <div className="inline-block bg-green-100 text-green-700 px-4 py-2 rounded-full text-base font-medium">
                      {currentContent.specialOffer.savings}
                    </div>
                  </div>

                  {/* Details */}
                  <div className="space-y-3">
                    <p className="text-stone-600 text-lg">{currentContent.specialOffer.duration}</p>
                    <p className="text-stone-500 leading-relaxed">
                      {currentContent.specialOffer.description}
                    </p>
                  </div>

                  {/* Book Button */}
                  <Button
                    className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white rounded-xl shadow-lg font-medium transform transition-all duration-300 hover:scale-105 hover:shadow-xl py-6 text-lg"
                    onClick={() => setBookingModalOpen(true)}
                  >
                    <Calendar className="mr-2 h-5 w-5" />
                    {currentContent.specialOffer.bookNow}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Learn More Section */}
      <section className="py-16 px-4 bg-gradient-to-b from-cream-50/30 via-white to-cream-100/20">
        <div className="container mx-auto max-w-4xl">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-cream-200 text-center">
            <h3 className="text-2xl font-light text-stone-800 mb-4">
              {currentContent.learnMore.title}
            </h3>
            <p className="text-stone-600 mb-6 leading-relaxed">
              {currentContent.learnMore.description}
            </p>
            <Link href="/">
              <Button
                variant="outline"
                className="border-stone-300 text-stone-700 hover:bg-stone-50 px-8 py-3 rounded-full font-light"
              >
                {currentContent.learnMore.button}
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-br from-cream-100/60 via-white to-cream-50/40 text-stone-700 py-12 px-4 border-t border-cream-200">
        <div className="container mx-auto max-w-6xl text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <Image
              src="/images/logo.png"
              alt="Doctor K. Psychologist"
              width={40}
              height={40}
              className="rounded-full opacity-90"
            />
            <h3 className="text-xl font-light">Dr. Katiuscia Mercogliano</h3>
          </div>
          <p className="text-stone-500 font-light italic text-sm mb-6">
            "{language === "en" ? "See, feel and change for a better life." : "Vedi, senti e cambia per una vita di significato."}"
          </p>
          <p className="text-stone-500 font-light" suppressHydrationWarning>
            &copy; {new Date().getFullYear()} Dr. Katiuscia Mercogliano. {language === "en" ? "All rights reserved." : "Tutti i diritti riservati."}
          </p>
        </div>
      </footer>

      {/* Booking Modal */}
      <BookingModal
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        language={language}
        preSelectedPackage={specialPackage}
      />
    </div>
  )
}
