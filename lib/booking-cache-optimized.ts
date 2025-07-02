interface CachedBooking {
  booking: any
  timestamp: number
  ttl: number
}

interface CachedSearchResult {
  booking: any | null
  foundInMicrosite: string | null
  searchResults: any[]
  searchTime: string
  timestamp: number
  ttl: number
}

class OptimizedBookingCache {
  private bookingCache = new Map<string, any[]>()
  private searchCache = new Map<string, CachedSearchResult>()
  private bookingTimestamps = new Map<string, number>()
  private searchTimestamps = new Map<string, number>()

  // Cache TTL in milliseconds
  private readonly BOOKING_TTL = 5 * 60 * 1000 // 5 minutes
  private readonly SEARCH_TTL = 2 * 60 * 1000 // 2 minutes

  // Get cached bookings for a microsite
  getBookings(micrositeId: string): any[] | null {
    const timestamp = this.bookingTimestamps.get(micrositeId)
    if (!timestamp || Date.now() - timestamp > this.BOOKING_TTL) {
      this.bookingCache.delete(micrositeId)
      this.bookingTimestamps.delete(micrositeId)
      return null
    }

    return this.bookingCache.get(micrositeId) || null
  }

  // Cache bookings for a microsite
  setBookings(micrositeId: string, bookings: any[]): void {
    this.bookingCache.set(micrositeId, bookings)
    this.bookingTimestamps.set(micrositeId, Date.now())
    console.log(`💾 Cached ${bookings.length} bookings for ${micrositeId}`)
  }

  // Get cached search result
  getSearchResult(bookingId: string): CachedSearchResult | null {
    const timestamp = this.searchTimestamps.get(bookingId)
    if (!timestamp || Date.now() - timestamp > this.SEARCH_TTL) {
      this.searchCache.delete(bookingId)
      this.searchTimestamps.delete(bookingId)
      return null
    }

    const result = this.searchCache.get(bookingId)
    if (result) {
      console.log(`🎯 Cache hit for search: ${bookingId}`)
    }
    return result || null
  }

  // Cache search result
  setSearchResult(bookingId: string, result: Omit<CachedSearchResult, "timestamp" | "ttl">): void {
    const cachedResult: CachedSearchResult = {
      ...result,
      timestamp: Date.now(),
      ttl: this.SEARCH_TTL,
    }

    this.searchCache.set(bookingId, cachedResult)
    this.searchTimestamps.set(bookingId, Date.now())
    console.log(`💾 Cached search result for: ${bookingId}`)
  }

  // Clear expired entries
  clearExpired(): void {
    const now = Date.now()

    // Clear expired booking cache
    for (const [micrositeId, timestamp] of this.bookingTimestamps) {
      if (now - timestamp > this.BOOKING_TTL) {
        this.bookingCache.delete(micrositeId)
        this.bookingTimestamps.delete(micrositeId)
      }
    }

    // Clear expired search cache
    for (const [bookingId, timestamp] of this.searchTimestamps) {
      if (now - timestamp > this.SEARCH_TTL) {
        this.searchCache.delete(bookingId)
        this.searchTimestamps.delete(bookingId)
      }
    }
  }

  // Get cache statistics
  getStats(): {
    bookingCacheSize: number
    searchCacheSize: number
    oldestBookingCache: number
    oldestSearchCache: number
  } {
    const now = Date.now()

    let oldestBookingCache = 0
    let oldestSearchCache = 0

    for (const timestamp of this.bookingTimestamps.values()) {
      const age = now - timestamp
      if (age > oldestBookingCache) oldestBookingCache = age
    }

    for (const timestamp of this.searchTimestamps.values()) {
      const age = now - timestamp
      if (age > oldestSearchCache) oldestSearchCache = age
    }

    return {
      bookingCacheSize: this.bookingCache.size,
      searchCacheSize: this.searchCache.size,
      oldestBookingCache: Math.floor(oldestBookingCache / 1000), // in seconds
      oldestSearchCache: Math.floor(oldestSearchCache / 1000), // in seconds
    }
  }

  // Clear all cache
  clearAll(): void {
    this.bookingCache.clear()
    this.searchCache.clear()
    this.bookingTimestamps.clear()
    this.searchTimestamps.clear()
    console.log("🧹 All cache cleared")
  }
}

// Export singleton instance
export const optimizedBookingCache = new OptimizedBookingCache()

// Auto-cleanup every 5 minutes
setInterval(
  () => {
    optimizedBookingCache.clearExpired()
  },
  5 * 60 * 1000,
)
