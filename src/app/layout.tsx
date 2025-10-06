import '../app/globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import { AuthProvider } from '@/contexts/AuthContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Xseize | Build Enterprise Grade Custom AI Agents',
  description: 'Get started with building custom Conversational AI Agents powered by Wow\'s No/Low Code Builder',
  openGraph: {
    type: 'website',
    title: 'Build Enterprise Grade Custom AI Agents | Wow',
    description: 'Get started with building custom Conversational AI Agents powered by Wow\'s No/Low Code Builder',
    images: [
      {
        url: '/og.png',
        width: 1200,
        height: 630,
        alt: 'Wow AI Agents',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Build Enterprise Grade Custom AI Agents | Wow',
    description: 'Get started with building custom Conversational AI Agents powered by Wow\'s No/Low Code Builder',
    images: ['/og.png'],
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          themes={['light', 'dark']}
        >
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
