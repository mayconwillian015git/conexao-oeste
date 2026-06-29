import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// TheSportsDB - gratuito, Copa do Mundo 2026 league ID: 4429
const LEAGUE_ID = '4429'
const SEASON = '2026'
const BASE = 'https://www.thesportsdb.com/api/v1/json/3'

export async function GET() {
  try {
    // Busca todos os jogos da temporada
    const seasonRes = await fetch(
      `${BASE}/eventsseason.php?id=${LEAGUE_ID}&s=${SEASON}`,
      { next: { revalidate: 300 } }
    )
    const seasonData = seasonRes.ok ? await seasonRes.json() : { events: [] }
    const all: any[] = seasonData.events ?? []

    const now = new Date()

    const past = all
      .filter(e => e.intHomeScore !== null && e.intHomeScore !== '')
      .sort((a, b) => new Date(b.dateEvent).getTime() - new Date(a.dateEvent).getTime())
      .slice(0, 20)
      .map(e => ({
        id: e.idEvent,
        data: e.dateEvent,
        hora: e.strTime,
        timeA: e.strHomeTeam,
        timeB: e.strAwayTeam,
        golsA: e.intHomeScore,
        golsB: e.intAwayScore,
        encerrado: true,
      }))

    const next = all
      .filter(e => (e.intHomeScore === null || e.intHomeScore === '' || e.intHomeScore === 'null'))
      .sort((a, b) => new Date(a.dateEvent).getTime() - new Date(b.dateEvent).getTime())
      .slice(0, 30)
      .map(e => ({
        id: e.idEvent,
        data: e.dateEvent,
        hora: e.strTime,
        timeA: e.strHomeTeam,
        timeB: e.strAwayTeam,
        golsA: null,
        golsB: null,
        encerrado: false,
      }))

    return NextResponse.json({ past, next })
  } catch {
    return NextResponse.json({ past: [], next: [] })
  }
}
