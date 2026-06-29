import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <h1 className="text-7xl font-extrabold text-primary">404</h1>
      <p className="text-2xl font-bold text-ink mt-4">Página não encontrada</p>
      <p className="text-muted mt-2">A página que você está procurando não existe ou foi removida.</p>
      <Link href="/" className="btn-primary mt-8">
        Voltar ao início
      </Link>
    </div>
  );
}
