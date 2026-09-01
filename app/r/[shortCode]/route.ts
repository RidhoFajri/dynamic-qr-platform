import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import crypto from "crypto"
import { UAParser } from "ua-parser-js"
import { isbot } from "isbot"

export async function GET(req: NextRequest, { params }: { params: Promise<{ shortCode: string }> }) {
  const resolvedParams = await params;
  const shortCode = resolvedParams.shortCode;
  
  const qr = await prisma.qRCode.findUnique({
    where: { shortCode }
  })

  // Basic validation
  if (!qr) {
    return NextResponse.redirect(new URL("/not-found", req.url))
  }
  
  if (qr.status === "PAUSED") {
    return NextResponse.redirect(new URL("/inactive", req.url))
  }

  if (qr.expiresAt && qr.expiresAt < new Date()) {
    // Also auto-update status to EXPIRED?
    // Doing it synchronously here is okay but slowing down redirect
    return NextResponse.redirect(new URL("/expired", req.url))
  }

  // --- 1. Identity & Visitor Hash ---
  let visitorId = req.cookies.get("visitor_id")?.value
  const response = NextResponse.redirect(qr.destinationUrl, 307)
  
  if (!visitorId) {
    visitorId = crypto.randomUUID()
    // Secure cookie for 1 year
    response.cookies.set("visitor_id", visitorId, {
      maxAge: 60 * 60 * 24 * 365,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    })
  }

  // Hash the visitor ID for privacy
  const visitorHash = crypto.createHash('sha256').update(visitorId + process.env.AUTH_SECRET).digest('hex')

  // --- 2. Request Parsing ---
  const userAgent = req.headers.get("user-agent") || ""
  const parser = new UAParser(userAgent)
  const browser = parser.getBrowser().name
  const os = parser.getOS().name
  let deviceType: string | undefined = parser.getDevice().type
  const isBotRequest = isbot(userAgent)
  
  if (isBotRequest) {
    deviceType = "Bot"
  } else if (!deviceType) {
    deviceType = "Desktop"
  }

  // --- 3. Geolocation ---
  // Using Vercel Headers (fallbacks to unknown if not deployed on Vercel)
  const countryCode = req.headers.get("x-vercel-ip-country") || null
  const city = req.headers.get("x-vercel-ip-city") ? decodeURIComponent(req.headers.get("x-vercel-ip-city")!) : null
  const region = req.headers.get("x-vercel-ip-country-region") || null

  // We map country code to Country name typically, but we can just store what we get
  // In a real app we might use `Intl.DisplayNames` to get the full country name:
  let country = countryCode
  if (countryCode) {
    try {
      const regionNames = new Intl.DisplayNames(['en'], { type: 'region' })
      country = regionNames.of(countryCode) || countryCode
    } catch (e) {
      // fallback
    }
  }

  // --- 4. Anonymized IP (Optional) ---
  const ip = req.headers.get("x-forwarded-for") || "127.0.0.1"
  const ipHash = crypto.createHash('sha256').update(ip + process.env.AUTH_SECRET).digest('hex')

  const referrer = req.headers.get("referer") || null

  // --- 5. Record Event asynchronously without blocking response ---
  // Note: Vercel serverless functions might terminate immediately after response is returned.
  // In Next.js 14/15, using `waitUntil` (or experimentally `after`) is ideal.
  // We'll await it here for simplicity and safety across all providers, but keep it fast.
  try {
    await prisma.scanEvent.create({
      data: {
        qrCodeId: qr.id,
        visitorHash,
        city,
        region,
        country,
        countryCode,
        deviceType,
        browser,
        os,
        referrer,
        ipHash,
        isBot: isBotRequest
      }
    })
  } catch (error) {
    console.error("Failed to record scan event", error)
  }

  return response
}
