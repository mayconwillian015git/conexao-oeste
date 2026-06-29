// Login page has its own full-screen layout – no admin sidebar
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
