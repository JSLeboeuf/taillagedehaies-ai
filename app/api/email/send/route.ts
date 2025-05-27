// app/api/email/send/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// Templates d'emails
const emailTemplates = {
  welcome: {
    subject: "{{name}}, bienvenue dans le Club des 5! 🎉",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0;">🎉 Félicitations {{name}}!</h1>
        </div>
        
        <div style="background: #f7f7f7; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #333;">Tu fais maintenant partie de l'élite!</h2>
          
          <p>Bienvenue dans le Club des 5 - les premiers entrepreneurs au Québec à utiliser l'IA pour ne plus JAMAIS manquer un appel.</p>
          
          <div style="background: white; padding: 20px; border-radius: 10px; margin: 20px 0;">
            <h3 style="color: #667eea;">💰 Ton investissement intelligent:</h3>
            <p style="font-size: 24px; font-weight: bold; color: #333; margin: 10px 0;">{{amount}}$ CAD</p>
            <p style="color: #666;">ROI prévu: 3-4 semaines</p>
          </div>
          
          <h3>🚀 Prochaines étapes:</h3>
          <ol style="color: #666;">
            <li><strong>Réserve ton appel d'onboarding</strong> (45 min avec moi)</li>
            <li><strong>Prépare tes infos</strong> (liste de prix, zones de service)</li>
            <li><strong>Joins le groupe WhatsApp VIP</strong></li>
          </ol>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="{{bookingLink}}" style="display: inline-block; background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
              Réserver mon appel d'onboarding →
            </a>
          </div>
          
          <p style="color: #666;">Si tu as des questions, réponds simplement à ce email ou texte-moi au +1 (438) 229-4244.</p>
          
          <p style="color: #666;">À très bientôt,<br>
          <strong>Jean-Samuel Leboeuf</strong><br>
          Fondateur, IA Réceptionniste</p>
        </div>
      </body>
      </html>
    `
  },
  
  followUp: {
    subject: "{{name}}, as-tu réservé ton appel? 📅",
    html: `
      <!DOCTYPE html>
      <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2>Salut {{name}}! 👋</h2>
        
        <p>J'ai vu que tu as complété ton paiement (merci!), mais tu n'as pas encore réservé ton appel d'onboarding.</p>
        
        <p><strong>C'est super important qu'on se parle rapidement</strong> pour configurer ton IA avec TES infos spécifiques.</p>
        
        <div style="background: #f0f0f0; padding: 20px; border-radius: 10px; margin: 20px 0;">
          <p style="margin: 0;"><strong>⏰ Rappel:</strong> Plus vite on configure, plus vite tu arrêtes de perdre {{weeklyLoss}}$/semaine!</p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="{{bookingLink}}" style="display: inline-block; background: #28a745; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
            Réserver maintenant (2 min) →
          </a>
        </div>
        
        <p>Jean-Samuel</p>
      </body>
      </html>
    `
  },
  
  abandoned: {
    subject: "{{name}}, tu perds {{dailyLoss}}$/jour... 😱",
    html: `
      <!DOCTYPE html>
      <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #dc3545;">{{name}}, chaque jour compte!</h2>
        
        <p>J'ai vu que tu as commencé le processus mais pas terminé...</p>
        
        <div style="background: #fff3cd; border: 2px solid #ffc107; padding: 20px; border-radius: 10px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #856404;">💸 Pendant que tu lis ce email:</h3>
          <ul style="margin: 0; padding-left: 20px;">
            <li>Tu as perdu: <strong>{{dailyLoss}}$</strong></li>
            <li>Cette semaine: <strong>{{weeklyLoss}}$</strong></li>
            <li>Ce mois-ci: <strong>{{monthlyLoss}}$</strong></li>
          </ul>
        </div>
        
        <p><strong>La bonne nouvelle?</strong> Tu peux reprendre exactement où tu étais rendu:</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="{{resumeLink}}" style="display: inline-block; background: #dc3545; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
            Reprendre où j'étais ({{stage}}) →
          </a>
        </div>
        
        <p>Si quelque chose te bloque, réponds à ce email. Je suis là pour t'aider.</p>
        
        <p>Jean-Samuel<br>
        <small>P.S. Les {{spotsLeft}} places restantes partent vite...</small></p>
      </body>
      </html>
    `
  }
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { to, subject, template, html, text, data = {} } = body;

    if (!to) {
      return NextResponse.json(
        { error: 'Email destinataire requis' },
        { status: 400 }
      );
    }

    // Préparer le contenu
    let emailSubject = subject;
    let emailHtml = html;
    let emailText = text;

    // Si un template est spécifié
    if (template && emailTemplates[template]) {
      const tpl = emailTemplates[template];
      emailSubject = emailSubject || tpl.subject;
      emailHtml = emailHtml || tpl.html;

      // Remplacer les variables
      const variables = {
        ...data,
        currentYear: new Date().getFullYear()
      };

      for (const [key, value] of Object.entries(variables)) {
        const regex = new RegExp(`{{${key}}}`, 'g');
        emailSubject = emailSubject.replace(regex, String(value));
        if (emailHtml) emailHtml = emailHtml.replace(regex, String(value));
        if (emailText) emailText = emailText.replace(regex, String(value));
      }
    }

    // Envoyer l'email avec Resend
    const { data: emailData, error } = await resend.emails.send({
      from: 'IA Réceptionniste <ai@taillagedehaies.ai>',
      to: [to],
      subject: emailSubject || 'Message de IA Réceptionniste',
      html: emailHtml,
      text: emailText || stripHtml(emailHtml || ''),
      reply_to: process.env.ADMIN_EMAIL || 'jsleboeuf3@gmail.com',
      headers: {
        'X-Entity-Ref-ID': data.leadId || 'unknown',
      },
    });

    if (error) {
      console.error('Erreur Resend:', error);
      return NextResponse.json(
        { error: 'Erreur envoi email' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      emailId: emailData?.id,
      to: to
    });

  } catch (error) {
    console.error('Erreur email:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// Fonction pour enlever le HTML
function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// GET pour vérifier le statut (si supporté par Resend)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const emailId = searchParams.get('email_id');

  if (!emailId) {
    return NextResponse.json(
      { error: 'Email ID requis' },
      { status: 400 }
    );
  }

  // Resend ne supporte pas encore la récupération du statut
  // mais on peut retourner une réponse mock
  return NextResponse.json({
    success: true,
    emailId: emailId,
    status: 'sent',
    message: 'Email envoyé avec succès'
  });
}