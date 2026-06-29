import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'

export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const adminClient = createAdminClient()
  await adminClient.rpc('incrementar_visualizacao', { noticia_id: params.id })
  return NextResponse.json({ ok: true })
}
