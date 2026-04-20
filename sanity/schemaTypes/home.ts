import { defineType, defineField } from 'sanity'

export const homeSchema = defineType({
  name: 'home',
  type: 'document',
  title: 'Home Page',
  fields: [
    defineField({
      name: 'heroHeading',
      type: 'string',
      title: 'Hero Heading',
      description: 'Main headline on the hero section',
    }),
    defineField({
      name: 'heroImage',
      type: 'image',
      title: 'Hero Background Image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'heroSubheading',
      type: 'text',
      title: 'Hero Subheading',
      description: 'Supporting text below the hero headline',
    }),
    defineField({
      name: 'heroCta',
      type: 'string',
      title: 'CTA Button Label',
      description: 'Text for the main call-to-action button',
    }),
    defineField({
      name: 'featuredSectionHeading',
      type: 'string',
      title: 'Featured Section Heading',
    }),
    defineField({
      name: 'featuredProjects',
      type: 'array',
      title: 'Featured Projects Media',
      of: [
        {
          type: 'image',
          options: { hotspot: true },
          fields: [
            defineField({ name: 'alt', type: 'string', title: 'Alt Text' })
          ]
        }
      ]
    }),
    defineField({
      name: 'aboutTeaser',
      type: 'text',
      title: 'About Teaser Copy',
      description: 'Short teaser about the company shown on the home page',
    }),
    defineField({
      name: 'ctaBannerHeading',
      type: 'string',
      title: 'CTA Banner Heading',
    }),
    defineField({
      name: 'ctaBannerSubtext',
      type: 'string',
      title: 'CTA Banner Subtext',
    }),
  ],
  preview: {
    prepare() {
      return { title: 'Home Page' }
    },
  },
})
