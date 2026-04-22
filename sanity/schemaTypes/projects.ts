import { defineType, defineField } from 'sanity'

export const projectsSchema = defineType({
  name: 'projects',
  type: 'document',
  title: 'Projects Page',
  fields: [
    defineField({
      name: 'pageHeading',
      type: 'string',
      title: 'Page Heading',
      description: 'e.g. "Our Projects"',
    }),
    defineField({
      name: 'pageSubheading',
      type: 'text',
      title: 'Page Subheading',
      rows: 3,
    }),
    defineField({
      name: 'projectEntries',
      type: 'array',
      title: 'Project Entries',
      of: [
        {
          type: 'object',
          fields: [
            defineField({ name: 'name', type: 'string', title: 'Project Name' }),
            defineField({
              name: 'slug',
              type: 'slug',
              title: 'URL Slug',
              options: { source: 'name', maxLength: 96 },
            }),
            defineField({ name: 'location', type: 'string', title: 'Location' }),
            defineField({ name: 'description', type: 'text', title: 'Description', rows: 4 }),
            defineField({ name: 'image', type: 'image', title: 'Project Image', options: { hotspot: true } }),
            defineField({ name: 'masterLayoutImage', type: 'image', title: 'Master Layout Image', options: { hotspot: true } }),
            defineField({ name: 'plotSizes', type: 'string', title: 'Plot Sizes', description: 'e.g. "150 sq yd – 300 sq yd"' }),
            defineField({ name: 'pricePerSqYd', type: 'string', title: 'Price per sq yd', description: 'e.g. "Starting ₹15,000 per sq yd"' }),
            defineField({ name: 'hmdaLpNumber', type: 'string', title: 'HMDA LP Number' }),
            defineField({ name: 'reraNumber', type: 'string', title: 'RERA Registration Number' }),
            defineField({
              name: 'statusText',
              type: 'string',
              title: 'Status',
              options: {
                list: [
                  { title: 'Registrations Open', value: 'registrations-open' },
                  { title: 'Upcoming', value: 'upcoming' },
                  { title: 'Under Development', value: 'under-development' },
                  { title: 'Ready', value: 'ready' },
                  { title: 'Sold Out', value: 'sold-out' },
                ],
              },
            }),
            defineField({
              name: 'plotDetails',
              type: 'array',
              title: 'Plot Details Table',
              description: 'Rows for the plot pricing table',
              of: [
                {
                  type: 'object',
                  fields: [
                    defineField({ name: 'plotSize', type: 'string', title: 'Plot Size Label' }),
                    defineField({ name: 'area', type: 'string', title: 'Area (sq yd)' }),
                    defineField({ name: 'pricePerSqYd', type: 'string', title: 'Price per sq yd' }),
                    defineField({ name: 'totalPrice', type: 'string', title: 'Total Starting Price' }),
                  ],
                  preview: {
                    select: { title: 'plotSize', subtitle: 'totalPrice' },
                  },
                },
              ],
            }),
            defineField({
              name: 'amenities',
              type: 'array',
              title: 'Amenities',
              of: [
                {
                  type: 'object',
                  fields: [
                    defineField({ name: 'icon', type: 'string', title: 'Lucide Icon Name', description: 'e.g. MapPin, Navigation, School, Hospital, ShoppingCart, Bus' }),
                    defineField({ name: 'label', type: 'string', title: 'Amenity' }),
                  ],
                  preview: {
                    select: { title: 'label', subtitle: 'icon' },
                  },
                },
              ],
            }),
            defineField({
              name: 'locationHighlights',
              type: 'array',
              title: 'Location Highlights',
              of: [
                {
                  type: 'object',
                  fields: [
                    defineField({ name: 'icon', type: 'string', title: 'Lucide Icon Name', description: 'e.g. MapPin, Navigation, School, Hospital, ShoppingCart, Bus' }),
                    defineField({ name: 'label', type: 'string', title: 'Highlight' }),
                  ],
                  preview: {
                    select: { title: 'label' },
                  },
                },
              ],
            }),
            defineField({
              name: 'approvals',
              type: 'array',
              title: 'Approvals & Certifications',
              of: [
                {
                  type: 'object',
                  fields: [
                    defineField({ name: 'label', type: 'string', title: 'Approval Label' }),
                    defineField({ name: 'detail', type: 'string', title: 'Detail / Number' }),
                  ],
                  preview: {
                    select: { title: 'label', subtitle: 'detail' },
                  },
                },
              ],
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
