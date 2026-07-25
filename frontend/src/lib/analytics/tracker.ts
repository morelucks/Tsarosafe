import { config } from './config'

class EventTracker {
  private sessionId: string

  constructor() {
    this.sessionId = this.generateSessionId()
  }

  private generateSessionId(): string {
    return `ses_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  track(eventName: string, properties?: Record<string, any>): void {
    if (!config.enabled) return
    const event = { ...properties, timestamp: Date.now(), sessionId: this.sessionId }
    this.sendEvent(eventName, event)
  }

  private sendEvent(eventName: string, event: any): void {
    if (typeof window === 'undefined') return
  }
}

export const tracker = new EventTracker()
