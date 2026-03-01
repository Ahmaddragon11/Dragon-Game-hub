import type {Metadata} from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { AppProvider } from '@/components/Providers';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: 'Games Hub - مركز الألعاب',
  description: 'مركز الألعاب المتطور',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="ar" dir="rtl" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="font-sans bg-slate-950 text-slate-50 min-h-screen selection:bg-violet-500/30" suppressHydrationWarning>
        <AppProvider>
          {children}
        </AppProvider>
      </body>
    </html>
  );
}
