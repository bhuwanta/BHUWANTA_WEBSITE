import { createClient } from '@sanity/client'
import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
})

async function uploadFile(filePath: string, type: 'image' | 'file') {
  console.log(`Uploading ${filePath}...`)
  const absolutePath = path.resolve(process.cwd(), filePath)
  if (!fs.existsSync(absolutePath)) {
    console.error(`File not found: ${absolutePath}`)
    return null
  }
  
  const buffer = fs.readFileSync(absolutePath)
  const filename = path.basename(absolutePath)
  
  try {
    const asset = await client.assets.upload(type, buffer, {
      filename: filename
    })
    console.log(`Uploaded ${filename} successfully. Asset ID: ${asset._id}`)
    return asset
  } catch (error) {
    console.error(`Failed to upload ${filename}:`, error)
    return null
  }
}

async function run() {
  console.log('Starting upload process...')

  // 1. Upload Assets
  const shabadThumb = await uploadFile('public/project_details/Shabad/shabad_thumbnail.jpg', 'image')
  const shabadBrochure = await uploadFile('public/Brochures/Shabad.pdf', 'file')
  
  const sangareddyThumb = await uploadFile('public/project_details/Sangareddy township vencher/sanagareddy_thumbnail.png', 'image')
  const sangareddyBrochure = await uploadFile('public/Brochures/Sangareddy.pdf', 'file')
  const sangareddyVideo = await uploadFile('public/project_details/Sangareddy township vencher/sangareddy_video-1.mp4', 'file')

  // Fetch the existing 'projects' document to update its projectEntries
  const projectsDoc = await client.fetch('*[_type == "projects"][0]')
  
  let projectEntries = projectsDoc?.projectEntries || []

  // Create or Update Shabad
  const shabadIndex = projectEntries.findIndex((p: any) => p.name === 'Shabad')
  const shabadEntry = {
    _key: shabadIndex >= 0 ? projectEntries[shabadIndex]._key : `proj-${Date.now()}-1`,
    name: 'Shabad',
    slug: { _type: 'slug', current: 'shabad' },
    location: 'Shabad, Hyderabad',
    description: 'Premium open plots in Shabad, perfectly suited for long-term investment.',
    statusText: 'registrations-open',
    ...(shabadThumb && { image: { _type: 'image', asset: { _type: 'reference', _ref: shabadThumb._id } } }),
    ...(shabadBrochure && { brochureFile: { _type: 'file', asset: { _type: 'reference', _ref: shabadBrochure._id } } }),
  }
  
  if (shabadIndex >= 0) {
    projectEntries[shabadIndex] = { ...projectEntries[shabadIndex], ...shabadEntry }
  } else {
    projectEntries.push(shabadEntry)
  }

  // Create or Update Sangareddy
  const sangaIndex = projectEntries.findIndex((p: any) => p.name === 'Sangareddy township vencher')
  const sangaEntry = {
    _key: sangaIndex >= 0 ? projectEntries[sangaIndex]._key : `proj-${Date.now()}-2`,
    name: 'Sangareddy township vencher',
    slug: { _type: 'slug', current: 'sangareddy-township-vencher' },
    location: 'Sangareddy, Hyderabad',
    description: 'A beautifully planned township in Sangareddy offering excellent connectivity.',
    statusText: 'registrations-open',
    ...(sangareddyThumb && { image: { _type: 'image', asset: { _type: 'reference', _ref: sangareddyThumb._id } } }),
    ...(sangareddyBrochure && { brochureFile: { _type: 'file', asset: { _type: 'reference', _ref: sangareddyBrochure._id } } }),
    ...(sangareddyVideo && { videoFile: { _type: 'file', asset: { _type: 'reference', _ref: sangareddyVideo._id } } }),
  }

  if (sangaIndex >= 0) {
    projectEntries[sangaIndex] = { ...projectEntries[sangaIndex], ...sangaEntry }
  } else {
    projectEntries.push(sangaEntry)
  }

  if (projectsDoc) {
    console.log('Updating existing projects document...')
    await client
      .patch(projectsDoc._id)
      .set({ projectEntries })
      .commit()
  } else {
    console.log('Creating new projects document...')
    await client.create({
      _type: 'projects',
      pageHeading: 'Our Projects',
      projectEntries
    })
  }
  
  console.log('Done!')
}

run().catch(console.error)
