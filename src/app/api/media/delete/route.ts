import { NextRequest, NextResponse } from "next/server"
import { writeClient } from "@/lib/sanity"
import { createClient } from "@/lib/supabase/server"

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { type, page, projectKey, brochureKey, targetField = "brochure" } = await req.json()
    
    if (type === "pdf" && page === "projects" && projectKey && brochureKey) {
      const docQuery = `*[_type == $page][0]{_id}`
      const sanityDoc = await writeClient.fetch(docQuery, { page })
      
      if (!sanityDoc?._id) {
        return NextResponse.json({ error: `Sanity document not found.` }, { status: 404 })
      }

      // Unset the specific pdf from the project's array
      await writeClient
        .patch(sanityDoc._id)
        .unset([`projectEntries[_key=="${projectKey}"].${targetField}[_key=="${brochureKey}"]`])
        .commit()

      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: "Invalid request parameters" }, { status: 400 })
  } catch (error: unknown) {
    console.error("Delete Media Error:", error)
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 })
  }
}
