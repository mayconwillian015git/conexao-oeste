'use client'

import { useState } from 'react'

interface CarrosselProps {
  imagens: { id: string; url: string; ordem: number }[]
  titulo: string
}

export default function Carrossel({ imagens, titulo }: CarrosselProps) {
  const [atual, setAtual] = useState(0)

  if (imagens.length === 0) return null

  const sorted = [...imagens].sort((a, b) => a.ordem - b.ordem)

  const prev = () => setAtual((i) => (i === 0 ? sorted.length - 1 : i - 1))
  const next = () => setAtual((i) => (i === sorted.length - 1 ? 0 : i + 1))

  return (
    <div className="relative w-full mb-8 rounded-xl overflow-hidden bg-black">
      {/* Imagem principal */}
      <div className="relative w-full h-72 md:h-96">
        <img
          src={sorted[atual].url}
          alt={`${titulo} - foto ${atual + 1}`}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Controles (só se mais de 1 imagem) */}
      {sorted.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full w-9 h-9 flex items-center justify-center transition-colors"
            aria-label="Anterior"
          >
            ‹
          </button>
          <button
            onClick={next}
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full w-9 h-9 flex items-center justify-center transition-colors"
            aria-label="Próxima"
          >
            ›
          </button>

          {/* Indicadores */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {sorted.map((_, i) => (
              <button
                key={i}
                onClick={() => setAtual(i)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  i === atual ? 'bg-white' : 'bg-white/50'
                }`}
              />
            ))}
          </div>

          {/* Contador */}
          <div className="absolute top-3 right-3 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
            {atual + 1} / {sorted.length}
          </div>
        </>
      )}

      {/* Miniaturas */}
      {sorted.length > 1 && (
        <div className="flex gap-2 p-2 bg-black/80 overflow-x-auto">
          {sorted.map((img, i) => (
            <button
              key={img.id}
              onClick={() => setAtual(i)}
              className={`flex-shrink-0 w-16 h-12 rounded overflow-hidden border-2 transition-colors ${
                i === atual ? 'border-white' : 'border-transparent opacity-60'
              }`}
            >
              <img src={img.url} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
