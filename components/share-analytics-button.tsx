"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Share2, Check } from "lucide-react"
import { toast } from "sonner"

export function ShareAnalyticsButton({ shortCode }: { shortCode: string }) {
  const [copied, setCopied] = useState(false)

  const handleShare = async () => {
    try {
      const url = `${window.location.origin}/stats/${shortCode}`
      await navigator.clipboard.writeText(url)
      setCopied(true)
      toast.success("Analytics link copied to clipboard!")
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      toast.error("Failed to copy link")
    }
  }

  return (
    <Button variant="outline" onClick={handleShare}>
      {copied ? <Check className="mr-2 h-4 w-4 text-green-500" /> : <Share2 className="mr-2 h-4 w-4" />}
      {copied ? "Copied" : "Share Stats"}
    </Button>
  )
}
