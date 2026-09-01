import { ReactNode } from "react"
import Link from "next/link"
import { auth, signOut } from "@/auth"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, QrCode, Settings, LogOut } from "lucide-react"

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const session = await auth()

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-card border-r border-border flex flex-col hidden md:flex">
        <div className="p-6 border-b border-border">
          <Link href="/dashboard" className="flex items-center gap-2 font-bold text-xl text-primary">
            <QrCode className="h-6 w-6" />
            <span>QR Analytics</span>
          </Link>
        </div>
        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent text-accent-foreground transition-colors font-medium">
            <LayoutDashboard className="h-5 w-5" />
            Overview
          </Link>
          <Link href="/dashboard/qr" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent text-accent-foreground transition-colors font-medium">
            <QrCode className="h-5 w-5" />
            QR Codes
          </Link>
        </nav>
        <div className="p-4 border-t border-border">
          <div className="mb-4 px-3 text-sm font-medium text-muted-foreground truncate">
            {session?.user?.email}
          </div>
          <form action={async () => {
            "use server"
            await signOut({ redirectTo: "/login" })
          }}>
            <Button variant="ghost" className="w-full justify-start gap-3" type="submit">
              <LogOut className="h-5 w-5" />
              Logout
            </Button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 bg-muted/20">
        <div className="p-6 md:p-8 max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
