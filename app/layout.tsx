import type { Metadata, Viewport } from 'next'
import { Archivo, Inter, Geist_Mono } from 'next/font/google'
import { NavMenu } from '@/components/nav-menu'
import { CartProvider } from '@/components/cart-context'
import './globals.css'

const archivo = Archivo({
  variable: '--font-archivo',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
})
const inter = Inter({ variable: '--font-inter', subsets: ['latin'] })
const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: {
    default: 'Salami — SM',
    template: '%s | Salami',
  },
  description:
    'Salami (SM). A modern luxury streetwear label. Dark elegance, editorial restraint, deliberate motion.',
  generator: 'v0.app',
  openGraph: {
    title: 'Salami — SM',
    description: 'A modern luxury streetwear label.',
    siteName: 'Salami',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Salami — SM',
    description: 'A modern luxury streetwear label.',
  },
}

export const viewport: Viewport = {
  colorScheme: 'dark',
  themeColor: '#000000',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${archivo.variable} ${inter.variable} ${geistMono.variable} bg-background`}
    >
      <body className="font-sans antialiased">
        <CartProvider>
          <NavMenu />
          {children}
        </CartProvider>
      </body>
    </html>
  )
}
