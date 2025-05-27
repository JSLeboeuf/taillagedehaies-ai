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

          <div className="space-y-4">
            
              href="https://calendly.com/autoscaleai/decouverte"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-lg font-bold text-lg hover:scale-105 transition-transform flex items-center justify-center gap-2 inline-block"
            >
              <Calendar size={20} />
              Réserver mon appel maintenant
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}