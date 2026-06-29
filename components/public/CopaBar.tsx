'use client'

import { useEffect, useState, useRef } from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface Jogo {
  id: string
  data: string
  hora: string
  timeA: string
  timeB: string
  golsA: number | null
  golsB: number | null
  encerrado: boolean
}

// Mapeamento de nome do país para código ISO (para flagcdn.com)
const FLAG_MAP: Record<string, string> = {
  'Brazil': 'br', 'Argentina': 'ar', 'France': 'fr', 'Germany': 'de',
  'Spain': 'es', 'Portugal': 'pt', 'England': 'gb-eng', 'Italy': 'it',
  'Netherlands': 'nl', 'Belgium': 'be', 'Croatia': 'hr', 'Morocco': 'ma',
  'Japan': 'jp', 'South Korea': 'kr', 'Australia': 'au', 'USA': 'us',
  'United States': 'us', 'Mexico': 'mx', 'Canada': 'ca', 'Uruguay': 'uy',
  'Colombia': 'co', 'Chile': 'cl', 'Ecuador': 'ec', 'Peru': 'pe',
  'Venezuela': 've', 'Bolivia': 'bo', 'Paraguay': 'py', 'Panama': 'pa',
  'Costa Rica': 'cr', 'Honduras': 'hn', 'El Salvador': 'sv', 'Jamaica': 'jm',
  'Trinidad and Tobago': 'tt', 'Cuba': 'cu', 'Haiti': 'ht',
  'Senegal': 'sn', 'Nigeria': 'ng', 'Ghana': 'gh', 'Cameroon': 'cm',
  'Ivory Coast': 'ci', 'Mali': 'ml', 'Egypt': 'eg', 'Algeria': 'dz',
  'Tunisia': 'tn', 'South Africa': 'za', 'Kenya': 'ke', 'Angola': 'ao',
  'Switzerland': 'ch', 'Austria': 'at', 'Poland': 'pl', 'Denmark': 'dk',
  'Sweden': 'se', 'Norway': 'no', 'Finland': 'fi', 'Ireland': 'ie',
  'Scotland': 'gb-sct', 'Wales': 'gb-wls', 'Ukraine': 'ua', 'Turkey': 'tr',
  'Greece': 'gr', 'Czech Republic': 'cz', 'Slovakia': 'sk', 'Hungary': 'hu',
  'Romania': 'ro', 'Serbia': 'rs', 'Slovenia': 'si', 'Albania': 'al',
  'Saudi Arabia': 'sa', 'Iran': 'ir', 'Qatar': 'qa', 'UAE': 'ae',
  'Australia': 'au', 'New Zealand': 'nz', 'China': 'cn', 'India': 'in',
  'Indonesia': 'id', 'Thailand': 'th', 'Vietnam': 'vn', 'Philippines': 'ph',
}

function getFlag(country: string): string | null {
  const code = FLAG_MAP[country]
  if (!code) return null
  return `https://flagcdn.com/w40/${code}.png`
}

function JogoCard({ jogo }: { jogo: Jogo }) {
  const dataFormatada = jogo.data
    ? format(new Date(jogo.data + 'T12:00:00'), "dd/MM", { locale: ptBR })
    : ''
  const hora = jogo.hora ? jogo.hora.slice(0, 5) : ''
  const flagA = getFlag(jogo.timeA)
  const flagB = getFlag(jogo.timeB)

  return (
    <div
      className={`flex-shrink-0 flex items-center gap-1.5 rounded-lg px-2 py-1.5 border ${
        jogo.encerrado ? 'bg-white border-gray-200' : 'bg-blue-50 border-blue-200'
      }`}
      title={`${jogo.timeA} x ${jogo.timeB} — ${dataFormatada}`}
    >
      {/* Bandeira A */}
      {flagA
        ? <img src={flagA} alt={jogo.timeA} className="w-6 h-4 object-cover rounded border border-gray-200 flex-shrink-0" />
        : <span className="text-xs font-bold text-gray-500 w-6 text-center">{jogo.timeA?.slice(0,3)}</span>
      }

      {/* Placar */}
      {jogo.encerrado ? (
        <span className="text-xs font-bold text-gray-900 tabular-nums whitespace-nowrap px-1">
          {jogo.golsA}×{jogo.golsB}
        </span>
      ) : (
        <span className="text-xs text-gray-500 whitespace-nowrap px-1">{dataFormatada}</span>
      )}

      {/* Bandeira B */}
      {flagB
        ? <img src={flagB} alt={jogo.timeB} className="w-6 h-4 object-cover rounded border border-gray-200 flex-shrink-0" />
        : <span className="text-xs font-bold text-gray-500 w-6 text-center">{jogo.timeB?.slice(0,3)}</span>
      }
    </div>
  )
}

export default function CopaBar() {
  const [past, setPast] = useState<Jogo[]>([])
  const [next, setNext] = useState<Jogo[]>([])
  const [aba, setAba] = useState<'resultados' | 'proximos'>('resultados')
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch('/api/copa')
      .then(r => r.json())
      .then(data => {
        setPast(data.past ?? [])
        setNext(data.next ?? [])
      })
      .catch(() => {})
  }, [])

  function scroll(dir: 'left' | 'right') {
    scrollRef.current?.scrollBy({ left: dir === 'right' ? 210 : -210, behavior: 'smooth' })
  }

  const jogos = aba === 'resultados' ? past : next
  if (past.length === 0 && next.length === 0) return null

  return (
    <div className="bg-gray-50 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 py-2">
        <div className="flex items-center gap-3">
          {/* Label fixo */}
          <div className="flex-shrink-0 flex items-center gap-2 pr-3 border-r border-gray-300">
            <span className="text-base">🏆</span>
            <div className="flex flex-col leading-tight">
              <span className="font-bold text-gray-900 text-xs">Copa do Mundo</span>
              <span className="text-gray-400 text-xs">2026</span>
            </div>
            <div className="flex flex-col gap-0.5 ml-1">
              <button
                onClick={() => setAba('resultados')}
                className={`text-xs font-semibold px-2 py-0.5 rounded transition-colors ${
                  aba === 'resultados' ? 'bg-blue-800 text-white' : 'text-gray-500 hover:bg-gray-200'
                }`}
              >
                Resultados
              </button>
              <button
                onClick={() => setAba('proximos')}
                className={`text-xs font-semibold px-2 py-0.5 rounded transition-colors ${
                  aba === 'proximos' ? 'bg-blue-800 text-white' : 'text-gray-500 hover:bg-gray-200'
                }`}
              >
                Próximos
              </button>
            </div>
          </div>

          {/* Seta esquerda */}
          <button
            onClick={() => scroll('left')}
            className="flex-shrink-0 w-6 h-6 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Jogos */}
          {jogos.length === 0 ? (
            <p className="text-xs text-gray-400">Nenhum jogo encontrado.</p>
          ) : (
            <div
              ref={scrollRef}
              className="flex gap-2 overflow-x-auto flex-1 scroll-smooth"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {jogos.map(j => <JogoCard key={j.id} jogo={j} />)}
            </div>
          )}

          {/* Seta direita */}
          <button
            onClick={() => scroll('right')}
            className="flex-shrink-0 w-6 h-6 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
