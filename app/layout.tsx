import type { Metadata } from 'next';
import Script from 'next/script';
import './globals.css';

const BASE_URL = 'https://dogfriendlyfeast.vercel.app';
const GA_ID = 'G-4KQQMMPGVF';

export const metadata: Metadata = {
  title: 'Dog Friendly Feast | Find Dog-Friendly Restaurants in South Africa',
  description: 'Discover restaurants across South Africa where you can bring your dog. Find verified dog-friendly spots in Cape Town, Johannesburg, Durban and more.',
  robots: { index: true, follow: true },
  alternates: { canonical: BASE_URL },
  openGraph: {
    title: "Dog Friendly Feast | SA's Dog-Friendly Restaurant Finder",
    description: 'Discover restaurants across South Africa where you can bring your dog. Find verified dog-friendly spots in Cape Town, Johannesburg, Durban and more.',
    url: BASE_URL,
    siteName: 'Dog Friendly Feast',
    images: [{ url: `${BASE_URL}/hero.png` }],
    locale: 'en_ZA',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Dog Friendly Feast | SA's Dog-Friendly Restaurant Finder",
    description: 'Discover restaurants across South Africa where you can bring your dog.',
    images: [`${BASE_URL}/hero.png`],
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Dog Friendly Feast',
  url: BASE_URL,
  description: 'Discover restaurants across South Africa where you can bring your dog. Find verified dog-friendly spots in Cape Town, Johannesburg, Durban and more.',
  inLanguage: 'en-ZA',
  areaServed: { '@type': 'Country', name: 'South Africa' },
  potentialAction: {
    '@type': 'SearchAction',
    target: { '@type': 'EntryPoint', urlTemplate: `${BASE_URL}/?q={search_term_string}` },
    'query-input': 'required name=search_term_string',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-ZA">
      <head>
        <link rel="icon" href='data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🐶</text></svg>' />
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
