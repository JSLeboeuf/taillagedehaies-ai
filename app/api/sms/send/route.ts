// app/api/sms/send/route.ts
import { NextRequest, NextResponse } from 'next/server';
import twilio from 'twilio';

// Initialiser Twilio
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

const client = twilio(accountSid, authToken);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { to, message, mediaUrl } = body;

    if (!to || !message) {
      return NextResponse.json(
        { error: 'Numéro et message requis' },
        { status: 400 }
      );
    }

    // Formatter le numéro (ajouter +1 si nécessaire)
    let formattedTo = to.replace(/\D/g, ''); // Enlever tout sauf les chiffres
    if (!formattedTo.startsWith('1') && formattedTo.length === 10) {
      formattedTo = '1' + formattedTo;
    }
    if (!formattedTo.startsWith('+')) {
      formattedTo = '+' + formattedTo;
    }

    // Options du message
    const messageOptions: any = {
      body: message,
      from: twilioPhone,
      to: formattedTo
    };

    // Ajouter média si fourni (MMS)
    if (mediaUrl) {
      messageOptions.mediaUrl = [mediaUrl];
    }

    // Envoyer le SMS
    const twilioMessage = await client.messages.create(messageOptions);

    // Log pour debug
    console.log(`SMS envoyé: ${twilioMessage.sid} à ${formattedTo}`);

    return NextResponse.json({
      success: true,
      messageId: twilioMessage.sid,
      to: twilioMessage.to,
      status: twilioMessage.status,
      price: twilioMessage.price,
      priceUnit: twilioMessage.priceUnit
    });

  } catch (error: any) {
    console.error('Erreur Twilio:', error);
    
    // Gestion des erreurs Twilio spécifiques
    if (error.code) {
      switch (error.code) {
        case 21211: // Numéro invalide
          return NextResponse.json(
            { error: 'Numéro de téléphone invalide' },
            { status: 400 }
          );
        case 21608: // Numéro non vérifié (mode trial)
          return NextResponse.json(
            { error: 'Numéro non vérifié dans Twilio' },
            { status: 400 }
          );
        case 21610: // Blacklisté
          return NextResponse.json(
            { error: 'Ce numéro a demandé à ne plus recevoir de SMS' },
            { status: 400 }
          );
        default:
          return NextResponse.json(
            { error: `Erreur Twilio: ${error.message}` },
            { status: 400 }
          );
      }
    }

    return NextResponse.json(
      { error: 'Erreur envoi SMS' },
      { status: 500 }
    );
  }
}

// Endpoint pour vérifier le statut d'un message
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const messageId = searchParams.get('message_id');

    if (!messageId) {
      return NextResponse.json(
        { error: 'Message ID requis' },
        { status: 400 }
      );
    }

    const message = await client.messages(messageId).fetch();

    return NextResponse.json({
      success: true,
      message: {
        sid: message.sid,
        status: message.status,
        to: message.to,
        from: message.from,
        body: message.body,
        dateSent: message.dateSent,
        price: message.price,
        errorCode: message.errorCode,
        errorMessage: message.errorMessage
      }
    });

  } catch (error) {
    console.error('Erreur GET message:', error);
    return NextResponse.json(
      { error: 'Message non trouvé' },
      { status: 404 }
    );
  }
}