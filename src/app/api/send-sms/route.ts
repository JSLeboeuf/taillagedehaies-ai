 import { NextResponse } from 'next/server';

  const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
  const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
  const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;
  const NOTIFICATION_PHONE = '+14382294244';

  export async function POST(request: Request) {
    try {
      const body = await request.json();
      const { businessName, contactName, phone, email, package: packageType, value } = body;

      const message = `🎉 NOUVELLE VENTE!

  Entreprise: ${businessName}
  Contact: ${contactName}
  Tél: ${phone}
  Email: ${email}
  Forfait: ${packageType}
  Valeur: ${value}$/mois

  Contactez le client dans les 24h!`;

      const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;

      const response = await fetch(twilioUrl, {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString('base64'),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          To: NOTIFICATION_PHONE,
          From: TWILIO_PHONE_NUMBER,
          Body: message,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error('Twilio error:', error);
        throw new Error('Failed to send SMS');
      }

      const result = await response.json();

      return NextResponse.json({
        success: true,
        message: 'SMS sent successfully',
        sid: result.sid
      });
    } catch (error) {
      console.error('Error sending SMS:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to send SMS' },
        { status: 500 }
      );
    }
  }