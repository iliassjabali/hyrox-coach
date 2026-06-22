import type { ReactNode } from 'react';

export const metadata = {
  title: 'Hyrox Personal Coach',
  description: 'Multi-model LLM orchestration for hybrid-sport training',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: 'system-ui, sans-serif', margin: 0, background: '#0b0d12', color: '#e6e8ee' }}>
        {children}
      </body>
    </html>
  );
}
