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
    }),
    defineField({
      name: 'formLabels',
      type: 'object',
      title: 'Form Labels',
      fields: [
        defineField({ name: 'name', type: 'string', title: 'Name Label', initialValue: 'Your Name' }),
        defineField({ name: 'email', type: 'string', title: 'Email Label', initialValue: 'Email Address' }),
        defineField({ name: 'phone', type: 'string', title: 'Phone Label', initialValue: 'Phone Number' }),
        defineField({ name: 'message', type: 'string', title: 'Message Label', initialValue: 'Your Message' }),
        defineField({ name: 'interest', type: 'string', title: 'Property Interest Label', initialValue: 'Property Interest' }),
        defineField({ name: 'submit', type: 'string', title: 'Submit Button Text', initialValue: 'Send Message' }),
      ],
    }),
    defineField({
      name: 'thankYouMessage',
      type: 'text',
      title: 'Thank You Message',
      description: 'Message shown after successful form submission',
      initialValue: 'Thank you for reaching out! Our team will get back to you within 24 hours.',
    }),
  ],
  preview: {
    prepare() {
      return { title: 'Contact Page' }
    },
  },
})
