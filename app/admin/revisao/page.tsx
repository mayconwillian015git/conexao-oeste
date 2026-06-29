'use client'

import { useEffect, useState, useCallback } from 'react'
import FilaRevisaoCard from '@/components/admin/FilaRevisaoCard'
import type { Noticia } from '@/lib/types'

export default function RevisaoPage() {
  const [noticias, setNoticias] = useState<Noticia[]>([])
  const [loading, setLoading] = useState(true)
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())

  const fetchPending = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/pending-noticias', { cache: 'no-store' })
      if (res.ok) {
        const data = await res.json()
        setNoticias(data)
      }
    } catch (err) {
      console.error('Error fetching pending noticias:', err)
    } finally {
      setLoading(false)
      setLastRefresh(new Date())
    }
  }, [])

  useEffect(() => {
    fetchPending()

    // Poll every 30 seconds
    const interval = setInterval(fetchPending, 30_000)
    return () => clearInterval(interval)
  }, [fetchPending])

  async function handleApprove(id: string) {
    const res = await fetch(`/api/noticias/${id}/aprovar`, { method: 'POST' })
    if (res.ok) {
      setNoticias((prev) => prev.filter((n) => n.id !== id))
    } else {
      alert('Erro ao aprovar notícia. Tente novamente.')
    }
  }

  async function handleReject(id: string) {
    const res = await fetch(`/api/noticias/${id}/rejeitar`, { method: 'POST' })
    if (res.ok) {
      setNoticias((prev) => prev.filter((n) => n.id !== id))
    } else {
      alert('Erro ao rejeitar notícia. Tente novamente.')
    }
  }

  async function handleDelete(id: string) {
    const res = await fetch(`/api/noticias/${id}/deletar`, { method: 'DELETE' })
    if (res.ok) {
      setNoticias((prev) => prev.filter((n) => n.id !== id))
    } else {
      alert('Erro ao excluir notícia. Tente novamente.')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Fila de Revisão</h1>
          <p className="text-sm text-gray-500 mt-1">
            {noticias.length} {noticias.length === 1 ? 'matéria aguardando' : 'matérias aguardando'} revisão
            {' · '}
            <span className="text-gray-400">
              Atualizado às {lastRefresh.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </p>
        </div>
        <button
          onClick={fetchPending}
          className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Atualizar
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse h-52" />
          ))}
        </div>
      ) : noticias.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-gray-200">
          <div className="text-5xl mb-3">✅</div>
          <p className="text-gray-600 font-medium">Nenhuma matéria aguardando revisão</p>
          <p className="text-gray-400 text-sm mt-1">A fila está vazia por enquanto</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {noticias.map((n) => (
            <FilaRevisaoCard
              key={n.id}
              noticia={n}
              onApprove={handleApprove}
              onReject={handleReject}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  )
}
