const WHATSAPP_NUMBER = '919666504405'

export function WhatsAppInlineCta({ context, label = 'Chat on WhatsApp' }: { context: string; label?: string }) {
  const message = `Hi Bhuwanta, I'm interested in investor pricing for ${context}. Please share details.`
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#25D366] text-white text-sm font-semibold rounded-lg shadow-lg shadow-[#25D366]/20 hover:scale-105 transition-premium"
    >
      {label}
    </a>
  )
}
