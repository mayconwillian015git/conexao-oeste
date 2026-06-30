import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET() {
  const adminClient = createAdminClient()
  const { data, error } = await adminClient
    .from('noticias')
    .select('*')
    .eq('status', 'pending_review')
    .order('criado_em', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message, url: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'set' : 'missing', key: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'set' : 'missing' }, { status: 500 })
  }

  return NextResponse.json(data ?? [], {
    headers: { 'x-count': String((data ?? []).length) }
  })
}
