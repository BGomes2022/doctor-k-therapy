import type React from "react"
import type { Metadata } from "next"
import { Inter, DM_Sans } from "next/font/google"
import "./globals.css"
import CookieBanner from "@/components/CookieBanner"
import GoogleAnalytics from "@/components/GoogleAnalytics"
import { Providers } from "./providers"
import { Toaster } from "@/components/ui/toaster"

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
})

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

export const metadata: Metadata = {
  title: "Dr. Katiuscia Mercogliano",
  description:
    "Compassionate online therapy for trauma, depression, anxiety, and relationship challenges. Sessions in English & Italian."
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <meta name="permissions-policy" content="geolocation=(self)" />
        <GoogleAnalytics />
      </head>
      <body className={`${dmSans.variable} ${inter.variable} font-sans antialiased`}>
        <Providers>
          {children}
          <CookieBanner />
          <Toaster />
        </Providers>
      </body>
    </html>
  )
}
