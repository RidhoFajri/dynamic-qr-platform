"use client"

import { Button, buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useState } from "react"
import { createQRCode } from "../actions"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function NewQRCodePage() {
  const [isPending, setIsPending] = useState(false)
  const router = useRouter()

  async function onSubmit(formData: FormData) {
    setIsPending(true)
    const result = await createQRCode(formData)
    setIsPending(false)
    
    if (result.error) {
      toast.error("Error", {
        description: result.error
      })
    } else {
      toast.success("Success", {
        description: "QR Code created successfully."
      })
      router.push("/dashboard/qr")
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/qr" className={buttonVariants({ variant: "outline", size: "icon" })}>
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">Create QR Code</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>QR Code Details</CardTitle>
          <CardDescription>
            Enter the details for your new dynamic QR code. You can change the destination URL later.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">QR Code Name <span className="text-destructive">*</span></Label>
              <Input id="name" name="name" placeholder="e.g., September Voucher Campaign" required />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="destinationUrl">Destination URL <span className="text-destructive">*</span></Label>
              <Input id="destinationUrl" name="destinationUrl" type="url" placeholder="https://example.com/product" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Input id="description" name="description" placeholder="Internal notes about this QR" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="expiresAt">Expiration Date (Optional)</Label>
              <Input id="expiresAt" name="expiresAt" type="datetime-local" />
              <p className="text-sm text-muted-foreground">Leave empty if it never expires.</p>
            </div>

            <div className="pt-4 flex justify-end">
              <Button type="submit" disabled={isPending}>
                {isPending ? "Creating..." : "Create QR Code"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
