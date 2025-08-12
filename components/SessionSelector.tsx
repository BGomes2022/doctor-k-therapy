"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Calendar } from "lucide-react"

interface SessionPackage {
  id: string
  name: string
  price: number
  duration?: string
  description?: string
  popular?: boolean
}

interface SessionSelectorProps {
  language: "en" | "it"
  onSessionSelect: (sessionPackage: SessionPackage) => void
}

export default function SessionSelector({ language, onSessionSelect }: SessionSelectorProps) {
  const [selectedPackage, setSelectedPackage] = useState<SessionPackage | null>(null)

  const packages: SessionPackage[] = [
    {
      id: "consultation",
      name: language === "en" ? "Consultation" : "Consulenza",
      price: 30,
      duration: language === "en" ? "20 minutes" : "20 minuti",
      description: ""
    },
    {
      id: "single-session",
      name: language === "en" ? "1 Session" : "1 Sessione",
      price: 100,
      duration: language === "en" ? "50 minutes" : "50 minuti",
      description: ""
    },
    {
      id: "four-sessions",
      name: language === "en" ? "4 Sessions Package" : "Pacchetto 4 Sessioni",
      price: 350,
      duration: language === "en" ? "Valid for 3 months" : "Valido per 3 mesi",
      description: "",
      popular: true
    },
    {
      id: "six-sessions",
      name: language === "en" ? "6 Sessions Package" : "Pacchetto 6 Sessioni",
      price: 450,
      duration: language === "en" ? "Valid for 3 months" : "Valido per 3 mesi",
      description: ""
    },
    {
      id: "couples-session",
      name: language === "en" ? "Couples Session" : "Sessione di Coppia",
      price: 120,
      duration: language === "en" ? "50 minutes" : "50 minuti",
      description: ""
    }
  ]

  const handleSelectPackage = (pkg: SessionPackage) => {
    setSelectedPackage(pkg)
  }

  const handleProceedToPayment = () => {
    if (selectedPackage) {
      onSessionSelect(selectedPackage)
    }
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-extralight text-stone-700 mb-6">
          {language === "en" ? "Select Your Session Type" : "Seleziona il Tuo Tipo di Sessione"}
        </h2>
        <p className="text-xl text-stone-500 font-light">
          {language === "en" 
            ? "Choose the package that best fits your needs" 
            : "Scegli il pacchetto che meglio si adatta alle tue esigenze"}
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {packages.map((pkg) => (
          <Card
            key={pkg.id}
            className={`cursor-pointer transition-all duration-300 hover:shadow-xl ${
              selectedPackage?.id === pkg.id
                ? "ring-2 ring-stone-500 shadow-lg border-stone-400"
                : "border-cream-200 hover:border-stone-300"
            } ${pkg.popular ? "border-stone-400 shadow-lg" : ""}`}
            onClick={() => handleSelectPackage(pkg)}
          >
            <CardContent className="p-6 text-center relative">
              {pkg.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-stone-600 text-white">
                    {language === "en" ? "Most Popular" : "Più Popolare"}
                  </Badge>
                </div>
              )}
              
              {selectedPackage?.id === pkg.id && (
                <div className="absolute -top-2 -right-2">
                  <div className="bg-green-500 text-white rounded-full p-1">
                    <CheckCircle className="h-4 w-4" />
                  </div>
                </div>
              )}

              <h3 className="text-xl font-medium text-stone-800 mb-4">{pkg.name}</h3>
              <div className="text-4xl font-extralight text-stone-700 mb-3">€{pkg.price}</div>
              {pkg.duration && (
                <p className="text-stone-600 mb-2 font-light">{pkg.duration}</p>
              )}
              {pkg.description && (
                <p className="text-sm text-stone-500 italic">{pkg.description}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedPackage && (
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-cream-200">
          <div className="text-center">
            <h3 className="text-2xl font-light text-stone-800 mb-4">
              {language === "en" ? "Selected Package" : "Pacchetto Selezionato"}
            </h3>
            <div className="mb-6">
              <p className="text-lg font-medium text-stone-700">{selectedPackage.name}</p>
              <p className="text-3xl font-light text-stone-600">€{selectedPackage.price}</p>
              {selectedPackage.duration && (
                <p className="text-stone-500">{selectedPackage.duration}</p>
              )}
            </div>
            
            <div className="space-y-4 mb-8">
              <div className="flex items-center justify-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-stone-700">
                  {language === "en" 
                    ? "Secure PayPal payment" 
                    : "Pagamento sicuro con PayPal"}
                </span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-stone-700">
                  {language === "en" 
                    ? "Personal booking link after payment" 
                    : "Link di prenotazione personale dopo il pagamento"}
                </span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-stone-700">
                  {language === "en" 
                    ? "Choose your preferred time slot" 
                    : "Scegli il tuo orario preferito"}
                </span>
              </div>
            </div>

            <Button
              onClick={handleProceedToPayment}
              size="lg"
              className="bg-stone-600 hover:bg-stone-700 text-white px-12 py-3 rounded-full shadow-lg font-light"
            >
              <Calendar className="mr-2 h-5 w-5" />
              {language === "en" ? "Proceed to Payment" : "Procedi al Pagamento"}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}