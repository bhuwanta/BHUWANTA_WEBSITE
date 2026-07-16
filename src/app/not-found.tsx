import Link from 'next/link'
import { Home, Building2, BookOpen } from 'lucide-react'
import { NotFoundTracker } from '@/components/tracking/NotFoundTracker'

export default function NotFound() {
  return (
    <main className="min-h-[80vh] flex items-center justify-center bg-white px-4">
      <NotFoundTracker />
      <div className="max-w-lg w-full text-center">
        <p className="text-sm font-bold uppercase tracking-widest text-[#c4a55a] mb-4">404</p>
        <h1 className="text-3xl sm:text-4xl font-bold text-[#0f1d33] mb-4">Page Not Found</h1>
        <p className="text-[#5a6a82] mb-10 leading-relaxed">
          The page you&apos;re looking for doesn&apos;t exist or may have moved. Here are a few places to go instead.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 gradient-gold text-white font-semibold rounded-lg shadow-lg shadow-[#c4a55a]/20 hover:scale-105 transition-premium"
          >
            <Home className="w-4 h-4" /> Back to Home
          </Link>
          <Link
            href="/projects"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-white border border-[#c4a55a] text-[#c4a55a] font-semibold rounded-lg hover:bg-[#f7f8fa] transition-premium"
          >
            <Building2 className="w-4 h-4" /> View Projects
          </Link>
          <Link
            href="/blog"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-white border border-[#e8ecf2] text-[#1e3a5f] font-semibold rounded-lg hover:border-[#c4a55a] transition-premium"
          >
            <BookOpen className="w-4 h-4" /> Read the Blog
          </Link>
        </div>
      </div>
    </main>
  )
}
