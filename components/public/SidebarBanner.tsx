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

export default function SidebarBanner() {
  const [banners, setBanners] = useState<Banner[]>([])

  useEffect(() => {
    fetch('/api/banners')
      .then(r => r.json())
      .then((list: Banner[]) => {
        const now = new Date()
        const pathname = window.location.pathname

        const visible = list.filter(b => {
          if (!b.ativo || b.tipo !== 'sidebar') return false
          if (b.expirado_em && new Date(b.expirado_em) <= now) return false
          if (!matchesPage(b.paginas ?? ['todas'], pathname)) return false

          const key = `sidebar_seen_${b.id}`
          const frequencia = b.frequencia ?? 'always'
          if (frequencia === 'always') return true
          if (frequencia === 'daily') return localStorage.getItem(key) !== now.toDateString()
          return !sessionStorage.getItem(key)
        })

        setBanners(visible)
      })
      .catch(() => {})
  }, [])

  if (banners.length === 0) return null

  return (
    <div className="w-full space-y-4">
      {banners.map(banner => {
        // eslint-disable-next-line @next/next/no-img-element
        const img = <img key={banner.id} src={banner.imagem_url!} alt={banner.titulo} style={{ display: 'block', width: '100%', maxWidth: '100%', height: 'auto' }} className="rounded-xl border border-gray-200" />
        return (
          <div key={banner.id} className="w-full overflow-hidden">
            {banner.link_url ? (
              <a href={banner.link_url} target="_blank" rel="noopener noreferrer" className="block">{img}</a>
            ) : img}
          </div>
        )
      })}
    </div>
  )
}
