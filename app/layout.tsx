import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { CustomCursor } from '@/components/ui/CustomCursor';
import { LoadingScreen } from '@/components/ui/LoadingScreen';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
});

export const metadata: Metadata = {
  title: 'BDIE | Behavioral Drift Intelligence Engine',
  description: 'Enterprise AI defense platform for behavioral drift analysis and predictive risk visualization.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`} suppressHydrationWarning>
      <body suppressHydrationWarning className="bg-bdie-bg text-bdie-text-primary antialiased overflow-hidden h-screen w-screen flex flex-col">
        <LoadingScreen />
        <CustomCursor />
        {children}
      </body>
    </html>
  );
}
