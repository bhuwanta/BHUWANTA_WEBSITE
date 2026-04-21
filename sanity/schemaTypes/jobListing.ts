import { defineType, defineField } from 'sanity'

export const jobListingSchema = defineType({
  name: 'jobListing',
  type: 'document',
  title: 'Job Listing',
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      title: 'Job Title',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'department',
      type: 'string',
      title: 'Department',
      description: 'e.g. Sales, Engineering, Design',
    }),
    defineField({
      name: 'location',
      type: 'string',
      title: 'Location',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'employmentType',
      type: 'string',
      title: 'Employment Type',
      options: {
        list: [
          { title: 'Full Time', value: 'full-time' },
          { title: 'Part Time', value: 'part-time' },
          { title: 'Contract', value: 'contract' },
          { title: 'Internship', value: 'internship' },
        ],
      },
      initialValue: 'full-time',
    }),
    defineField({
      name: 'salaryMin',
      type: 'number',
      title: 'Min Salary (₹)',
    }),
    defineField({
      name: 'salaryMax',
      type: 'number',
      title: 'Max Salary (₹)',
    }),
    defineField({
      name: 'description',
      type: 'text',
      title: 'Job Description',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'requirements',
      type: 'array',
      title: 'Requirements',
      of: [{ type: 'string' }],
    }),
    defineField({
      name: 'applyUrl',
      type: 'url',
      title: 'Apply URL',
      description: 'External link where candidates can apply',
    }),
    defineField({
      name: 'isActive',
      type: 'boolean',
      title: 'Active',
      description: 'Only active jobs are shown on the website',
      initialValue: true,
    }),
    defineField({
      name: 'postedAt',
      type: 'datetime',
      title: 'Posted Date',
      initialValue: () => new Date().toISOString(),
    }),
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'department',
      active: 'isActive',
    },
    prepare({ title, subtitle, active }) {
      return {
        title: `${active ? '🟢' : '🔴'} ${title}`,
        subtitle: subtitle || 'No department',
      }
    },
  },
  orderings: [
    {
      title: 'Posted Date (Newest)',
      name: 'postedAtDesc',
      by: [{ field: 'postedAt', direction: 'desc' }],
    },
  ],
})
