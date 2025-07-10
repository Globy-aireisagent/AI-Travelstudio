// Database schema voor TravelBuddy configuraties
export interface TravelBuddyConfig {
  id: string
  clientName: string
  destination: string
  bookingId?: string
  documents: string[]
  urls: string[]
  intakeData: any
  gptInstructions: string
  createdAt: Date
  expiresAt?: Date
}

// Database operations
export class TravelBuddyDatabase {
  static async saveTravelBuddy(config: TravelBuddyConfig): Promise<string> {
    // Save to database (Supabase, Neon, etc.)
    // Return unique ID
  }

  static async getTravelBuddy(id: string): Promise<TravelBuddyConfig | null> {
    // Retrieve from database
  }

  static async updateTravelBuddy(id: string, updates: Partial<TravelBuddyConfig>): Promise<void> {
    // Update in database
  }
}
