import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types for our database tables
export interface Lead {
  id?: string
  created_at?: string
  name: string
  phone: string
  email: string
  company: string
  missed_calls: number
  avg_price: number
  weekly_loss: number
  yearly_loss: number
  urgency: string
  decision_maker: boolean
  nepq_score: number
  stage: string
  session_id: string
  metadata?: any
}

export interface AnalyticsEvent {
  id?: string
  created_at?: string
  event: string
  value?: number
  stage: string
  session_id: string
  user_data?: any
  metadata?: any
}

// Helper functions
export const trackingHelpers = {
  // Create or update a lead
  async upsertLead(lead: Lead) {
    try {
      const { data, error } = await supabase
        .from('leads')
        .upsert({
          ...lead,
          updated_at: new Date().toISOString()
        })
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('Error upserting lead:', error)
      return null
    }
  },

  // Track an analytics event
  async trackEvent(event: AnalyticsEvent) {
    try {
      const { data, error } = await supabase
        .from('analytics_events')
        .insert(event)
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('Error tracking event:', error)
      return null
    }
  },

  // Get lead by session ID
  async getLeadBySession(sessionId: string) {
    try {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .eq('session_id', sessionId)
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('Error getting lead:', error)
      return null
    }
  },

  // Get all events for a session
  async getSessionEvents(sessionId: string) {
    try {
      const { data, error } = await supabase
        .from('analytics_events')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true })
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('Error getting events:', error)
      return []
    }
  }
}
