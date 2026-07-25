export interface BaseEvent {
  timestamp: number
  sessionId: string
}

export interface WalletEvent extends BaseEvent {
  action: 'connect' | 'disconnect'
  chain?: string
}
