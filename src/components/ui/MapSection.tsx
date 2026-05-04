import React from 'react'
import { Building2, Navigation, MapPin } from 'lucide-react'

interface Feature {
  icon: string
  title: string
  distance: string
}

interface MapSectionProps {
  features: Feature[]
  location: string
}

export const MapSection: React.FC<MapSectionProps> = ({ features, location }) => {
  if (!features || !Array.isArray(features) || features.length === 0) {
    return null
  }

  const getIcon = (name: string) => {
    switch (name.toLowerCase()) {
      case 'building': return <Building2 className="w-5 h-5" />
      case 'navigation': return <Navigation className="w-5 h-5" />
      case 'map-pin': return <MapPin className="w-5 h-5" />
      default: return <MapPin className="w-5 h-5" />
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
      {/* Map Embed Container */}
      <div className="lg:col-span-2 min-h-[400px] rounded-3xl overflow-hidden border border-[#e8ecf2] shadow-sm relative group">
        <iframe 
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15227.06915229671!2d78.4326!3d17.4116!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bcb973a2185b19d%3A0x6334f6f87f48037!2sBanjara%20Hills%2C%20Hyderabad%2C%20Telangana!5e0!3m2!1sen!2sin!4v1713600000000!5m2!1sen!2sin" 
          width="100%" 
          height="100%" 
          style={{ border: 0, filter: 'grayscale(1) contrast(1.1) opacity(0.8)' }} 
          allowFullScreen 
          loading="lazy" 
          referrerPolicy="no-referrer-when-downgrade"
          className="grayscale hover:grayscale-0 transition-all duration-700"
        ></iframe>
        <div className="absolute inset-0 pointer-events-none border-[12px] border-white/10 rounded-3xl" />
      </div>

      {/* Connectivity Info */}
      <div className="flex flex-col gap-6">
        <div className="bg-[#f8f9fb] rounded-2xl p-8 border border-[#e8ecf2] flex-grow">
          <h3 className="text-xl font-bold text-[#002935] mb-4">Strategic Proximity</h3>
          <p className="text-sm text-[#5a6a82] leading-relaxed mb-8">
            {location}
          </p>
          
          <div className="space-y-4">
            {features.map((feature, i) => (
              <div key={i} className="flex items-center gap-4 p-4 bg-white rounded-xl border border-[#e8ecf2] shadow-sm">
                <div className="w-10 h-10 rounded-lg bg-[#7D651F]/10 flex items-center justify-center text-[#7D651F]">
                  {getIcon(feature.icon)}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#002935]">{feature.title}</h4>
                  <p className="text-xs text-[#5a6a82] font-medium">{feature.distance}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-[#7D651F] rounded-2xl p-6 text-white text-center">
          <p className="text-xs font-bold uppercase tracking-widest mb-1 opacity-80">Site Visit</p>
          <p className="text-sm font-medium">Free transport available for site visits.</p>
        </div>
      </div>
    </div>
  )
}
