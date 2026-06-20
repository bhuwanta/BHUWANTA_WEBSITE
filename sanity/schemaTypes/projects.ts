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
      name: 'projectEntries',
      type: 'array',
      title: 'Project Entries',
      of: [
        {
          type: 'object',
          fields: [
            defineField({ name: 'name', type: 'string', title: 'Project Name' }),
            defineField({
              name: 'category',
              type: 'reference',
              to: [{ type: 'projectCategory' }],
              title: 'Project Category',
            }),
            defineField({
              name: 'slug',
              type: 'slug',
              title: 'URL Slug',
              options: { source: 'name', maxLength: 96 },
            }),
            defineField({ name: 'location', type: 'string', title: 'Location' }),
            defineField({ name: 'googleMapsUrl', type: 'url', title: 'Google Maps Link', description: 'Link to the project location on Google Maps' }),
            defineField({ name: 'description', type: 'text', title: 'Description', rows: 4 }),
            defineField({
              name: 'images',
              type: 'array',
              title: 'Project Images',
              of: [{ type: 'image', options: { hotspot: true } }],
              description: 'Upload multiple images for this project. The first image will be used as the primary thumbnail.'
            }),
            defineField({
              name: 'videoFile',
              type: 'file',
              title: 'Project Video (MP4)',
              options: { accept: 'video/*' },
              description: 'Upload an MP4 video if you do not have images.'
            }),
            defineField({
              name: 'youtubeUrl',
              type: 'url',
              title: 'YouTube Video URL',
              description: 'Optional: Provide a YouTube link instead of uploading a video file.'
            }),
            defineField({
              name: 'brochure',
              type: 'array',
              title: 'Project Brochures',
              of: [{ type: 'file', options: { accept: '.pdf' } }],
              description: 'Upload one or more brochure PDFs for this project.'
            }),
            defineField({
              name: 'layoutPdf',
              type: 'array',
              title: 'Project Layouts',
              of: [{ type: 'file', options: { accept: '.pdf' } }],
              description: 'Upload one or more layout map PDFs for this project.'
            }),
            defineField({
              name: 'reraCertificate',
              type: 'array',
              title: 'RERA Certificates',
              of: [{ type: 'file', options: { accept: '.pdf' } }],
              description: 'Upload one or more RERA Certificate PDFs for this project.'
            }),
            defineField({
              name: 'approvalCertificateLabel',
              type: 'string',
              title: 'Approval Certificate Button Label',
              description: 'e.g. "HMDA Approved Documents" or "DTCP Approved Documents" (Defaults to "HMDA/DTCP Approved Documents")',
            }),
            defineField({
              name: 'hmdaDtcpCertificate',
              type: 'array',
              title: 'HMDA / DTCP Certificates',
              of: [{ type: 'file', options: { accept: '.pdf' } }],
              description: 'Upload one or more HMDA or DTCP Approval Certificate PDFs for this project.'
            }),
            defineField({
              name: 'approvalBadge',
              type: 'string',
              title: 'Approval Badge Text',
              description: 'e.g. "DTCP & RERA Approved" or "HMDA Approved"',
            }),
            defineField({
              name: 'projectHighlights',
              type: 'array',
              title: 'Project Highlights',
              of: [{ type: 'string' }],
              description: 'Add bullet points like "100% Vaastu Compliant", "Underground Drainage", etc.',
              initialValue: [
                "HMDA & RERA Approved Layout",
                "100% Vaastu Compliant",
                "'60' '40' & 30' Wide Roads",
                "Grand Entrance Gate",
                "Underground Drainage",
                "Overhead Water Tank",
                "Street Lights",
                "Rainwater Harvesting",
                "Avenue Plantation",
                "Fully Secured Layout"
              ]
            }),

          ],
          preview: {
            select: { title: 'name', subtitle: 'category.title' },
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
