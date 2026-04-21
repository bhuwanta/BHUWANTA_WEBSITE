/**
 * Seed Script — Populate Sanity CMS with existing Bhuwanta website content
 * 
 * Run: node scripts/seed-sanity.mjs
 */

import { createClient } from '@sanity/client'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
})

async function seed() {
  console.log('🌱 Seeding Sanity CMS with existing website content...\n')

  // ===== SITE SETTINGS =====
  console.log('⚙️  Creating Site Settings...')
  await client.createOrReplace({
    _id: 'siteSettings',
    _type: 'siteSettings',
    siteName: 'BHUWANTA',
    tagline: 'Land Today. Landmark Tomorrow.',
    ctaButtonText: 'Book Site Visit',
    ctaButtonLink: '/contact',
    navLinks: [
      { _key: 'nav1', label: 'Home', href: '/' },
      { _key: 'nav2', label: 'About', href: '/about' },
      { _key: 'nav3', label: 'Projects', href: '/projects' },
      { _key: 'nav4', label: 'Gallery', href: '/gallery' },
      { _key: 'nav5', label: 'Blog', href: '/blog' },
      { _key: 'nav6', label: 'Careers', href: '/careers' },
    ],
    footerAddress: 'Floor #4, Flat No. #406, Alluri Trade Center, Near KPHB Metro (Pillar #761), Hyderabad, Telangana - 500072',
    footerAddressLabel: 'Headquarters',
    googleMapsUrl: 'https://maps.app.goo.gl/USjC2iYeGiXbZ5U16',
    footerPhone: '+91 XXXXX XXXXX',
    footerEmail: 'info@bhuwanta.com',
    copyrightText: 'Bhuwanta. All rights reserved.',
    metaTitleTemplate: '%s | Bhuwanta',
    defaultMetaDescription: 'Bhuwanta — Premium real estate developer in Hyderabad. Discover luxury residential projects, plots, and investment opportunities. Land Today. Landmark Tomorrow.',
    socialLinks: {
      linkedin: '',
      facebook: '',
      instagram: '',
      youtube: '',
    },
  })
  console.log('   ✅ Site Settings created\n')

  // ===== HOME PAGE =====
  console.log('🏠 Creating Home Page...')
  await client.createOrReplace({
    _id: 'home',
    _type: 'home',
    heroHeading: 'Redefining Luxury Living',
    heroSubheading: 'Discover exceptional properties crafted with precision, designed for those who demand the extraordinary in every detail of their home.',
    heroCta: 'Explore Projects',
    featuredSectionHeading: 'Featured Projects',
    aboutTeaser: 'With decades of experience in premium real estate, Bhuwanta delivers unparalleled quality and design that transforms spaces into extraordinary living experiences.',
    ctaBannerHeading: 'Ready to Find Your Dream Property?',
    ctaBannerSubtext: 'Our expert team is here to guide you through every step of your journey.',
  })
  console.log('   ✅ Home Page created\n')

  // ===== ABOUT PAGE =====
  console.log('👥 Creating About Page...')
  await client.createOrReplace({
    _id: 'about',
    _type: 'about',
    companyStory: [
      {
        _type: 'block',
        _key: 'story1',
        style: 'normal',
        children: [
          {
            _type: 'span',
            _key: 'span1',
            text: 'Bhuwanta was founded with a vision to transform the real estate landscape in Hyderabad. With over 15 years of experience, we have established ourselves as one of the most trusted names in premium real estate development. Our commitment to quality, transparency, and innovation has earned us the trust of over 5,000 happy families.',
          },
        ],
        markDefs: [],
      },
    ],
    missionStatement: [
      {
        _type: 'block',
        _key: 'mission1',
        style: 'normal',
        children: [
          {
            _type: 'span',
            _key: 'mspan1',
            text: 'To deliver exceptional real estate experiences through innovative design, sustainable development, and unwavering commitment to customer satisfaction. We believe in building not just structures, but communities and legacies that stand the test of time.',
          },
        ],
        markDefs: [],
      },
    ],
  })
  console.log('   ✅ About Page created\n')

  // ===== PROJECTS PAGE =====
  console.log('🏗️  Creating Projects Page...')
  await client.createOrReplace({
    _id: 'projects',
    _type: 'projects',
    sectionHeading: 'Our Projects',
  })
  console.log('   ✅ Projects Page created\n')

  // ===== GALLERY PAGE =====
  console.log('📸 Creating Gallery Page...')
  await client.createOrReplace({
    _id: 'gallery',
    _type: 'gallery',
    pageHeading: 'Our Gallery',
  })
  console.log('   ✅ Gallery Page created\n')

  // ===== CAREERS PAGE =====
  console.log('💼 Creating Careers Page...')
  await client.createOrReplace({
    _id: 'careers',
    _type: 'careers',
    introText: 'Join our team of passionate professionals and help us build the future of real estate. We offer competitive compensation, growth opportunities, and a culture that values innovation.',
  })
  console.log('   ✅ Careers Page created\n')

  // ===== CONTACT PAGE =====
  console.log('📞 Creating Contact Page...')
  await client.createOrReplace({
    _id: 'contact',
    _type: 'contact',
    pageHeading: 'Get In Touch',
    thankYouMessage: 'Thank you for reaching out! Our team will get back to you within 24 hours.',
  })
  console.log('   ✅ Contact Page created\n')

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('🎉 All content seeded successfully!')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('\nOpen the Content Manager in your dashboard to see all the content.')
  console.log('You can now edit everything from Sanity!\n')
}

seed().catch((err) => {
  console.error('❌ Seeding failed:', err.message)
  process.exit(1)
})
