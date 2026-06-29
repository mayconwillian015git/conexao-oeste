import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'Conexão Oeste – Portal de Notícias do Oeste do Paraná',
    template: '%s | Conexão Oeste',
  },
  description:
    'O portal de notícias do Oeste do Paraná. Cobertura regional de Medianeira, Itaipulândia, Matelândia, Missal, Santa Helena, São Miguel do Iguaçu e região.',
  keywords: ['notícias', 'oeste do paraná', 'medianeira', 'itaipulândia', 'conexão oeste'],
  authors: [{ name: 'Conexão Oeste' }],
  creator: 'Conexão Oeste',
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    siteName: 'Conexão Oeste',
  },
  twitter: {
    card: 'summary_large_image',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}
