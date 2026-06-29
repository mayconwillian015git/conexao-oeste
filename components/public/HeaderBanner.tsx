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

export default function HeaderBanner() {
  const [banner, setBanner] = useState<Banner | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    fetch('/api/banners')
      .then(r => r.json())
      .then((list: Banner[]) => {
        const now = new Date()
        const active = list.find(b =>
          b.ativo &&
          b.tipo === 'header' &&
          (!b.expirado_em || new Date(b.expirado_em) > now)
        )
        if (!active) return
        setBanner(active)

        const pathname = window.location.pathname
        if (!matchesPage(active.paginas ?? ['todas'], pathname)) return

        setVisible(true)
      })
      .catch(() => {})
  }, [])

  if (!visible || !banner?.imagem_url) return null

  return (
    <div className="w-full flex justify-center bg-gray-100 py-2">
      {banner.link_url ? (
        <a href={banner.link_url} target="_blank" rel="noopener noreferrer">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={banner.imagem_url} alt={banner.titulo} style={{ display: 'block', width: '100%', height: 75, objectFit: 'cover' }} />
        </a>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={banner.imagem_url} alt={banner.titulo} style={{ display: 'block', width: '100%', height: 75, objectFit: 'cover' }} />
      )}
    </div>
  )
}
