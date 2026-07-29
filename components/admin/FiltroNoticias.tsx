'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'

const STATUS_OPTIONS = [
  { value: 'published', label: 'Publicadas' },
  { value: 'draft', label: 'Rascunhos' },
  { value: 'rejected', label: 'Rejeitadas' },
]

export default function FiltroNoticias() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const status = searchParams.get('status') ?? 'published'
  const busca = searchParams.get('busca') ?? ''

  const handleBusca = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set('busca', value)
      } else {
        params.delete('busca')
      }
      router.push(`/admin/noticias?${params.toString()}`)
    },
    [router, searchParams],
  )

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      {/* Filtro de status */}
      <div className="flex gap-2 flex-wrap">
        {STATUS_OPTIONS.map((opt) => (
          <Link
            key={opt.value}
            href={`/admin/noticias?status=${opt.value}${busca ? `&busca=${encodeURIComponent(busca)}` : ''}`}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              status === opt.value
                ? 'bg-blue-800 text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:border-blue-300'
            }`}
          >
            {opt.label}
          </Link>
        ))}
      </div>

      {/* Campo de busca */}
      <div className="relative flex-1 max-w-sm">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
        <input
          type="text"
          defaultValue={busca}
          placeholder="Pesquisar por título..."
          className="w-full pl-8 pr-8 py-1.5 text-sm border border-gray-200 rounded-full bg-white focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-300"
          onChange={(e) => {
            const val = e.target.value
            const timer = setTimeout(() => handleBusca(val), 400)
            return () => clearTimeout(timer)
          }}
        />
        {busca && (
          <button
            onClick={() => handleBusca('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  )
}
