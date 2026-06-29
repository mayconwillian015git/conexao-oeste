import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'
import slugify from 'slugify'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { publish, _galeria, ...fields } = body

  const adminClient = createAdminClient()

  // Generate slug from title
  let slug = slugify(fields.titulo ?? 'noticia', { lower: true, strict: true, locale: 'pt' })

  // Ensure uniqueness
  const { data: existing } = await adminClient
    .from('noticias')
    .select('id')
    .eq('slug', slug)
    .single()

  if (existing) {
    slug = `${slug}-${Date.now()}`
  }

  const { data, error } = await adminClient
    .from('noticias')
    .insert({
      ...fields,
      slug,
      status: publish ? 'published' : 'draft',
      origem: 'manual',
      publicado_em: publish ? new Date().toISOString() : null,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ id: data.id, slug: data.slug })
}
