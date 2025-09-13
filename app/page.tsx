import { AuthGuard } from "@/components/auth-guard"
import { Dashboard } from "@/components/dashboard"

export default function Home() {
  return (
    <AuthGuard>
      <Dashboard />
    </AuthGuard>
  )
}

