import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import prisma from "@/lib/prisma"

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  const resolvedParams = await params
  const qrId = resolvedParams.id

  const qr = await prisma.qRCode.findUnique({
    where: { id: qrId, userId: session.user.id },
    include: {
      scanEvents: {
        orderBy: { scannedAt: "desc" }
      }
    }
  })

  if (!qr) {
    return new NextResponse("Not Found", { status: 404 })
  }

  // Generate CSV Content
  const headers = ["Timestamp", "Country", "City", "Device", "OS", "Browser", "Bot", "Referrer"]
  
  const rows = qr.scanEvents.map(scan => {
    return [
      scan.scannedAt.toISOString(),
      scan.country || "Unknown",
      scan.city || "Unknown",
      scan.deviceType || "Unknown",
      scan.os || "Unknown",
      scan.browser || "Unknown",
      scan.isBot ? "Yes" : "No",
      scan.referrer || "Direct"
    ].map(field => `"${field.replace(/"/g, '""')}"`).join(",") // Escape quotes and join
  })

  const csvContent = [headers.join(","), ...rows].join("\n")

  return new NextResponse(csvContent, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="qr-stats-${qr.shortCode}.csv"`
    }
  })
}
