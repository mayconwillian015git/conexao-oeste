import AdminSidebar from '@/components/admin/AdminSidebar'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-auto">
        <main className="flex-1 p-6 md:p-8 max-w-6xl w-full">{children}</main>
      </div>
    </div>
  )
}
