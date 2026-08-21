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
  title: 'EduSelect — Find Your Best Engineering College in India',
  description:
    'Explore 580+ top engineering colleges across 28 Indian states. Compare, shortlist, predict KCET ranks, and choose the best path for your future.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans antialiased min-h-screen flex flex-col bg-slate-50/50 text-slate-900">
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
