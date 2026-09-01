"use client"

import { useEffect, useState } from "react"
import QRCode from "qrcode"
import { Button } from "@/components/ui/button"
import { Download, Link as LinkIcon, Loader2 } from "lucide-react"

export default function QRCodePreview({ shortCode }: { shortCode: string }) {
  const [qrDataUrl, setQrDataUrl] = useState<string>("")
  const [loading, setLoading] = useState(true)

  const url = typeof window !== "undefined" ? `${window.location.origin}/r/${shortCode}` : ""

  useEffect(() => {
    if (!url) return
    setLoading(true)
    QRCode.toDataURL(url, {
      width: 400,
      margin: 2,
      color: {
        dark: "#000000",
        light: "#ffffff",
      },
    })
      .then((url) => {
        setQrDataUrl(url)
        setLoading(false)
      })
      .catch((err) => {
        console.error(err)
        setLoading(false)
      })
  }, [url])

  const handleDownload = () => {
    if (!qrDataUrl) return
    const a = document.createElement("a")
    a.href = qrDataUrl
    a.download = `qr-${shortCode}.png`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  const handleCopyUrl = () => {
    if (url) {
      navigator.clipboard.writeText(url)
    }
  }

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <div className="aspect-square w-full max-w-[250px] bg-muted flex items-center justify-center rounded-md overflow-hidden relative border">
        {loading ? (
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        ) : (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={qrDataUrl} alt="QR Code" className="w-full h-full object-contain" />
        )}
      </div>
      <div className="flex gap-2 w-full max-w-[250px]">
        <Button onClick={handleDownload} className="flex-1" variant="default" disabled={!qrDataUrl}>
          <Download className="mr-2 h-4 w-4" /> Download
        </Button>
        <Button onClick={handleCopyUrl} variant="outline" size="icon">
          <LinkIcon className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
