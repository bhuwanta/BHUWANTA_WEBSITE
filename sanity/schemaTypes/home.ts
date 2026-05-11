import { defineType, defineField } from 'sanity'

export const homeSchema = defineType({
  name: 'home',
  type: 'document',
  title: 'Home Page',
  groups: [
    { name: 'hero', title: 'Hero Section' },
    { name: 'trustBar', title: 'Trust Bar' },
    { name: 'whyOwnLand', title: 'Why Own Land' },
    { name: 'featuredProject', title: 'Featured Project Teaser' },
    { name: 'vastu', title: 'Vastu Section' },
    { name: 'reviews', title: 'Customer Reviews' },
    { name: 'faq', title: 'FAQ' },
    { name: 'finalCta', title: 'Final CTA' },
  ],
  fields: [
    // ===== HERO =====
    defineField({
      name: 'heroHeading',
      type: 'string',
      title: 'Hero Heading',
      group: 'hero',
      description: 'Main headline on the hero section',
    }),
    defineField({
      name: 'heroSubheading',
      type: 'text',
      title: 'Hero Subheading',
      group: 'hero',
      description: 'Supporting text below the hero headline',
    }),
    defineField({
      name: 'heroImage',
      type: 'image',
      title: 'Hero Background Image',
      group: 'hero',
      options: { hotspot: true },
    }),
    defineField({
      name: 'heroPrimaryCta',
      type: 'string',
      title: 'Primary CTA Button Label',
      group: 'hero',
      description: 'e.g. "Book Free Site Visit"',
    }),
    defineField({
      name: 'heroSecondaryCta',
      type: 'string',
      title: 'Secondary CTA Button Label',
      group: 'hero',
      description: 'e.g. "Call Now"',
    }),

    // ===== TRUST BAR =====
    defineField({
      name: 'trustBadges',
      type: 'array',
      title: 'Trust Badges',
      group: 'trustBar',
      description: 'Horizontal strip of trust indicators (4 recommended)',
      of: [
        {
          type: 'object',
          fields: [
            defineField({ name: 'label', type: 'string', title: 'Badge Label' }),
          ],
          preview: {
            select: { title: 'label' },
          },
        },
      ],
    }),

    // ===== WHY OWN LAND =====
    defineField({
      name: 'whyOwnLandHeading',
      type: 'string',
      title: 'Section Heading',
      group: 'whyOwnLand',
    }),
    defineField({
      name: 'whyOwnLandSubheading',
      type: 'text',
      title: 'Section Subheading',
      group: 'whyOwnLand',
    }),
    defineField({
      name: 'whyOwnLandCards',
      type: 'array',
      title: 'Benefit Cards',
      group: 'whyOwnLand',
      of: [
        {
          type: 'object',
          fields: [
            defineField({ name: 'icon', type: 'string', title: 'Lucide Icon Name', description: 'e.g. TrendingUp, Home, Globe, Key' }),
            defineField({ name: 'title', type: 'string', title: 'Card Title' }),
            defineField({ name: 'description', type: 'text', title: 'Card Description' }),
          ],
          preview: {
            select: { title: 'title', subtitle: 'icon' },
          },
        },
      ],
    }),

    // ===== FEATURED PROJECT TEASER =====
    defineField({
      name: 'featuredProjectName',
      type: 'string',
      title: 'Project Name',
      group: 'featuredProject',
    }),
    defineField({
      name: 'featuredProjectLocation',
      type: 'string',
      title: 'Project Location',
      group: 'featuredProject',
    }),
    defineField({
      name: 'featuredProjectDescription',
      type: 'text',
      title: 'Project Description',
      group: 'featuredProject',
    }),
    defineField({
      name: 'featuredProjectDetails',
      type: 'array',
      title: 'Project Details',
      group: 'featuredProject',
      description: 'Key-value pairs like Location, Plot Sizes, Price, etc.',
      of: [
        {
          type: 'object',
          fields: [
            defineField({ name: 'icon', type: 'string', title: 'Lucide Icon Name', description: 'e.g. MapPin, Ruler, IndianRupee, Landmark, CheckCircle' }),
            defineField({ name: 'label', type: 'string', title: 'Label' }),
            defineField({ name: 'value', type: 'string', title: 'Value' }),
          ],
          preview: {
            select: { title: 'label', subtitle: 'value' },
          },
        },
      ],
    }),
    defineField({
      name: 'featuredProjectFormHeadline',
      type: 'string',
      title: 'Registration Form Headline',
      group: 'featuredProject',
      description: 'e.g. "Be among the first to own a plot in [PROJECT NAME]."',
    }),

    // ===== VASTU SECTION =====
    defineField({
      name: 'vastuHeading',
      type: 'string',
      title: 'Section Heading',
      group: 'vastu',
    }),
    defineField({
      name: 'vastuSubheading',
      type: 'text',
      title: 'Section Subheading',
      group: 'vastu',
    }),
    defineField({
      name: 'vastuCards',
      type: 'array',
      title: 'Vastu Feature Cards',
      group: 'vastu',
      of: [
        {
          type: 'object',
          fields: [
            defineField({ name: 'icon', type: 'string', title: 'Lucide Icon Name', description: 'e.g. Compass, Home, Sun, Sprout' }),
            defineField({ name: 'title', type: 'string', title: 'Card Title' }),
            defineField({ name: 'description', type: 'text', title: 'Card Description' }),
          ],
          preview: {
            select: { title: 'title', subtitle: 'icon' },
          },
        },
      ],
    }),

    // ===== CUSTOMER REVIEWS =====
    defineField({
      name: 'reviewsHeading',
      type: 'string',
      title: 'Reviews Section Heading',
      group: 'reviews',
    }),
    defineField({
      name: 'reviewsContent',
      type: 'text',
      title: 'Reviews Section Description',
      group: 'reviews',
    }),
    defineField({
      name: 'reviews',
      type: 'array',
      title: 'Customer Reviews',
      group: 'reviews',
      of: [
        {
          type: 'object',
          fields: [
            defineField({ name: 'name', type: 'string', title: 'Customer Name' }),
            defineField({ name: 'role', type: 'string', title: 'Role / Designation' }),
            defineField({ name: 'rating', type: 'number', title: 'Rating (1-5)', validation: Rule => Rule.min(1).max(5) }),
            defineField({ name: 'content', type: 'text', title: 'Review Content' }),
          ],
          preview: {
            select: { title: 'name', subtitle: 'role' },
          },
        },
      ],
    }),

    // ===== FAQ =====
    defineField({
      name: 'faqHeading',
      type: 'string',
      title: 'FAQ Section Heading',
      group: 'faq',
    }),
    defineField({
      name: 'faqItems',
      type: 'array',
      title: 'FAQ Items',
      group: 'faq',
      of: [
        {
          type: 'object',
          fields: [
            defineField({ name: 'question', type: 'string', title: 'Question' }),
            defineField({ name: 'answer', type: 'text', title: 'Answer' }),
          ],
          preview: {
            select: { title: 'question' },
          },
        },
      ],
    }),

    // ===== FINAL CTA =====
    defineField({
      name: 'finalCtaHeading',
      type: 'string',
      title: 'CTA Heading',
      group: 'finalCta',
    }),
    defineField({
      name: 'finalCtaSubtext',
      type: 'text',
      title: 'CTA Subtext',
      group: 'finalCta',
    }),
    defineField({
      name: 'finalCtaSupportingText',
      type: 'string',
      title: 'Supporting Text (below buttons)',
      group: 'finalCta',
      description: 'e.g. "📞 [PHONE] | ✉️ info@bhuwanta.com"',
    }),
  ],
  preview: {
    prepare() {
      return { title: 'Home Page' }
    },
  },
})
