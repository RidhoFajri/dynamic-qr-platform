"use server"

import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import crypto from "crypto"
import { z } from "zod"

const qrSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  destinationUrl: z.string().url("Must be a valid URL"),
  expiresAt: z.string().optional(),
})

function generateShortCode() {
  return crypto.randomBytes(6).toString("base64url").replace(/[-_]/g, "").substring(0, 8)
}

export async function createQRCode(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const data = Object.fromEntries(formData.entries())
  const parsed = qrSchema.safeParse({
    name: data.name,
    description: data.description,
    destinationUrl: data.destinationUrl,
    expiresAt: data.expiresAt || undefined,
  })

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  const { name, description, destinationUrl, expiresAt } = parsed.data

  let shortCode = generateShortCode()
  
  // ensure uniqueness
  while (await prisma.qRCode.findUnique({ where: { shortCode } })) {
    shortCode = generateShortCode()
  }

  await prisma.qRCode.create({
    data: {
      userId: session.user.id,
      name,
      description,
      destinationUrl,
      shortCode,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      status: "ACTIVE"
    }
  })

  revalidatePath("/dashboard/qr")
  revalidatePath("/dashboard")
  return { success: true }
}

export async function updateQRCode(id: string, formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const data = Object.fromEntries(formData.entries())
  const parsed = qrSchema.safeParse({
    name: data.name,
    description: data.description,
    destinationUrl: data.destinationUrl,
    expiresAt: data.expiresAt || undefined,
  })

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  const { name, description, destinationUrl, expiresAt } = parsed.data

  // ensure ownership
  const qr = await prisma.qRCode.findUnique({ where: { id } })
  if (!qr || qr.userId !== session.user.id) throw new Error("Unauthorized")

  await prisma.qRCode.update({
    where: { id },
    data: {
      name,
      description,
      destinationUrl,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
    }
  })

  revalidatePath("/dashboard/qr")
  revalidatePath(`/dashboard/qr/${id}`)
  return { success: true }
}

export async function changeQRStatus(id: string, status: "ACTIVE" | "PAUSED" | "ARCHIVED") {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const qr = await prisma.qRCode.findUnique({ where: { id } })
  if (!qr || qr.userId !== session.user.id) throw new Error("Unauthorized")

  await prisma.qRCode.update({
    where: { id },
    data: { status }
  })

  revalidatePath("/dashboard/qr")
  revalidatePath(`/dashboard/qr/${id}`)
  return { success: true }
}

export async function deleteQRCode(id: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const qr = await prisma.qRCode.findUnique({ where: { id } })
  if (!qr || qr.userId !== session.user.id) throw new Error("Unauthorized")

  await prisma.qRCode.delete({
    where: { id }
  })

  revalidatePath("/dashboard/qr")
  revalidatePath("/dashboard")
  return { success: true }
}
