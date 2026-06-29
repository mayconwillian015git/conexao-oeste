import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('noticias_imagens')
    .select('id, url, ordem')
    .eq('noticia_id', params.id)
    .order('ordem')

  if (error) return NextResponse.json([], { status: 200 })
  return NextResponse.json(data ?? [])
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createAdminClient()
  const imagens: { url: string; ordem: number }[] = await request.json()

  // Apagar as existentes e reinserir (simples e sem conflito)
  await supabase.from('noticias_imagens').delete().eq('noticia_id', params.id)

  if (imagens.length > 0) {
    const { error } = await supabase.from('noticias_imagens').insert(
      imagens.map((img) => ({ noticia_id: params.id, url: img.url, ordem: img.ordem }))
    )
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
