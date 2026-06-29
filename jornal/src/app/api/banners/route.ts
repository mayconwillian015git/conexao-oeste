import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  const { data, error } = await supabase
    .from('banners')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const body = await request.json();
  const { imagem_url, link, ativo } = body;

  if (!imagem_url) {
    return NextResponse.json({ error: 'imagem_url é obrigatória' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('banners')
    .insert({ imagem_url, link: link || null, ativo: ativo ?? false })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
