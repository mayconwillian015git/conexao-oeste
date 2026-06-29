'use client'

import { useEffect, useState } from 'react'
import type { Banner } from '@/lib/types'

const FREQUENCIA_LABELS = {
  session: 'Uma vez por sessão',
  daily: 'Uma vez por dia',
  always: 'Sempre (toda visita)',
}

const PAGINAS_OPTIONS = [
  { value: 'todas', label: 'Todas as páginas' },
  { value: 'home', label: 'Home' },
  { value: 'noticia', label: 'Páginas de notícia' },
  { value: 'categoria', label: 'Páginas de categoria' },
]

const TIPO_LABELS: Record<Banner['tipo'], string> = {
  popup: 'Popup',
  sidebar: 'Sidebar',
  header: 'Header',
}

const EMPTY_FORM = {
  titulo: '',
  tipo: 'popup' as Banner['tipo'],
  imagem_url: '',
  link_url: '',
  ativo: true,
  expirado_em: '',
  frequencia: 'session' as Banner['frequencia'],
  paginas: ['todas'] as string[],
}

export default function BannersPage() {
  const [banners, setBanners] = useState<Banner[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>('')

  useEffect(() => { fetchBanners() }, [])

  async function fetchBanners() {
    const res = await fetch('/api/admin/banners', { cache: 'no-store' })
    if (res.ok) setBanners(await res.json())
    setLoading(false)
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onload = () => setImagePreview(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  function openNew() {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setImageFile(null)
    setImagePreview('')
    setError(null)
    setShowForm(true)
  }

  function openEdit(b: Banner) {
    setEditingId(b.id)
    setForm({
      titulo: b.titulo,
      tipo: b.tipo,
      imagem_url: b.imagem_url ?? '',
      link_url: b.link_url ?? '',
      ativo: b.ativo,
      expirado_em: b.expirado_em ? b.expirado_em.slice(0, 16) : '',
      frequencia: b.frequencia ?? 'session',
      paginas: b.paginas ?? ['todas'],
    })
    setImageFile(null)
    setImagePreview(b.imagem_url ?? '')
    setError(null)
    setShowForm(true)
  }

  function togglePagina(valor: string) {
    if (valor === 'todas') {
      setForm({ ...form, paginas: ['todas'] })
      return
    }
    const sem_todas = form.paginas.filter(p => p !== 'todas')
    if (sem_todas.includes(valor)) {
      const novo = sem_todas.filter(p => p !== valor)
      setForm({ ...form, paginas: novo.length ? novo : ['todas'] })
    } else {
      setForm({ ...form, paginas: [...sem_todas, valor] })
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)

    try {
      let imagemUrl = form.imagem_url
      if (imageFile) {
        const fd = new FormData()
        fd.append('file', imageFile)
        const uploadRes = await fetch('/api/admin/upload-imagem', { method: 'POST', body: fd })
        if (uploadRes.ok) {
          const { url } = await uploadRes.json()
          imagemUrl = url
        }
      }

      const payload = {
        ...form,
        imagem_url: imagemUrl,
        expirado_em: form.expirado_em || null,
      }

      const res = editingId
        ? await fetch(`/api/admin/banners/${editingId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          })
        : await fetch('/api/admin/banners', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          })

      if (!res.ok) throw new Error((await res.json()).error)

      await fetchBanners()
      setShowForm(false)
      setEditingId(null)
      setForm(EMPTY_FORM)
      setImageFile(null)
      setImagePreview('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar')
    } finally {
      setSaving(false)
    }
  }

  async function toggleBanner(id: string, ativo: boolean) {
    await fetch(`/api/admin/banners/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ativo: !ativo }),
    })
    await fetchBanners()
  }

  async function deleteBanner(id: string) {
    if (!confirm('Excluir este banner?')) return
    await fetch(`/api/admin/banners/${id}`, { method: 'DELETE' })
    await fetchBanners()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Banners e Popups</h1>
          <p className="text-gray-600 text-sm mt-1">Gerencie banners institucionais e popups</p>
        </div>
        <button
          onClick={showForm ? () => setShowForm(false) : openNew}
          className="bg-blue-800 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
        >
          {showForm ? 'Cancelar' : '+ Novo Banner'}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {editingId ? 'Editar Banner' : 'Novo Banner'}
          </h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Título *</label>
              <input
                required
                value={form.titulo}
                onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nome do banner"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
              <select
                value={form.tipo}
                onChange={(e) => setForm({ ...form, tipo: e.target.value as Banner['tipo'] })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Object.entries(TIPO_LABELS).map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Expirar em</label>
              <input
                type="datetime-local"
                value={form.expirado_em}
                onChange={(e) => setForm({ ...form, expirado_em: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Frequência de exibição</label>
              <select
                value={form.frequencia}
                onChange={(e) => setForm({ ...form, frequencia: e.target.value as Banner['frequencia'] })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Object.entries(FREQUENCIA_LABELS).map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Exibir nas páginas</label>
              <div className="flex flex-wrap gap-2 mt-1">
                {PAGINAS_OPTIONS.map(({ value, label }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => togglePagina(value)}
                    className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                      form.paginas.includes(value)
                        ? 'bg-blue-800 text-white border-blue-800'
                        : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Imagem</label>
              <div className="flex gap-3 items-start">
                <div className="flex-1 space-y-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="block w-full text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  <div className="flex gap-2 items-center">
                    <span className="text-xs text-gray-500">ou URL:</span>
                    <input
                      value={form.imagem_url}
                      onChange={(e) => { setForm({ ...form, imagem_url: e.target.value }); setImagePreview(e.target.value) }}
                      className="flex-1 border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="https://..."
                    />
                  </div>
                </div>
                {imagePreview && (
                  <div className="w-24 h-16 rounded overflow-hidden border border-gray-200 flex-shrink-0">
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">URL de destino (link)</label>
              <input
                value={form.link_url}
                onChange={(e) => setForm({ ...form, link_url: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://... (opcional)"
              />
            </div>

            {error && (
              <div className="md:col-span-2 bg-red-50 text-red-700 text-sm px-3 py-2 rounded-lg">{error}</div>
            )}

            <div className="md:col-span-2 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 text-sm font-semibold text-white bg-blue-800 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? 'Salvando...' : editingId ? 'Salvar alterações' : 'Criar Banner'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* List */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400">Carregando...</div>
        ) : banners.length === 0 ? (
          <div className="p-8 text-center text-gray-400">Nenhum banner cadastrado</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 text-xs uppercase">
              <tr>
                <th className="px-4 py-3 text-left">Imagem</th>
                <th className="px-4 py-3 text-left">Título</th>
                <th className="px-4 py-3 text-left hidden md:table-cell">Tipo</th>
                <th className="px-4 py-3 text-left hidden md:table-cell">Frequência</th>
                <th className="px-4 py-3 text-left hidden lg:table-cell">Páginas</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {banners.map((b) => (
                <tr key={b.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    {b.imagem_url ? (
                      <img src={b.imagem_url} alt={b.titulo} className="w-16 h-10 object-cover rounded border border-gray-200" />
                    ) : (
                      <div className="w-16 h-10 bg-gray-100 rounded border border-gray-200 flex items-center justify-center text-gray-400 text-xs">sem img</div>
                    )}
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900">{b.titulo}</td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="bg-gray-100 text-gray-700 text-xs px-2 py-0.5 rounded">
                      {TIPO_LABELS[b.tipo]}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-gray-500 text-xs">
                    {FREQUENCIA_LABELS[b.frequencia ?? 'session']}
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell text-gray-500 text-xs">
                    {(b.paginas ?? ['todas']).join(', ')}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleBanner(b.id, b.ativo)}
                      className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        b.ativo ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {b.ativo ? 'Ativo' : 'Inativo'}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEdit(b)}
                        className="text-xs font-medium text-blue-700 hover:text-blue-900 px-2 py-1 rounded hover:bg-blue-50 transition-colors"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => deleteBanner(b.id)}
                        className="text-xs font-medium text-red-500 hover:text-red-700 px-2 py-1 rounded hover:bg-red-50 transition-colors"
                      >
                        Excluir
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
