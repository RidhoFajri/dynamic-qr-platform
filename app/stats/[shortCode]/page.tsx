import { notFound } from "next/navigation"
import prisma from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { ExternalLink, BarChart3 } from "lucide-react"

export default async function PublicAnalyticsPage({ params }: { params: Promise<{ shortCode: string }> }) {
  const resolvedParams = await params
  const shortCode = resolvedParams.shortCode

  const qr = await prisma.qRCode.findUnique({
    where: { shortCode },
    include: {
      scanEvents: {
        orderBy: { scannedAt: 'desc' }
      }
    }
  })

  if (!qr) notFound()

  // Analytics Calculation
  const totalScans = qr.scanEvents.length
  const uniqueVisitorsSet = new Set(qr.scanEvents.map(s => s.visitorHash))
  const uniqueVisitors = uniqueVisitorsSet.size
  const repeatScans = totalScans - uniqueVisitors

  // Location Aggregation
  const locationMap = qr.scanEvents.reduce((acc, curr) => {
    const loc = curr.city ? `${curr.city}, ${curr.country}` : 'Unknown'
    acc[loc] = (acc[loc] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  
  const locations = Object.entries(locationMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)

  // Device Aggregation
  const deviceMap = qr.scanEvents.reduce((acc, curr) => {
    const dev = curr.deviceType || 'Unknown'
    acc[dev] = (acc[dev] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  
  const devices = Object.entries(deviceMap).sort((a, b) => b[1] - a[1])

  return (
    <div className="min-h-screen bg-muted/40 p-4 md:p-10">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1 text-muted-foreground">
              <BarChart3 className="h-5 w-5 text-primary" />
              <span className="font-semibold text-sm uppercase tracking-wider text-primary">Public Analytics Dashboard</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">{qr.name}</h1>
            <div className="flex items-center gap-2 text-muted-foreground mt-2">
              <span className="font-mono text-sm">/r/{qr.shortCode}</span>
              <Badge variant={qr.status === 'ACTIVE' ? 'default' : qr.status === 'PAUSED' ? 'secondary' : 'outline'}>
                {qr.status}
              </Badge>
            </div>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="space-y-6 md:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div>
                  <div className="font-medium">Destination URL</div>
                  <a href={qr.destinationUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1 break-all">
                    {qr.destinationUrl} <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
                {qr.description && (
                  <div>
                    <div className="font-medium">Description</div>
                    <div className="text-muted-foreground">{qr.description}</div>
                  </div>
                )}
                <div>
                  <div className="font-medium">Created At</div>
                  <div className="text-muted-foreground">{format(qr.createdAt, 'PPp')}</div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6 md:col-span-2">
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Scans</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalScans}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Unique Visitors</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{uniqueVisitors}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Repeat Scans</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{repeatScans}</div>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Top Locations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {locations.length > 0 ? locations.map(([loc, count]) => (
                      <div key={loc} className="flex items-center justify-between">
                        <span className="text-sm">{loc}</span>
                        <span className="text-sm font-medium">{count}</span>
                      </div>
                    )) : (
                      <div className="text-sm text-muted-foreground">No location data yet.</div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Devices</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {devices.length > 0 ? devices.map(([dev, count]) => (
                      <div key={dev} className="flex items-center justify-between">
                        <span className="text-sm capitalize">{dev}</span>
                        <span className="text-sm font-medium">{count}</span>
                      </div>
                    )) : (
                      <div className="text-sm text-muted-foreground">No device data yet.</div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {qr.scanEvents.slice(0, 10).map((scan) => (
                    <div key={scan.id} className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">
                          {scan.city ? `${scan.city}, ${scan.country}` : 'Unknown Location'}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {scan.browser} on {scan.os}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground text-right">
                        {format(scan.scannedAt, 'MMM d, h:mm a')}
                        <div className="text-[10px] mt-0.5 capitalize">
                          {scan.isBot ? "Bot" : "Human"}
                        </div>
                      </div>
                    </div>
                  ))}
                  {qr.scanEvents.length === 0 && (
                    <div className="text-sm text-muted-foreground text-center py-4">No scans yet.</div>
                  )}
                </div>
              </CardContent>
            </Card>

          </div>
        </div>
      </div>
    </div>
  )
}
