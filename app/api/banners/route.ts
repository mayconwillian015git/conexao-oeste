import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET() {
  const now = new Date().toISOString()
  const adminClient = createAdminClient()
  const { data, error } = await adminClient
    .from('banners')
    .select('*')
    .eq('ativo', true)
    .or(`expirado_em.is.null,expirado_em.gt.${now}`)
    .order('criado_em', { ascending: false })

  if (error) return NextResponse.json([], { status: 200 })
  return NextResponse.json(data ?? [])
}
