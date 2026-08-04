import { Space_Grotesk, Inter, IBM_Plex_Mono, Geist } from 'next/font/google';
import ReduxProvider from '@/redux/provider';
import { Toaster } from 'react-hot-toast';
import './globals.css';
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-display',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-body',
});

const plexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['500', '600'],
  variable: '--font-mono',
});

export const metadata = {
  title: 'Doctor Tracker - Admin Portal',
  description: 'Manage doctors, patients and analytics',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={cn("font-sans", geist.variable)}>
      <body
        className={`${inter.className} ${spaceGrotesk.variable} ${inter.variable} ${plexMono.variable} bg-slate-50 text-slate-900 antialiased`}
      >
        <ReduxProvider>
          {children}
          {/* Toast Provider */}
          <Toaster position="top-right" reverseOrder={false} />
        </ReduxProvider>
      </body>
    </html>
  );
}