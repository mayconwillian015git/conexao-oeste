import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import Anthropic from '@anthropic-ai/sdk';
import { XMLParser } from 'fast-xml-parser';

const FEEDS = [
  { url: 'https://g1.globo.com/rss/g1/', fonte: 'G1' },
  { url: 'https://agenciabrasil.ebc.com.br/rss/ultimasnoticias/feed.xml', fonte: 'Agência Brasil' },
  { url: 'https://feeds.bbci.co.uk/portuguese/rss.xml', fonte: 'BBC Brasil' },
  { url: 'https://rss.uol.com.br/feed/noticias.xml', fonte: 'UOL' },
];

interface RssItem {
  title?: string;
  description?: string;
  link?: string;
  pubDate?: string;
  enclosure?: { '@_url'?: string };
  'media:content'?: { '@_url'?: string };
  'media:thumbnail'?: { '@_url'?: string };
}

interface ClaudeResponse {
  titulo: string;
  resumo: string;
  conteudo: string;
  seo_title: string;
  seo_description: string;
}

function gerarSlug(texto: string): string {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80)
    + '-' + Date.now();
}

function inferirCategoria(titulo: string, descricao: string): string {
  const texto = `${titulo} ${descricao}`.toLowerCase();
  if (/futebol|esporte|campeona|copa|olimp|atleta|jogo|partida|gol/.test(texto)) return 'esportes';
  if (/economia|mercado|bolsa|inflação|dólar|pib|emprego|desemprego|juro|banco central/.test(texto)) return 'economia';
  if (/tecnologia|inteligência artificial|startup|app|software|hardware|internet|digital/.test(texto)) return 'tecnologia';
  if (/saúde|hospital|vacina|doença|médico|medicina|vírus|pandemia/.test(texto)) return 'saude';
  if (/ciência|pesquisa|estudo|descoberta|nasa|espaço|planeta/.test(texto)) return 'ciencia';
  if (/cinema|música|arte|show|celebridade|entretenimento|série|filme/.test(texto)) return 'entretenimento';
  if (/mundo|guerra|exterior|eua|europa|china|oriente|onu|internacional/.test(texto)) return 'mundo';
  return 'brasil';
}

async function buscarFeed(feedUrl: string): Promise<RssItem[]> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    const res = await fetch(feedUrl, { signal: controller.signal, next: { revalidate: 0 } });
    clearTimeout(timeout);
    const xml = await res.text();

    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
      isArray: () => false,
    });
    const parsed = parser.parse(xml);
    const channel = parsed?.rss?.channel ?? parsed?.feed;
    if (!channel) return [];

    const items = channel.item ?? channel.entry ?? [];
    return Array.isArray(items) ? items : [items];
  } catch {
    return [];
  }
}

async function reescreverComClaude(conteudo: string, client: Anthropic): Promise<ClaudeResponse | null> {
  try {
    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: `Você é um editor de jornal brasileiro. Reescreva a notícia abaixo com suas próprias palavras, mantendo todos os fatos mas usando um estilo jornalístico profissional. Retorne JSON com os campos: titulo, resumo (2 frases), conteudo (texto completo reescrito em HTML simples com parágrafos <p>), seo_title (máx 60 chars), seo_description (máx 155 chars). Retorne SOMENTE o JSON, sem markdown ou texto adicional. Notícia original: ${conteudo}`,
        },
      ],
    });

    const texto = message.content[0].type === 'text' ? message.content[0].text : '';
    // Remove possíveis blocos de markdown
    const json = texto.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(json) as ClaudeResponse;
  } catch {
    return null;
  }
}

async function urlJaExiste(url: string): Promise<boolean> {
  const { count } = await supabase
    .from('noticias')
    .select('*', { count: 'exact', head: true })
    .eq('fonte_url', url);
  return (count ?? 0) > 0;
}

function verificarSecret(request: Request): boolean {
  const xSecret = request.headers.get('x-cron-secret');
  if (xSecret && xSecret === process.env.CRON_SECRET) return true;

  const auth = request.headers.get('authorization');
  if (auth && auth === `Bearer ${process.env.CRON_SECRET}`) return true;

  return false;
}

export async function POST(request: Request) {
  if (!verificarSecret(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const resultados = { processadas: 0, ignoradas: 0, erros: 0, novas: 0 };

  for (const feed of FEEDS) {
    const items = await buscarFeed(feed.url);

    // Processa no máximo 5 itens por feed por execução para evitar timeout
    const recentes = items.slice(0, 5);

    for (const item of recentes) {
      resultados.processadas++;

      const titulo = item.title ?? '';
      const descricao = item.description ?? '';
      const link = item.link ?? '';
      const imagem =
        item['media:content']?.['@_url'] ??
        item['media:thumbnail']?.['@_url'] ??
        item.enclosure?.['@_url'] ??
        null;

      if (!titulo || !link) {
        resultados.ignoradas++;
        continue;
      }

      // Verifica se a URL já existe no banco
      const jaExiste = await urlJaExiste(link);
      if (jaExiste) {
        resultados.ignoradas++;
        continue;
      }

      // Conteúdo para reescrita
      const conteudoOriginal = `Título: ${titulo}\n\n${descricao}`;

      const reescrito = await reescreverComClaude(conteudoOriginal, client);
      if (!reescrito) {
        resultados.erros++;
        continue;
      }

      const slug = gerarSlug(reescrito.titulo || titulo);
      const categoria = inferirCategoria(reescrito.titulo, reescrito.resumo ?? '');

      const { error } = await supabase.from('noticias').insert({
        titulo: reescrito.titulo || titulo,
        resumo: reescrito.resumo || '',
        conteudo: reescrito.conteudo || `<p>${descricao}</p>`,
        slug,
        categoria,
        status: 'rascunho',
        imagem_url: imagem,
        fonte_url: link,
        seo_title: reescrito.seo_title || titulo.slice(0, 60),
        seo_description: reescrito.seo_description || descricao.slice(0, 155),
      });

      if (error) {
        resultados.erros++;
      } else {
        resultados.novas++;
      }

      // Pausa breve para respeitar rate limits da API
      await new Promise((r) => setTimeout(r, 500));
    }
  }

  return NextResponse.json({
    ok: true,
    timestamp: new Date().toISOString(),
    ...resultados,
  });
}

// Permitir chamada via GET também (útil para testar no browser com CRON_SECRET na query)
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const querySecret = searchParams.get('secret');

  // Suporta secret via query param para testes manuais no browser
  const headersComSecret = new Headers(request.headers);
  if (querySecret) headersComSecret.set('x-cron-secret', querySecret);

  const newReq = new Request(request.url, {
    method: 'POST',
    headers: headersComSecret,
  });

  if (!verificarSecret(newReq)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return POST(newReq);
}
