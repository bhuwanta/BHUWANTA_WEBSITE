import { defineType, defineField } from 'sanity'

export const projectsSchema = defineType({
  name: 'projects',
  type: 'document',
  title: 'Projects Page',
  fields: [
    defineField({
      name: 'sectionHeading',
      type: 'string',
      title: 'Section Heading',
    }),
    defineField({
      name: 'projectEntries',
      type: 'array',
      title: 'Project Entries',
      description: 'Text details for each project (images uploaded via dashboard)',
      of: [
        {
          type: 'object',
          fields: [
            defineField({ name: 'name', type: 'string', title: 'Project Name' }),
            defineField({ name: 'description', type: 'text', title: 'Description' }),
            defineField({ name: 'specs', type: 'text', title: 'Specifications' }),
            defineField({ name: 'image', type: 'image', title: 'Project Image', options: { hotspot: true } }),
            defineField({
              name: 'statusText',
              type: 'string',
              title: 'Status',
              options: {
                list: [
                  { title: 'Upcoming', value: 'upcoming' },
                  { title: 'Under Construction', value: 'under-construction' },
                  { title: 'Ready to Move', value: 'ready' },
                  { title: 'Sold Out', value: 'sold-out' },
                ],
              },
            }),
          ],
          preview: {
            select: { title: 'name', subtitle: 'statusText' },
          },
        },
      ],
    }),
  ],
  preview: {
    prepare() {
      return { title: 'Projects Page' }
    },
  },
})
