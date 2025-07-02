// Permanente booking cache die alle bookings opslaat
class PersistentBookingCache {
  private allBookings = new Map<string, any[]>() // microsite -> bookings
  private searchIndex = new Map<string, any>() // bookingId -> booking + microsite
  private lastSync = new Map<string, number>() // microsite -> timestamp
  private isWarmedUp = false
  private warmupPromise: Promise<void> | null = null

  private readonly SYNC_INTERVAL = 15 * 60 * 1000 // 15 minuten
  private readonly WARMUP_TIMEOUT = 30 * 1000 // 30 seconden max voor warmup

  constructor() {
    // Start background sync
    this.startBackgroundSync()
  }

  // Warm up cache bij opstarten
  async warmUpCache(): Promise<void> {
    if (this.isWarmedUp || this.warmupPromise) {
      return this.warmupPromise || Promise.resolve()
    }

    console.log("🔥 Warming up booking cache...")

    this.warmupPromise = this.performWarmup()

    try {
      await Promise.race([
        this.warmupPromise,
        new Promise((_, reject) => setTimeout(() => reject(new Error("Warmup timeout")), this.WARMUP_TIMEOUT)),
      ])
    } catch (error) {
      console.log("⚠️ Cache warmup timeout - continuing with partial data")
    }

    return this.warmupPromise
  }

  private async performWarmup(): Promise<void> {
    const microsites = [
      { id: "rondreis-planner", config: 1 },
      { id: "pacificislandtravel", config: 3 },
      // Skip config 2 - bekend probleem
    ]

    const warmupPromises = microsites.map(async ({ id, config }) => {
      try {
        await this.syncMicrositeBookings(id, config)
        console.log(`🔥 Warmed up ${id}`)
      } catch (error) {
        console.log(`⚠️ Warmup failed for ${id}:`, error)
      }
    })

    await Promise.allSettled(warmupPromises)

    this.isWarmedUp = true
    this.buildSearchIndex()

    const totalBookings = Array.from(this.allBookings.values()).reduce((sum, bookings) => sum + bookings.length, 0)

    console.log(`🔥 Cache warmed up! ${totalBookings} bookings ready for instant search`)
  }

  // Sync bookings voor een specifieke microsite
  private async syncMicrositeBookings(micrositeId: string, configNumber: number): Promise<void> {
    try {
      console.log(`🔄 Syncing ${micrositeId}...`)

      const suffix = configNumber === 1 ? "" : `_${configNumber}`
      const username = process.env[`TRAVEL_COMPOSITOR_USERNAME${suffix}`]
      const password = process.env[`TRAVEL_COMPOSITOR_PASSWORD${suffix}`]
      const microsite = process.env[`TRAVEL_COMPOSITOR_MICROSITE_ID${suffix}`]

      if (!username || !password || !microsite) {
        throw new Error(`Missing credentials for config ${configNumber}`)
      }

      // Authenticatie
      const authResponse = await fetch("https://online.travelcompositor.com/resources/authentication/authenticate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, micrositeId: microsite }),
      })

      if (!authResponse.ok) {
        throw new Error(`Auth failed: ${authResponse.status}`)
      }

      const authData = await authResponse.json()
      const token = authData.token

      // Haal alle bookings op met snelste endpoints
      const endpoints = [
        `/resources/booking/getBookings?microsite=${microsite}&from=20250601&to=20250630`,
        `/resources/booking/getBookings?microsite=${microsite}&from=20250101&to=20251231`,
        `/resources/booking/getBookings?microsite=${microsite}&from=20240101&to=20241231`,
      ]

      let allBookings: any[] = []

      // Parallel fetch voor snelheid
      const fetchPromises = endpoints.map(async (endpoint) => {
        try {
          const response = await fetch(`https://online.travelcompositor.com${endpoint}`, {
            headers: {
              "auth-token": token,
              "Content-Type": "application/json",
              Accept: "application/json",
            },
          })

          if (response.ok) {
            const data = await response.json()
            return data.bookedTrip || data.bookings || data || []
          }
          return []
        } catch (error) {
          return []
        }
      })

      const results = await Promise.all(fetchPromises)

      // Combineer en dedupliceer
      for (const bookings of results) {
        if (Array.isArray(bookings)) {
          const newBookings = bookings.filter(
            (newBooking: any) => !allBookings.some((existing: any) => existing.id === newBooking.id),
          )
          allBookings = [...allBookings, ...newBookings]
        }
      }

      // Sorteer voor consistentie
      allBookings.sort((a, b) => {
        const aNum = Number.parseInt(a.id?.replace(/\D/g, "") || "0")
        const bNum = Number.parseInt(b.id?.replace(/\D/g, "") || "0")
        return aNum - bNum
      })

      // Sla op in cache
      this.allBookings.set(micrositeId, allBookings)
      this.lastSync.set(micrositeId, Date.now())

      console.log(`✅ Synced ${allBookings.length} bookings for ${micrositeId}`)
    } catch (error) {
      console.error(`❌ Sync failed for ${micrositeId}:`, error)
      throw error
    }
  }

  // Bouw search index voor super snelle lookups
  private buildSearchIndex(): void {
    console.log("🔍 Building search index...")

    this.searchIndex.clear()

    for (const [micrositeId, bookings] of this.allBookings.entries()) {
      for (const booking of bookings) {
        // Alle mogelijke ID varianten indexeren
        const possibleIds = [
          booking.id,
          booking.bookingId,
          booking.reservationId,
          booking.bookingReference,
          booking.reference,
          booking.tripId,
        ].filter(Boolean)

        for (const id of possibleIds) {
          const key = String(id).toLowerCase()
          if (!this.searchIndex.has(key)) {
            this.searchIndex.set(key, {
              booking,
              micrositeId,
              allIds: possibleIds,
            })
          }
        }
      }
    }

    console.log(`🔍 Search index built: ${this.searchIndex.size} searchable IDs`)
  }

  // Super snelle booking search - altijd instant!
  async findBooking(bookingId: string): Promise<{
    booking: any | null
    micrositeId: string | null
    searchTime: string
    source: string
  }> {
    const startTime = Date.now()

    // Zorg dat cache warm is
    if (!this.isWarmedUp) {
      console.log("🔥 Cache not warm yet, warming up...")
      await this.warmUpCache()
    }

    // Zoek in index (instant!)
    const searchKey = bookingId.toLowerCase()
    const result = this.searchIndex.get(searchKey)

    if (result) {
      return {
        booking: result.booking,
        micrositeId: result.micrositeId,
        searchTime: `${Date.now() - startTime}ms`,
        source: "persistent_cache_exact",
      }
    }

    // Fallback: partial match search
    for (const [key, value] of this.searchIndex.entries()) {
      if (key.includes(searchKey) || searchKey.includes(key)) {
        return {
          booking: value.booking,
          micrositeId: value.micrositeId,
          searchTime: `${Date.now() - startTime}ms`,
          source: "persistent_cache_partial",
        }
      }
    }

    return {
      booking: null,
      micrositeId: null,
      searchTime: `${Date.now() - startTime}ms`,
      source: "persistent_cache_not_found",
    }
  }

  // Multi-microsite search - ook instant!
  async searchAllMicrosites(bookingId: string): Promise<{
    booking: any | null
    foundInMicrosite: string | null
    searchResults: Array<{ microsite: string; found: boolean; bookingCount: number }>
    searchTime: string
  }> {
    const startTime = Date.now()

    // Zorg dat cache warm is
    if (!this.isWarmedUp) {
      await this.warmUpCache()
    }

    // Zoek in alle microsites
    const result = await this.findBooking(bookingId)

    const searchResults = Array.from(this.allBookings.entries()).map(([micrositeId, bookings]) => ({
      microsite: micrositeId,
      found: result.micrositeId === micrositeId,
      bookingCount: bookings.length,
    }))

    return {
      booking: result.booking,
      foundInMicrosite: result.micrositeId,
      searchResults,
      searchTime: `${Date.now() - startTime}ms`,
    }
  }

  // Background sync - houdt cache up-to-date
  private startBackgroundSync(): void {
    console.log("🔄 Starting background sync service...")

    // Initial warmup
    setTimeout(() => this.warmUpCache(), 1000)

    // Periodieke sync
    setInterval(async () => {
      if (!this.isWarmedUp) return

      console.log("🔄 Background sync starting...")

      try {
        await this.performWarmup() // Re-sync alles
        this.buildSearchIndex() // Rebuild index
        console.log("✅ Background sync completed")
      } catch (error) {
        console.error("❌ Background sync failed:", error)
      }
    }, this.SYNC_INTERVAL)
  }

  // Cache statistieken
  getStats() {
    const totalBookings = Array.from(this.allBookings.values()).reduce((sum, bookings) => sum + bookings.length, 0)

    return {
      isWarmedUp: this.isWarmedUp,
      totalBookings,
      searchableIds: this.searchIndex.size,
      microsites: this.allBookings.size,
      lastSyncTimes: Object.fromEntries(this.lastSync.entries()),
      micrositeBreakdown: Object.fromEntries(
        Array.from(this.allBookings.entries()).map(([id, bookings]) => [id, bookings.length]),
      ),
    }
  }

  // Force refresh
  async forceRefresh(): Promise<void> {
    console.log("🔄 Force refreshing cache...")
    this.isWarmedUp = false
    this.warmupPromise = null
    await this.warmUpCache()
  }

  // Get sample booking IDs voor testing
  getSampleBookingIds(limit = 10): string[] {
    const allIds: string[] = []

    for (const bookings of this.allBookings.values()) {
      for (const booking of bookings.slice(0, limit)) {
        if (booking.id) allIds.push(booking.id)
      }
    }

    return allIds.slice(0, limit)
  }
}

// Singleton instance
export const persistentBookingCache = new PersistentBookingCache()
