'use client'

import { useState } from 'react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { Noticia } from '@/lib/types'

interface FilaRevisaoCardProps {
  noticia: Noticia
  onApprove: (id: string) => Promise<void>
  onReject: (id: string) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

const origemLabels: Record<string, { label: string; color: string }> = {
  ia_nacional: { label: 'IA Nacional', color: 'bg-purple-100 text-purple-800' },
  ia_regional: { label: 'IA Regional', color: 'bg-indigo-100 text-indigo-800' },
  prefeitura: { label: 'Prefeitura', color: 'bg-green-100 text-green-800' },
  importacao_url: { label: 'URL', color: 'bg-orange-100 text-orange-800' },
  manual: { label: 'Manual', color: 'bg-gray-100 text-gray-800' },
}

export default function FilaRevisaoCard({ noticia, onApprove, onReject, onDelete }: FilaRevisaoCardProps) {
  const [loading, setLoading] = useState<'approve' | 'reject' | 'delete' | null>(null)
  const origem = origemLabels[noticia.origem] ?? origemLabels.manual

  async function handleApprove() {
    setLoading('approve')
    try {
      await onApprove(noticia.id)
    } finally {
      setLoading(null)
    }
  }

  async function handleReject() {
    setLoading('reject')
    try {
      await onReject(noticia.id)
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${origem.color}`}>
            {origem.label}
          </span>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
            {noticia.categoria}
          </span>
          {noticia.cidade_prefeitura && (
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800">
              {noticia.cidade_prefeitura}
            </span>
          )}
        </div>
        <time className="text-xs text-gray-400 whitespace-nowrap flex-shrink-0">
          {formatDistanceToNow(new Date(noticia.criado_em), { addSuffix: true, locale: ptBR })}
        </time>
      </div>

      {/* Title */}
      <h3 className="font-bold text-gray-900 text-base leading-snug">{noticia.titulo}</h3>

      {/* Summary */}
      {noticia.resumo && (
        <p className="text-sm text-gray-600 line-clamp-2">{noticia.resumo}</p>
      )}

      {/* Source link */}
      {noticia.fonte_original_url && (
        <a
          href={noticia.fonte_original_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-blue-600 hover:underline truncate"
        >
          Fonte: {noticia.fonte_original_nome ?? noticia.fonte_original_url}
        </a>
      )}

      {/* Actions */}
      <div className="flex gap-2 mt-1">
        <button
          onClick={handleApprove}
          disabled={loading !== null}
          className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-sm font-semibold py-2 rounded-lg transition-colors"
        >
          {loading === 'approve' ? 'Aprovando...' : 'Aprovar'}
        </button>
        <Link
          href={`/admin/editor/${noticia.id}`}
          className="flex-1 text-center bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2 rounded-lg transition-colors"
        >
          Editar
        </Link>
        <button
          onClick={handleReject}
          disabled={loading !== null}
          className="flex-1 bg-red-50 hover:bg-red-100 disabled:opacity-50 text-red-700 text-sm font-semibold py-2 rounded-lg transition-colors"
        >
          {loading === 'reject' ? 'Rejeitando...' : 'Rejeitar'}
        </button>
        <button
          onClick={async () => {
            if (!confirm('Excluir esta notícia permanentemente?')) return
            setLoading('delete')
            try { await onDelete(noticia.id) } finally { setLoading(null) }
          }}
          disabled={loading !== null}
          className="bg-gray-100 hover:bg-red-50 disabled:opacity-50 text-gray-500 hover:text-red-700 text-sm font-semibold px-3 py-2 rounded-lg transition-colors"
          title="Excluir"
        >
          {loading === 'delete' ? '...' : '🗑'}
        </button>
      </div>
    </div>
  )
}
