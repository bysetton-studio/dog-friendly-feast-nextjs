import type { Metadata } from 'next';
import Script from 'next/script';
import './globals.css';

const BASE_URL = 'https://dogworldweb.vercel.app';
const GA_ID = 'G-4KQQMMPGVF';

export const metadata: Metadata = {
  title: 'Dog World | Find Dog-Friendly Restaurants Near You',
  description: 'Discover dog-friendly restaurants and cafes near you, wherever you are in the world. Community-driven and verified spots where your dog is always welcome.',
  robots: { index: true, follow: true },
  alternates: { canonical: BASE_URL },
  openGraph: {
    title: 'Dog World | Dog-Friendly Restaurant Finder',
    description: 'Discover dog-friendly restaurants and cafes near you, wherever you are in the world.',
    url: BASE_URL,
    siteName: 'Dog World',
    images: [{ url: `${BASE_URL}/dog_world_pin.png` }],
    locale: 'en',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Dog World | Dog-Friendly Restaurant Finder',
    description: 'Discover dog-friendly restaurants and cafes near you, wherever you are in the world.',
    images: [`${BASE_URL}/dog_world_pin.png`],
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Dog World',
  url: BASE_URL,
  description: 'Discover dog-friendly restaurants and cafes near you, wherever you are in the world. Community-driven and verified spots where your dog is always welcome.',
  inLanguage: 'en',
  potentialAction: {
    '@type': 'SearchAction',
    target: { '@type': 'EntryPoint', urlTemplate: `${BASE_URL}/?q={search_term_string}` },
    'query-input': 'required name=search_term_string',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href='data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🐶</text></svg>' />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Comic+Neue:ital,wght@0,400;0,700&display=swap" rel="stylesheet" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        {children}
        <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
        <Script id="gtag-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_ID}');
          `}
        </Script>
      </body>
    </html>
  );
}
