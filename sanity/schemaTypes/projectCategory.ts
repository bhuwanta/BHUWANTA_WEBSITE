import { defineType, defineField } from 'sanity'

export const projectCategorySchema = defineType({
  name: 'projectCategory',
  type: 'document',
  title: 'Project Categories',
  fields: [
    defineField({ 
      name: 'title', 
      type: 'string', 
      title: 'Category Title',
      description: 'e.g., Warangal Highway, Farmlands, etc.'
    }),
    defineField({ 
      name: 'slug', 
      type: 'slug', 
      title: 'URL Slug',
      options: { source: 'title', maxLength: 96 },
      description: 'Important for filtering. Just click "Generate".'
    }),
    defineField({ 
      name: 'order', 
      type: 'number', 
      title: 'Display Order', 
      description: 'Lower numbers appear first in the filter tabs (e.g., 1, 2, 3...)' 
    }),
    defineField({
      name: 'image',
      type: 'image',
      title: 'Category Preview Image',
      options: { hotspot: true },
      description: 'Image shown on the homepage for this category.'
    })
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'order',
      media: 'image',
    },
    prepare({ title, subtitle, media }) {
      return {
        title,
        subtitle: subtitle ? `Order: ${subtitle}` : 'No order set',
        media,
      }
    }
  }
})
