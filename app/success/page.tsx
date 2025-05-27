'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, Calendar, MessageSquare, Rocket } from 'lucide-react';
import Link from 'next/link';

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [sessionData, setSessionData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (sessionId) {
      // Vérifier le statut du paiement
      fetch(`/api/payments/create-checkout?session_id=${sessionId}`)
        .then(res => res.json())
        .then(data => {
          setSessionData(data);
          setLoading(false);
        })
        .catch(err => {
          console.error('Erreur:', err);
          setLoading(false);
        });
    }
  }, [sessionId]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 text-center">
          {/* Animation de succès */}
          <div className="mb-8">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
          </div>

          <h1 className="text-3xl md:text-4xl font-black mb-4">
            🎉 Paiement Confirmé!
          </h1>
          
          <p className="text-xl text-gray-600 mb-8">
            Bienvenue dans le Club des 5 Pionniers!
          </p>

          {sessionData && (
            <div className="bg-gray-50 rounded-lg p-6 mb-8">
              <p className="text-lg mb-2">
                Montant payé: <span className="font-bold">{sessionData.amount} CAD</span>
              </p>
              <p className="text-gray-600">
                Confirmation envoyée à: {sessionData.customerEmail}
              </p>
            </div>
          )}

          {/* Prochaines étapes */}
          <div className="bg-blue-50 rounded-lg p-6 mb-8 text-left">
            <h2 className="font-bold text-lg mb-4">🚀 Prochaines étapes:</h2>
            <ol className="space-y-3">
              <li className="flex items-start gap-3">
                <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0">1</span>
                <div>
                  <p className="font-semibold">Check tes emails</p>
                  <p className="text-sm text-gray-600">Instructions complètes envoyées</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0">2</span>
                <div>
                  <p className="font-semibold">Réserve ton appel d'onboarding</p>
                  <p className="text-sm text-gray-600">45 min avec Jean-Samuel</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0">3</span>
                <div>
                  <p className="font-semibold">Rejoins le groupe WhatsApp VIP</p>
                  <p className="text-sm text-gray-600">Lien dans ton email</p>
                </div>
              </li>
            </ol>
          </div>

          {/* CTAs */}
          <div className="space-y-4">
            <a
              href="https://calendly.com/autoscaleai/decouverte"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-lg font-bold text-lg hover:scale-105 transition-transform flex items-center justify-center gap-2"
            >
              <Calendar size={20} />
              Réserver mon appel maintenant
            </a>
            
            <a
              href="https://wa.me/14382294244"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-green-600 text-white py-4 rounded-lg font-bold text-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
            >
              <MessageSquare size={20} />
              WhatsApp Jean-Samuel
            </a>
          </div>

          <p className="mt-8 text-sm text-gray-600">
            Des questions? Texte-moi: +1 (438) 229-4244
          </p>
        </div>
      </div>
    </div>
  );
}

// ==============================================

// app/cancel/page.tsx
'use client';

import { useEffect } from 'react';
import { XCircle, Phone, MessageSquare, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function CancelPage() {
  useEffect(() => {
    // Track l'abandon
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'payment_cancelled', {
        event_category: 'Funnel',
        event_label: 'Payment Stage'
      });
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 text-center">
          {/* Icône d'annulation */}
          <div className="mb-8">
            <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto">
              <XCircle className="w-12 h-12 text-red-600" />
            </div>
          </div>

          <h1 className="text-3xl md:text-4xl font-black mb-4">
            Paiement Annulé
          </h1>
          
          <p className="text-xl text-gray-600 mb-8">
            Aucun montant n'a été débité de ta carte.
          </p>

          {/* Message d'urgence */}
          <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-6 mb-8">
            <p className="text-lg font-semibold mb-2">
              ⚠️ Attention: Tu continues à perdre de l'argent!
            </p>
            <p className="text-gray-700">
              Chaque jour sans IA = des appels manqués = des milliers de dollars perdus
            </p>
          </div>

          {/* Options */}
          <div className="space-y-4 mb-8">
            <Link
              href="/"
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-lg font-bold text-lg hover:scale-105 transition-transform flex items-center justify-center gap-2 inline-block"
            >
              <ArrowLeft size={20} />
              Reprendre où j'étais
            </Link>
            
            <a
              href="tel:+14382294244"
              className="w-full bg-green-600 text-white py-4 rounded-lg font-bold text-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
            >
              <Phone size={20} />
              Parler à Jean-Samuel
            </a>
            
            <a
              href="https://wa.me/14382294244?text=J'ai%20des%20questions%20sur%20l'IA%20réceptionniste"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-gray-200 text-gray-800 py-4 rounded-lg font-bold text-lg hover:bg-gray-300 transition-colors flex items-center justify-center gap-2"
            >
              <MessageSquare size={20} />
              Poser mes questions par texto
            </a>
          </div>

          <p className="text-sm text-gray-600">
            Quelque chose te bloque? Je suis là pour t'aider.<br />
            Jean-Samuel: +1 (438) 229-4244
          </p>
        </div>
      </div>
    </div>
  );
}