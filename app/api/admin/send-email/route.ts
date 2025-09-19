import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import nodemailer from "nodemailer"

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user?.email !== "dr.k@doctorktherapy.com") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { subject, message, recipients } = await req.json()

    if (!subject || !message || !recipients || recipients.length === 0) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Create transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    })

    // Send individual emails to each recipient for personalized communication
    const emailPromises = recipients.map(async (recipient: string) => {
      return transporter.sendMail({
        from: '"Dr. Kathleen Therapy" <info@doctorkathleen.com>',
        to: recipient,
        subject: subject,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Message from Dr. Kathleen Therapy</h2>
            <div style="padding: 20px; background: #f5f5f5; border-radius: 5px;">
              ${message.replace(/\n/g, '<br>')}
            </div>
            <p style="color: #666; font-size: 12px; margin-top: 20px;">
              This email was sent from Dr. Kathleen Therapy admin panel.
            </p>
          </div>
        `
      })
    })

    // Wait for all emails to be sent
    await Promise.all(emailPromises)

    console.log(`📧 Successfully sent ${recipients.length} individual emails`)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error sending email:", error)
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 })
  }
}