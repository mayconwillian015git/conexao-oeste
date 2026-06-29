'use client'

import { useRouter } from 'next/navigation'
import EditorMateria from '@/components/admin/EditorMateria'
import type { Noticia } from '@/lib/types'

export default function NovaMateria() {
  const router = useRouter()

  async function handleSave(data: Partial<Noticia>, publish: boolean) {
    const res = await fetch('/api/admin/noticias', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, publish }),
    })

    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.error ?? 'Erro ao salvar')
    }

    const { id } = await res.json()
    router.push(publish ? '/' : `/admin/editor/${id}`)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Nova Matéria</h1>
        <p className="text-gray-600 text-sm mt-1">Crie uma matéria manualmente</p>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <EditorMateria onSave={handleSave} />
      </div>
    </div>
  )
}
