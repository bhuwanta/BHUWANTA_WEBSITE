import { NextRequest, NextResponse } from "next/server"
import { writeClient } from "@/lib/sanity"
import { createClient } from "@/lib/supabase/server"

// Generates a random alphanumeric key for Sanity arrays
const generateKey = () => Math.random().toString(36).substring(2, 9)

export async function POST(req: NextRequest) {
  try {
    // Basic auth check against Supabase
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await req.formData()
    const type = formData.get("type") as string // "image" or "video"
    const page = formData.get("page") as string // "gallery"
    
    if (!type || !page) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Attempt to locate the exact sanity document ID for the page
    const docQuery = `*[_type == $page][0]{_id}`
    const sanityDoc = await writeClient.fetch(docQuery, { page })
    
    if (!sanityDoc?._id) {
      return NextResponse.json({ error: `Sanity document for '${page}' not found. Please create it in /dashboard/blog first.` }, { status: 404 })
    }

    const docId = sanityDoc._id

    // IMAGE UPLOAD LOGIC
    if (type === "image") {
      const file = formData.get("file") as File
      const alt = formData.get("alt") as string || ""

      if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 })

      // Convert Next.js File to Buffer for Sanity upload
      const arrayBuffer = await file.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)

      // Upload file directly to Sanity Asset CDN
      const asset = await writeClient.assets.upload('image', buffer, {
        filename: file.name,
        contentType: file.type
      })

      // Patch the specific document array
      let fieldName = 'images' // Default for gallery
      if (page === 'home') fieldName = 'featuredProjects'
      if (page === 'projects') return NextResponse.json({error: 'Projects array logic requires specific editing'}, {status: 400})

      await writeClient
        .patch(docId)
        .setIfMissing({ [fieldName]: [] })
        .append(fieldName, [{
          _key: generateKey(),
          _type: 'image',
          asset: { _type: "reference", _ref: asset._id },
          alt: alt
        }])
        .commit()

      return NextResponse.json({ success: true, url: asset.url })
    }

    // YOUTUBE VIDEO LOGIC
    if (type === "video") {
      const url = formData.get("url") as string
      const title = formData.get("title") as string || "YouTube Video"

      if (!url) return NextResponse.json({ error: "No URL provided" }, { status: 400 })

      await writeClient
        .patch(docId)
        .setIfMissing({ youtubeVideos: [] })
        .append("youtubeVideos", [{
          _key: generateKey(),
          _type: "object",
          title: title,
          url: url
        }])
        .commit()

      return NextResponse.json({ success: true })
    }

    // PDF UPLOAD LOGIC
    if (type === "pdf") {
      const file = formData.get("file") as File
      const projectKey = formData.get("projectKey") as string
      const targetField = (formData.get("targetField") as string) || "brochure"
      
      if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 })
      if (!projectKey) return NextResponse.json({ error: "No projectKey provided" }, { status: 400 })
      if (page !== "projects") return NextResponse.json({ error: "PDF upload currently only supports projects page" }, { status: 400 })

      const arrayBuffer = await file.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)

      // Upload file to Sanity Asset CDN
      const asset = await writeClient.assets.upload('file', buffer, {
        filename: file.name,
        contentType: file.type
      })

      // Patch the specific project in the projectEntries array
      await writeClient
        .patch(docId)
        // Ensure the array exists for this project before appending
        .setIfMissing({ [`projectEntries[_key=="${projectKey}"].${targetField}`]: [] })
        .append(`projectEntries[_key=="${projectKey}"].${targetField}`, [{
          _key: generateKey(),
          _type: 'file',
          asset: { _type: "reference", _ref: asset._id }
        }])
        .commit()

      return NextResponse.json({ success: true, url: asset.url })
    }

    return NextResponse.json({ error: "Invalid type" }, { status: 400 })

  } catch (error: unknown) {
    console.error("Sanity Media Upload Error:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to process upload" }, { status: 500 })
  }
}
