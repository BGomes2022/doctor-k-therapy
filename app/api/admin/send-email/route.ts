import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { GoogleWorkspaceHelper } from "@/utils/google"

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

    // Use Gmail API for consistent email sending
    const googleHelper = new GoogleWorkspaceHelper()

    const htmlContent = `
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

    const result = await googleHelper.sendBulkEmails({
      recipients,
      subject,
      htmlContent
    })

    if (!result.success) {
      console.error("❌ Bulk email failed:", result.error)
      return NextResponse.json({ error: result.error || "Failed to send emails" }, { status: 500 })
    }

    console.log(`📧 Gmail API bulk email results:`, result.summary)

    return NextResponse.json({
      success: true,
      summary: result.summary,
      message: `Successfully sent ${result.summary.successful} of ${result.summary.total} emails`
    })
  } catch (error) {
    console.error("Error sending email:", error)
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 })
  }
}