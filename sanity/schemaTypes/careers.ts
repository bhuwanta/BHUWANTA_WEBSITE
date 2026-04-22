import { defineType, defineField } from 'sanity'

export const careersSchema = defineType({
  name: 'careers',
  type: 'document',
  title: 'Careers Page',
  fields: [
    defineField({
      name: 'pageHeading',
      type: 'string',
      title: 'Page Heading',
      description: 'e.g. "Join the Bhuwanta Team"',
    }),
    defineField({
      name: 'pageSubheading',
      type: 'text',
      title: 'Page Subheading',
      rows: 3,
    }),
    defineField({
      name: 'bodyText',
      type: 'text',
      title: 'Body Text',
      rows: 5,
      description: 'Main descriptive paragraph about joining the team',
    }),
    defineField({
      name: 'whatWeLookFor',
      type: 'array',
      title: 'What We Look For',
      description: 'Qualities the company values in candidates',
      of: [{ type: 'string' }],
      options: { layout: 'tags' },
    }),
    defineField({
      name: 'applyEmail',
      type: 'string',
      title: 'Apply Email Address',
      description: 'Email for resume submissions',
      initialValue: 'info@bhuwanta.com',
    }),
    defineField({
      name: 'footerNote',
      type: 'text',
      title: 'Footer Note',
      rows: 2,
      description: 'e.g. "We will get back to every applicant personally. No automated rejections."',
    }),
  ],
  preview: {
    prepare() {
      return { title: 'Careers Page' }
    },
  },
})
