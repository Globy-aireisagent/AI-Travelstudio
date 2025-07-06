import { NextResponse } from "next/server"
import { getSupabaseServiceClient } from "@/lib/supabase-client"

export async function GET() {
  try {
    console.log("🔍 Starting system health check...")

    const healthReport = {
      timestamp: new Date().toISOString(),
      status: "healthy",
      issues: [] as string[],
      recommendations: [] as string[],
      services: {
        database: "unknown",
        travelCompositor: "unknown",
        authentication: "unknown",
        memory: "unknown",
      },
      stats: {
        activeConnections: 0,
        cachedTokens: 0,
        pendingOperations: 0,
      },
    }

    // 1. Check database connectivity
    try {
      const supabase = getSupabaseServiceClient()
      const { data, error } = await supabase.from("users").select("count").limit(1)

      if (error) {
        healthReport.services.database = "error"
        healthReport.issues.push(`Database error: ${error.message}`)
      } else {
        healthReport.services.database = "healthy"
      }
    } catch (error) {
      healthReport.services.database = "error"
      healthReport.issues.push("Database connection failed")
    }

    // 2. Check Travel Compositor API status
    try {
      const tcResponse = await fetch("https://online.travelcompositor.com/resources/authentication/authenticate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: process.env.TRAVEL_COMPOSITOR_USERNAME || "test",
          password: process.env.TRAVEL_COMPOSITOR_PASSWORD || "test",
          micrositeId: process.env.TRAVEL_COMPOSITOR_MICROSITE_ID || "test",
        }),
      })

      if (tcResponse.status === 401) {
        healthReport.services.travelCompositor = "auth_error"
        healthReport.issues.push("Travel Compositor authentication failed")
        healthReport.recommendations.push("Check Travel Compositor credentials")
      } else if (tcResponse.ok) {
        healthReport.services.travelCompositor = "healthy"
      } else {
        healthReport.services.travelCompositor = "error"
        healthReport.issues.push(`Travel Compositor API error: ${tcResponse.status}`)
      }
    } catch (error) {
      healthReport.services.travelCompositor = "unreachable"
      healthReport.issues.push("Travel Compositor API unreachable")
    }

    // 3. Check memory usage (simplified)
    const memUsage = process.memoryUsage()
    const memUsageMB = Math.round(memUsage.heapUsed / 1024 / 1024)

    if (memUsageMB > 500) {
      healthReport.services.memory = "high"
      healthReport.issues.push(`High memory usage: ${memUsageMB}MB`)
      healthReport.recommendations.push("Consider restarting the application")
    } else {
      healthReport.services.memory = "healthy"
    }

    // 4. Check for common issues
    if (!process.env.TRAVEL_COMPOSITOR_USERNAME) {
      healthReport.issues.push("Missing Travel Compositor credentials")
      healthReport.recommendations.push("Set TRAVEL_COMPOSITOR_USERNAME environment variable")
    }

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      healthReport.issues.push("Missing Supabase configuration")
      healthReport.recommendations.push("Set Supabase environment variables")
    }

    // 5. Overall status
    if (healthReport.issues.length === 0) {
      healthReport.status = "healthy"
    } else if (healthReport.issues.length < 3) {
      healthReport.status = "warning"
    } else {
      healthReport.status = "critical"
    }

    console.log(`✅ Health check complete: ${healthReport.status}`)

    return NextResponse.json(healthReport)
  } catch (error) {
    console.error("❌ Health check failed:", error)
    return NextResponse.json(
      {
        status: "error",
        error: error instanceof Error ? error.message : "Health check failed",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
