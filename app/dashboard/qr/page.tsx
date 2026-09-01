import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import prisma from "@/lib/prisma"
import { auth } from "@/auth"
import Link from "next/link"
import { format } from "date-fns"
import { LocalTime } from "@/components/local-time"
import { Plus } from "lucide-react"
import { changeQRStatus, deleteQRCode } from "./actions"
import { QRListActions } from "@/components/qr-list-actions"

export default async function QRListPage() {
  const session = await auth()
  if (!session?.user?.id) return null

  const qrCodes = await prisma.qRCode.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { scanEvents: true }
      }
    }
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">QR Codes</h1>
        <Link href="/dashboard/qr/new" className={buttonVariants()}>
          <Plus className="mr-2 h-4 w-4" /> Create QR Code
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All QR Codes</CardTitle>
          <CardDescription>Manage and view analytics for all your dynamic QR codes.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Short URL</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Total Scans</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {qrCodes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No QR codes found. Create one to get started.
                  </TableCell>
                </TableRow>
              ) : qrCodes.map((qr) => (
                <TableRow key={qr.id}>
                  <TableCell className="font-medium">
                    <Link href={`/dashboard/qr/${qr.id}`} className="hover:underline">
                      {qr.name}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground font-mono text-sm">
                    /r/{qr.shortCode}
                  </TableCell>
                  <TableCell>
                    <Badge variant={qr.status === 'ACTIVE' ? 'default' : qr.status === 'PAUSED' ? 'secondary' : 'outline'}>
                      {qr.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{qr._count.scanEvents}</TableCell>
                  <TableCell>
                    <div className="text-muted-foreground">
                      <LocalTime date={qr.createdAt} formatStr="MMM d, yyyy" />
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <QRListActions qr={qr} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
