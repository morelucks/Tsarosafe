/**
 * Price API health check utility
 */

import { GDOLLAR_PRICE_CONFIG } from './constants'

interface HealthStatus {
  isHealthy: boolean
  lastCheck: number
  error?: string
  responseTime?: number
}

class PriceHealthChecker {
  private healthStatus: HealthStatus = {
    isHealthy: true,
    lastCheck: 0,
  }

  /**
   * Check if price API is healthy and responsive
   */
  async checkHealth(): Promise<HealthStatus> {
    const startTime = Date.now()
    
    try {
      // Try API route first
      let response: Response
      try {
        response = await fetch('/api/price', {
          method: 'HEAD', // Just check if endpoint exists
          signal: AbortSignal.timeout(5000),
        })
      } catch {
        // Fallback to direct CoinGecko check
        response = await fetch(
          `${GDOLLAR_PRICE_CONFIG.COINGECKO_API}/ping`,
          {
            signal: AbortSignal.timeout(5000),
          }
        )
      }

      const responseTime = Date.now() - startTime
      const isHealthy = response.ok && responseTime < 3000

      this.healthStatus = {
        isHealthy,
        lastCheck: Date.now(),
        responseTime,
        error: isHealthy ? undefined : 'API response too slow or failed',
      }

      return this.healthStatus
    } catch (error) {
      const responseTime = Date.now() - startTime
      this.healthStatus = {
        isHealthy: false,
        lastCheck: Date.now(),
        responseTime,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
      return this.healthStatus
    }
  }

  getStatus(): HealthStatus {
    return this.healthStatus
  }
}

export const priceHealthChecker = new PriceHealthChecker()
export default priceHealthChecker

