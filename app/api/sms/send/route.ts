import { NextRequest, NextResponse } from 'next/server'
import twilio from 'twilio'

// Initialize Twilio client
const accountSid = process.env.TWILIO_ACCOUNT_SID
const authToken = process.env.TWILIO_AUTH_TOKEN
const twilioPhone = process.env.TWILIO_PHONE_NUMBER

const client = accountSid && authToken ? twilio(accountSid, authToken) : null

export async function POST(request: NextRequest) {
  try {
    const { to, message } = await request.json()
    
    if (!to || !message) {
      return NextResponse.json(
        { error: 'Missing required fields: to, message' },
        { status: 400 }
      )
    }
    
    // Format phone number (add +1 if not present)
    let formattedPhone = to.replace(/\D/g, '')
    if (!formattedPhone.startsWith('1')) {
      formattedPhone = '1' + formattedPhone
    }
    formattedPhone = '+' + formattedPhone
    
    // Send SMS via Twilio
    if (client && twilioPhone) {
      try {
        const result = await client.messages.create({
          body: message,
          from: twilioPhone,
          to: formattedPhone
        })
        
        return NextResponse.json({
          success: true,
          messageId: result.sid,
          to: formattedPhone
        })
      } catch (twilioError) {
        console.error('Twilio error:', twilioError)
        // Continue even if SMS fails
      }
    }
    
    // Log SMS attempt even if Twilio is not configured
    console.log('SMS Request:', {
      to: formattedPhone,
      message: message,
      timestamp: new Date().toISOString()
    })
    
    // You can also save to database or send to webhook here
    
    return NextResponse.json({
      success: true,
      message: 'SMS processed',
      to: formattedPhone
    })
    
  } catch (error) {
    console.error('SMS API error:', error)
    return NextResponse.json(
      { error: 'Failed to send SMS' },
      { status: 500 }
    )
  }
}
