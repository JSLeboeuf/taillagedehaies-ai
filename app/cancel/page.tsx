'use client';

import { useEffect } from 'react';
import { XCircle, Phone, MessageSquare, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function CancelPage() {
  useEffect(() => {
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

          <div className="space-y-4 mb-8">
            <Link
              href="/"
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-lg font-bold text-lg hover:scale-105 transition-transform flex items-center justify-center gap-2 inline-block"
            >
              <ArrowLeft size={20} />
              Reprendre où j'étais
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}