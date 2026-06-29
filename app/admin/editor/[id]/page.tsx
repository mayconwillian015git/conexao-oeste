'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import EditorMateria from '@/components/admin/EditorMateria'
import type { Noticia } from '@/lib/types'

export default function EditarMateria() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [noticia, setNoticia] = useState<Noticia | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch(`/api/admin/noticias/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setError(data.error)
        else setNoticia(data)
      })
      .catch(() => setError('Erro ao carregar notícia'))
      .finally(() => setLoading(false))
  }, [id])

  async function handleSave(data: Partial<Noticia> & { _galeria?: { url: string; ordem: number }[] }, publish: boolean) {
    const { _galeria, ...noticiaData } = data

    const res = await fetch(`/api/admin/noticias/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...noticiaData, publish }),
    })

    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.error ?? 'Erro ao salvar')
    }

    // Salvar galeria de imagens
    if (_galeria !== undefined) {
      await fetch(`/api/admin/noticias/${id}/imagens`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(_galeria),
      })
    }

    const saved = await res.json()
    if (publish) {
      router.push(`/admin/noticias?status=published`)
    } else {
      router.push('/admin/noticias')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-800" />
      </div>
    )
  }

  if (error || !noticia) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">{error ?? 'Notícia não encontrada'}</p>
        <button onClick={() => router.back()} className="mt-4 text-blue-700 hover:underline text-sm">
          Voltar
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Editar Matéria</h1>
          <p className="text-gray-600 text-sm mt-1 truncate max-w-lg">{noticia.titulo}</p>
        </div>
        <button
          onClick={() => router.back()}
          className="text-sm text-gray-600 hover:text-gray-900"
        >
          ← Voltar
        </button>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <EditorMateria initialData={noticia} onSave={handleSave} />
      </div>
    </div>
  )
}
