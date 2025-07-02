interface CachedBooking {
  id: string
  data: any
  timestamp: number
  ttl: number // Time to live in milliseconds
}

class BookingFastCache {
  private cache = new Map<string, CachedBooking>()
  private allBookingsCache: { data: any[]; timestamp: number; ttl: number } | null = null
  private readonly DEFAULT_TTL = 5 * 60 * 1000 // 5 minutes

  // Cache individual booking
  setBooking(bookingId: string, data: any, ttl = this.DEFAULT_TTL) {
    this.cache.set(bookingId.toLowerCase(), {
      id: bookingId,
      data,
      timestamp: Date.now(),
      ttl,
    })
  }

  // Get cached booking
  getBooking(bookingId: string): any | null {
    const cached = this.cache.get(bookingId.toLowerCase())
    if (!cached) return null

    // Check if expired
    if (Date.now() - cached.timestamp > cached.ttl) {
      this.cache.delete(bookingId.toLowerCase())
      return null
    }

    return cached.data
  }

  // Cache all bookings for fast search
  setAllBookings(bookings: any[], ttl = this.DEFAULT_TTL) {
    this.allBookingsCache = {
      data: bookings,
      timestamp: Date.now(),
      ttl,
    }

    // Also cache individual bookings
    bookings.forEach((booking) => {
      const possibleIds = [
        booking.id,
        booking.bookingReference,
        booking.customBookingReference,
        booking.reference,
      ].filter(Boolean)

      possibleIds.forEach((id) => {
        this.setBooking(String(id), booking, ttl)
      })
    })
  }

  // Get all cached bookings
  getAllBookings(): any[] | null {
    if (!this.allBookingsCache) return null

    // Check if expired
    if (Date.now() - this.allBookingsCache.timestamp > this.allBookingsCache.ttl) {
      this.allBookingsCache = null
      return null
    }

    return this.allBookingsCache.data
  }

  // Fast search in cached bookings
  searchBooking(bookingId: string): any | null {
    // First try direct cache
    const directResult = this.getBooking(bookingId)
    if (directResult) return directResult

    // Then search in all bookings cache
    const allBookings = this.getAllBookings()
    if (!allBookings) return null

    const cleanId = bookingId.replace(/[^0-9]/g, "")

    return allBookings.find((booking) => {
      const possibleIds = [
        booking.id,
        booking.bookingReference,
        booking.customBookingReference,
        booking.reference,
      ].filter(Boolean)

      return possibleIds.some((id) => {
        const idStr = String(id).toLowerCase()
        const searchStr = bookingId.toLowerCase()
        const cleanIdStr = String(id).replace(/[^0-9]/g, "")

        return idStr === searchStr || idStr.includes(searchStr) || searchStr.includes(idStr) || cleanIdStr === cleanId
      })
    })
  }

  // Clear expired entries
  cleanup() {
    const now = Date.now()
    for (const [key, cached] of this.cache.entries()) {
      if (now - cached.timestamp > cached.ttl) {
        this.cache.delete(key)
      }
    }

    if (this.allBookingsCache && now - this.allBookingsCache.timestamp > this.allBookingsCache.ttl) {
      this.allBookingsCache = null
    }
  }

  // Get cache stats
  getStats() {
    return {
      individualBookings: this.cache.size,
      allBookingsCached: !!this.allBookingsCache,
      allBookingsCount: this.allBookingsCache?.data.length || 0,
      allBookingsAge: this.allBookingsCache ? Math.round((Date.now() - this.allBookingsCache.timestamp) / 1000) : 0,
    }
  }
}

// Global cache instance
export const bookingFastCache = new BookingFastCache()

// Cleanup every 10 minutes
setInterval(
  () => {
    bookingFastCache.cleanup()
  },
  10 * 60 * 1000,
)
