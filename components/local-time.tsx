"use client"
import { format } from "date-fns"
import { useEffect, useState } from "react"

export function LocalTime({ date, formatStr }: { date: Date | string, formatStr: string }) {
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => setMounted(true), [])
  
  if (!mounted) {
    return <span className="opacity-0">loading...</span>
  }
  
  return <span>{format(new Date(date), formatStr)}</span>
}
