// Simple in-memory cache voor bookings
class BookingCache {
  private cache = new Map<string, any[]>()
  private cacheTimestamp = new Map<string, number>()
  private readonly CACHE_DURATION = 5 * 60 * 1000 // 5 minuten

  set(key: string, bookings: any[]) {
    this.cache.set(key, bookings)
    this.cacheTimestamp.set(key, Date.now())
    console.log(`💾 Cached ${bookings.length} bookings for ${key}`)
  }

  get(key: string): any[] | null {
    const timestamp = this.cacheTimestamp.get(key)
    if (!timestamp || Date.now() - timestamp > this.CACHE_DURATION) {
      this.cache.delete(key)
      this.cacheTimestamp.delete(key)
      return null
    }

    const bookings = this.cache.get(key)
    if (bookings) {
      console.log(`⚡ Using cached ${bookings.length} bookings for ${key}`)
    }
    return bookings || null
  }

  clear() {
    this.cache.clear()
    this.cacheTimestamp.clear()
    console.log("🗑️ Cache cleared")
  }

  getStats() {
    return {
      keys: Array.from(this.cache.keys()),
      totalBookings: Array.from(this.cache.values()).reduce((sum, bookings) => sum + bookings.length, 0),
      cacheSize: this.cache.size,
    }
  }
}

export const bookingCache = new BookingCache()
