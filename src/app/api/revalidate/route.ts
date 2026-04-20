import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath, revalidateTag } from 'next/cache'

export async function POST(request: NextRequest) {
  try {
    const secret = request.headers.get('x-revalidation-secret')
    
    if (secret !== process.env.REVALIDATION_SECRET) {
      return NextResponse.json({ error: 'Invalid secret' }, { status: 401 })
    }

    const body = await request.json()
    const { _type, slug } = body

    // Helper to bypass Next.js canary typings expecting 2 arguments
    const safeRevalidateTag = (tag: string) => {
      // @ts-expect-error - Next.js typings are incorrect in this canary version
      revalidateTag(tag)
    }

    // Revalidate based on Sanity document type
    switch (_type) {
      case 'home':
        safeRevalidateTag('home')
        revalidatePath('/')
        break
      case 'about':
        safeRevalidateTag('about')
        revalidatePath('/about')
        break
      case 'gallery':
        safeRevalidateTag('gallery')
        revalidatePath('/gallery')
        break
      case 'projects':
        safeRevalidateTag('projects')
        revalidatePath('/projects')
        break
      case 'blog':
        safeRevalidateTag('blog')
        revalidatePath('/blog')
        if (slug?.current) {
          revalidatePath(`/blog/${slug.current}`)
        }
        break
      case 'careers':
        safeRevalidateTag('careers')
        revalidatePath('/careers')
        break
      case 'contact':
        safeRevalidateTag('contact')
        revalidatePath('/contact')
        break
      default:
        // Revalidate all public pages
        revalidatePath('/', 'layout')
    }

    return NextResponse.json({ revalidated: true, type: _type })
  } catch (error) {
    console.error('Revalidation error:', error)
    return NextResponse.json({ error: 'Revalidation failed' }, { status: 500 })
  }
}
