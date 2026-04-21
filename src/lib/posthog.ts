import posthog from 'posthog-js'

export function initPostHog() {
  if (typeof window === 'undefined' || posthog.__loaded) return posthog

  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY
  if (!key) {
    if (process.env.NODE_ENV === 'development') {
      console.info('[posthog] NEXT_PUBLIC_POSTHOG_KEY not set — analytics disabled')
    }
    return posthog
  }

  posthog.init(key, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com',
    person_profiles: 'identified_only',
    capture_pageview: true,
    capture_pageleave: true,
    loaded: (ph) => {
      if (process.env.NODE_ENV === 'development') ph.debug()
    },
  })
  return posthog
}

export { posthog }
