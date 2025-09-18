"use client"

import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js"
import { useState } from "react"

interface SessionPackage {
  id: string
  name: string
  price: number
  duration?: string
  description?: string
}

interface PayPalCheckoutProps {
  sessionPackage: SessionPackage
  language: "en" | "it"
  onPaymentSuccess: (paymentDetails: any) => void
  onPaymentError: (error: any) => void
}

export default function PayPalCheckout({ 
  sessionPackage, 
  language, 
  onPaymentSuccess, 
  onPaymentError 
}: PayPalCheckoutProps) {
  const [isProcessing, setIsProcessing] = useState(false)

  const paypalOptions = {
    "client-id": process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "",
    currency: "EUR",
    intent: "capture",
    environment: "production",
    "disable-funding": "credit,card"
  }

  const createOrder = (data: any, actions: any) => {
    return actions.order.create({
      purchase_units: [
        {
          amount: {
            currency_code: "EUR",
            value: sessionPackage.price.toString()
          },
          description: sessionPackage.name
        }
      ],
      application_context: {
        shipping_preference: "NO_SHIPPING"
      }
    })
  }

  const onApprove = async (data: any, actions: any) => {
    setIsProcessing(true)
    try {
      const details = await actions.order.capture()
      console.log('PayPal payment captured:', details)
      
      // Send payment details to your backend
      const response = await fetch('/api/payment/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentId: details.id,
          sessionPackage: sessionPackage,
          paymentDetails: details
        })
      })

      if (response.ok) {
        const result = await response.json()
        console.log('Payment verification result:', result)
        onPaymentSuccess({
          ...details,
          sessionPackage,
          userId: result.userId
        })
      } else {
        console.error('Payment verification failed:', response.status)
        throw new Error('Payment verification failed')
      }
    } catch (error) {
      onPaymentError(error)
    } finally {
      setIsProcessing(false)
    }
  }

  const onCancel = (data: any) => {
    console.log('PayPal payment cancelled:', data)
    // Don't call onPaymentError for cancellation - just stay on payment page
  }

  const onError = (err: any) => {
    console.error('PayPal error:', err)
    onPaymentError(err)
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-cream-200">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-light text-stone-800 mb-4">
            {language === "en" ? "Complete Your Payment" : "Completa il Pagamento"}
          </h2>
          
          <div className="bg-stone-50 rounded-lg p-6 mb-6">
            <h3 className="text-xl font-medium text-stone-700 mb-2">{sessionPackage.name}</h3>
            <p className="text-3xl font-light text-stone-600 mb-2">€{sessionPackage.price}</p>
            {sessionPackage.duration && (
              <p className="text-stone-500">{sessionPackage.duration}</p>
            )}
          </div>

          <p className="text-stone-600 mb-6">
            {language === "en" 
              ? "After successful payment, you'll receive a medical form and then your personal booking link."
              : "Dopo il pagamento riuscito, riceverai un modulo medico e poi il tuo link di prenotazione personale."}
          </p>
        </div>

        {isProcessing ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-stone-600 mx-auto mb-4"></div>
            <p className="text-stone-600">
              {language === "en" ? "Processing payment..." : "Elaborazione pagamento..."}
            </p>
          </div>
        ) : (
          <PayPalScriptProvider options={paypalOptions}>
            <PayPalButtons
              createOrder={createOrder}
              onApprove={onApprove}
              onCancel={onCancel}
              onError={onError}
              onCancel={(data) => {
                console.log('PayPal payment cancelled:', data)
                onPaymentError(new Error('Payment was cancelled'))
              }}
              style={{
                layout: "vertical",
                color: "gold",
                shape: "rect",
                label: "paypal"
              }}
              forceReRender={[sessionPackage.price]}
            />
          </PayPalScriptProvider>
        )}


        <div className="mt-6 text-center">
          <p className="text-sm text-stone-500">
            {language === "en" 
              ? "🔒 Secure payment processed by PayPal"
              : "🔒 Pagamento sicuro elaborato da PayPal"}
          </p>
        </div>
      </div>
    </div>
  )
}