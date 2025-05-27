// app/api/leads/create/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialiser Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validation basique
    if (!body.name || !body.phone) {
      return NextResponse.json(
        { error: 'Nom et téléphone requis' },
        { status: 400 }
      );
    }

    // Calculer les pertes
    const missedCalls = body.missedCalls || 4;
    const avgPrice = body.avgPrice || 600;
    const conversionRate = 0.3; // 30% réaliste
    
    const dailyLoss = Math.round((missedCalls / 5) * avgPrice * conversionRate);
    const weeklyLoss = Math.round(missedCalls * avgPrice * conversionRate);
    const monthlyLoss = Math.round(weeklyLoss * 4.33);
    const yearlyLoss = Math.round(weeklyLoss * 52);
    const fiveYearLoss = yearlyLoss * 5;

    // Créer le lead dans Supabase
    const { data: lead, error } = await supabase
      .from('leads')
      .insert({
        name: body.name,
        email: body.email || null,
        phone: body.phone,
        company: body.company || null,
        city: body.city || null,
        missed_calls: missedCalls,
        avg_price: avgPrice,
        daily_loss: dailyLoss,
        weekly_loss: weeklyLoss,
        monthly_loss: monthlyLoss,
        yearly_loss: yearlyLoss,
        five_year_loss: fiveYearLoss,
        nepq_score: body.nepqScore || 0,
        stage: body.stage || 'landing',
        source: body.source || 'direct',
        utm_source: body.utm_source || null,
        utm_medium: body.utm_medium || null,
        utm_campaign: body.utm_campaign || null,
        interactions: body.interactions || []
      })
      .select()
      .single();

    if (error) {
      console.error('Erreur Supabase:', error);
      return NextResponse.json(
        { error: 'Erreur création lead' },
        { status: 500 }
      );
    }

    // Créer un événement
    await supabase
      .from('events')
      .insert({
        lead_id: lead.id,
        event_type: 'lead_created',
        event_data: {
          source: body.source,
          weekly_loss: weeklyLoss,
          user_agent: request.headers.get('user-agent')
        }
      });

    // Envoyer SMS si grosse perte
    if (weeklyLoss > 1000) {
      try {
        await fetch('/api/sms/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: process.env.OWNER_PHONE,
            message: `🔥 NOUVEAU LEAD CHAUD!\n${body.name}\nPerd: ${weeklyLoss}$/sem\nTél: ${body.phone}`
          })
        });
      } catch (smsError) {
        console.error('Erreur SMS:', smsError);
      }
    }

    return NextResponse.json({
      success: true,
      lead: {
        id: lead.id,
        name: lead.name,
        weeklyLoss: lead.weekly_loss,
        yearlyLoss: lead.yearly_loss,
        roiWeeks: Math.ceil(5000 / weeklyLoss)
      }
    });

  } catch (error) {
    console.error('Erreur API:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// GET pour récupérer un lead
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const leadId = searchParams.get('id');
    const phone = searchParams.get('phone');

    if (!leadId && !phone) {
      return NextResponse.json(
        { error: 'ID ou téléphone requis' },
        { status: 400 }
      );
    }

    let query = supabase.from('leads').select('*');
    
    if (leadId) {
      query = query.eq('id', leadId);
    } else if (phone) {
      query = query.eq('phone', phone);
    }

    const { data: lead, error } = await query.single();

    if (error || !lead) {
      return NextResponse.json(
        { error: 'Lead non trouvé' },
        { status: 404 }
      );
    }

    return NextResponse.json({ lead });

  } catch (error) {
    console.error('Erreur GET:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}