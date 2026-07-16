import { ShieldCheck, Users, Award } from 'lucide-react'

const items = [
  { icon: ShieldCheck, label: 'RERA Registered' },
  { icon: Award, label: 'HMDA/DTCP Approved' },
  { icon: Users, label: '1000+ Happy Customers' },
  { icon: ShieldCheck, label: '20+ Years' },
]

export function TrustStrip() {
  return (
    <div className="bg-white border-b border-[#e8ecf2] py-3">
      <div className="max-w-5xl mx-auto px-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
        {items.map((item, i) => (
          <span key={i} className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#5a6a82]">
            <item.icon className="w-3.5 h-3.5 text-[#c4a55a]" /> {item.label}
          </span>
        ))}
      </div>
    </div>
  )
}
