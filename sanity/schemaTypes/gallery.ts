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
      description: 'e.g. "On the Ground at Bhuwanta"',
    }),
    defineField({
      name: 'pageSubheading',
      type: 'text',
      title: 'Page Subheading',
      rows: 2,
      description: 'e.g. "See the land for yourself. Every photo here is real — no renderings, no stock images."',
    }),
    defineField({
      name: 'images',
      type: 'array',
      title: 'Gallery Images',
      description: 'Upload gallery images with category tags for filtering',
      of: [
        {
          type: 'image',
          options: { hotspot: true },
          fields: [
            defineField({ name: 'alt', type: 'string', title: 'Alt Text / Caption' }),
            defineField({
              name: 'category',
              type: 'string',
              title: 'Category',
              options: {
                list: [
                  { title: 'Site Views', value: 'site-views' },
                  { title: 'Location & Surroundings', value: 'location-surroundings' },
                  { title: 'Layout Map', value: 'layout-map' },
                  { title: 'Development Progress', value: 'development-progress' },
                ],
              },
            }),
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
    defineField({
      name: 'devUpdateHeading',
      type: 'string',
      title: 'Development Updates Heading',
      description: 'e.g. "Development Updates"',
    }),
    defineField({
      name: 'devUpdateBody',
      type: 'text',
      title: 'Development Updates Text',
      rows: 4,
      description: 'Description for the development progress section',
    }),
  ],
  preview: {
    prepare() {
      return { title: 'Gallery Page' }
    },
  },
})
