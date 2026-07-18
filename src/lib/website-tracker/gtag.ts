// Single Google Ads conversion label covering all 3 lead-generating actions
// (form submit, WhatsApp click, call tap) per the client's own instruction -
// one unified "Lead" conversion rather than three separate ones.
const LEAD_CONVERSION_SEND_TO = 'AW-18267535069/8DW6COSx2c8cEN3t0YZE'

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
  }
}

/** Fires the shared lead conversion event. Safe to call even if gtag hasn't loaded yet. */
export function fireLeadConversion() {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('event', 'conversion', { send_to: LEAD_CONVERSION_SEND_TO })
  }
}
