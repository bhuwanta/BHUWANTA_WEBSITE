import { defineType, defineField } from 'sanity'

export const gallerySchema = defineType({
  name: 'gallery',
  type: 'document',
  title: 'Gallery Page',
  fields: [
    defineField({
      name: 'pageHeading',
      type: 'string',
      title: 'Page Heading',
    }),
    defineField({
      name: 'sectionHeadings',
      type: 'array',
      title: 'Section Headings',
      of: [{ type: 'string' }],
    }),
    defineField({
      name: 'images',
      type: 'array',
      title: 'Gallery Images',
      description: 'Upload your gallery images here',
      of: [
        {
          type: 'image',
          options: { hotspot: true },
          fields: [
            defineField({ name: 'alt', type: 'string', title: 'Alt Text / Caption' }),
          ],
        },
      ],
    }),
    defineField({
      name: 'youtubeVideos',
      type: 'array',
      title: 'YouTube Videos',
      description: 'Paste YouTube URLs here',
      of: [
        {
          type: 'object',
          fields: [
            defineField({ name: 'title', type: 'string', title: 'Video Title' }),
            defineField({ name: 'url', type: 'url', title: 'YouTube URL' }),
          ],
          preview: {
            select: { title: 'title', subtitle: 'url' },
          },
        },
      ],
    }),
  ],
  preview: {
    prepare() {
      return { title: 'Gallery Page' }
    },
  },
})
