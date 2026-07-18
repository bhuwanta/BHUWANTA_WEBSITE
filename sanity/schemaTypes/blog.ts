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
      name: 'mainImage',
      type: 'image',
      title: 'Main Image',
      options: {
        hotspot: true,
      },
      fields: [
        {
          name: 'alt',
          type: 'string',
          title: 'Alternative text',
          description: 'Important for SEO and accessibility.',
        },
      ],
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
          lists: [
            { title: 'Bullet', value: 'bullet' },
            { title: 'Numbered', value: 'number' },
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
        {
          type: 'object',
          name: 'blogTable',
          title: 'Table',
          fields: [
            {
              name: 'headers',
              type: 'array',
              title: 'Table Headers',
              of: [{ type: 'string' }],
            },
            {
              name: 'rows',
              type: 'array',
              title: 'Table Rows',
              of: [
                {
                  type: 'object',
                  fields: [
                    {
                      name: 'cells',
                      type: 'array',
                      of: [{ type: 'string' }],
                    },
                  ],
                },
              ],
            },
          ],
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
    // SEO fields - Blog is the exception that includes SEO in Sanity
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
      type: 'image',
      title: 'OG Image',
      description: 'Upload an image for social sharing',
      options: {
        hotspot: true,
      },
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
    defineField({
      name: 'secondaryKeywords',
      type: 'array',
      title: 'Secondary Keywords',
      of: [{ type: 'string' }],
      group: 'seo',
    }),
    defineField({
      name: 'faqs',
      type: 'array',
      title: 'FAQs',
      description: 'Frequently Asked Questions for SEO',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'question',
              type: 'string',
              title: 'Question',
              validation: (Rule) => Rule.required(),
            },
            {
              name: 'answer',
              type: 'text',
              title: 'Answer',
              validation: (Rule) => Rule.required(),
            },
          ],
        },
      ],
      group: 'seo',
    }),
    defineField({
      name: 'whatsappContext',
      type: 'string',
      title: 'WhatsApp Context',
      description: 'The pre-filled text for the WhatsApp button CTA',
    }),
    defineField({
      name: 'disclaimer',
      type: 'text',
      title: 'Disclaimer',
      description: 'Legal disclaimer at the bottom of the article',
      rows: 3,
    }),
    defineField({
      name: 'relatedLinks',
      type: 'array',
      title: 'Related Links',
      description: 'Links to related articles or pages',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'label',
              type: 'string',
              title: 'Label',
              validation: (Rule) => Rule.required(),
            },
            {
              name: 'href',
              type: 'string',
              title: 'URL',
              validation: (Rule) => Rule.required(),
            },
          ],
        },
      ],
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
