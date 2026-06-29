'use client'

import { useEffect, useState } from 'react'
import type { Banner } from '@/lib/types'

function matchesPage(paginas: string[], pathname: string): boolean {
  if (paginas.includes('todas')) return true
  if (paginas.includes('home') && pathname === '/') return true
  if (paginas.includes('noticia') && pathname.startsWith('/noticia/')) return true
  if (paginas.includes('categoria') && pathname.startsWith('/categoria/')) return true
  return false
}

export default function PopupBanner({ banner }: { banner: Banner }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const pathname = window.location.pathname
    const paginas = banner.paginas ?? ['todas']
    if (!matchesPage(paginas, pathname)) return

    const key = `popup_seen_${banner.id}`
    const frequencia = banner.frequencia ?? 'session'

    if (frequencia === 'always') { setVisible(true); return }
    if (frequencia === 'daily') {
      if (localStorage.getItem(key) !== new Date().toDateString()) setVisible(true)
      return
    }
    if (!sessionStorage.getItem(key)) setVisible(true)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function close() {
    const key = `popup_seen_${banner.id}`
    const frequencia = banner.frequencia ?? 'session'
    if (frequencia === 'daily') localStorage.setItem(key, new Date().toDateString())
    else if (frequencia === 'session') sessionStorage.setItem(key, '1')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={close}
    >
      <div
        className="relative bg-white rounded-2xl shadow-2xl overflow-hidden"
        style={{ width: 600, maxWidth: '95vw', height: 500, maxHeight: '90vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={close}
          className="absolute top-3 right-3 z-10 bg-white/90 hover:bg-white rounded-full w-8 h-8 flex items-center justify-center shadow text-gray-600 hover:text-gray-900 transition-colors"
          aria-label="Fechar"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {banner.link_url ? (
          <a href={banner.link_url} target="_blank" rel="noopener noreferrer" onClick={close}>
            {banner.imagem_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={banner.imagem_url} alt={banner.titulo} style={{ display: 'block', width: '100%', height: '100%', objectFit: 'cover' }} />
            )}
          </a>
        ) : (
          banner.imagem_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={banner.imagem_url} alt={banner.titulo} style={{ display: 'block', width: '100%', height: '100%', objectFit: 'cover' }} />
          )
        )}
      </div>
    </div>
  )
}
