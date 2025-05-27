// app/api/stripe-webhook/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia'
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// IMPORTANT: Pour Stripe webhooks, on doit lire le body brut
export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'Pas de signature Stripe' },
        { status: 400 }
      );
    }

    // Vérifier la signature du webhook
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!
      );
    } catch (err: any) {
      console.error('Erreur vérification webhook:', err.message);
      return NextResponse.json(
        { error: `Webhook Error: ${err.message}` },
        { status: 400 }
      );
    }

    // Log l'événement
    console.log(`📨 Webhook Stripe reçu: ${event.type}`);

    // Traiter selon le type d'événement
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }
      
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log('💰 Paiement réussi:', paymentIntent.amount / 100, 'CAD');
        break;
      }
      
      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentFailed(paymentIntent);
        break;
      }
      
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdate(subscription);
        break;
      }
      
      default:
        console.log(`Type d'événement non géré: ${event.type}`);
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('Erreur webhook:', error);
    return NextResponse.json(
      { error: 'Erreur traitement webhook' },
      { status: 500 }
    );
  }
}

// Gérer la complétion du checkout
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  console.log('✅ Checkout complété:', session.id);
  
  const metadata = session.metadata || {};
  const customerEmail = session.customer_details?.email;
  const customerPhone = session.customer_details?.phone;
  const amount = session.amount_total ? session.amount_total / 100 : 0;

  // Mettre à jour le lead dans Supabase
  if (metadata.leadId && metadata.leadId !== 'new') {
    const { error } = await supabase
      .from('leads')
      .update({
        payment_completed: true,
        payment_amount: amount,
        payment_method: 'stripe',
        stripe_customer_id: session.customer as string,
        stripe_session_id: session.id,
        stage: 'payment_completed',
        email: customerEmail || undefined,
        updated_at: new Date().toISOString()
      })
      .eq('id', metadata.leadId);

    if (error) {
      console.error('Erreur mise à jour lead:', error);
    }
  } else {
    // Créer un nouveau lead si nécessaire
    const { data: newLead, error } = await supabase
      .from('leads')
      .insert({
        name: metadata.name || customerEmail?.split('@')[0] || 'Client',
        email: customerEmail,
        phone: metadata.phone || customerPhone || '',
        payment_completed: true,
        payment_amount: amount,
        payment_method: 'stripe',
        stripe_customer_id: session.customer as string,
        stripe_session_id: session.id,
        stage: 'payment_completed',
        weekly_loss: parseInt(metadata.weeklyLoss || '0'),
        yearly_loss: parseInt(metadata.yearlyLoss || '0')
      })
      .select()
      .single();

    if (error) {
      console.error('Erreur création lead:', error);
    }
  }

  // Créer un événement
  await supabase
    .from('events')
    .insert({
      lead_id: metadata.leadId || null,
      event_type: 'payment_completed',
      event_data: {
        amount,
        currency: session.currency,
        customer_email: customerEmail,
        customer_name: session.customer_details?.name,
        session_id: session.id
      }
    });

  // Envoyer email de confirmation
  try {
    await sendWelcomeEmail(customerEmail!, metadata.name || 'Client', amount);
  } catch (error) {
    console.error('Erreur envoi email:', error);
  }

  // Notification SMS au propriétaire
  try {
    await fetch('/api/sms/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: process.env.OWNER_PHONE,
        message: `💰 NOUVELLE VENTE!\n${metadata.name || customerEmail}\nMontant: ${amount}$\nTél: ${metadata.phone || customerPhone || 'Non fourni'}`
      })
    });
  } catch (error) {
    console.error('Erreur SMS notification:', error);
  }
}

// Gérer les échecs de paiement
async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  console.log('❌ Paiement échoué:', paymentIntent.id);
  
  // Créer un événement
  await supabase
    .from('events')
    .insert({
      event_type: 'payment_failed',
      event_data: {
        payment_intent_id: paymentIntent.id,
        amount: paymentIntent.amount / 100,
        error: paymentIntent.last_payment_error?.message
      }
    });
}

// Gérer les abonnements
async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  console.log('🔄 Abonnement mis à jour:', subscription.id);
  
  // Logique pour gérer les abonnements mensuels
  const customerId = subscription.customer as string;
  const status = subscription.status;
  
  // Mettre à jour dans la DB si nécessaire
  if (status === 'active') {
    console.log('Abonnement actif pour:', customerId);
  }
}

// Envoyer email de bienvenue
async function sendWelcomeEmail(email: string, name: string, amount: number) {
  // Utiliser votre API d'email
  const response = await fetch('/api/email/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      to: email,
      subject: `${name}, bienvenue dans le Club des 5! 🎉`,
      template: 'welcome',
      data: {
        name,
        amount,
        bookingLink: process.env.NEXT_PUBLIC_CALENDLY_URL
      }
    })
  });
  
  if (!response.ok) {
    throw new Error('Erreur envoi email');
  }
}

// Configuration pour dire à Next.js de ne pas parser le body
export const runtime = 'nodejs';