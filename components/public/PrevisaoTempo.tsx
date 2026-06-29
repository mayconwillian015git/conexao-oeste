'use client'

import { useEffect, useState } from 'react'

interface DiaPrevisao {
  diaSemana: string
  max: number
  min: number
  codigo: number
}

interface Previsao {
  cidade: string
  temp: number
  codigo: number
  dias: DiaPrevisao[]
}

function iconeClima(codigo: number): { icon: string; label: string } {
  if (codigo === 0) return { icon: '☀️', label: 'Ensolarado' }
  if (codigo <= 2) return { icon: '⛅', label: 'Parcialmente nublado' }
  if (codigo <= 3) return { icon: '☁️', label: 'Nublado' }
  if (codigo <= 49) return { icon: '🌫️', label: 'Neblina' }
  if (codigo <= 59) return { icon: '🌦️', label: 'Chuvisco' }
  if (codigo <= 69) return { icon: '🌧️', label: 'Chuva' }
  if (codigo <= 79) return { icon: '❄️', label: 'Neve' }
  if (codigo <= 82) return { icon: '🌧️', label: 'Chuva forte' }
  if (codigo <= 86) return { icon: '❄️', label: 'Neve forte' }
  if (codigo <= 99) return { icon: '⛈️', label: 'Tempestade' }
  return { icon: '🌤️', label: 'Variável' }
}

const DIAS_SEMANA = ['Domingo', 'Segunda-Feira', 'Terça-Feira', 'Quarta-Feira', 'Quinta-Feira', 'Sexta-Feira', 'Sábado']

export default function PrevisaoTempo() {
  const [previsao, setPrevisao] = useState<Previsao | null>(null)

  useEffect(() => {
    // Medianeira PR como padrão, tenta geolocalização
    const fetchTempo = async (lat: number, lon: number, cidade: string) => {
      try {
        const res = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weathercode&daily=weathercode,temperature_2m_max,temperature_2m_min&timezone=America%2FSao_Paulo&forecast_days=6`
        )
        if (!res.ok) return
        const data = await res.json()

        const dias: DiaPrevisao[] = data.daily.time.slice(1, 6).map((d: string, i: number) => ({
          diaSemana: DIAS_SEMANA[new Date(d + 'T12:00:00').getDay()],
          max: Math.round(data.daily.temperature_2m_max[i + 1]),
          min: Math.round(data.daily.temperature_2m_min[i + 1]),
          codigo: data.daily.weathercode[i + 1],
        }))

        setPrevisao({
          cidade,
          temp: Math.round(data.current.temperature_2m),
          codigo: data.current.weathercode,
          dias,
        })
      } catch {}
    }

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude, longitude } = pos.coords
          let cidade = 'Sua cidade'
          try {
            const geoRes = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&accept-language=pt-BR`,
              { headers: { 'User-Agent': 'ConexaoOeste/1.0' } }
            )
            if (geoRes.ok) {
              const geoData = await geoRes.json()
              cidade = geoData.address?.city || geoData.address?.town || geoData.address?.village || 'Sua cidade'
            }
          } catch {}
          fetchTempo(latitude, longitude, cidade)
        },
        () => fetchTempo(-25.2944, -54.0961, 'Medianeira')
      )
    } else {
      fetchTempo(-25.2944, -54.0961, 'Medianeira')
    }
  }, [])

  if (!previsao) return null

  const atual = iconeClima(previsao.codigo)

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      <div className="flex items-center divide-x divide-gray-100 overflow-x-auto">
        {/* Cidade + temp atual */}
        <div className="flex-shrink-0 flex items-center gap-4 px-6 py-4 min-w-[200px]">
          <div>
            <p className="text-xs font-bold text-gray-800 uppercase tracking-wide">{previsao.cidade}</p>
            <p className="text-xs text-gray-400 uppercase tracking-wide">Previsão do Tempo</p>
          </div>
          <span className="text-4xl">{atual.icon}</span>
          <div>
            <p className="text-2xl font-bold text-gray-900">{previsao.temp}°C</p>
            <p className="text-xs text-gray-400">{atual.label}</p>
          </div>
        </div>

        {/* Dias */}
        {previsao.dias.map((dia, i) => {
          const { icon } = iconeClima(dia.codigo)
          return (
            <div key={i} className="flex-shrink-0 flex flex-col items-center px-5 py-4 gap-1 min-w-[110px]">
              <span className="text-xs font-medium text-gray-500">{dia.diaSemana}</span>
              <span className="text-2xl">{icon}</span>
              <div className="flex gap-2 text-sm font-semibold">
                <span className="text-orange-500">{dia.max}°C</span>
                <span className="text-blue-400">{dia.min}°C</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
