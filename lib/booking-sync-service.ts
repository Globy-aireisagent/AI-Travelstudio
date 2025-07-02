// Background sync service voor bookings
import { BookingDatabase } from "./booking-database"
import { createTravelCompositorClient } from "./travel-compositor-client"

export class BookingSyncService {
  private static syncInProgress = new Map<number, boolean>()

  // Intelligente sync - alleen als nodig
  static async ensureBookingsAvailable(configNumber: number): Promise<any[]> {
    // Check of we al aan het syncen zijn
    if (this.syncInProgress.get(configNumber)) {
      console.log(`⏳ Sync already in progress for config ${configNumber}`)
      // Wacht tot sync klaar is
      while (this.syncInProgress.get(configNumber)) {
        await new Promise((resolve) => setTimeout(resolve, 1000))
      }
    }

    // Check of cache geldig is
    const isValid = await BookingDatabase.isCacheValid(configNumber)
    if (isValid) {
      const bookings = await BookingDatabase.getAllBookings(configNumber)
      if (bookings && bookings.length > 0) {
        console.log(`✅ Using valid cache: ${bookings.length} bookings`)
        return bookings
      }
    }

    // Cache is niet geldig, sync in background
    console.log(`🔄 Starting background sync for config ${configNumber}`)
    return await this.syncBookings(configNumber)
  }

  // Volledige sync van alle bookings
  private static async syncBookings(configNumber: number): Promise<any[]> {
    this.syncInProgress.set(configNumber, true)

    try {
      console.log(`📡 Syncing all bookings for config ${configNumber}...`)

      const client = createTravelCompositorClient(configNumber)

      // Gebruik de snelste methode die we hebben gevonden
      const bookings = await this.fastFetchAllBookings(client)

      // Sla op in database
      await BookingDatabase.storeAllBookings(configNumber, bookings)

      console.log(`✅ Sync completed: ${bookings.length} bookings`)
      return bookings
    } catch (error) {
      console.error(`❌ Sync failed for config ${configNumber}:`, error)
      throw error
    } finally {
      this.syncInProgress.set(configNumber, false)
    }
  }

  // Geoptimaliseerde fetch methode
  private static async fastFetchAllBookings(client: any): Promise<any[]> {
    // Probeer eerst de snelste endpoints
    const fastEndpoints = [
      // Zonder date restrictions (vaak snelst)
      `/resources/booking/getBookings?microsite=${client.config.micrositeId}&limit=10000`,
      `/resources/booking/getBookings?operator=${client.config.micrositeId}&limit=10000`,

      // Met brede date range
      `/resources/booking/getBookings?microsite=${client.config.micrositeId}&from=20200101&to=20301231&limit=10000`,
    ]

    for (const endpoint of fastEndpoints) {
      try {
        console.log(`⚡ Trying fast endpoint: ${endpoint}`)
        const response = await client.makeAuthenticatedRequest(endpoint)

        if (response.ok) {
          const data = await response.json()
          const bookings = data.bookedTrip || data.bookings || data

          if (Array.isArray(bookings) && bookings.length > 1000) {
            console.log(`🎯 Fast endpoint success: ${bookings.length} bookings`)
            return bookings
          }
        }
      } catch (error) {
        console.log(`⚠️ Fast endpoint failed: ${endpoint}`)
        continue
      }
    }

    // Fallback naar paginatie als fast endpoints falen
    console.log(`🔄 Falling back to pagination...`)
    return await client.getAllBookings({ includeAll: true, limit: 10000 })
  }

  // Webhook handler voor real-time updates
  static async handleWebhook(configNumber: number, webhookData: any) {
    console.log(`🔔 Webhook received for config ${configNumber}:`, webhookData)

    // Invalideer cache zodat volgende request fresh data haalt
    await BookingDatabase.invalidateCache(configNumber)

    // Start background sync
    this.syncBookings(configNumber).catch((error) => {
      console.error("❌ Webhook-triggered sync failed:", error)
    })
  }
}
