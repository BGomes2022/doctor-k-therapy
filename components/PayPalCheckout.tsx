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
    clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "",
    currency: "EUR",
    intent: "capture",
    "disable-funding": "credit,card"
  }

  const createOrder = async (data: any, actions: any) => {
    try {
      console.log('🔵 Creating PayPal order via server...')
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionPackage: sessionPackage
        })
      })

      const orderData = await response.json()
      console.log('✅ Server created order:', orderData)

      if (orderData.id) {
        return orderData.id
      }

      const errorDetail = orderData?.details?.[0]
      const errorMessage = errorDetail
        ? `${errorDetail.issue} ${errorDetail.description} (${orderData.debug_id})`
        : JSON.stringify(orderData)

      throw new Error(errorMessage)
    } catch (error) {
      console.error('❌ Failed to create order:', error)
      throw error
    }
  }

  const onApprove = async (data: any, actions: any) => {
    console.log('🔵 PayPal onApprove triggered with orderID:', data.orderID)
    setIsProcessing(true)
    try {
      console.log('🔵 Capturing PayPal order via server...')
      const response = await fetch(`/api/orders/${data.orderID}/capture`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const orderData = await response.json()
      console.log('🔵 Server response status:', response.status)

      // Handle PayPal's standard error responses
      const errorDetail = orderData?.details?.[0]

      if (errorDetail?.issue === "INSTRUMENT_DECLINED") {
        // Recoverable state - let user try again
        console.log('🔄 Payment declined, restarting...')
        return actions.restart()
      } else if (errorDetail) {
        // Non-recoverable error
        console.error('❌ PayPal error:', errorDetail)
        throw new Error(`${errorDetail.description} (${orderData.debug_id})`)
      } else if (!orderData.purchase_units) {
        console.error('❌ Invalid order data:', orderData)
        throw new Error(JSON.stringify(orderData))
      } else if (!response.ok) {
        console.error('❌ Server error:', response.status, orderData)
        throw new Error(`Server error: ${response.status}`)
      } else {
        // Success!
        const transaction =
          orderData?.purchase_units?.[0]?.payments?.captures?.[0] ||
          orderData?.purchase_units?.[0]?.payments?.authorizations?.[0]

        console.log('✅ Payment successful:', transaction.status, transaction.id)
        console.log('✅ Full order data:', orderData)

        onPaymentSuccess({
          ...orderData,
          transactionId: transaction.id,
          userId: orderData.userId,
          sessionPackage: orderData.sessionPackage || sessionPackage
        })
      }
    } catch (error) {
      console.error('❌ Error in onApprove:', error)
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
              style={{
                layout: "vertical",
                color: "gold",
                shape: "rect",
                label: "paypal"
              }}
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