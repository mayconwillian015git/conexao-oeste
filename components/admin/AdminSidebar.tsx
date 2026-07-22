'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: '📊', exact: true },
  { href: '/admin/revisao', label: 'Fila de Revisão', icon: '📋' },
  { href: '/admin/noticias', label: 'Notícias', icon: '📰' },
  { href: '/admin/editor', label: 'Nova Matéria', icon: '✏️' },
  { href: '/admin/prefeitura', label: 'Prefeitura', icon: '🏛️' },
  { href: '/admin/importar-url', label: 'Importar URL', icon: '🔗' },
  { href: '/admin/banners', label: 'Banners / Popups', icon: '🖼️' },
  { href: '/admin/fontes', label: 'Fontes RSS', icon: '📡' },
  { href: '/admin/relatorio', label: 'Relatório de Views', icon: '📈' },
]

export default function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 min-h-screen bg-gray-900 text-white flex flex-col">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-gray-700">
        <Link href="/" className="text-lg font-bold text-white hover:text-blue-300 transition-colors">
          Conexão Oeste
        </Link>
        <p className="text-xs text-gray-400 mt-0.5">Painel Administrativo</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ href, label, icon, exact }) => {
          const isActive = exact ? pathname === href : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-700 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <span className="text-base">{icon}</span>
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-gray-700">
        <Link
          href="/"
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          target="_blank"
        >
          <span>🌐</span>
          Ver site público
        </Link>
        <form action="/api/auth/signout" method="post">
          <button
            type="submit"
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-gray-800 transition-colors mt-1"
          >
            <span>🚪</span>
            Sair
          </button>
        </form>
      </div>
    </aside>
  )
}
