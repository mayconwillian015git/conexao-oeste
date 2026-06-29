import { NextResponse } from 'next/server'
import * as cheerio from 'cheerio'

export const dynamic = 'force-dynamic'

export async function GET() {
  const results: Record<string, string | null> = {
    temperatura: null,
    dolar: null,
    soja: null,
    milho: null,
    boi: null,
    trigo: null,
  }

  // Temperatura - Medianeira PR (Open-Meteo, gratuito, sem key)
  try {
    const res = await fetch(
      'https://api.open-meteo.com/v1/forecast?latitude=-25.2944&longitude=-54.0961&current=temperature_2m&timezone=America%2FSao_Paulo',
      { next: { revalidate: 1800 } }
    )
    if (res.ok) {
      const data = await res.json()
      results.temperatura = `${data.current.temperature_2m}°C`
    }
  } catch {}

  // Cotações agrícolas - Notícias Agrícolas
  try {
    const res = await fetch('https://www.noticiasagricolas.com.br/cotacoes/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html',
      },
      next: { revalidate: 3600 },
    })

    if (res.ok) {
      const html = await res.text()
      const $ = cheerio.load(html)

      // Percorre todos os itens de cotação e extrai por nome
      $('table tr, .cot-item, .cotacao-item, [class*="cotac"]').each((_, el) => {
        const text = $(el).text().replace(/\s+/g, ' ').trim()
        const cells = $(el).find('td')

        if (cells.length >= 2) {
          const nome = $(cells[0]).text().trim().toLowerCase()
          const valor = $(cells[1]).text().trim()

          if (nome.includes('milho') && !results.milho) {
            const v = valor.replace(/[^\d,.]/g, '').trim()
            if (v) results.milho = `R$ ${v}/sc`
          }
          if (nome.includes('boi') && !results.boi) {
            const v = valor.replace(/[^\d,.]/g, '').trim()
            if (v) results.boi = `R$ ${v}/@`
          }
          if (nome.includes('trigo') && !results.trigo) {
            const v = valor.replace(/[^\d,.]/g, '').trim()
            if (v) results.trigo = `R$ ${v}/t`
          }
          if (nome.includes('soja') && !results.soja) {
            const v = valor.replace(/[^\d,.]/g, '').trim()
            if (v) results.soja = `R$ ${v}/sc`
          }
        }

        // Fallback por texto corrido
        if (text.includes('Dólar') && text.includes('R$') && !results.dolar) {
          const match = text.match(/R\$\s*[\d.,]+/)
          if (match) results.dolar = match[0]
        }
      })

      // Busca por texto direto se tabelas não funcionaram
      if (!results.dolar) {
        const bodyText = $('body').text()
        const dolarMatch = bodyText.match(/Dólar[^\d]*R\$\s*([\d.,]+)/)
        if (dolarMatch) results.dolar = `R$ ${dolarMatch[1]}`
      }
    }
  } catch {}

  // Dólar fallback - AwesomeAPI
  if (!results.dolar) {
    try {
      const res = await fetch('https://economia.awesomeapi.com.br/json/last/USD-BRL', {
        next: { revalidate: 3600 },
      })
      if (res.ok) {
        const data = await res.json()
        const usd = parseFloat(data.USDBRL?.bid ?? '0')
        if (usd) results.dolar = `R$ ${usd.toFixed(2)}`
      }
    } catch {}
  }

  // Cotações manuais do banco têm prioridade sobre scraping
  try {
    const { createAdminClient } = await import('@/lib/supabase')
    const adminClient = createAdminClient()
    const { data } = await adminClient.from('ticker_config').select('chave, valor')
    if (data) {
      for (const row of data) {
        results[row.chave] = row.valor // sempre sobrescreve
      }
    }
  } catch {}

  return NextResponse.json(results)
}
