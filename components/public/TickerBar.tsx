'use client'

import { useEffect, useState } from 'react'

interface TickerData {
  temperatura: string | null
  dolar: string | null
  soja: string | null
  milho: string | null
  boi: string | null
  trigo: string | null
}

export default function TickerBar() {
  const [data, setData] = useState<TickerData | null>(null)
  const [temperatura, setTemperatura] = useState<string | null>(null)
  const [cidade, setCidade] = useState<string>('Sua cidade')

  useEffect(() => {
    fetch('/api/ticker')
      .then(r => r.json())
      .then(setData)
      .catch(() => {})

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(async (pos) => {
        const { latitude, longitude } = pos.coords
        try {
          const tempRes = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m&timezone=auto`
          )
          if (tempRes.ok) {
            const tempData = await tempRes.json()
            setTemperatura(`${tempData.current.temperature_2m}°C`)
          }
          const geoRes = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&accept-language=pt-BR`,
            { headers: { 'User-Agent': 'ConexaoOeste/1.0' } }
          )
          if (geoRes.ok) {
            const geoData = await geoRes.json()
            const nome = geoData.address?.city || geoData.address?.town || geoData.address?.village || 'Sua cidade'
            setCidade(nome)
          }
        } catch {}
      }, () => {})
    }
  }, [])

  if (!data) return null

  const tempFinal = temperatura ?? data.temperatura
  const items = [
    tempFinal  && { icon: '🌡', label: cidade,      value: tempFinal },
    data.dolar && { icon: '💵', label: 'Dólar',     value: data.dolar },
    data.soja  && { icon: '🌱', label: 'Soja',      value: data.soja },
    data.milho && { icon: '🌽', label: 'Milho',     value: data.milho },
    data.boi   && { icon: '🐂', label: 'Boi Gordo', value: data.boi },
    data.trigo && { icon: '🌾', label: 'Trigo',     value: data.trigo },
  ].filter(Boolean) as { icon: string; label: string; value: string }[]

  if (items.length === 0) return null

  const repeated = [...items, ...items, ...items]

  return (
    <div className="overflow-hidden border-b border-blue-900" style={{ background: '#1a1a6e', height: 36 }}>
      <div className="flex items-center h-full">
        {/* Badge fixo */}
        <div className="flex-shrink-0 flex items-center gap-1.5 px-3 h-full z-10" style={{ background: '#5b21b6' }}>
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
          <span className="text-white text-xs font-bold uppercase tracking-widest">Ao vivo</span>
        </div>

        {/* Ticker */}
        <div className="overflow-hidden flex-1 h-full relative">
          <div
            className="flex items-center h-full"
            style={{
              animation: 'ticker-scroll 40s linear infinite',
              whiteSpace: 'nowrap',
              willChange: 'transform',
            }}
          >
            {repeated.map((item, i) => (
              <span key={i} className="inline-flex items-center gap-2 px-5 text-xs">
                <span>{item.icon}</span>
                <span style={{ color: '#93c5fd' }} className="font-medium">{item.label}</span>
                <span className="text-white font-bold">{item.value}</span>
                <span style={{ color: '#3b4fd8' }} className="mx-1 text-sm">|</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes ticker-scroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-33.333%); }
        }
      `}</style>
    </div>
  )
}
