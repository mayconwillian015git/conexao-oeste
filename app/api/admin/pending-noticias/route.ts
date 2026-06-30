import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    return NextResponse.json({ error: 'missing env', url: !!url, key: !!key }, { status: 500 })
  }

  // Test direct fetch to Supabase REST API
  const res = await fetch(`${url}/rest/v1/noticias?status=eq.pending_review&select=id,titulo,categoria,status,origem,publicado_em,criado_em,imagem_url&order=criado_em.desc`, {
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
    },
    cache: 'no-store',
  })

  if (!res.ok) {
    const text = await res.text()
    return NextResponse.json({ error: text, status: res.status }, { status: 500 })
  }

  const data = await res.json()
  return NextResponse.json(data, {
    headers: { 'x-count': String(data.length) }
  })
}
