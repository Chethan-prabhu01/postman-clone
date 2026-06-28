import type { Metadata } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'API Client — Postman Clone',
  description: 'A full-featured API client for building and testing HTTP requests',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
      </head>
      <body className={`${inter.variable} font-sans bg-postman-darker text-postman-text antialiased`}>
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#2D2D3F',
              color: '#E2E2EF',
              border: '1px solid #3A3A4D',
              borderRadius: '6px',
              fontSize: '13px',
            },
            success: { iconTheme: { primary: '#10B981', secondary: '#2D2D3F' } },
            error: { iconTheme: { primary: '#EF4444', secondary: '#2D2D3F' } },
          }}
        />
      </body>
    </html>
  )
}
