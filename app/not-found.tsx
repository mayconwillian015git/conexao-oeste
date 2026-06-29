import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-8xl font-bold text-blue-800 mb-4">404</h1>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Página não encontrada</h2>
        <p className="text-gray-600 mb-8">
          O conteúdo que você procura não existe ou foi removido.
        </p>
        <Link
          href="/"
          className="inline-block bg-blue-800 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
        >
          Voltar para a home
        </Link>
      </div>
    </div>
  )
}
