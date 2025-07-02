"use client"

import { Loader2 } from "lucide-react"

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center gap-2">
        <Loader2 className="w-6 h-6 animate-spin text-gray-600" />
        <span className="text-sm text-gray-600">{"Loading booking lookup…"}</span>
      </div>
    </div>
  )
}
