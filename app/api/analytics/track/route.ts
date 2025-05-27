import { NextRequest, NextResponse } from 'next/server'
import { supabase, trackingHelpers } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Log to console for development
    console.log('Analytics Event:', body)
    
    // Save to Supabase
    await trackingHelpers.trackEvent({
      event: body.event,
      value: body.value,
      stage: body.stage,
      session_id: body.sessionId,
      user_data: body.userData,
      metadata: body
    })
    
    // Update lead data if we have user information
    if (body.userData && body.userData.name && body.sessionId) {
      await trackingHelpers.upsertLead({
        name: body.userData.name,
        phone: body.userData.phone || '',
        email: body.userData.email || '',
        company: body.userData.company || '',
        missed_calls: body.userData.missedCalls || 0,
        avg_price: body.userData.avgPrice || 0,
        weekly_loss: body.userData.weeklyLoss || 0,
        yearly_loss: body.userData.yearlyLoss || 0,
        urgency: body.userData.urgency || '',
        decision_maker: body.userData.decisionMaker || false,
        nepq_score: body.userData.nepqScore || 0,
        stage: body.stage,
        session_id: body.sessionId
      })
    }
    
    // Send to webhook for external integrations (Zapier/Make)
    if (process.env.ANALYTICS_WEBHOOK_URL) {
      fetch(process.env.ANALYTICS_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      }).catch(console.error)
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Analytics error:', error)
    return NextResponse.json(
      { error: 'Failed to track event' },
      { status: 500 }
    )
  }
}
