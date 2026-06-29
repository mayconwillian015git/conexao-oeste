'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function BotaoDeletar({ id }: { id: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    if (!confirm('Tem certeza que deseja excluir esta notícia? Esta ação não pode ser desfeita.')) return

    setLoading(true)
    const res = await fetch(`/api/noticias/${id}/deletar`, { method: 'DELETE' })
    setLoading(false)

    if (res.ok) {
      router.refresh()
    } else {
      alert('Erro ao excluir notícia.')
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="text-xs font-medium text-red-600 hover:text-red-800 px-2 py-1 rounded hover:bg-red-50 transition-colors disabled:opacity-50"
    >
      {loading ? '...' : 'Excluir'}
    </button>
  )
}
