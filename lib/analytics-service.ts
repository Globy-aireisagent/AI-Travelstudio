// Real analytics service
export interface AnalyticsData {
  roadbooksGenerated: number
  roadbooksLimit: number
  mediaGenerated: number
  mediaLimit: number
  aiReisbuddies: number
  reisbuddiesLimit: number
  totalMessages: number
  popularDestinations: Array<{
    destination: string
    count: number
  }>
}

export class AnalyticsService {
  // Track roadbook generation
  static async trackRoadbookGenerated(userId: string, destination: string) {
    // Store in database/localStorage
    const analytics = this.getStoredAnalytics(userId)
    analytics.roadbooksGenerated += 1
    analytics.popularDestinations = this.updateDestinationCount(analytics.popularDestinations, destination)
    this.storeAnalytics(userId, analytics)
  }

  // Track media generation
  static async trackMediaGenerated(userId: string, type: "image" | "video") {
    const analytics = this.getStoredAnalytics(userId)
    analytics.mediaGenerated += 1
    this.storeAnalytics(userId, analytics)
  }

  // Track AI Reisbuddy creation
  static async trackReisbuddyCreated(userId: string) {
    const analytics = this.getStoredAnalytics(userId)
    analytics.aiReisbuddies += 1
    this.storeAnalytics(userId, analytics)
  }

  // Track messages
  static async trackMessage(userId: string) {
    const analytics = this.getStoredAnalytics(userId)
    analytics.totalMessages += 1
    this.storeAnalytics(userId, analytics)
  }

  // Get current analytics
  static getAnalytics(userId: string): AnalyticsData {
    return this.getStoredAnalytics(userId)
  }

  // Private methods
  private static getStoredAnalytics(userId: string): AnalyticsData {
    if (typeof window === "undefined") {
      // Server-side: return defaults or fetch from database
      return this.getDefaultAnalytics()
    }

    const stored = localStorage.getItem(`analytics_${userId}`)
    if (stored) {
      return JSON.parse(stored)
    }
    return this.getDefaultAnalytics()
  }

  private static storeAnalytics(userId: string, analytics: AnalyticsData) {
    if (typeof window !== "undefined") {
      localStorage.setItem(`analytics_${userId}`, JSON.stringify(analytics))
    }
    // Also send to API/database for persistence
  }

  private static getDefaultAnalytics(): AnalyticsData {
    return {
      roadbooksGenerated: 0,
      roadbooksLimit: 200,
      mediaGenerated: 0,
      mediaLimit: 500,
      aiReisbuddies: 0,
      reisbuddiesLimit: 50,
      totalMessages: 0,
      popularDestinations: [],
    }
  }

  private static updateDestinationCount(
    destinations: Array<{ destination: string; count: number }>,
    newDestination: string,
  ) {
    const existing = destinations.find((d) => d.destination === newDestination)
    if (existing) {
      existing.count += 1
    } else {
      destinations.push({ destination: newDestination, count: 1 })
    }
    return destinations.sort((a, b) => b.count - a.count).slice(0, 5) // Top 5
  }
}
