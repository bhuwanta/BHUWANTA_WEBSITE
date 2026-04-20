import { Resend } from 'resend'

export const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'noreply@bhuwanta.com'

// Send notification to team when a new lead comes in
export async function sendContactNotification(lead: {
  name: string
  email: string
  phone?: string
  message: string
  propertyInterest?: string
  sourcePage?: string
}) {
  if (!resend) {
    console.warn('Resend not configured, skipping email')
    return null
  }

  return resend.emails.send({
    from: FROM_EMAIL,
    to: FROM_EMAIL, // Send to team email
    subject: `New Lead: ${lead.name} — ${lead.propertyInterest || 'General Inquiry'}`,
    html: `
      <h2>New Contact Form Submission</h2>
      <table style="border-collapse: collapse; width: 100%;">
        <tr><td style="padding: 8px; font-weight: bold;">Name:</td><td style="padding: 8px;">${lead.name}</td></tr>
        <tr><td style="padding: 8px; font-weight: bold;">Email:</td><td style="padding: 8px;">${lead.email}</td></tr>
        ${lead.phone ? `<tr><td style="padding: 8px; font-weight: bold;">Phone:</td><td style="padding: 8px;">${lead.phone}</td></tr>` : ''}
        <tr><td style="padding: 8px; font-weight: bold;">Interest:</td><td style="padding: 8px;">${lead.propertyInterest || 'Not specified'}</td></tr>
        <tr><td style="padding: 8px; font-weight: bold;">Source:</td><td style="padding: 8px;">${lead.sourcePage || 'Contact Page'}</td></tr>
        <tr><td style="padding: 8px; font-weight: bold;">Message:</td><td style="padding: 8px;">${lead.message}</td></tr>
      </table>
    `,
  })
}

// Send acknowledgement email to the lead
export async function sendLeadAcknowledgement(to: string, name: string) {
  if (!resend) return null

  return resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: 'Thank you for contacting Bhuwanta',
    html: `
      <h2>Thank you, ${name}!</h2>
      <p>We've received your inquiry and our team will get back to you within 24 hours.</p>
      <p>In the meantime, feel free to explore our latest projects on our website.</p>
      <br/>
      <p>Best regards,<br/>The Bhuwanta Team</p>
    `,
  })
}

// Send follow-up email from dashboard
export async function sendFollowUpEmail(
  to: string,
  subject: string,
  htmlBody: string
) {
  if (!resend) return null

  return resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject,
    html: htmlBody,
  })
}
