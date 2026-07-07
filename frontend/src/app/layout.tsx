import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Quexy — AI-Powered Business Intelligence',
  description: 'Connect your data. Ask naturally. Get intelligent answers. Quexy transforms natural language questions into complete analytical experiences.',
  keywords: ['business intelligence', 'AI analytics', 'natural language SQL', 'data visualization', 'dashboard'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
