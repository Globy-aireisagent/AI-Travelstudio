// Productie database cache met Vercel KV of Upstash Redis
import { kv } from "@vercel/kv"

export class BookingDatabase {
  private static readonly CACHE_PREFIX = "bookings:"
  private static readonly INDEX_KEY = "booking_index"
  private static readonly LAST_SYNC_KEY = "last_sync"
  private static readonly CACHE_DURATION = 24 * 60 * 60 * 1000 // 24 uur in plaats van 5 minuten

  // Sla alle bookings op in database
  static async storeAllBookings(configNumber: number, bookings: any[]) {
    console.log(`💾 Storing ${bookings.length} bookings in database...`)

    const cacheKey = `${this.CACHE_PREFIX}${configNumber}`
    const indexKey = `${this.INDEX_KEY}:${configNumber}`

    // Sla bookings op in chunks voor betere performance
    const chunkSize = 100
    const chunks = []

    for (let i = 0; i < bookings.length; i += chunkSize) {
      chunks.push(bookings.slice(i, i + chunkSize))
    }

    // Parallel opslaan voor snelheid
    await Promise.all([
      // Sla alle bookings op
      kv.set(cacheKey, bookings, { ex: this.CACHE_DURATION / 1000 }),

      // Maak een index voor snelle lookup
      kv.set(
        indexKey,
        bookings.map((b) => ({
          id: b.id,
          reference: b.bookingReference,
          custom: b.customBookingReference,
          status: b.status,
        })),
        { ex: this.CACHE_DURATION / 1000 },
      ),

      // Sla laatste sync tijd op
      kv.set(`${this.LAST_SYNC_KEY}:${configNumber}`, Date.now(), { ex: this.CACHE_DURATION / 1000 }),
    ])

    console.log(`✅ Stored ${bookings.length} bookings in database`)
  }

  // Haal alle bookings op uit database
  static async getAllBookings(configNumber: number): Promise<any[] | null> {
    const cacheKey = `${this.CACHE_PREFIX}${configNumber}`

    try {
      const bookings = await kv.get<any[]>(cacheKey)
      if (bookings) {
        console.log(`⚡ Retrieved ${bookings.length} bookings from database`)
        return bookings
      }
    } catch (error) {
      console.error("❌ Error retrieving from database:", error)
    }

    return null
  }

  // Snelle booking lookup via index
  static async findBooking(configNumber: number, bookingId: string): Promise<any | null> {
    const indexKey = `${this.INDEX_KEY}:${configNumber}`
    const cacheKey = `${this.CACHE_PREFIX}${configNumber}`

    try {
      // Eerst zoeken in index (super snel)
      const index = await kv.get<any[]>(indexKey)
      if (!index) return null

      const searchLower = bookingId.toLowerCase().trim()
      const indexMatch = index.find(
        (item) =>
          item.id?.toLowerCase() === searchLower ||
          item.reference?.toLowerCase() === searchLower ||
          item.custom?.toLowerCase() === searchLower,
      )

      if (!indexMatch) return null

      // Als gevonden in index, haal volledige booking op
      const allBookings = await kv.get<any[]>(cacheKey)
      if (!allBookings) return null

      const fullBooking = allBookings.find((b) => b.id === indexMatch.id)

      console.log(`⚡ Found booking ${bookingId} in database (< 50ms)`)
      return fullBooking
    } catch (error) {
      console.error("❌ Error in database lookup:", error)
      return null
    }
  }

  // Check of cache nog geldig is
  static async isCacheValid(configNumber: number): Promise<boolean> {
    try {
      const lastSync = await kv.get<number>(`${this.LAST_SYNC_KEY}:${configNumber}`)
      if (!lastSync) return false

      const age = Date.now() - lastSync
      const isValid = age < this.CACHE_DURATION

      console.log(`🕐 Cache age: ${Math.round(age / 1000 / 60)} minutes, valid: ${isValid}`)
      return isValid
    } catch (error) {
      return false
    }
  }

  // Forceer cache refresh
  static async invalidateCache(configNumber: number) {
    const keys = [
      `${this.CACHE_PREFIX}${configNumber}`,
      `${this.INDEX_KEY}:${configNumber}`,
      `${this.LAST_SYNC_KEY}:${configNumber}`,
    ]

    await Promise.all(keys.map((key) => kv.del(key)))
    console.log(`🗑️ Invalidated cache for config ${configNumber}`)
  }
}
