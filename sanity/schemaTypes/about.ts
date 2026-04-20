import { defineType, defineField } from 'sanity'

export const aboutSchema = defineType({
  name: 'about',
  type: 'document',
  title: 'About Page',
  fields: [
    defineField({
      name: 'companyStory',
      type: 'array',
      title: 'Company Story',
      description: 'Rich text content for the company story section',
      of: [{ type: 'block' }],
    }),
    defineField({
      name: 'missionStatement',
      type: 'text',
      title: 'Mission Statement',
    }),
    defineField({
      name: 'teamMembers',
      type: 'array',
      title: 'Team Members',
      description: 'Text-only team member info (photos uploaded via dashboard)',
      of: [
        {
          type: 'object',
          fields: [
            defineField({ name: 'name', type: 'string', title: 'Name' }),
            defineField({ name: 'role', type: 'string', title: 'Role/Title' }),
            defineField({ name: 'bio', type: 'text', title: 'Bio' }),
            defineField({ name: 'image', type: 'image', title: 'Profile Photo', options: { hotspot: true } }),
          ],
          preview: {
            select: { title: 'name', subtitle: 'role' },
          },
        },
      ],
    }),
  ],
  preview: {
    prepare() {
      return { title: 'About Page' }
    },
  },
})
