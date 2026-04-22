import { defineType, defineField } from 'sanity'

export const contactSchema = defineType({
  name: 'contact',
  type: 'document',
  title: 'Contact Page',
  fields: [
    defineField({
      name: 'pageHeading',
      type: 'string',
      title: 'Page Heading',
      description: 'e.g. "Let\'s Talk"',
    }),
    defineField({
      name: 'pageSubheading',
      type: 'text',
      title: 'Page Subheading',
      rows: 2,
    }),
    defineField({
      name: 'formLabels',
      type: 'object',
      title: 'Form Labels',
      fields: [
        defineField({ name: 'name', type: 'string', title: 'Name Label', initialValue: 'Full Name' }),
        defineField({ name: 'phone', type: 'string', title: 'Phone Label', initialValue: 'Phone Number' }),
        defineField({ name: 'email', type: 'string', title: 'Email Label', initialValue: 'Email Address' }),
        defineField({ name: 'query', type: 'string', title: 'Query Type Label', initialValue: 'Your Query' }),
        defineField({ name: 'message', type: 'string', title: 'Message Label', initialValue: 'Message' }),
        defineField({ name: 'submit', type: 'string', title: 'Submit Button Text', initialValue: 'Send Message' }),
      ],
    }),
    defineField({
      name: 'queryOptions',
      type: 'array',
      title: 'Query Type Dropdown Options',
      description: 'Options for the query type dropdown in the contact form',
      of: [{ type: 'string' }],
      initialValue: ['Site Visit', 'Project Info', 'Investment Query', 'Other'],
    }),
    defineField({
      name: 'thankYouMessage',
      type: 'text',
      title: 'Thank You Message',
      description: 'Message shown after successful form submission',
      initialValue: 'Thank you for reaching out! Our team will get back to you within 24 hours.',
    }),
    defineField({
      name: 'whatsappLink',
      type: 'url',
      title: 'WhatsApp Link',
      description: 'e.g. https://wa.me/91XXXXXXXXXX',
    }),
    defineField({
      name: 'googleMapsEmbed',
      type: 'text',
      title: 'Google Maps Embed URL',
      description: 'Paste the Google Maps embed iframe src URL here',
      rows: 2,
    }),
  ],
  preview: {
    prepare() {
      return { title: 'Contact Page' }
    },
  },
})
