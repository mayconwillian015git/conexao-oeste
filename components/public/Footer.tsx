import Link from 'next/link'
import { CATEGORIAS } from '@/lib/types'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="bg-gray-900 text-gray-300 mt-12">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="text-white font-bold text-xl mb-3">Conexão Oeste</div>
            <p className="text-sm text-gray-400 leading-relaxed">
              O portal de notícias do Oeste do Paraná. Cobertura regional com informação de qualidade
              para Medianeira, Itaipulândia, Matelândia, Missal, Santa Helena, São Miguel do Iguaçu
              e toda a região.
            </p>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-white font-semibold mb-3 text-sm uppercase tracking-wide">
              Editorias
            </h3>
            <ul className="grid grid-cols-2 gap-1">
              {CATEGORIAS.slice(0, 10).map((cat) => (
                <li key={cat}>
                  <Link
                    href={`/${cat.toLowerCase().replace(/ /g, '-')}`}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    {cat}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Info */}
          <div>
            <h3 className="text-white font-semibold mb-3 text-sm uppercase tracking-wide">
              Informações
            </h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link href="/sobre" className="hover:text-white transition-colors">
                  Sobre o Portal
                </Link>
              </li>
              <li>
                <Link href="/contato" className="hover:text-white transition-colors">
                  Contato / Redação
                </Link>
              </li>
              <li>
                <Link href="/politica-de-privacidade" className="hover:text-white transition-colors">
                  Política de Privacidade
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-white transition-colors">
                  Área Administrativa
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-6 text-center text-xs text-gray-500">
          &copy; {year} Conexão Oeste. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  )
}
