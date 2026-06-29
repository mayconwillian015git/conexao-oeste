'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { CATEGORIAS } from '@/lib/types';

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [busca, setBusca] = useState('');
  const [menuAberto, setMenuAberto] = useState(false);

  function handleBusca(e: React.FormEvent) {
    e.preventDefault();
    if (busca.trim()) {
      router.push(`/?busca=${encodeURIComponent(busca.trim())}`);
      setBusca('');
    }
  }

  return (
    <header className="bg-white border-b border-border shadow-sm sticky top-0 z-40">
      {/* Barra superior */}
      <div className="bg-primary text-white text-xs py-1 px-4 text-center hidden sm:block">
        As últimas notícias do Brasil e do mundo em tempo real
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Logo e busca */}
        <div className="flex items-center justify-between h-16 gap-4">
          <Link href="/" className="flex-shrink-0">
            <span className="text-2xl font-extrabold text-primary tracking-tight">
              JORNAL<span className="text-accent">.</span>
            </span>
          </Link>

          <form onSubmit={handleBusca} className="hidden sm:flex flex-1 max-w-md">
            <input
              type="search"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar notícias..."
              className="w-full border border-border rounded-l-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button
              type="submit"
              className="bg-primary text-white px-4 py-1.5 rounded-r-md text-sm hover:bg-blue-700 transition-colors"
            >
              Buscar
            </button>
          </form>

          <button
            className="sm:hidden p-2 text-ink"
            onClick={() => setMenuAberto(!menuAberto)}
            aria-label="Menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuAberto ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Navegação de categorias */}
        <nav className="hidden sm:flex items-center gap-1 overflow-x-auto pb-2 scrollbar-hide">
          <Link
            href="/"
            className={`text-sm font-medium px-3 py-1 rounded whitespace-nowrap transition-colors ${
              pathname === '/' ? 'bg-primary text-white' : 'text-ink hover:text-primary'
            }`}
          >
            Início
          </Link>
          {CATEGORIAS.map((cat) => (
            <Link
              key={cat}
              href={`/${cat}`}
              className={`text-sm font-medium px-3 py-1 rounded whitespace-nowrap capitalize transition-colors ${
                pathname === `/${cat}` ? 'bg-primary text-white' : 'text-ink hover:text-primary'
              }`}
            >
              {cat}
            </Link>
          ))}
        </nav>

        {/* Menu mobile */}
        {menuAberto && (
          <div className="sm:hidden py-3 border-t border-border">
            <form onSubmit={handleBusca} className="flex mb-3">
              <input
                type="search"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar notícias..."
                className="flex-1 border border-border rounded-l-md px-3 py-2 text-sm focus:outline-none"
              />
              <button type="submit" className="bg-primary text-white px-4 rounded-r-md text-sm">
                Buscar
              </button>
            </form>
            <div className="flex flex-col gap-1">
              <Link href="/" onClick={() => setMenuAberto(false)} className="py-2 text-sm font-medium text-ink hover:text-primary">
                Início
              </Link>
              {CATEGORIAS.map((cat) => (
                <Link
                  key={cat}
                  href={`/${cat}`}
                  onClick={() => setMenuAberto(false)}
                  className="py-2 text-sm font-medium capitalize text-ink hover:text-primary"
                >
                  {cat}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
