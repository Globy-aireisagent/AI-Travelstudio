import { NextResponse } from "next/server"

// Global cleanup state
const cleanupState = {
  authTokens: new Map(),
  activeImports: new Set(),
  lastCleanup: null as Date | null,
}

export async function POST() {
  try {
    console.log("🧹 Starting system cleanup...")

    const cleanupReport = {
      timestamp: new Date().toISOString(),
      actions: [] as string[],
      cleared: {
        authTokens: 0,
        activeImports: 0,
        memoryCache: false,
      },
    }

    // 1. Clear authentication tokens
    const tokenCount = cleanupState.authTokens.size
    cleanupState.authTokens.clear()
    cleanupReport.cleared.authTokens = tokenCount
    cleanupReport.actions.push(`Cleared ${tokenCount} cached auth tokens`)

    // 2. Clear active import operations
    const importCount = cleanupState.activeImports.size
    cleanupState.activeImports.clear()
    cleanupReport.cleared.activeImports = importCount
    cleanupReport.actions.push(`Cleared ${importCount} active import operations`)

    // 3. Force garbage collection if available
    if (global.gc) {
      global.gc()
      cleanupReport.cleared.memoryCache = true
      cleanupReport.actions.push("Forced garbage collection")
    }

    // 4. Clear any module-level caches
    if (require.cache) {
      const cacheKeys = Object.keys(require.cache).filter(
        (key) => key.includes("travel-compositor") || key.includes("booking-cache") || key.includes("user-manager"),
      )

      cacheKeys.forEach((key) => {
        delete require.cache[key]
      })

      if (cacheKeys.length > 0) {
        cleanupReport.actions.push(`Cleared ${cacheKeys.length} module caches`)
      }
    }

    // 5. Reset any global state
    cleanupState.lastCleanup = new Date()
    cleanupReport.actions.push("Reset global cleanup state")

    console.log(`✅ System cleanup complete: ${cleanupReport.actions.length} actions taken`)

    return NextResponse.json({
      success: true,
      message: "System cleanup completed successfully",
      report: cleanupReport,
    })
  } catch (error) {
    console.error("❌ System cleanup failed:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Cleanup failed",
      },
      { status: 500 },
    )
  }
}
