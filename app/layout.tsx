import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import './globals.css'
import { warmupServices } from '@/lib/warmup'

// Warm up backend services during app initialization
if (typeof process !== 'undefined') {
  warmupServices().catch(console.error);
  
  // Add global error handlers only once
  if (!process.listenerCount('unhandledRejection')) {
    process.on('unhandledRejection', (reason, promise) => {
      console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    });
  }
  
  if (!process.listenerCount('uncaughtException')) {
    process.on('uncaughtException', (err) => {
      console.error('Uncaught Exception:', err);
    });
  }
}

export const metadata: Metadata = {
  title: 'v0 App',
  description: 'Created with v0',
  generator: 'v0.dev',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <style>{`
html {
  font-family: ${GeistSans.style.fontFamily};
  --font-sans: ${GeistSans.variable};
  --font-mono: ${GeistMono.variable};
}
        `}</style>
      </head>
      <body>{children}</body>
    </html>
  )
}
