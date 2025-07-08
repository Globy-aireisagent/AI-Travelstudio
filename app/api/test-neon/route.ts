import { NextResponse } from "next/server"
import { safeQuery, isDatabaseAvailable } from "@/lib/neon-client"

export async function GET() {
  try {
    console.log("🧪 Testing Neon database connection...")

    // Test environment variables
    const envCheck = {
      DATABASE_URL: !!process.env.DATABASE_URL,
    }

    console.log("🔑 Environment variables:", envCheck)

    if (!isDatabaseAvailable()) {
      return NextResponse.json({
        success: false,
        message: "Database not configured",
        environment: envCheck,
        recommendations: ["Add DATABASE_URL environment variable"],
      })
    }

    // Test basic connection
    const { data: versionResult, error: versionError } = await safeQuery("SELECT version()")

    if (versionError) {
      return NextResponse.json({
        success: false,
        message: "Database connection failed",
        error: versionError,
        environment: envCheck,
      })
    }

    // Test table existence
    const tables = ["users", "bookings", "travel_ideas", "feature_requests", "agencies", "webhook_events"]
    const tableResults = []

    for (const table of tables) {
      const { data, error } = await safeQuery(
        `
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = $1
        )
      `,
        [table],
      )

      tableResults.push({
        name: table,
        exists: data?.[0]?.exists || false,
        error: error,
      })
    }

    // Test data counts
    const dataCounts = []
    for (const table of tables) {
      const tableExists = tableResults.find((t) => t.name === table)?.exists
      if (tableExists) {
        const { data, error } = await safeQuery(`SELECT COUNT(*) as count FROM ${table}`)
        dataCounts.push({
          table,
          count: data?.[0]?.count || 0,
          error,
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: "Neon database connection successful",
      timestamp: new Date().toISOString(),
      environment: envCheck,
      database: {
        version: versionResult?.[0]?.version,
        tables: tableResults,
        data: dataCounts,
      },
      recommendations: [
        !envCheck.DATABASE_URL && "Add DATABASE_URL to environment variables",
        tableResults.some((t) => !t.exists) && "Run database setup scripts to create missing tables",
      ].filter(Boolean),
    })
  } catch (error) {
    console.error("❌ Neon test failed:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}

export async function POST() {
  try {
    if (!isDatabaseAvailable()) {
      return NextResponse.json({ success: false, error: "Database not configured" }, { status: 503 })
    }

    // Test write operation
    const testQuery = `
      INSERT INTO feature_requests (title, description, category, priority, status) 
      VALUES ($1, $2, $3, $4, $5) 
      RETURNING id
    `

    const { data: insertResult, error: insertError } = await safeQuery(testQuery, [
      "Test Feature Request",
      "This is a test to verify database write operations",
      "feature",
      "low",
      "open",
    ])

    if (insertError) {
      return NextResponse.json(
        {
          success: false,
          message: "Database write test failed",
          error: insertError,
        },
        { status: 500 },
      )
    }

    // Clean up test data
    const testId = insertResult?.[0]?.id
    if (testId) {
      await safeQuery("DELETE FROM feature_requests WHERE id = $1", [testId])
    }

    return NextResponse.json({
      success: true,
      message: "Database write test successful",
      testId,
    })
  } catch (error) {
    console.error("❌ Neon write test failed:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
