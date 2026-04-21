import { defineType, defineField } from 'sanity'

export const autoresponderSchema = defineType({
  name: 'autoresponder',
  type: 'document',
  title: 'Autoresponder Settings',
  fields: [
    defineField({
      name: 'fromName',
      type: 'string',
      title: 'Sender Name',
      initialValue: 'Bhuwanta Real Estate',
    }),
    defineField({
      name: 'fromEmail',
      type: 'string',
      title: 'Sender Email',
      description: 'Must be verified in Resend.com DNS settings (e.g. info@bhuwanta.com)',
      initialValue: 'info@bhuwanta.com',
    }),
    defineField({
      name: 'subjectLine',
      type: 'string',
      title: 'Subject Line',
      initialValue: 'Thank you for contacting Bhuwanta',
    }),
    defineField({
      name: 'logo',
      type: 'image',
      title: 'Email Logo (Optional)',
      description: 'The logo to display at the top of the email',
      options: { hotspot: true },
    }),
    defineField({
      name: 'messageBody',
      type: 'text',
      title: 'Message Body',
      description: 'The main text of the email. You can use simple text.',
      initialValue: "We've received your inquiry and our team will get back to you within 24 hours.\\n\\nIn the meantime, feel free to explore our latest projects and review our brochure attached below.",
    }),
    defineField({
      name: 'attachmentFile',
      type: 'file',
      title: 'Attachment (PDF Brochure)',
      description: 'Optional file attached to the email (Max 5MB recommended).',
      options: { accept: 'application/pdf' }
    }),
  ],
})
