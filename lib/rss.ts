import Parser from 'rss-parser'

export interface RSSItem {
  title: string
  link: string
  content: string
  pubDate: string
  source: string
  imageUrl?: string
}

const parser = new Parser({
  customFields: {
    item: ['content:encoded', 'description', 'enclosure', 'media:content', 'media:thumbnail'],
  },
})

function extractImageFromItem(item: Record<string, unknown>): string | undefined {
  // enclosure (padrão RSS)
  const enc = item['enclosure'] as { url?: string; type?: string } | undefined
  if (enc?.url && enc?.type?.startsWith('image')) return enc.url

  // media:content
  const media = item['media:content'] as { $?: { url?: string } } | undefined
  if (media?.$?.url) return media.$.url

  // media:thumbnail
  const thumb = item['media:thumbnail'] as { $?: { url?: string } } | undefined
  if (thumb?.$?.url) return thumb.$.url

  // imagem dentro do content:encoded ou description
  const html = (item['content:encoded'] as string) || (item['content'] as string) || ''
  const match = html.match(/<img[^>]+src=["']([^"']+)["']/i)
  if (match) return match[1]

  return undefined
}

export async function fetchRSSFeed(url: string, sourceName: string): Promise<RSSItem[]> {
  try {
    const feed = await parser.parseURL(url)

    return feed.items.map((item) => ({
      title: item.title ?? '',
      link: item.link ?? '',
      content:
        (item['content:encoded'] as string) ||
        item.content ||
        item.contentSnippet ||
        item.summary ||
        '',
      pubDate: item.pubDate ?? new Date().toISOString(),
      source: sourceName,
      imageUrl: extractImageFromItem(item as Record<string, unknown>),
    }))
  } catch (error) {
    console.error(`[RSS] Error fetching ${url}:`, error)
    return []
  }
}

// Normalize title for duplicate detection
export function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove accents
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 100) // compare first 100 chars
}
