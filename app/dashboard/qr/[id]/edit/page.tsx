import { notFound, redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import { auth } from "@/auth"
import { Button, buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { updateQRCode } from "../../actions"

export default async function EditQRCodePage({ params }: { params: { id: string } }) {
  const session = await auth()
  if (!session?.user?.id) return null

  const qr = await prisma.qRCode.findUnique({
    where: { id: params.id, userId: session.user.id }
  })

  if (!qr) notFound()

  // Preformat datetime-local string
  const expiresAtValue = qr.expiresAt ? new Date(qr.expiresAt).toISOString().slice(0, 16) : ""

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/dashboard/qr/${qr.id}`} className={buttonVariants({ variant: "outline", size: "icon" })}>
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">Edit QR Code</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Update Details</CardTitle>
          <CardDescription>
            Change the destination URL. Your existing printed QR code will continue to work.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={async (formData: FormData) => {
            "use server"
            await updateQRCode(qr.id, formData)
            redirect(`/dashboard/qr/${qr.id}`)
          }} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">QR Code Name <span className="text-destructive">*</span></Label>
              <Input id="name" name="name" defaultValue={qr.name} required />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="destinationUrl">Destination URL <span className="text-destructive">*</span></Label>
              <Input id="destinationUrl" name="destinationUrl" type="url" defaultValue={qr.destinationUrl} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Input id="description" name="description" defaultValue={qr.description || ""} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="expiresAt">Expiration Date (Optional)</Label>
              <Input id="expiresAt" name="expiresAt" type="datetime-local" defaultValue={expiresAtValue} />
              <p className="text-sm text-muted-foreground">Leave empty if it never expires.</p>
            </div>

            <div className="pt-4 flex justify-end">
              <Button type="submit">
                Save Changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
