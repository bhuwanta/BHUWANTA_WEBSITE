import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Production-optimized: sample 20% of traces to reduce bundle overhead
  tracesSampleRate: 0.2,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,

  replaysOnErrorSampleRate: 0.5,

  // Sample 5% of sessions for replay in production
  replaysSessionSampleRate: 0.05,

  // You can remove this option if you're not planning to use the Sentry Session Replay feature:
  integrations: [
    Sentry.replayIntegration({
      // Additional Replay configuration goes here, for example:
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
});
