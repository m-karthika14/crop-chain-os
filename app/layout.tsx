import type { Metadata, Viewport } from 'next'
import { Inter, Geist_Mono, Noto_Sans, Noto_Sans_Tamil, Noto_Sans_Telugu, Noto_Sans_Kannada, Noto_Sans_Malayalam } from 'next/font/google'
import './globals.css'

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

// Noto Sans for Devanagari (Hindi)
const notoSans = Noto_Sans({
  variable: '--font-noto-sans',
  subsets: ['latin', 'devanagari'],
  weight: ['400', '500', '600', '700', '900'],
  display: 'swap',
})

// Indian script fonts for farmer portal
const notoTamil = Noto_Sans_Tamil({
  variable: '--font-noto-tamil',
  subsets: ['tamil'],
  weight: ['400', '600', '700'],
  display: 'swap',
})

const notoTelugu = Noto_Sans_Telugu({
  variable: '--font-noto-telugu',
  subsets: ['telugu'],
  weight: ['400', '600', '700'],
  display: 'swap',
})

const notoKannada = Noto_Sans_Kannada({
  variable: '--font-noto-kannada',
  subsets: ['kannada'],
  weight: ['400', '600', '700'],
  display: 'swap',
})

const notoMalayalam = Noto_Sans_Malayalam({
  variable: '--font-noto-malayalam',
  subsets: ['malayalam'],
  weight: ['400', '600', '700'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'CropChain OS — Financial Operating System for FPOs',
  description:
    "India's First Financial OS serving 10,000+ registered FPOs representing 30 lakh farmers. Live Mandi prices, Smart Optimizer, Trust Score Engine, Farmer Payouts, Audit Ledger and FPO Credit Score — all in one platform.",
  keywords: [
    'CropChain OS',
    'FPO',
    'Farmer Producer Organization',
    'Financial OS',
    'Mandi prices',
    'agri-fintech',
    'India agriculture',
  ],
  authors: [{ name: 'CropChain OS' }],
  openGraph: {
    title: 'CropChain OS — Financial Operating System for FPOs',
    description: "India's First Financial OS serving 10,000+ registered FPOs representing 30 lakh farmers.",
    type: 'website',
  },
}

export const viewport: Viewport = {
  colorScheme: 'dark',
  themeColor: '#10B981',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${geistMono.variable} ${notoSans.variable} ${notoTamil.variable} ${notoTelugu.variable} ${notoKannada.variable} ${notoMalayalam.variable} bg-background`}
      style={{ backgroundColor: '#0A0A0A' }}
    >
      <body className="font-sans antialiased bg-background text-foreground">
        {children}
      </body>
    </html>
  )
}
