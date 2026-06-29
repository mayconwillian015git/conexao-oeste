import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'
import { createSupabaseServerClient } from '@/lib/supabase-server'

export async function POST(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authClient = createSupabaseServerClient()
  const { data: { user } } = await authClient.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = params
  const adminClient = createAdminClient()

  const { data, error } = await adminClient
    .from('noticias')
    .update({
      status: 'published',
      publicado_em: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, noticia: data })
}
