"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"

export default function RoadbookPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if params and params.id exist
    if (!params?.id) {
      setLoading(false)
      return
    }

    // Load data from localStorage
    const bookingId = params.id.replace("booking-", "")
    const savedData = localStorage.getItem(`booking-${bookingId}`)

    if (savedData) {
      try {
        setData(JSON.parse(savedData))
      } catch (error) {
        console.error("Error parsing saved data:", error)
      }
    }
    setLoading(false)
  }, [params?.id])

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div>Loading...</div>
      </div>
    )
  }

  if (!params?.id) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-bold mb-4">Invalid booking ID</h1>
          <Button onClick={() => router.push("/agent-dashboard")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Terug naar Dashboard
          </Button>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-bold mb-4">Geen data gevonden</h1>
          <p className="mb-4">Booking ID: {params.id.replace("booking-", "")}</p>
          <Button onClick={() => router.push("/agent-dashboard")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Terug naar Dashboard
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="p-4 border-b">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Terug
          </Button>
          <div>
            <h1 className="text-xl font-bold">Travel Compositor Data</h1>
            <p className="text-sm text-gray-600">Booking: {params.id.replace("booking-", "")}</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        <pre className="whitespace-pre-wrap text-sm font-mono">{JSON.stringify(data, null, 2)}</pre>
      </div>
    </div>
  )
}
