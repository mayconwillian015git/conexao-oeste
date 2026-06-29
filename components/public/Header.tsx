'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { CATEGORIAS } from '@/lib/types'

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)

  const mainCategories = ['Política', 'Economia', 'Saúde', 'Segurança', 'Esporte']

  return (
    <header className="bg-white shadow-md sticky top-0 z-40">
      {/* Top bar */}
      <div className="bg-blue-800 text-white text-xs py-1">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
          <span>Portal de Notícias do Oeste do Paraná</span>
          <span>{new Date().toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
      </div>

      {/* Main header */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/">
          <Image src="/logo.png" alt="Conexão Oeste" width={160} height={48} className="h-12 w-auto" priority />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {mainCategories.map((cat) => (
            <Link
              key={cat}
              href={`/${cat.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/ /g, '-')}`}
              className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
            >
              {cat}
            </Link>
          ))}
        </nav>

        {/* Search */}
        <form action="/busca" method="get" className="hidden md:flex items-center gap-1 bg-gray-100 rounded-full px-3 py-1.5">
          <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
          </svg>
          <input
            type="text"
            name="q"
            placeholder="Buscar..."
            className="bg-transparent text-sm text-gray-700 outline-none w-36 placeholder-gray-400"
          />
        </form>

        {/* Mobile menu toggle */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden p-2 rounded-md text-gray-700 hover:bg-gray-100"
          aria-label="Abrir menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {menuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile nav */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <nav className="max-w-7xl mx-auto px-4 py-2 flex flex-col">
            {CATEGORIAS.map((cat) => (
              <Link
                key={cat}
                href={`/${cat.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/ /g, '-')}`}
                onClick={() => setMenuOpen(false)}
                className="px-3 py-2.5 text-sm font-medium text-gray-700 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
              >
                {cat}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  )
}
