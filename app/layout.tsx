import type {Metadata} from 'next';
import { Inter, Space_Grotesk, JetBrains_Mono } from 'next/font/google';
import './globals.css'; // Global styles

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'PIC Akademi | Gömülü Sistemler ve PIC Programlama',
  description: 'PIC 16F84 ve PIC 16F877A mikrodenetleyicileri için interaktif animasyonlar, kod simülatörü, gelişmiş görsel şemalar ve ders notları platformu.',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="tr" className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable}`}>
      <body className="antialiased bg-[#0F1113] text-[#E5E7EB] font-sans" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
