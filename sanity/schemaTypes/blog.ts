import { defineType, defineField } from 'sanity'

export const blogSchema = defineType({
  name: 'blog',
  type: 'document',
  title: 'Blog Post',
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      title: 'Title',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      type: 'slug',
      title: 'Slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'excerpt',
      type: 'text',
      title: 'Excerpt',
      description: 'Short summary for blog listing cards',
      rows: 3,
    }),
    defineField({
      name: 'body',
      type: 'array',
      title: 'Body',
      of: [
        {
          type: 'block',
          styles: [
            { title: 'Normal', value: 'normal' },
            { title: 'H2', value: 'h2' },
            { title: 'H3', value: 'h3' },
            { title: 'H4', value: 'h4' },
            { title: 'Quote', value: 'blockquote' },
          ],
          marks: {
            decorators: [
              { title: 'Bold', value: 'strong' },
              { title: 'Italic', value: 'em' },
              { title: 'Code', value: 'code' },
            ],
            annotations: [
              {
                name: 'link',
                type: 'object',
                title: 'Link',
                fields: [
                  {
                    name: 'href',
                    type: 'url',
                    title: 'URL',
                    validation: (Rule) =>
                      Rule.uri({ allowRelative: true }),
                  },
                ],
              },
            ],
          },
        },
      ],
    }),
    defineField({
      name: 'tags',
      type: 'array',
      title: 'Tags',
      of: [{ type: 'string' }],
      options: {
        layout: 'tags',
      },
    }),
    defineField({
      name: 'publishDate',
      type: 'datetime',
      title: 'Publish Date',
      initialValue: () => new Date().toISOString(),
    }),
    // SEO fields — Blog is the exception that includes SEO in Sanity
    defineField({
      name: 'metaTitle',
      type: 'string',
      title: 'Meta Title',
      group: 'seo',
    }),
    defineField({
      name: 'metaDescription',
      type: 'text',
      title: 'Meta Description',
      rows: 3,
      group: 'seo',
    }),
    defineField({
      name: 'ogImage',
      type: 'url',
      title: 'OG Image URL',
      description: 'URL to image for social sharing',
      group: 'seo',
    }),
    defineField({
      name: 'canonicalUrl',
      type: 'url',
      title: 'Canonical URL',
      group: 'seo',
    }),
    defineField({
      name: 'focusKeyword',
      type: 'string',
      title: 'Focus Keyword',
      group: 'seo',
    }),
  ],
  groups: [
    { name: 'seo', title: 'SEO Settings' },
  ],
  orderings: [
    {
      title: 'Publish Date (Newest)',
      name: 'publishDateDesc',
      by: [{ field: 'publishDate', direction: 'desc' }],
    },
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'publishDate',
    },
  },
})
