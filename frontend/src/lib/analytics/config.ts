export interface AnalyticsConfig {
  enabled: boolean
  provider: 'vercel' | 'plausible'
  debug: boolean
}

export const config: AnalyticsConfig = {
  enabled: process.env.NEXT_PUBLIC_ANALYTICS_ENABLED === 'true',
  provider: (process.env.NEXT_PUBLIC_ANALYTICS_PROVIDER as any) || 'vercel',
  debug: process.env.NODE_ENV === 'development',
}
