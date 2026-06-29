'use client'

import { useState } from 'react'

export default function ImportarUrlPage() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!url.startsWith('http')) {
      setError('Insira uma URL válida (começando com http:// ou https://)')
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const res = await fetch('/api/admin/importar-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Erro ao importar')

      setSuccess(`Matéria importada: "${data.titulo}". Aguarda revisão.`)
      setUrl('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }

  const supportedSites = [
    { name: 'Oeste Agora', url: 'https://oesteoagora.com.br' },
    { name: 'Extremo Oeste', url: 'https://extremooeste.com.br' },
  ]

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Importar Artigo por URL</h1>
        <p className="text-gray-600 text-sm mt-1">
          Cole a URL de um artigo para importar e reescrever com IA
        </p>
      </div>

      {/* Supported sites */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <p className="text-sm font-medium text-gray-700 mb-2">Sites suportados:</p>
        <div className="flex flex-wrap gap-2">
          {supportedSites.map((s) => (
            <a
              key={s.url}
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs bg-blue-50 text-blue-700 hover:bg-blue-100 px-3 py-1 rounded-full font-medium transition-colors"
            >
              {s.name} ↗
            </a>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              URL do Artigo <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                required
                placeholder="https://oesteoagora.com.br/noticia/exemplo"
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 text-red-700 text-sm rounded-lg px-4 py-3 border border-red-200">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-50 text-green-800 text-sm rounded-lg px-4 py-3 border border-green-200">
              {success}
              {' '}
              <a href="/admin/revisao" className="underline font-medium">
                Ver fila de revisão →
              </a>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !url}
            className="w-full bg-blue-800 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Importando e reescrevendo...
              </>
            ) : (
              'Importar e Reescrever com IA'
            )}
          </button>
        </form>
      </div>

      {/* Notice */}
      <div className="bg-amber-50 rounded-xl border border-amber-200 p-4 text-sm text-amber-800 space-y-1">
        <p className="font-semibold">Importante:</p>
        <ul className="list-disc list-inside space-y-1 text-amber-700">
          <li>O artigo será reescrito com palavras próprias (não copiado)</li>
          <li>O crédito à fonte original será incluído automaticamente</li>
          <li>A matéria precisará de aprovação manual antes de publicar</li>
        </ul>
      </div>
    </div>
  )
}
