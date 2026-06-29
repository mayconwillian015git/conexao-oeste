import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  const { data, error } = await supabase
    .from('noticias')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const body = await request.json();

  const { titulo, resumo, conteudo, slug, categoria, status, imagem_url, fonte_url, seo_title, seo_description } = body;

  if (!titulo || !slug) {
    return NextResponse.json({ error: 'titulo e slug são obrigatórios' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('noticias')
    .insert({
      titulo,
      resumo: resumo ?? '',
      conteudo: conteudo ?? '',
      slug,
      categoria: categoria ?? 'brasil',
      status: status ?? 'rascunho',
      imagem_url: imagem_url ?? null,
      fonte_url: fonte_url ?? null,
      seo_title: seo_title ?? null,
      seo_description: seo_description ?? null,
      published_at: status === 'publicada' ? new Date().toISOString() : null,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
