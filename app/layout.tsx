import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Script from 'next/script'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
 title: 'Sophie IA - Ne Perds Plus JAMAIS d\'Appels | Par Jean-Samuel Leboeuf',
 description: 'Récupère jusqu\'à 5,000$/semaine en appels manqués. Sophie répond en 0.3 secondes, 24/7, en québécois. Installation en 4 semaines. ROI garanti par Jean-Samuel.',
 keywords: 'sophie ia, réceptionniste ia, appels manqués, taillage de haies, jean-samuel leboeuf, intelligence artificielle québec',
 openGraph: {
   title: 'Ta Business = Un Seau Troué? Sophie IA Récupère Tes Appels Manqués',
   description: '78% des clients vont avec le premier qui répond. Sophie répond en 0.3 secondes, 24/7. Par Jean-Samuel Leboeuf.',
   images: ['/og-image.jpg'],
   locale: 'fr_CA',
   type: 'website',
 },
 twitter: {
   card: 'summary_large_image',
   title: 'Sophie IA - Réceptionniste 24/7 pour Tailleurs de Haies',
   description: 'Ne perds plus jamais un appel. Sophie close tout, tout le temps.',
   images: ['/og-image.jpg'],
 },
 robots: {
   index: true,
   follow: true,
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
       {process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID && (
         <>
           <Script
             src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID}`}
             strategy="afterInteractive"
           />
           <Script id="google-analytics" strategy="afterInteractive">
             {`
               window.dataLayer = window.dataLayer || [];
               function gtag(){dataLayer.push(arguments);}
               gtag('js', new Date());
               gtag('config', '${process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID}');
             `}
           </Script>
         </>
       )}
       
       {/* Facebook Pixel */}
       {process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID && (
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
             fbq('init', '${process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID}');
             fbq('track', 'PageView');
           `}
         </Script>
       )}
       
       {/* Structured Data */}
       <Script
         id="structured-data"
         type="application/ld+json"
         dangerouslySetInnerHTML={{
           __html: JSON.stringify({
             "@context": "https://schema.org",
             "@type": "SoftwareApplication",
             "name": "Sophie IA",
             "applicationCategory": "BusinessApplication",
             "offers": {
               "@type": "Offer",
               "price": "5000",
               "priceCurrency": "CAD",
               "priceValidUntil": new Date(Date.now() + 86400000).toISOString()
             },
             "creator": {
               "@type": "Person",
               "name": "Jean-Samuel Leboeuf",
               "jobTitle": "Entrepreneur & Développeur IA"
             },
             "aggregateRating": {
               "@type": "AggregateRating",
               "ratingValue": "5.0",
               "reviewCount": "47"
             }
           })
         }}
       />
     </head>
     <body className={inter.className}>
       {children}
       
       {/* Facebook Pixel noscript */}
       {process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID && (
         <noscript>
           <img
             height="1"
             width="1"
             style={{ display: 'none' }}
             src={`https://www.facebook.com/tr?id=${process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID}&ev=PageView&noscript=1`}
           />
         </noscript>
       )}
     </body>
   </html>
 )
}
