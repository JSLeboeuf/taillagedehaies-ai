// app/api/analytics/track/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Types
interface TrackingEvent {
  event: string;
  value?: any;
  stage?: number | string;
  userData?: {
    name?: string;
    weeklyLoss?: number;
    nepqScore?: number;
  };
  sessionId?: string;
  timestamp?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: TrackingEvent = await request.json();
    
    if (!body.event) {
      return NextResponse.json(
        { error: 'Nom d\'événement requis' },
        { status: 400 }
      );
    }

    // Extraire les infos de la requête
    const userAgent = request.headers.get('user-agent') || '';
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown';
    const referer = request.headers.get('referer') || '';

    // Créer l'événement dans Supabase
    const eventData = {
      event_type: body.event,
      event_data: {
        value: body.value,
        stage: body.stage,
        userData: body.userData,
        sessionId: body.sessionId || generateSessionId(),
        timestamp: body.timestamp || new Date().toISOString(),
        // Métadonnées additionnelles
        metadata: {
          userAgent,
          ip,
          referer,
          url: referer,
          // Device info basique
          isMobile: /mobile/i.test(userAgent),
          isTablet: /tablet/i.test(userAgent),
          browser: getBrowserFromUA(userAgent)
        }
      },
      session_id: body.sessionId || generateSessionId()
    };

    // Si on a un lead associé, l'inclure
    if (body.userData?.name || body.userData?.weeklyLoss) {
      // Essayer de trouver le lead
      const { data: existingLead } = await supabase
        .from('leads')
        .select('id')
        .eq('name', body.userData.name || '')
        .single();

      if (existingLead) {
        eventData['lead_id'] = existingLead.id;
      }
    }

    const { data, error } = await supabase
      .from('events')
      .insert(eventData)
      .select()
      .single();

    if (error) {
      console.error('Erreur Supabase:', error);
      return NextResponse.json(
        { error: 'Erreur enregistrement événement' },
        { status: 500 }
      );
    }

    // Événements spéciaux qui déclenchent des actions
    await handleSpecialEvents(body, eventData);

    // Analytics côté serveur pour Facebook
    if (process.env.FB_CONVERSION_API_TOKEN) {
      await sendToFacebookConversionAPI(body, eventData);
    }

    return NextResponse.json({
      success: true,
      eventId: data.id,
      timestamp: data.created_at
    });

  } catch (error) {
    console.error('Erreur tracking:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// GET pour récupérer les analytics
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const leadId = searchParams.get('lead_id');
    const sessionId = searchParams.get('session_id');
    const eventType = searchParams.get('event_type');
    const limit = parseInt(searchParams.get('limit') || '100');

    let query = supabase
      .from('events')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (leadId) {
      query = query.eq('lead_id', leadId);
    }
    if (sessionId) {
      query = query.eq('session_id', sessionId);
    }
    if (eventType) {
      query = query.eq('event_type', eventType);
    }

    const { data: events, error } = await query;

    if (error) {
      console.error('Erreur récupération events:', error);
      return NextResponse.json(
        { error: 'Erreur récupération événements' },
        { status: 500 }
      );
    }

    // Calculer quelques métriques
    const metrics = {
      totalEvents: events.length,
      uniqueSessions: new Set(events.map(e => e.session_id)).size,
      eventTypes: events.reduce((acc, event) => {
        acc[event.event_type] = (acc[event.event_type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      lastEvent: events[0]?.created_at || null
    };

    return NextResponse.json({
      success: true,
      events,
      metrics
    });

  } catch (error) {
    console.error('Erreur GET analytics:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// Fonctions utilitaires
function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function getBrowserFromUA(userAgent: string): string {
  if (userAgent.includes('Chrome')) return 'Chrome';
  if (userAgent.includes('Firefox')) return 'Firefox';
  if (userAgent.includes('Safari')) return 'Safari';
  if (userAgent.includes('Edge')) return 'Edge';
  return 'Other';
}

async function handleSpecialEvents(event: TrackingEvent, eventData: any) {
  // Envoyer des notifications pour certains événements
  const criticalEvents = [
    'payment_completed',
    'payment_initiated', 
    'ai_qualification_completed',
    'funnel_abandoned'
  ];

  if (criticalEvents.includes(event.event)) {
    // Notification SMS au propriétaire
    try {
      const message = formatNotificationMessage(event);
      if (message) {
        await fetch('/api/sms/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: process.env.OWNER_PHONE,
            message
          })
        });
      }
    } catch (error) {
      console.error('Erreur notification:', error);
    }
  }
}

function formatNotificationMessage(event: TrackingEvent): string | null {
  switch (event.event) {
    case 'payment_completed':
      return `💰 VENTE! ${event.userData?.name || 'Client'} - ${event.value}$`;
    
    case 'payment_initiated':
      return `💳 Paiement en cours: ${event.userData?.name || 'Client'}`;
    
    case 'ai_qualification_completed':
      return `🤖 Lead qualifié: ${event.userData?.name} - Score: ${event.userData?.nepqScore}%`;
    
    case 'funnel_abandoned':
      return `⚠️ Abandon: ${event.userData?.name || 'Visiteur'} à l'étape ${event.stage}`;
    
    default:
      return null;
  }
}

async function sendToFacebookConversionAPI(event: TrackingEvent, eventData: any) {
  // Implémenter si nécessaire
  // Documentation: https://developers.facebook.com/docs/marketing-api/conversions-api
  
  const fbEvents = {
    'page_view_landing': 'PageView',
    'ai_qualification_started': 'Lead',
    'payment_initiated': 'InitiateCheckout',
    'payment_completed': 'Purchase'
  };

  if (fbEvents[event.event]) {
    // Envoyer à Facebook
    console.log('FB Event:', fbEvents[event.event], event.value);
  }
}