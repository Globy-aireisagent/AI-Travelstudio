// Verbeterde user-booking synchronization met betere koppeling
export interface UserBookingLink {
  bookingId: string
  userId: string
  linkMethod: "email" | "userId" | "name" | "manual"
  confidence: number // 0-100
  verifiedAt: string
}

export class ImprovedUserBookingSyncService {
  private static userBookingLinks: Map<string, UserBookingLink[]> = new Map()

  // Verbeterde sync met betere koppeling
  static async syncUserBookingsWithVerification() {
    console.log("🔍 Starting improved user-booking sync with verification...")

    for (let config = 1; config <= 4; config++) {
      await this.syncMicrositeWithVerification(config)
    }
  }

  private static async syncMicrositeWithVerification(micrositeId: number) {
    try {
      // 1. Haal users en bookings op
      const [users, bookings] = await Promise.all([this.fetchUsers(micrositeId), this.fetchBookings(micrositeId)])

      console.log(`Microsite ${micrositeId}: ${users.length} users, ${bookings.length} bookings`)

      // 2. Maak slimme koppelingen
      const links: UserBookingLink[] = []

      for (const user of users) {
        const userLinks = this.findBookingsForUser(user, bookings)
        links.push(...userLinks)
      }

      // 3. Sla koppelingen op
      this.userBookingLinks.set(`microsite-${micrositeId}`, links)

      console.log(`✅ Microsite ${micrositeId}: ${links.length} user-booking links created`)
    } catch (error) {
      console.error(`❌ Failed to sync microsite ${micrositeId}:`, error)
    }
  }

  private static findBookingsForUser(user: any, bookings: any[]): UserBookingLink[] {
    const links: UserBookingLink[] = []

    for (const booking of bookings) {
      const linkResult = this.calculateBookingUserMatch(user, booking)

      if (linkResult.confidence >= 70) {
        // Alleen hoge confidence matches
        links.push({
          bookingId: booking.id,
          userId: user.id,
          linkMethod: linkResult.method,
          confidence: linkResult.confidence,
          verifiedAt: new Date().toISOString(),
        })
      }
    }

    return links
  }

  private static calculateBookingUserMatch(
    user: any,
    booking: any,
  ): { method: "email" | "userId" | "name" | "manual"; confidence: number } {
    // 1. Email match (hoogste confidence)
    if (user.email && booking.clientEmail) {
      if (user.email.toLowerCase() === booking.clientEmail.toLowerCase()) {
        return { method: "email", confidence: 95 }
      }
    }

    // 2. User ID match
    if (user.id && (booking.userId === user.id || booking.clientId === user.id)) {
      return { method: "userId", confidence: 90 }
    }

    // 3. Naam match (lagere confidence)
    if (user.name && booking.clientName) {
      const userName = user.name.toLowerCase().trim()
      const bookingName = booking.clientName.toLowerCase().trim()

      if (userName === bookingName) {
        return { method: "name", confidence: 80 }
      }

      // Partial name match
      if (userName.includes(bookingName) || bookingName.includes(userName)) {
        return { method: "name", confidence: 60 }
      }
    }

    return { method: "manual", confidence: 0 }
  }

  private static async fetchUsers(micrositeId: number) {
    const response = await fetch(`/api/travel-compositor/user/${micrositeId}`)
    const data = await response.json()
    return data.users || []
  }

  private static async fetchBookings(micrositeId: number) {
    const response = await fetch(`/api/travel-compositor/booking-super-fast?config=${micrositeId}`)
    const data = await response.json()
    return data.bookings || []
  }

  // Haal gekoppelde bookings op voor een user
  static getBookingsForUser(userId: string, micrositeId: number): UserBookingLink[] {
    const links = this.userBookingLinks.get(`microsite-${micrositeId}`) || []
    return links.filter((link) => link.userId === userId)
  }

  // Haal alle koppelingen op
  static getAllLinks(): Map<string, UserBookingLink[]> {
    return this.userBookingLinks
  }

  // Verifieer een koppeling handmatig
  static verifyLink(bookingId: string, userId: string, micrositeId: number): boolean {
    const links = this.userBookingLinks.get(`microsite-${micrositeId}`) || []
    const existingLink = links.find((link) => link.bookingId === bookingId && link.userId === userId)

    if (existingLink) {
      existingLink.confidence = 100
      existingLink.linkMethod = "manual"
      existingLink.verifiedAt = new Date().toISOString()
      return true
    }

    // Maak nieuwe handmatige koppeling
    links.push({
      bookingId,
      userId,
      linkMethod: "manual",
      confidence: 100,
      verifiedAt: new Date().toISOString(),
    })

    this.userBookingLinks.set(`microsite-${micrositeId}`, links)
    return true
  }
}
