import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    default: 'Admin',
    template: '%s | Admin — Jornal Online',
  },
};

const NAV_LINKS = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/noticias', label: 'Notícias' },
  { href: '/admin/banners', label: 'Banners' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-surface">
      {/* Admin header */}
      <header className="bg-ink text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-14">
          <div className="flex items-center gap-6">
            <Link href="/admin" className="font-bold text-lg tracking-tight">
              JORNAL <span className="text-primary-light font-normal text-sm">/ admin</span>
            </Link>
            <nav className="hidden sm:flex items-center gap-1">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm px-3 py-1.5 rounded hover:bg-white/10 transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
          <Link
            href="/"
            target="_blank"
            className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-1"
          >
            Ver site
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </Link>
        </div>
      </header>

      {/* Mobile nav */}
      <div className="sm:hidden bg-gray-800 text-white flex overflow-x-auto">
        {NAV_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="text-sm px-4 py-2 whitespace-nowrap hover:bg-white/10"
          >
            {link.label}
          </Link>
        ))}
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
