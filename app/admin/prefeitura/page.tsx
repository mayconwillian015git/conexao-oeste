'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { MUNICIPIOS } from '@/lib/types'

export default function PrefeituraPage() {
  const router = useRouter()
  const [municipio, setMunicipio] = useState('')
  const [docxFile, setDocxFile] = useState<File | null>(null)
  const [photos, setPhotos] = useState<File[]>([])
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!municipio || !docxFile) {
      setError('Selecione o município e um arquivo .docx')
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const formData = new FormData()
      formData.append('municipio', municipio)
      formData.append('docx', docxFile)
      photos.forEach((p) => formData.append('photos', p))

      const res = await fetch('/api/admin/importar-prefeitura', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error ?? 'Erro ao processar')
      }

      setSuccess(
        `Matéria criada: "${data.titulo}" (${data.fotosUploaded} foto(s) enviada(s)). Aguarda revisão.`
      )
      setDocxFile(null)
      setPhotos([])
      setMunicipio('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Upload da Prefeitura</h1>
        <p className="text-gray-600 text-sm mt-1">
          Envie comunicados oficiais das prefeituras para serem transformados em notícias
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Municipality */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Município <span className="text-red-500">*</span>
            </label>
            <select
              value={municipio}
              onChange={(e) => setMunicipio(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Selecione o município</option>
              {MUNICIPIOS.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          {/* DOCX file */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Documento .docx <span className="text-red-500">*</span>
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
              <input
                type="file"
                accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={(e) => setDocxFile(e.target.files?.[0] ?? null)}
                className="hidden"
                id="docx-upload"
                required
              />
              <label htmlFor="docx-upload" className="cursor-pointer">
                {docxFile ? (
                  <div>
                    <p className="text-sm font-medium text-green-700">✅ {docxFile.name}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {(docxFile.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                ) : (
                  <div>
                    <svg className="w-10 h-10 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="text-sm text-gray-600">Clique para selecionar o arquivo .docx</p>
                    <p className="text-xs text-gray-400 mt-1">ou arraste e solte aqui</p>
                  </div>
                )}
              </label>
            </div>
          </div>

          {/* Photos */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fotos <span className="text-gray-400">(opcional, múltiplas)</span>
            </label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => setPhotos(Array.from(e.target.files ?? []))}
              className="block w-full text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {photos.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {photos.map((p, i) => (
                  <span key={i} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                    {p.name}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Feedback */}
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
            disabled={loading}
            className="w-full bg-blue-800 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Processando...
              </>
            ) : (
              'Enviar e Processar com IA'
            )}
          </button>
        </form>
      </div>

      {/* Info */}
      <div className="bg-blue-50 rounded-xl border border-blue-200 p-4 text-sm text-blue-800 space-y-1">
        <p className="font-semibold">Como funciona:</p>
        <ol className="list-decimal list-inside space-y-1 text-blue-700">
          <li>O texto do .docx é extraído automaticamente</li>
          <li>As fotos são enviadas para o armazenamento</li>
          <li>O Claude reescreve o comunicado em formato jornalístico</li>
          <li>A matéria fica em fila de revisão para aprovação manual</li>
        </ol>
      </div>
    </div>
  )
}
