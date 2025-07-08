import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseServiceClient, supabase } from "@/lib/supabase-client"
import { testConnection, isDatabaseAvailable } from "@/lib/neon-client"

export async function GET(request: NextRequest) {
  try {
    console.log("🧪 Testing Supabase connection...")

    // Test environment variables
    const envCheck = {
      NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    }

    console.log("🔑 Environment variables:", envCheck)

    // Test client-side connection
    let clientTest = { success: false, error: null }
    try {
      const { data, error } = await supabase.from("users").select("count").limit(1)
      if (error) throw error
      clientTest = { success: true, error: null }
      console.log("✅ Client connection successful")
    } catch (error) {
      clientTest = { success: false, error: error.message }
      console.log("❌ Client connection failed:", error.message)
    }

    // Test server-side connection
    let serverTest = { success: false, error: null }
    try {
      const supabaseServer = getSupabaseServiceClient()
      const { data, error } = await supabaseServer.from("users").select("count").limit(1)
      if (error) throw error
      serverTest = { success: true, error: null }
      console.log("✅ Server connection successful")
    } catch (error) {
      serverTest = { success: false, error: error.message }
      console.log("❌ Server connection failed:", error.message)
    }

    // Test database tables
    let tablesTest = { success: false, tables: [], error: null }
    try {
      const supabaseServer = getSupabaseServiceClient()

      const tables = [
        "users",
        "bookings",
        "travel_ideas",
        "feature_requests",
        "feature_votes",
        "feature_comments",
        "webhook_events",
        "agencies",
      ]

      const tableResults = []

      for (const table of tables) {
        try {
          const { data, error } = await supabaseServer.from(table).select("count").limit(1)
          tableResults.push({
            name: table,
            exists: !error,
            error: error?.message || null,
          })
        } catch (err) {
          tableResults.push({
            name: table,
            exists: false,
            error: err.message,
          })
        }
      }

      tablesTest = {
        success: true,
        tables: tableResults,
        error: null,
      }
      console.log("✅ Tables test completed")
    } catch (error) {
      tablesTest = { success: false, tables: [], error: error.message }
      console.log("❌ Tables test failed:", error.message)
    }

    // Redirect to Neon Database test if Supabase is not used
    if (
      !envCheck.NEXT_PUBLIC_SUPABASE_URL ||
      !envCheck.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      !envCheck.SUPABASE_SERVICE_ROLE_KEY
    ) {
      return NextResponse.json({
        success: false,
        message: "Supabase has been replaced with Neon Database",
        redirect: "/test-neon",
        timestamp: new Date().toISOString(),
        environment: {
          NEXT_PUBLIC_SUPABASE_URL: false,
          NEXT_PUBLIC_SUPABASE_ANON_KEY: false,
          SUPABASE_SERVICE_ROLE_KEY: false,
        },
        tests: {
          client: { success: false, error: "Supabase client removed" },
          server: { success: false, error: "Supabase server client removed" },
          tables: {
            success: false,
            tables: [],
            error: "Please use /api/test-neon instead",
          },
        },
        recommendations: [
          "Use /test-neon page to test your Neon database connection",
          "Set DATABASE_URL environment variable in Vercel",
          "Run the SQL scripts in your Neon dashboard to create tables",
          "Remove any remaining Supabase environment variables",
        ],
      })
    }

    // Test Neon database connection
    if (!isDatabaseAvailable()) {
      return NextResponse.json({
        success: false,
        error: "DATABASE_URL not configured",
        demo: true,
        instructions: [
          "Set your DATABASE_URL in Vercel environment variables",
          "Run the SQL scripts in your Neon console (step by step)",
          "Refresh this page to test the connection",
        ],
      })
    }

    const connectionTest = await testConnection()

    if (!connectionTest.success) {
      return NextResponse.json({
        success: false,
        error: connectionTest.error,
        demo: true,
      })
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      environment: envCheck,
      tests: {
        client: clientTest,
        server: serverTest,
        tables: tablesTest,
      },
      recommendations: [
        !envCheck.NEXT_PUBLIC_SUPABASE_URL && "Add NEXT_PUBLIC_SUPABASE_URL to environment variables",
        !envCheck.NEXT_PUBLIC_SUPABASE_ANON_KEY && "Add NEXT_PUBLIC_SUPABASE_ANON_KEY to environment variables",
        !envCheck.SUPABASE_SERVICE_ROLE_KEY && "Add SUPABASE_SERVICE_ROLE_KEY to environment variables",
        !clientTest.success && "Fix client-side Supabase connection",
        !serverTest.success && "Fix server-side Supabase connection",
        !tablesTest.success && "Check database table setup",
      ].filter(Boolean),
      neonTest: {
        success: connectionTest.success,
        message: connectionTest.message,
        timestamp: connectionTest.timestamp,
        database: "Neon PostgreSQL",
      },
    })
  } catch (error) {
    console.error("❌ Supabase test failed:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 },
    )
  }
}
