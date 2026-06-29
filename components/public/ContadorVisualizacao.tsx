'use client'

import { useEffect } from 'react'

export default function ContadorVisualizacao({ id }: { id: string }) {
  useEffect(() => {
    const key = `visto_${id}`
    if (sessionStorage.getItem(key)) return
    sessionStorage.setItem(key, '1')
    fetch(`/api/noticias/${id}/visualizacao`, { method: 'POST' }).catch(() => {})
  }, [id])

  return null
}
