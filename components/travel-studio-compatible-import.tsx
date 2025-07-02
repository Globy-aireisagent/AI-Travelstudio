"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

// Kopieer Travel Studio's frontend methode
export default function TravelStudioCompatibleImport() {
  const [bookingId, setBookingId] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  // Kopieer tsRemoteBookingImport functie
  const handleImport = async () => {
    if (!bookingId.trim()) return

    setIsLoading(true)
    setResult(null)

    try {
      // Gebruik Travel Studio's endpoint structuur
      const response = await fetch("/api/backend/remote/booking/import", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Requested-With": "XMLHttpRequest",
        },
        credentials: "same-origin",
        body: JSON.stringify({
          action: "import",
          booking_id: bookingId.trim(),
          agency_id: "1", // Default agency
          service_id: "1", // Default service
          debug: false,
        }),
      })

      const data = await response.json()
      setResult(data)

      // Travel Studio style redirect + localStorage save
      if (data.success && data.redirect_url) {
        // ← VOEG DIT TOE: Sla booking data op in localStorage
        if (data.booking_data) {
          localStorage.setItem("importedBooking", JSON.stringify(data.booking_data))
        }

        setTimeout(() => {
          window.location.href = data.redirect_url
        }, 2000)
      }
    } catch (error) {
      setResult({
        success: false,
        error: "Network error occurred",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Kopieer tsRemoteBookingView functie
  const handleView = async () => {
    if (!bookingId.trim()) return

    try {
      const response = await fetch("/api/backend/remote/booking/view", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Requested-With": "XMLHttpRequest",
        },
        credentials: "same-origin",
        body: JSON.stringify({
          action: "view",
          booking_id: bookingId.trim(),
          agency_id: "1",
          service_id: "1",
        }),
      })

      const data = await response.json()

      if (data.success && data.html) {
        // Show preview modal (Travel Studio style)
        const modal = document.createElement("div")
        modal.innerHTML = `
          <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 9999; display: flex; align-items: center; justify-content: center;">
            <div style="background: white; padding: 20px; border-radius: 8px; max-width: 600px; max-height: 80vh; overflow-y: auto;">
              ${data.html}
            </div>
          </div>
        `
        document.body.appendChild(modal)

        // Handle close button
        modal.querySelector("#backend-remote-booking-view__button-close")?.addEventListener("click", () => {
          document.body.removeChild(modal)
        })

        // Handle import button
        modal.querySelector("#backend-remote-booking-view__button-import")?.addEventListener("click", () => {
          document.body.removeChild(modal)
          handleImport()
        })
      }
    } catch (error) {
      console.error("View error:", error)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Travel Studio Style Import</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Input
            type="text"
            placeholder="Booking ID (bijv. RRP-9263)"
            value={bookingId}
            onChange={(e) => setBookingId(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleImport()}
          />
        </div>

        <div className="flex gap-2">
          <Button onClick={handleView} variant="outline" disabled={isLoading || !bookingId.trim()}>
            Preview
          </Button>
          <Button onClick={handleImport} disabled={isLoading || !bookingId.trim()} className="flex-1">
            {isLoading ? "Importing..." : "Import"}
          </Button>
        </div>

        {result && (
          <div className={`p-3 rounded ${result.success ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
            {result.success ? (
              <div>
                <p>{result.text}</p>
                {result.redirect_url && <p className="text-sm mt-1">Redirecting to workspace...</p>}
              </div>
            ) : (
              <p>{result.error}</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
