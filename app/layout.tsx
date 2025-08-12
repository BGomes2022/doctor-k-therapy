import type React from "react"
import type { Metadata } from "next"
import { Inter, DM_Sans } from "next/font/google"
import "./globals.css"
import CookieBanner from "@/components/CookieBanner"

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
})

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

export const metadata: Metadata = {
  title: "Dr. Katyusha Mercogliano - Online Therapy",
  description:
    "Compassionate online therapy for trauma, depression, anxiety, and relationship challenges. Sessions in English & Italian.",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${dmSans.variable} ${inter.variable} font-sans antialiased`}>
        {children}
        <CookieBanner />
      </body>
    </html>
  )
}
