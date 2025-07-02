interface CacheEntry {
  data: any
  timestamp: number
  ttl: number
}

interface CacheStats {
  hits: number
  misses: number
  totalRequests: number
  hitRate: number
}

class SimpleBookingCache {
  private cache = new Map<string, CacheEntry>()
  private stats = { hits: 0, misses: 0 }
  private defaultTTL = 15 * 60 * 1000 // 15 minutes

  get(key: string): any | null {
    const entry = this.cache.get(key)

    if (!entry) {
      this.stats.misses++
      return null
    }

    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key)
      this.stats.misses++
      return null
    }

    this.stats.hits++
    return entry.data
  }

  set(key: string, data: any, ttl?: number): void {
    const entry: CacheEntry = {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL,
    }

    this.cache.set(key, entry)
  }

  has(key: string): boolean {
    const entry = this.cache.get(key)
    if (!entry) return false

    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key)
      return false
    }

    return true
  }

  getStats(): CacheStats {
    const totalRequests = this.stats.hits + this.stats.misses
    return {
      hits: this.stats.hits,
      misses: this.stats.misses,
      totalRequests,
      hitRate: totalRequests > 0 ? (this.stats.hits / totalRequests) * 100 : 0,
    }
  }

  clear(): void {
    this.cache.clear()
    this.stats = { hits: 0, misses: 0 }
  }

  // Cleanup expired entries
  cleanup(): void {
    const now = Date.now()
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key)
      }
    }
  }
}

// Export singleton instance
export const simpleBookingCache = new SimpleBookingCache()

// Auto cleanup every 5 minutes
setInterval(
  () => {
    simpleBookingCache.cleanup()
  },
  5 * 60 * 1000,
)
