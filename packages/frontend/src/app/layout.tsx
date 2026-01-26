import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Project Bold | UNC Student Government',
  description: 'First, Best, For All - The official policy platform for UNC Student Government',
  keywords: ['UNC', 'Student Government', 'Project Bold', 'Devin Duncan', 'Carolina'],
  authors: [{ name: 'Project Bold Team' }],
  openGraph: {
    title: 'Project Bold | UNC Student Government',
    description: 'First, Best, For All - Building a Carolina that leads in purpose and care.',
    type: 'website',
    locale: 'en_US',
    siteName: 'Project Bold',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen bg-gray-50 text-gray-900 antialiased`}>
        <Providers>
          <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
