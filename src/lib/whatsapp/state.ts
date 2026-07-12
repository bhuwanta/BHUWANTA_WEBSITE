import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

export type ConversationStep = 
  | 'INIT' 
  | 'AWAITING_AREA' 
  | 'AWAITING_PROJECT' 
  | 'AWAITING_ACTION'

export interface WhatsAppSession {
  step: ConversationStep
  phone: string
  name: string
  selectedArea?: string
  selectedProject?: string
  lastUpdated: number
}

const SESSION_TTL = 3600 // 1 hour in seconds

/**
 * Get the current session state for a user.
 * If no session exists, returns a default INIT session.
 */
export async function getSession(phone: string, defaultName: string): Promise<WhatsAppSession> {
  const session = await redis.get<WhatsAppSession>(`wa_session:${phone}`)
  
  if (!session) {
    return {
      step: 'INIT',
      phone,
      name: defaultName,
      lastUpdated: Date.now()
    }
  }
  
  return session
}

/**
 * Save the session state for a user.
 * Overwrites existing state and resets the TTL.
 */
export async function setSession(phone: string, session: WhatsAppSession): Promise<void> {
  session.lastUpdated = Date.now()
  await redis.set(`wa_session:${phone}`, session, { ex: SESSION_TTL })
}

/**
 * Clear the session state for a user (useful for restarting the flow).
 */
export async function clearSession(phone: string): Promise<void> {
  await redis.del(`wa_session:${phone}`)
}
