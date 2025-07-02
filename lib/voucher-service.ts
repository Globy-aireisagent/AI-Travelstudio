// Service for handling vouchers and travel documents
export interface VoucherData {
  id: string
  type: "booking" | "hotel" | "transport" | "activity"
  title: string
  description: string
  url: string
  downloadUrl?: string
  generatedDate?: string
  validUntil?: string
  status: "available" | "pending" | "expired"
}

export class VoucherService {
  static async getBookingVouchers(bookingId: string): Promise<VoucherData[]> {
    try {
      console.log(`📄 Fetching vouchers for booking ${bookingId}`)

      // Get the full booking data first
      const response = await fetch(`/api/travel-compositor/booking-super-fast?bookingId=${bookingId}&config=1`)
      const result = await response.json()

      if (!result.success) {
        console.log("❌ No booking data found for vouchers")
        return []
      }

      const booking = result.booking
      const vouchers: VoucherData[] = []

      console.log("🔍 Checking booking for vouchers:", {
        hasVoucherUrl: !!booking.voucherUrl,
        hasRawData: !!booking.rawData,
        hotelServices: booking.rawData?.hotelservice?.length || 0,
        transportServices: booking.rawData?.transportservice?.length || 0,
      })

      // Main booking voucher
      if (booking.voucherUrl) {
        vouchers.push({
          id: `booking-${bookingId}`,
          type: "booking",
          title: "Reis Voucher",
          description: `Officiële reisvoucher voor ${booking.bookingReference || bookingId}`,
          url: booking.voucherUrl,
          downloadUrl: booking.voucherUrl,
          status: "available",
        })
      }

      // Check rawData for vouchers
      if (booking.rawData) {
        // Hotel vouchers
        const hotels = booking.rawData.hotelservice || []
        hotels.forEach((hotel: any, index: number) => {
          if (hotel.voucherUrl) {
            vouchers.push({
              id: `hotel-${hotel.id || index}`,
              type: "hotel",
              title: `${hotel.hotelName || hotel.name} Voucher`,
              description: `Hotel voucher voor ${hotel.locationName || hotel.location}`,
              url: hotel.voucherUrl,
              downloadUrl: hotel.voucherUrl,
              status: "available",
            })
          }
        })

        // Transport vouchers
        const transports = booking.rawData.transportservice || []
        transports.forEach((transport: any, index: number) => {
          if (transport.voucherUrl) {
            vouchers.push({
              id: `transport-${transport.id || index}`,
              type: "transport",
              title: "Vlucht Voucher",
              description: `${transport.departureAirport} → ${transport.arrivalAirport}`,
              url: transport.voucherUrl,
              downloadUrl: transport.voucherUrl,
              status: "available",
            })
          }
        })

        // Ticket vouchers
        const tickets = booking.rawData.ticketservice || []
        tickets.forEach((ticket: any, index: number) => {
          if (ticket.voucherUrl) {
            vouchers.push({
              id: `ticket-${ticket.id || index}`,
              type: "activity",
              title: `${ticket.name || ticket.title} Voucher`,
              description: `Ticket voucher voor ${ticket.location || ticket.city}`,
              url: ticket.voucherUrl,
              downloadUrl: ticket.voucherUrl,
              status: "available",
            })
          }
        })
      }

      console.log(`✅ Found ${vouchers.length} vouchers`)
      return vouchers
    } catch (error) {
      console.error("❌ Error fetching vouchers:", error)
      return []
    }
  }

  static async generateVoucherIfMissing(bookingId: string, type: string): Promise<string | null> {
    try {
      console.log(`🔄 Attempting to generate ${type} voucher for ${bookingId}`)

      // This would call Travel Compositor API to generate voucher
      const response = await fetch(`/api/travel-compositor/generate-voucher`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId, type }),
      })

      if (response.ok) {
        const result = await response.json()
        return result.voucherUrl
      }

      return null
    } catch (error) {
      console.error("❌ Error generating voucher:", error)
      return null
    }
  }

  static getVoucherIcon(type: string): string {
    switch (type) {
      case "booking":
        return "📋"
      case "hotel":
        return "🏨"
      case "transport":
        return "✈️"
      case "activity":
        return "🎯"
      default:
        return "📄"
    }
  }

  static getVoucherColor(type: string): string {
    switch (type) {
      case "booking":
        return "bg-blue-50 border-blue-200"
      case "hotel":
        return "bg-green-50 border-green-200"
      case "transport":
        return "bg-purple-50 border-purple-200"
      case "activity":
        return "bg-orange-50 border-orange-200"
      default:
        return "bg-gray-50 border-gray-200"
    }
  }
}
