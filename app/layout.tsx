import type { Metadata } from 'next';
import { DM_Mono, Barlow_Condensed } from 'next/font/google';
import './globals.css';
import Providers from '@/components/providers';
import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';
import CartDrawer from '@/components/cart/CartDrawer';

const dmMono = DM_Mono({
  weight: ['300', '400', '500'],
  subsets: ['latin'],
  variable: '--font-body',
});

const barlowCondensed = Barlow_Condensed({
  weight: ['400', '700', '900'],
  subsets: ['latin'],
  variable: '--font-display',
});

export const metadata: Metadata = {
  title: 'UNHRD.LAB | Premium Limited Streetwear Drop',
  description: 'Limited drops. Zero gravity streetwear. No restocks, no regrets.',
  metadataBase: new URL('https://unhrd.lab'),
  openGraph: {
    title: 'UNHRD.LAB | Zero Gravity Streetwear',
    description: 'Exclusive, high-GSM streetwear drops in India. Experience premium fabrics floating in zero gravity.',
    images: ['https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=1200&q=80'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${dmMono.variable} ${barlowCondensed.variable} h-full`}>
      <body className="bg-[#0a0a0a] text-[#F0EDE6] min-h-full flex flex-col font-mono antialiased">
        <Providers>
          <Navbar />
          <main className="flex-grow flex flex-col">
            {children}
          </main>
          <CartDrawer />
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
