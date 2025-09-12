"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

interface CredentialsModalProps {
  isOpen: boolean
  onClose: () => void
  language: "en" | "it"
}

export default function CredentialsModal({ isOpen, onClose, language }: CredentialsModalProps) {
  const content = {
    en: {
      title: "Professional Credentials",
      credentials: [
        "PhD in Psychology (18 years)",
        "Licensed Psychologist (15 years)",
        "Master's Degree in Psychotherapy (TA)",
        "Forensic Psychologist",
        "Psychologist in Psychiatric Hospital (3 years)",
        "CCATP (Clinical Anxiety Treatment Professional)",
        "Cognitive Behavioral Therapy (CBT)",
        "Positive Psychology",
        "FT Psychology (Interpersonal Forgiveness Analysis)",
        "PTSD and PTSD-C (Complex PTSD)",
        "Narcissistic Abuse Specialist",
        "Eating Disorders Specialist",
        "Anti-Bullying Specialist",
        "Low Self-Esteem Specialist",
        "Opioid Dependence and Pornography Addiction Treatment",
        "International Certifications: Anxiety, Trauma-Informed ACT, Somatic Therapy (SP - Sensorimotor Psychotherapy), EMDR Therapy"
      ],
      areasOfWork: "Areas of Work:",
      close: "Close"
    },
    it: {
      title: "Credenziali Professionali",
      credentials: [
        "Dottorato in Psicologia (18 anni)",
        "Psicologa Abilitata (15 anni)",
        "Master in Psicoterapia (AT)",
        "Psicologa Forense",
        "Psicologa in Ospedale Psichiatrico (3 anni)",
        "CCATP (Professionista Clinico per il Trattamento dell'Ansia)",
        "Terapia Cognitivo Comportamentale (CBT)",
        "Psicologia Positiva",
        "Psicologia FT (Analisi del Perdono Interpersonale)",
        "PTSD e PTSD-C (PTSD Complesso)",
        "Specialista in Abuso Narcisistico",
        "Specialista in Disturbi Alimentari",
        "Specialista Anti-Bullismo",
        "Specialista in Bassa Autostima",
        "Trattamento Dipendenza da Oppioidi e Pornografia",
        "Certificazioni Internazionali: Ansia, ACT Informata sul Trauma, Terapia Somatica (SP - Psicoterapia Sensomotoria), Terapia EMDR"
      ],
      areasOfWork: "Aree di Lavoro:",
      close: "Chiudi"
    }
  }

  const currentContent = content[language]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-light text-stone-800 mb-4">
            {currentContent.title}
          </DialogTitle>
          <Button
            onClick={onClose}
            variant="ghost"
            size="icon"
            className="absolute right-4 top-4"
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>
        
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium text-stone-700 mb-4">
              {currentContent.title}
            </h3>
            <div className="space-y-2">
              {currentContent.credentials.map((credential, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-stone-600 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-stone-700 leading-relaxed">{credential}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-6 pt-6 border-t border-stone-200">
          <Button onClick={onClose} className="bg-stone-600 hover:bg-stone-700 text-white">
            {currentContent.close}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}