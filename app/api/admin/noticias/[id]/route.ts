import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'
import { createSupabaseServerClient } from '@/lib/supabase-server'

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const adminClient = createAdminClient()
  const { data, error } = await adminClient
    .from('noticias')
    .select('*')
    .eq('id', params.id)
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return NextResponse.json(data)
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {

  const body = await request.json()
  const { publish, _galeria, ...fields } = body

  const adminClient = createAdminClient()
  const { data, error } = await adminClient
    .from('noticias')
    .update({
      ...fields,
      status: publish ? 'published' : fields.status ?? 'draft',
      publicado_em: publish ? new Date().toISOString() : fields.publicado_em,
    })
    .eq('id', params.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ id: data.id, slug: data.slug })
}
