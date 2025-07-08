import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

export async function GET() {
  try {
    // Check if DATABASE_URL is configured
    if (!process.env.DATABASE_URL) {
      return NextResponse.json({
        success: false,
        setup_needed: true,
        message: "DATABASE_URL not configured - using demo mode",
        troubleshooting: [
          "Add DATABASE_URL to your Vercel environment variables",
          "Get your connection string from Neon dashboard",
          "Format: postgresql://username:password@hostname/database?sslmode=require",
        ],
      })
    }

    // Test basic connection
    const sql = neon(process.env.DATABASE_URL)

    // Simple query first
    const timeResult = await sql`SELECT NOW() as current_time, 'Connected!' as status`

    // Get table count
    const tableResult = await sql`
      SELECT COUNT(*) as table_count 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `

    // Get table names
    const tablesResult = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `

    const tables = tablesResult.map((row) => row.table_name)

    // Get record counts for existing tables
    const record_counts: Record<string, number | string> = {}

    for (const table of tables) {
      try {
        const countResult = await sql`SELECT COUNT(*) as count FROM ${sql(table)}`
        record_counts[table] = Number.parseInt(countResult[0].count)
      } catch (error) {
        record_counts[table] = "Error counting"
      }
    }

    return NextResponse.json({
      success: true,
      message: "Database connection successful!",
      timestamp: timeResult[0].current_time,
      tables_found: Number.parseInt(tableResult[0].table_count),
      tables: tables,
      record_counts: record_counts,
    })
  } catch (error) {
    console.error("Database connection error:", error)

    // Parse error message for better troubleshooting
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    const troubleshooting = []

    if (errorMessage.includes("authentication")) {
      troubleshooting.push("Check your database username and password")
      troubleshooting.push("Verify your DATABASE_URL format")
    }

    if (errorMessage.includes("connection")) {
      troubleshooting.push("Check if your database is running")
      troubleshooting.push("Verify the hostname in your DATABASE_URL")
    }

    if (errorMessage.includes("SSL") || errorMessage.includes("ssl")) {
      troubleshooting.push("Add ?sslmode=require to your DATABASE_URL")
    }

    if (troubleshooting.length === 0) {
      troubleshooting.push("Check your DATABASE_URL format")
      troubleshooting.push("Verify your Neon database is active")
      troubleshooting.push("Try copying the connection string again from Neon")
    }

    return NextResponse.json({
      success: false,
      error: errorMessage,
      troubleshooting: troubleshooting,
      setup_needed: true,
    })
  }
}
