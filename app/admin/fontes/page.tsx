'use client'

import { useEffect, useState } from 'react'
import type { FonteBusca } from '@/lib/types'

export default function FontesPage() {
  const [fontes, setFontes] = useState<FonteBusca[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ nome: '', url: '', tipo: 'rss' as FonteBusca['tipo'] })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchFontes()
  }, [])

  async function fetchFontes() {
    const res = await fetch('/api/admin/fontes')
    if (res.ok) setFontes(await res.json())
    setLoading(false)
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)

    try {
      const res = await fetch('/api/admin/fontes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error((await res.json()).error)
      await fetchFontes()
      setShowForm(false)
      setForm({ nome: '', url: '', tipo: 'rss' })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar')
    } finally {
      setSaving(false)
    }
  }

  async function toggleFonte(id: string, ativo: boolean) {
    await fetch(`/api/admin/fontes/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ativo: !ativo }),
    })
    await fetchFontes()
  }

  async function deleteFonte(id: string) {
    if (!confirm('Excluir esta fonte?')) return
    await fetch(`/api/admin/fontes/${id}`, { method: 'DELETE' })
    await fetchFontes()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Fontes de Busca</h1>
          <p className="text-gray-600 text-sm mt-1">Gerencie os feeds RSS usados no cron job</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-800 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
        >
          {showForm ? 'Cancelar' : '+ Nova Fonte'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Nova Fonte</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
                <input
                  required
                  value={form.nome}
                  onChange={(e) => setForm({ ...form, nome: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="G1 Paraná"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">URL do Feed *</label>
                <input
                  required
                  type="url"
                  value={form.url}
                  onChange={(e) => setForm({ ...form, url: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://g1.globo.com/rss/g1/pr/"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
              <select
                value={form.tipo}
                onChange={(e) => setForm({ ...form, tipo: e.target.value as FonteBusca['tipo'] })}
                className="border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="rss">RSS</option>
                <option value="busca">Busca</option>
              </select>
            </div>

            {error && (
              <div className="bg-red-50 text-red-700 text-sm px-3 py-2 rounded-lg">{error}</div>
            )}

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 text-sm font-semibold text-white bg-blue-800 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? 'Salvando...' : 'Adicionar Fonte'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400">Carregando...</div>
        ) : fontes.length === 0 ? (
          <div className="p-8 text-center text-gray-400">Nenhuma fonte cadastrada</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 text-xs uppercase">
              <tr>
                <th className="px-4 py-3 text-left">Nome</th>
                <th className="px-4 py-3 text-left">URL</th>
                <th className="px-4 py-3 text-left">Tipo</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {fontes.map((f) => (
                <tr key={f.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{f.nome}</td>
                  <td className="px-4 py-3 text-gray-500 max-w-xs truncate">
                    <a href={f.url} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 hover:underline">
                      {f.url}
                    </a>
                  </td>
                  <td className="px-4 py-3">
                    <span className="bg-purple-100 text-purple-700 text-xs px-2 py-0.5 rounded uppercase">
                      {f.tipo}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleFonte(f.id, f.ativo)}
                      className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        f.ativo ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {f.ativo ? 'Ativo' : 'Inativo'}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => deleteFonte(f.id)}
                      className="text-red-500 hover:text-red-700 text-xs font-medium"
                    >
                      Excluir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Cron trigger */}
      <div className="bg-gray-50 rounded-xl border border-gray-200 p-4">
        <p className="text-sm font-medium text-gray-700 mb-2">Executar cron manualmente (teste):</p>
        <code className="text-xs text-gray-600 bg-white border border-gray-200 rounded px-3 py-2 block">
          curl -H &quot;Authorization: Bearer $CRON_SECRET&quot; https://seu-site.com/api/cron/rss-nacional
        </code>
      </div>
    </div>
  )
}
