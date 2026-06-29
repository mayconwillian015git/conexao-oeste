import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const body = await request.json();
  const { status, titulo, resumo, conteudo, categoria, imagem_url, seo_title, seo_description } = body;

  const updates: Record<string, unknown> = {};

  if (status !== undefined) {
    updates.status = status;
    if (status === 'publicada') {
      updates.published_at = new Date().toISOString();
    }
  }
  if (titulo !== undefined) updates.titulo = titulo;
  if (resumo !== undefined) updates.resumo = resumo;
  if (conteudo !== undefined) updates.conteudo = conteudo;
  if (categoria !== undefined) updates.categoria = categoria;
  if (imagem_url !== undefined) updates.imagem_url = imagem_url;
  if (seo_title !== undefined) updates.seo_title = seo_title;
  if (seo_description !== undefined) updates.seo_description = seo_description;

  const { data, error } = await supabase
    .from('noticias')
    .update(updates)
    .eq('id', params.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const { error } = await supabase
    .from('noticias')
    .delete()
    .eq('id', params.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
