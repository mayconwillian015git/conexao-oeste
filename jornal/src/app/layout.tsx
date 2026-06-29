import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/Header';

export const metadata: Metadata = {
  title: {
    default: 'Jornal Online',
    template: '%s | Jornal Online',
  },
  description: 'As últimas notícias do Brasil e do mundo.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-surface">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </main>
        <footer className="mt-12 border-t border-border bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center text-muted text-sm">
            © {new Date().getFullYear()} Jornal Online — Todos os direitos reservados.
          </div>
        </footer>
      </body>
    </html>
  );
}
