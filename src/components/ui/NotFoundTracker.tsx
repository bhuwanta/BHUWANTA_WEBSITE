'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { usePostHog } from 'posthog-js/react'

// Fires a distinct, filterable event for 404 hits (broken ad links, old
// shares, typos) separate from the generic $pageview PostHog already
// captures on every route, so they surface cleanly in reporting.
export function NotFoundTracker() {
  const pathname = usePathname()
  const posthog = usePostHog()

  useEffect(() => {
    posthog?.capture('404_not_found', { path: pathname })
  }, [pathname, posthog])

  return null
}
