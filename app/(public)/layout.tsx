import Header from '@/components/public/Header'
import Footer from '@/components/public/Footer'
import HeaderBanner from '@/components/public/HeaderBanner'
import TickerBar from '@/components/public/TickerBar'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <HeaderBanner />
      <TickerBar />
      <main className="flex-1">{children}</main>
      <Footer />
      <a
        href="/admin"
        className="fixed bottom-5 right-5 z-50 bg-blue-800 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-2 rounded-full shadow-lg flex items-center gap-1.5 transition-colors"
        title="Área administrativa"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
        Admin
      </a>
    </div>
  )
}
