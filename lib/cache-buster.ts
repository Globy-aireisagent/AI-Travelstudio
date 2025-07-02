// Cache busting utility
export class CacheBuster {
  private static version = Date.now()

  static getVersion(): string {
    return this.version.toString()
  }

  static bustCache(): void {
    this.version = Date.now()
    console.log(`🔄 Cache busted: ${this.version}`)
  }

  static addCacheBuster(url: string): string {
    const separator = url.includes("?") ? "&" : "?"
    return `${url}${separator}_cb=${this.version}`
  }
}

// Force cache bust on module load
if (typeof window !== "undefined") {
  CacheBuster.bustCache()
}
