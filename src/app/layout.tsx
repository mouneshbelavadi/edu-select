import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/ui/Navbar';
import { Footer } from '@/components/ui/Footer';
import { NextAuthProvider } from '@/components/providers/NextAuthProvider';
import { CompareBar } from '@/components/features/CompareBar';
import { Toaster } from 'react-hot-toast';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'EduSelect — Find Your Best Engineering College & Career Path in India',
  description:
    'Explore 450+ top engineering colleges across 28 Indian states. Discover career pathways, compare institutions, predict cutoffs, and plan your engineering future.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans antialiased min-h-screen flex flex-col bg-white text-[#0F172A]">
        <NextAuthProvider>
          <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
          <Navbar />
          <main className="flex-1 w-full">{children}</main>
          <CompareBar />
          <Footer />
        </NextAuthProvider>
      </body>
    </html>
  );
}
