import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { OverviewChart } from "@/components/overview-chart"
import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { QrCode, Scan, Users, Activity } from "lucide-react"

export default async function DashboardOverview() {
  const session = await auth()
  if (!session?.user?.id) return null

  // Total QR Codes
  const totalQRCodes = await prisma.qRCode.count({
    where: { userId: session.user.id }
  })

  // Total Scans
  const totalScans = await prisma.scanEvent.count({
    where: { qrCode: { userId: session.user.id } }
  })

  // Unique Visitors
  const uniqueVisitorsResult = await prisma.scanEvent.groupBy({
    by: ['visitorHash'],
    where: { qrCode: { userId: session.user.id } }
  })
  const uniqueVisitors = uniqueVisitorsResult.length

  // Repeat Scans
  const repeatScans = totalScans - uniqueVisitors

  // Scans last 7 days for Chart
  const last7Days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - i)
    return d.toISOString().split('T')[0]
  }).reverse()

  const scanStats = await prisma.scanEvent.findMany({
    where: { 
      qrCode: { userId: session.user.id },
      scannedAt: { gte: new Date(new Date().setDate(new Date().getDate() - 7)) }
    },
    select: { scannedAt: true, visitorHash: true }
  })

  const chartData = last7Days.map(date => {
    const dayScans = scanStats.filter(s => s.scannedAt.toISOString().startsWith(date))
    const uniqueDayScans = new Set(dayScans.map(s => s.visitorHash)).size
    return {
      name: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
      total: dayScans.length,
      unique: uniqueDayScans
    }
  })

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total QR Codes</CardTitle>
            <QrCode className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalQRCodes}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Scans</CardTitle>
            <Scan className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalScans}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unique Visitors</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{uniqueVisitors}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Repeat Scans</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{repeatScans}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Overview (Last 7 Days)</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <OverviewChart data={chartData} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
