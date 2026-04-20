import { defineType, defineField } from 'sanity'

export const careersSchema = defineType({
  name: 'careers',
  type: 'document',
  title: 'Careers Page',
  fields: [
    defineField({
      name: 'introText',
      type: 'text',
      title: 'Intro Paragraph',
      description: 'Introduction text for the careers page',
    }),
    defineField({
      name: 'cultureCopy',
      type: 'array',
      title: 'Culture Section',
      of: [{ type: 'block' }],
    }),
    defineField({
      name: 'benefitsCopy',
      type: 'array',
      title: 'Benefits Section',
      of: [{ type: 'block' }],
    }),
    defineField({
      name: 'whyWorkCopy',
      type: 'array',
      title: 'Why Work With Us',
      of: [{ type: 'block' }],
    }),
  ],
  preview: {
    prepare() {
      return { title: 'Careers Page' }
    },
  },
})
