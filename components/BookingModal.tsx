"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import BookingFlow from "./BookingFlow"

interface BookingModalProps {
  isOpen: boolean
  onClose: () => void
  language: "en" | "it"
  preSelectedPackage?: any
}

export default function BookingModal({ isOpen, onClose, language, preSelectedPackage }: BookingModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-6xl w-full mx-4 max-h-[95vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 hover:bg-stone-100 rounded-full transition-colors"
        >
          <X className="h-6 w-6 text-stone-600" />
        </button>

        {/* Modal Header */}
        <div className="p-6 border-b border-stone-200">
          <h2 className="text-2xl font-light text-stone-800">
            {language === "en" ? "Book Your Therapy Session" : "Prenota la Tua Sessione di Terapia"}
          </h2>
          <p className="text-stone-600 mt-2">
            {language === "en" 
              ? "Complete your booking in 5 simple steps"
              : "Completa la tua prenotazione in 5 semplici passaggi"}
          </p>
        </div>

        {/* Booking Flow Content */}
        <div className="relative">
          <BookingFlow language={language} preSelectedPackage={preSelectedPackage} />
        </div>
      </div>
    </div>
  )
}