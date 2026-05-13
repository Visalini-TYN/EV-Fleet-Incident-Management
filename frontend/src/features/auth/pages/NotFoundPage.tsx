import { Link, useNavigate } from "react-router-dom"
import {
  HelpCircle,
  LayoutDashboard,
  Map,
  Search,
  ShieldAlert,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useAuth } from "@/features/auth/auth-context"

function getDashboardPath(role: string | null | undefined): string {
  const normalizedRole = role?.toLowerCase()
  if (normalizedRole === "manager") return "/manager"
  if (normalizedRole === "admin" || normalizedRole === "vendor_admin" || normalizedRole === "vendor-admin") {
    return "/home"
  }
  return "/driver"
}

export default function NotFoundPage() {
  const navigate = useNavigate()
  const { role, status } = useAuth()
  const dashboardPath = getDashboardPath(role)
  const activeIncidentsPath = role?.toLowerCase() === "manager" ? "/manager/active" : "/admin/vehicle"

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <main className="flex flex-1 items-center justify-center px-6 py-16">
        <div className="w-full max-w-4xl text-center">
          <div className="relative mb-12 flex justify-center">
            <div className="absolute inset-0 scale-110 rounded-full bg-blue-500/5 blur-3xl" />
            <div className="relative flex h-56 w-56 items-center justify-center rounded-full border border-blue-100 bg-white shadow-sm">
              <ShieldAlert className="h-24 w-24 text-blue-600" />
            </div>
          </div>

          <div className="space-y-4">
            <h1 className="text-6xl font-bold text-blue-700">404</h1>
            <h2 className="text-4xl font-semibold text-slate-900">
              Page Not Found
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-slate-500">
              We can&apos;t seem to find the page you&apos;re looking for. It might have been moved or deleted.
            </p>
          </div>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button
              className="h-12 gap-2 px-8 text-sm font-semibold"
              onClick={() => navigate(dashboardPath)}
            >
              <LayoutDashboard className="h-5 w-5" />
              Return to Dashboard
            </Button>

            <Button
              variant="outline"
              className="h-12 gap-2 px-8 text-sm font-semibold"
              onClick={() => navigate(activeIncidentsPath)}
            >
              <ShieldAlert className="h-5 w-5" />
              View Incidents
            </Button>
          </div>

          <Card className="mx-auto mt-14 max-w-2xl border-slate-200 shadow-sm">
            <CardContent className="p-8">
              <p className="mb-6 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                Or try one of these
              </p>

              <div className="flex flex-wrap justify-center gap-8">
                <Link
                  to={dashboardPath}
                  className="flex items-center gap-2 text-sm font-medium text-blue-700 transition hover:underline"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Link>

                <Link
                  to={activeIncidentsPath}
                  className="flex items-center gap-2 text-sm font-medium text-blue-700 transition hover:underline"
                >
                  <ShieldAlert className="h-4 w-4" />
                  Incidents
                </Link>

                <Link
                  to="/manager/audit"
                  className="flex items-center gap-2 text-sm font-medium text-blue-700 transition hover:underline"
                >
                  <Search className="h-4 w-4" />
                  Search Archive
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-5 text-sm md:flex-row">
          <div className="text-xl font-semibold text-blue-700">
            Fleet Assurance Identity
          </div>

          <div className="flex flex-wrap items-center gap-6 text-slate-500">
            <a href="#" className="transition hover:text-blue-700">
              Support
            </a>

            <a href="#" className="transition hover:text-blue-700">
              Privacy Policy
            </a>

            <a href="#" className="transition hover:text-blue-700">
              System Status
            </a>
          </div>

          <div className="text-slate-400">
            © 2024 Fleet Assurance Identity. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
