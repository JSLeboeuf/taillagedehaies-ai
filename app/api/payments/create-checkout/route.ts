// app/api/payments/create-checkout/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia'
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount, userData } = body;

    if (!amount || !userData) {
      return NextResponse.json(
        { error: 'Montant et données utilisateur requis' },
        { status: 400 }
      );
    }

    // Créer ou récupérer le client Stripe
    let customer;
    if (userData.email) {
      const customers = await stripe.customers.list({
        email: userData.email,
        limit: 1
      });

      if (customers.data.length > 0) {
        customer = customers.data[0];
      } else {
        customer = await stripe.customers.create({
          email: userData.email,
          name: userData.name,
          phone: userData.phone,
          metadata: {
            leadId: userData.leadId || 'new',
            weeklyLoss: String(userData.weeklyLoss),
            source: 'funnel_ia'
          }
        });
      }
    }

    // Créer la session de checkout
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer: customer?.id,
      line_items: [
        {
          price_data: {
            currency: 'cad',
            product_data: {
              name: 'IA Réceptionniste - Installation complète',
              description: `ROI garanti en ${userData.roiWeeks || 4} semaines. Ne manquez plus jamais un appel!`,
              images: ['https://taillagedehaies.ai/logo.png'],
            },
            unit_amount: amount * 100, // Stripe utilise les cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL}/cancel`,
      metadata: {
        leadId: userData.leadId || 'new',
        name: userData.name,
        phone: userData.phone,
        weeklyLoss: String(userData.weeklyLoss),
        yearlyLoss: String(userData.yearlyLoss)
      },
      // Collecter plus d'infos si nécessaire
      phone_number_collection: {
        enabled: !userData.phone
      },
      billing_address_collection: 'required',
      // Options de paiement
      payment_intent_data: {
        description: `IA Réceptionniste pour ${userData.name || 'client'}`,
      },
      // Permettre codes promo
      allow_promotion_codes: true,
      // Expiration après 30 minutes
      expires_at: Math.floor(Date.now() / 1000) + (30 * 60),
    });

    // Sauvegarder la session dans la DB
    if (userData.leadId) {
      try {
        await fetch(`${process.env.NEXT_PUBLIC_URL}/api/leads/update`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            leadId: userData.leadId,
            stripeSessionId: session.id,
            stage: 'payment_initiated'
          })
        });
      } catch (error) {
        console.error('Erreur mise à jour lead:', error);
      }
    }

    return NextResponse.json({
      success: true,
      url: session.url,
      sessionId: session.id
    });

  } catch (error) {
    console.error('Erreur Stripe:', error);
    return NextResponse.json(
      { 
        error: 'Erreur création paiement',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
}

// Endpoint pour vérifier le statut d'une session
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID requis' },
        { status: 400 }
      );
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['payment_intent', 'customer']
    });

    return NextResponse.json({
      success: true,
      status: session.payment_status,
      customerEmail: session.customer_details?.email,
      amount: session.amount_total ? session.amount_total / 100 : null,
      metadata: session.metadata
    });

  } catch (error) {
    console.error('Erreur GET session:', error);
    return NextResponse.json(
      { error: 'Session non trouvée' },
      { status: 404 }
    );
  }
}