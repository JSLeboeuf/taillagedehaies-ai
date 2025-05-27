// app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'IA Réceptionniste #1 au Québec - Ne Manquez Plus Jamais un Appel',
  description: 'Arrêtez de perdre des milliers de dollars en appels manqués. Notre IA répond 24/7 en français québécois. ROI garanti en 3-4 semaines.',
  keywords: 'IA réceptionniste, taillage de haies, appels manqués, Québec, intelligence artificielle, service client',
  authors: [{ name: 'Jean-Samuel Leboeuf' }],
  creator: 'Jean-Samuel Leboeuf',
  publisher: 'IA Réceptionniste',
  
  // Open Graph
  openGraph: {
    type: 'website',
    locale: 'fr_CA',
    url: 'https://taillagedehaies.ai',
    siteName: 'IA Réceptionniste',
    title: 'Arrêtez de Perdre 2,400$/Semaine en Appels Manqués',
    description: 'IA qui répond 24/7 en français québécois. Installation en 30 jours. ROI garanti.',
    images: [
      {
        url: 'https://taillagedehaies.ai/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'IA Réceptionniste pour Entreprises de Taillage',
      }
    ],
  },
  
  // Twitter
  twitter: {
    card: 'summary_large_image',
    title: 'IA Réceptionniste #1 au Québec',
    description: 'Ne manquez plus jamais un appel. IA 24/7 en français québécois.',
    images: ['https://taillagedehaies.ai/twitter-image.jpg'],
    creator: '@jeansamuel',
  },
  
  // Autres métadonnées
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  
  manifest: '/manifest.json',
  
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  
  verification: {
    google: 'verification_token_here',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr-CA">
      <head>
        {/* Google Analytics */}
        <script
          async
          src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');
            `,
          }}
        />
        
        {/* Facebook Pixel */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '${process.env.NEXT_PUBLIC_FB_PIXEL_ID}');
              fbq('track', 'PageView');
            `,
          }}
        />
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: 'none' }}
            src={`https://www.facebook.com/tr?id=${process.env.NEXT_PUBLIC_FB_PIXEL_ID}&ev=PageView&noscript=1`}
          />
        </noscript>
        
        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'LocalBusiness',
              name: 'IA Réceptionniste',
              description: 'Service d\'intelligence artificielle pour ne plus jamais manquer un appel client',
              url: 'https://taillagedehaies.ai',
              telephone: '+14382294244',
              address: {
                '@type': 'PostalAddress',
                addressRegion: 'QC',
                addressCountry: 'CA'
              },
              priceRange: '$$$',
              founder: {
                '@type': 'Person',
                name: 'Jean-Samuel Leboeuf'
              },
              areaServed: {
                '@type': 'Country',
                name: 'Canada'
              },
              serviceType: 'AI Receptionist Service'
            })
          }}
        />
      </head>
      
      <body className={inter.className}>
        {children}
        
        {/* Chat Widget ou autres scripts globaux */}
      </body>
    </html>
  );
}