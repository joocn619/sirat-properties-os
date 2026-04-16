import type { Metadata } from 'next'
import { Cormorant_Garamond, DM_Sans, DM_Mono, Hind_Siliguri } from 'next/font/google'

import { AppToaster } from '@/components/providers/AppToaster'
import './globals.css'

const cormorant = Cormorant_Garamond({
  variable: '--font-cormorant',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  style: ['normal', 'italic'],
  display: 'swap',
})

const dmSans = DM_Sans({
  variable: '--font-dm-sans',
  subsets: ['latin'],
  display: 'swap',
})

const dmMono = DM_Mono({
  variable: '--font-dm-mono',
  subsets: ['latin'],
  weight: ['400', '500'],
  display: 'swap',
})

const hindSiliguri = Hind_Siliguri({
  variable: '--font-hind-siliguri',
  subsets: ['bengali'],
  weight: ['300', '400', '500', '600'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: "Sirat Properties | Bangladesh's Premium Real Estate Platform",
    template: '%s | Sirat Properties',
  },
  description:
    'Find, list, and manage premium properties across Bangladesh. Trusted by modern buyers, sellers, agents, and operators.',
  keywords: 'real estate Bangladesh, property buy sell rent, Dhaka property, Sirat Properties, বাংলাদেশ সম্পত্তি',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://siratproperties.com'),
  openGraph: {
    title: "Sirat Properties | Bangladesh's Premium Real Estate Platform",
    description: 'Find, list, and manage premium properties across Bangladesh.',
    type: 'website',
    locale: 'bn_BD',
    siteName: 'Sirat Properties',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Sirat Properties | Bangladesh's Premium Real Estate Platform",
    description: 'Find, list, and manage premium properties across Bangladesh.',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="bn"
      className={`${cormorant.variable} ${dmSans.variable} ${dmMono.variable} ${hindSiliguri.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        {children}
        <AppToaster />
      </body>
    </html>
  )
}
