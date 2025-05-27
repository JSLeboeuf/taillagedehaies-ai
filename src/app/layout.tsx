import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Script from 'next/script'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'IA Réceptionniste #1 au Québec - Arrête de Perdre 2400$/Semaine',
  description: 'Arrête de perdre des appels et de l\'argent. IA qui répond 24/7 en français québécois. ROI en 3 semaines garanti. Installation en 30 jours.',
  keywords: 'taillage haies, IA réceptionniste, appels manqués, service client automatisé, Québec',
  authors: [{ name: 'Jean-Samuel Leboeuf' }],
  creator: 'Jean-Samuel Leboeuf',
  publisher: 'IA Réceptionniste',
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
  openGraph: {
    title: 'Arrête de Perdre 2400$/Semaine en Appels Manqués',
    description: 'IA Réceptionniste pour entreprises de taillage. Répond 24/7, qualifie les clients, envoie des SMS. ROI garanti en 3 semaines.',
    url: 'https://taillagedehaies.ai',
    siteName: 'Taillage de Haies IA',
    images: [
      {
        url: 'https://taillagedehaies.ai/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'IA Réceptionniste pour Taillage de Haies',
      }
    ],
    locale: 'fr_CA',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Arrête de Perdre 2400$/Semaine en Appels Manqués',
    description: 'IA Réceptionniste pour entreprises de taillage. ROI en 3 semaines.',
    images: ['https://taillagedehaies.ai/og-image.jpg'],
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
  verification: {
    google: 'google-site-verification-code',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr-CA">
      <head>
        {/* Google Analytics */}
        <Script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-BYDHGJR1F9"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-BYDHGJR1F9');
          `}
        </Script>

        {/* Facebook Pixel */}
        <Script id="facebook-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '490629836');
            fbq('track', 'PageView');
          `}
        </Script>
        <noscript>
          <img 
            height="1" 
            width="1" 
            style={{ display: 'none' }}
            src="https://www.facebook.com/tr?id=490629836&ev=PageView&noscript=1"
            alt=""
          />
        </noscript>

        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        
        {/* Preconnect to external domains */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="preconnect" href="https://connect.facebook.net" />
      </head>
      <body className={inter.className}>
        {children}
        
        {/* Confetti Script */}
        <Script
          src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.5.1/dist/confetti.browser.min.js"
          strategy="lazyOnload"
        />
      </body>
    </html>
  )
}