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
  location?: string
  project?: string
  enquiryType?: string
  message?: string
  sourcePage?: string
}) {
  if (!resend) {
    console.warn('Resend not configured, skipping email')
    return null
  }

  const emailsToNotify = Array.from(new Set([
    process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'bhuwanta9@gmail.com',
    'info@bhuwanta.com',
    'bhuwanta9@gmail.com'
  ]))

  const { data, error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: emailsToNotify,
    replyTo: lead.email,
    subject: `New Lead: ${lead.name} — ${lead.project || 'General Inquiry'}`,
    html: `
      <h2>New Contact Form Submission</h2>
      <table style="border-collapse: collapse; width: 100%;">
        <tr><td style="padding: 8px; font-weight: bold;">Name:</td><td style="padding: 8px;">${lead.name}</td></tr>
        <tr><td style="padding: 8px; font-weight: bold;">Email:</td><td style="padding: 8px;"><a href="mailto:${lead.email}">${lead.email}</a></td></tr>
        ${lead.phone ? `<tr><td style="padding: 8px; font-weight: bold;">Phone:</td><td style="padding: 8px;">${lead.phone}</td></tr>` : ''}
        <tr><td style="padding: 8px; font-weight: bold;">Location:</td><td style="padding: 8px;">${lead.location || 'Not Sure'}</td></tr>
        <tr><td style="padding: 8px; font-weight: bold;">Project:</td><td style="padding: 8px;">${lead.project || 'Not Sure'}</td></tr>
        <tr><td style="padding: 8px; font-weight: bold;">Type:</td><td style="padding: 8px;">${lead.enquiryType || 'Site Visit'}</td></tr>
        <tr><td style="padding: 8px; font-weight: bold;">Message:</td><td style="padding: 8px; white-space: pre-wrap;">${lead.message || 'No message provided'}</td></tr>
        <tr><td style="padding: 8px; font-weight: bold;">Source:</td><td style="padding: 8px;">${lead.sourcePage || 'Website'}</td></tr>
      </table>
    `,
  })

  if (error) {
    console.error('Resend Admin Notification Error:', error)
  }

  return data
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

// Send credentials to newly created user
export async function sendUserCredentials(to: string, name: string, role: string, password: string, loginUrl: string) {
  if (!resend) return null

  return resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: `Your Bhuwanta CRM ${role} Account Details`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Welcome to Bhuwanta CRM, ${name || 'User'}!</h2>
        <p>An administrator has created a <strong>${role}</strong> account for you.</p>
        
        <div style="background-color: #f3f5f8; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 5px 0;"><strong>Email:</strong> ${to}</p>
          <p style="margin: 5px 0;"><strong>Password:</strong> ${password}</p>
        </div>

        <p>You can log in to the CRM at the following link:</p>
        <p><a href="${loginUrl}" style="display: inline-block; padding: 10px 20px; background-color: #c4a55a; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">Login to CRM</a></p>

        <p style="color: #5a6a82; font-size: 12px; margin-top: 30px;">
          * Please change your password after logging in for the first time if possible.
        </p>
      </div>
    `,
  })
}
