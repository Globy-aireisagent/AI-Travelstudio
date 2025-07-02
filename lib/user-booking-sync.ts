// Real-time user booking synchronization service
export interface UserBooking {
  id: string
  userId: string
  bookingReference: string
  title: string
  destinations: string[]
  status: "active" | "completed" | "cancelled"
  createdAt: string
  lastSynced: string
  type: "booking" | "idea"
}

export interface TravelUser {
  id: string
  email: string
  name: string
  micrositeId: string
  lastLogin: string
  bookings: UserBooking[]
  ideas: UserBooking[]
}

export class UserBookingSyncService {
  private static syncInterval: NodeJS.Timeout | null = null
  private static users: Map<string, TravelUser> = new Map()

  // Start real-time sync (elke 5 minuten)
  static startRealTimeSync() {
    console.log("🔄 Starting real-time booking sync...")

    this.syncInterval = setInterval(
      async () => {
        await this.syncAllUserBookings()
      },
      5 * 60 * 1000,
    ) // 5 minuten

    // Initial sync
    this.syncAllUserBookings()
  }

  // Stop sync
  static stopRealTimeSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval)
      this.syncInterval = null
    }
  }

  // Sync alle gebruikers en hun bookings
  static async syncAllUserBookings() {
    try {
      console.log("📡 Syncing all user bookings...")

      // 1. Haal alle gebruikers op van alle microsites
      const allUsers = await this.fetchAllUsers()

      // 2. Voor elke gebruiker, haal bookings en ideas op
      for (const user of allUsers) {
        await this.syncUserData(user)
      }

      console.log(`✅ Synced ${allUsers.length} users with their bookings`)
    } catch (error) {
      console.error("❌ Sync failed:", error)
    }
  }

  // Haal alle gebruikers op van alle microsites
  private static async fetchAllUsers(): Promise<TravelUser[]> {
    const allUsers: TravelUser[] = []

    // Loop door alle microsites (1, 2, 3, 4)
    for (let config = 1; config <= 4; config++) {
      try {
        const response = await fetch(`/api/travel-compositor/user/${config}`)
        if (response.ok) {
          const data = await response.json()
          const users = data.users || []

          users.forEach((user: any) => {
            // Alleen actieve users die recent ingelogd zijn
            if (user.status === "active" && user.lastLogin) {
              allUsers.push({
                id: `${config}-${user.id}`,
                email: user.email,
                name: user.name,
                micrositeId: config.toString(),
                lastLogin: user.lastLogin,
                bookings: [],
                ideas: [],
                isActive: true, // Nieuwe property
              })
            }
          })
        }
      } catch (error) {
        console.log(`⚠️ Could not fetch users from microsite ${config}`)
      }
    }

    return allUsers
  }

  // Sync data voor specifieke gebruiker
  private static async syncUserData(user: TravelUser) {
    try {
      console.log(`🔄 Syncing data for user: ${user.email}`)

      // Haal bookings op met user filter
      const bookingsResponse = await fetch(
        `/api/travel-compositor/booking-super-fast?config=${user.micrositeId}&clientEmail=${encodeURIComponent(user.email)}`,
      )

      if (bookingsResponse.ok) {
        const bookingsData = await bookingsResponse.json()
        user.bookings = this.transformBookings(bookingsData.bookings || [], "booking")
        console.log(`✅ Found ${user.bookings.length} bookings for ${user.email}`)
      }

      // Haal ideas op
      const ideasResponse = await fetch(`/api/travel-compositor/idea-lightning-fast`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          micrositeConfig: user.micrositeId,
          clientEmail: user.email,
        }),
      })

      if (ideasResponse.ok) {
        const ideasData = await ideasResponse.json()
        user.ideas = this.transformBookings(ideasData.ideas || [], "idea")
        console.log(`✅ Found ${user.ideas.length} ideas for ${user.email}`)
      }

      // Update sync timestamp
      user.lastSynced = new Date().toISOString()
      this.users.set(user.id, user)
    } catch (error) {
      console.error(`❌ Failed to sync user ${user.email}:`, error)
    }
  }

  // Transform API data naar UserBooking format
  private static transformBookings(items: any[], type: "booking" | "idea"): UserBooking[] {
    return items.map((item) => ({
      id: item.id,
      userId: item.userId || item.clientId,
      bookingReference: type === "booking" ? item.bookingReference : item.id,
      title: item.title || item.name || "Untitled",
      destinations: this.extractDestinations(item),
      status: item.status || "active",
      createdAt: item.createdAt || item.creationDate || new Date().toISOString(),
      lastSynced: new Date().toISOString(),
      type,
    }))
  }

  // Extract destinations from booking/idea data
  private static extractDestinations(item: any): string[] {
    const destinations: string[] = []

    if (item.destinations) {
      destinations.push(...item.destinations.map((d: any) => d.name || d.destination))
    }

    if (item.hotels) {
      destinations.push(...item.hotels.map((h: any) => h.destination || h.city))
    }

    return [...new Set(destinations.filter(Boolean))]
  }

  // Get user data
  static getUserData(userId: string): TravelUser | null {
    return this.users.get(userId) || null
  }

  // Get all users
  static getAllUsers(): TravelUser[] {
    return Array.from(this.users.values())
  }

  // Search users by email
  static searchUserByEmail(email: string): TravelUser | null {
    for (const user of this.users.values()) {
      if (user.email.toLowerCase() === email.toLowerCase()) {
        return user
      }
    }
    return null
  }
}
