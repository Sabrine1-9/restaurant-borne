import './globals.css';
import { ReactNode } from 'react';
import { LanguageProvider } from '@/context/LanguageContext';

export const metadata = {
  title: 'Borne Restaurant',
  description: 'Interface de connexion',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html>
      <body>
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
