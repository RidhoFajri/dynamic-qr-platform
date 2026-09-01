"use client"

import { MoreVertical, BarChart2, Settings, Pause, Play, Trash } from "lucide-react"
import Link from "next/link"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { changeQRStatus, deleteQRCode } from "@/app/dashboard/qr/actions"
import { toast } from "sonner"
import { useState } from "react"
import { useRouter } from "next/navigation"

export function QRListActions({ qr }: { qr: { id: string, status: string } }) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleStatusChange = async (newStatus: "ACTIVE" | "PAUSED") => {
    try {
      setIsLoading(true)
      await changeQRStatus(qr.id, newStatus)
      toast.success(`QR Code ${newStatus === "ACTIVE" ? "activated" : "paused"}!`)
      router.refresh()
    } catch (e) {
      toast.error("Failed to update status")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this QR code?")) return
    try {
      setIsLoading(true)
      await deleteQRCode(qr.id)
      toast.success("QR Code deleted!")
      router.refresh()
    } catch (e) {
      toast.error("Failed to delete")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0" disabled={isLoading}>
          <span className="sr-only">Open menu</span>
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem render={<Link href={`/dashboard/qr/${qr.id}`} />}>
          <BarChart2 className="mr-2 h-4 w-4" /> Analytics
        </DropdownMenuItem>
        <DropdownMenuItem render={<Link href={`/dashboard/qr/${qr.id}/edit`} />}>
          <Settings className="mr-2 h-4 w-4" /> Edit
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        
        {qr.status === "ACTIVE" ? (
          <DropdownMenuItem onClick={() => handleStatusChange("PAUSED")}>
            <Pause className="mr-2 h-4 w-4" /> Pause QR
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem onClick={() => handleStatusChange("ACTIVE")}>
            <Play className="mr-2 h-4 w-4" /> Activate QR
          </DropdownMenuItem>
        )}
        
        <DropdownMenuItem 
          onClick={handleDelete}
          variant="destructive"
        >
          <Trash className="mr-2 h-4 w-4" /> Delete QR
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
