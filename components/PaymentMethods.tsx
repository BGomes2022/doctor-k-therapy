"use client"


interface PaymentMethodsProps {
  language: "en" | "it"
}

export default function PaymentMethods({ language }: PaymentMethodsProps) {
  const content = {
    en: {
      title: "Payment Methods",
      subtitle: "Secure and convenient payment options via PayPal",
      paypalOptions: [
        {
          title: "PayLater",
          description: "Buy now, pay later option",
          countries: "🇦🇺 🇫🇷 🇩🇪 🇮🇹 🇪🇸 🇬🇧 🇺🇸"
        },
        {
          title: "Credit",
          description: "Credit and debit card payments",
          countries: "🇬🇧 🇺🇸"
        },
        {
          title: "Pay in 3",
          description: "Split payments into 3 installments",
          countries: "🇬🇧"
        },
        {
          title: "Pay Monthly",
          description: "Monthly payment plans available",
          countries: "🇺🇸"
        }
      ],
      security: "All payments are processed securely through PayPal's encrypted platform"
    },
    it: {
      title: "Metodi di Pagamento",
      subtitle: "Opzioni di pagamento sicure e convenienti tramite PayPal",
      paypalOptions: [
        {
          title: "Paga Dopo",
          description: "Compra ora, paga dopo",
          countries: "🇦🇺 🇫🇷 🇩🇪 🇮🇹 🇪🇸 🇬🇧 🇺🇸"
        },
        {
          title: "Credito",
          description: "Pagamenti con carta di credito e debito",
          countries: "🇬🇧 🇺🇸"
        },
        {
          title: "Paga in 3",
          description: "Dividi i pagamenti in 3 rate",
          countries: "🇬🇧"
        },
        {
          title: "Paga Mensilmente",
          description: "Piani di pagamento mensili disponibili",
          countries: "🇺🇸"
        }
      ],
      security: "Tutti i pagamenti sono elaborati in modo sicuro attraverso la piattaforma crittografata di PayPal"
    }
  }

  const currentContent = content[language]

  return (
    <section className="py-16 px-4 bg-gradient-to-b from-white to-cream-50/30">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-light text-stone-800 mb-4">{currentContent.title}</h2>
          <p className="text-lg text-stone-600">{currentContent.subtitle}</p>
        </div>

        {/* PayPal Options Grid - Like in the screenshot */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {currentContent.paypalOptions.map((option, index) => (
            <div key={index} className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all border border-gray-100">
              {/* PayPal Logo */}
              <div className="flex items-center justify-center mb-4">
                <img 
                  src="/images/PayPal_Logo2014.svg" 
                  alt="PayPal"
                  className="h-12"
                />
              </div>
              
              {/* Option Title */}
              <div className="text-center mb-4">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{option.title}</h3>
                <p className="text-gray-600 text-xs">{option.description}</p>
              </div>
              
              {/* Availability */}
              <div className="text-center">
                <p className="text-gray-500 text-xs">{option.countries}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Security Notice */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
            <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <p className="text-sm text-blue-800">{currentContent.security}</p>
          </div>
        </div>
      </div>
    </section>
  )
}