import { defineType, defineField } from 'sanity'

export const aboutSchema = defineType({
  name: 'about',
  type: 'document',
  title: 'About Page',
  groups: [
    { name: 'whoWeAre', title: 'Who We Are' },
    { name: 'vision', title: 'Vision' },
    { name: 'mission', title: 'Mission' },
    { name: 'whyChoose', title: 'Why Choose Bhuwanta' },
    { name: 'legal', title: 'Legal Transparency' },
    { name: 'closing', title: 'Closing' },
  ],
  fields: [
    // ===== WHO WE ARE =====
    defineField({
      name: 'whoWeAreHeading',
      type: 'string',
      title: 'Section Heading',
      group: 'whoWeAre',
    }),
    defineField({
      name: 'whoWeAreBody',
      type: 'text',
      title: 'Company Overview Text',
      group: 'whoWeAre',
      rows: 8,
    }),

    // ===== VISION =====
    defineField({
      name: 'visionHeading',
      type: 'string',
      title: 'Vision Heading',
      group: 'vision',
    }),
    defineField({
      name: 'visionBody',
      type: 'text',
      title: 'Vision Statement',
      group: 'vision',
      rows: 4,
    }),

    // ===== MISSION =====
    defineField({
      name: 'missionHeading',
      type: 'string',
      title: 'Mission Heading',
      group: 'mission',
    }),
    defineField({
      name: 'missionBody',
      type: 'text',
      title: 'Mission Intro Text',
      group: 'mission',
      rows: 3,
    }),
    defineField({
      name: 'missionCommitments',
      type: 'array',
      title: 'Mission Commitments',
      group: 'mission',
      description: 'e.g. Legal First, Vastu by Design, Total Transparency',
      of: [
        {
          type: 'object',
          fields: [
            defineField({ name: 'title', type: 'string', title: 'Commitment Title' }),
            defineField({ name: 'description', type: 'text', title: 'Description', rows: 3 }),
          ],
          preview: {
            select: { title: 'title' },
          },
        },
      ],
    }),

    // ===== WHY CHOOSE BHUWANTA =====
    defineField({
      name: 'whyChooseHeading',
      type: 'string',
      title: 'Section Heading',
      group: 'whyChoose',
    }),
    defineField({
      name: 'differentiators',
      type: 'array',
      title: 'Differentiators',
      group: 'whyChoose',
      of: [
        {
          type: 'object',
          fields: [
            defineField({ name: 'title', type: 'string', title: 'Point Title' }),
            defineField({ name: 'description', type: 'text', title: 'Description', rows: 3 }),
          ],
          preview: {
            select: { title: 'title' },
          },
        },
      ],
    }),

    // ===== LEGAL TRANSPARENCY =====
    defineField({
      name: 'legalHeading',
      type: 'string',
      title: 'Section Heading',
      group: 'legal',
    }),
    defineField({
      name: 'legalBody',
      type: 'text',
      title: 'Legal Intro Text',
      group: 'legal',
      rows: 4,
    }),
    defineField({
      name: 'legalCommitments',
      type: 'array',
      title: 'Legal Commitment Items',
      group: 'legal',
      description: 'Bullet points like "Full HMDA Layout Approval in place"',
      of: [{ type: 'string' }],
    }),

    // ===== CLOSING =====
    defineField({
      name: 'closingLine',
      type: 'string',
      title: 'Closing Tagline',
      group: 'closing',
      description: 'e.g. "Bhuwanta. Built on trust. Built on land."',
    }),
    defineField({
      name: 'closingContact',
      type: 'string',
      title: 'Closing Contact Info',
      group: 'closing',
      description: 'e.g. "📞 [PHONE] | ✉️ info@bhuwanta.com"',
    }),
  ],
  preview: {
    prepare() {
      return { title: 'About Page' }
    },
  },
})
