'use client'

import { useState } from 'react'

export interface ImagemItem {
  id?: string
  url: string
  ordem: number
  file?: File
}

interface Props {
  noticiaId?: string
  imagens: ImagemItem[]
  onChange: (imagens: ImagemItem[]) => void
}

export default function GerenciadorImagens({ imagens, onChange }: Props) {
  const [uploading, setUploading] = useState(false)

  async function handleAddFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    if (files.length === 0) return

    setUploading(true)
    const novas: ImagemItem[] = []

    for (const file of files) {
      const formData = new FormData()
      formData.append('file', file)

      try {
        const res = await fetch('/api/admin/upload-imagem', { method: 'POST', body: formData })
        if (res.ok) {
          const { url } = await res.json()
          novas.push({ url, ordem: imagens.length + novas.length })
        }
      } catch {
        // silently skip failed uploads
      }
    }

    onChange([...imagens, ...novas])
    setUploading(false)
    e.target.value = ''
  }

  function remover(index: number) {
    const updated = imagens.filter((_, i) => i !== index).map((img, i) => ({ ...img, ordem: i }))
    onChange(updated)
  }

  function mover(index: number, direcao: -1 | 1) {
    const novo = [...imagens]
    const alvo = index + direcao
    if (alvo < 0 || alvo >= novo.length) return
    ;[novo[index], novo[alvo]] = [novo[alvo], novo[index]]
    onChange(novo.map((img, i) => ({ ...img, ordem: i })))
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          Galeria de Imagens
          <span className="text-gray-400 font-normal ml-1">(carrossel na notícia)</span>
        </label>
        <label className={`cursor-pointer text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
          uploading ? 'bg-gray-100 text-gray-400' : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
        }`}>
          {uploading ? 'Enviando...' : '+ Adicionar fotos'}
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleAddFiles}
            disabled={uploading}
          />
        </label>
      </div>

      {imagens.length === 0 ? (
        <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center text-sm text-gray-400">
          Nenhuma imagem adicionada. A primeira foto também serve como capa.
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {imagens.map((img, i) => (
            <div key={i} className="relative group rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
              <img src={img.url} alt="" className="w-full h-20 object-cover" />

              {/* Ordem badge */}
              <div className="absolute top-1 left-1 bg-black/60 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {i + 1}
              </div>

              {/* Ações */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                <button
                  type="button"
                  onClick={() => mover(i, -1)}
                  disabled={i === 0}
                  className="bg-white/80 text-gray-800 rounded px-1.5 py-0.5 text-xs disabled:opacity-30"
                  title="Mover para esquerda"
                >
                  ←
                </button>
                <button
                  type="button"
                  onClick={() => remover(i)}
                  className="bg-red-500 text-white rounded px-1.5 py-0.5 text-xs"
                  title="Remover"
                >
                  ✕
                </button>
                <button
                  type="button"
                  onClick={() => mover(i, 1)}
                  disabled={i === imagens.length - 1}
                  className="bg-white/80 text-gray-800 rounded px-1.5 py-0.5 text-xs disabled:opacity-30"
                  title="Mover para direita"
                >
                  →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
