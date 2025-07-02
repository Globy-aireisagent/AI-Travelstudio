/**
 * Stub-implementatie van de vroegere webhook-store.
 * Houdt alles in-memory zodat bestaande imports niet breken,
 * maar doet verder niets meer (webhooks zijn niet langer in gebruik).
 */

type Booking = Record<string, any>

class InMemoryWebhookBookingStore {
  private store = new Map<string, Booking>()

  /** Zoek een booking op id (geeft undefined terug als niet gevonden). */
  getBooking(bookingId: string): Booking | undefined {
    return this.store.get(bookingId)
  }

  /** Sla een booking op / werk bij. */
  setBooking(bookingId: string, booking: Booking) {
    this.store.set(bookingId, booking)
  }

  /** Verwijder een booking. */
  deleteBooking(bookingId: string) {
    this.store.delete(bookingId)
  }

  /** Alle bookings (array) – handig voor debug/statistiek. */
  getAllBookings(): Booking[] {
    return Array.from(this.store.values())
  }

  /** Leeg de store. */
  clear() {
    this.store.clear()
  }

  /** Eenvoudige statistiek van aantal items. */
  getStats() {
    return {
      count: this.store.size,
    }
  }
}

/**
 * Exporteer een singleton zodat alle imports dezelfde instantie gebruiken.
 * Hierdoor voldoet dit bestand aan het oude API-contract, ook al wordt het
 * in de huidige app niet echt meer gebruikt.
 */
export const webhookBookingStore = new InMemoryWebhookBookingStore()
