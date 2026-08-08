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
      description: 'e.g. "Our Gallery"',
      initialValue: 'Our Gallery',
    }),
    defineField({
      name: 'siteVisitImages',
      type: 'array',
      title: 'Site Visit Images',
      of: [{ type: 'image', options: { hotspot: true } }],
      description: 'Upload images from site visits.'
    }),
    defineField({
      name: 'siteVisitVideos',
      type: 'array',
      title: 'Site Visit Videos (MP4)',
      of: [{ type: 'file', options: { accept: 'video/*' } }],
      description: 'Upload MP4 videos from site visits.'
    }),
    defineField({
      name: 'siteVisitYoutubeUrls',
      type: 'array',
      title: 'Site Visit YouTube Video URLs',
      of: [{ type: 'url' }],
      description: 'Provide YouTube links for site visits.'
    }),
    defineField({
      name: 'generalImages',
      type: 'array',
      title: 'General Gallery Images',
      of: [{ type: 'image', options: { hotspot: true } }],
      description: 'Upload images that are not tied to a specific project.'
    }),
    defineField({
      name: 'generalVideos',
      type: 'array',
      title: 'General Gallery Videos (MP4)',
      of: [{ type: 'file', options: { accept: 'video/*' } }],
      description: 'Upload MP4 videos that are not tied to a specific project.'
    }),
    defineField({
      name: 'generalYoutubeUrls',
      type: 'array',
      title: 'General YouTube Video URLs',
      of: [{ type: 'url' }],
      description: 'Provide YouTube links that are not tied to a specific project.'
    }),
  ],
  preview: {
    prepare() {
      return { title: 'Gallery Page Configuration' }
    },
  },
})
