import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseServiceClient } from "@/lib/supabase-client"

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseServiceClient()

    // Test database connection
    const { data: agencies, error: agenciesError } = await supabase.from("agencies").select("*").limit(5)

    if (agenciesError) {
      console.error("Agencies query error:", agenciesError)
    }

    const { data: users, error: usersError } = await supabase.from("users").select("*").limit(5)

    if (usersError) {
      console.error("Users query error:", usersError)
    }

    const { data: featureRequests, error: featuresError } = await supabase.from("feature_requests").select("*").limit(5)

    if (featuresError) {
      console.error("Feature requests query error:", featuresError)
    }

    const { data: bookings, error: bookingsError } = await supabase.from("bookings").select("*").limit(5)

    if (bookingsError) {
      console.error("Bookings query error:", bookingsError)
    }

    // Test table existence
    const { data: tables, error: tablesError } = await supabase.rpc("exec_sql", {
      sql: `
          SELECT table_name 
          FROM information_schema.tables 
          WHERE table_schema = 'public' 
          ORDER BY table_name
        `,
    })

    return NextResponse.json({
      success: true,
      message: "Supabase connection successful",
      data: {
        agencies: {
          count: agencies?.length || 0,
          data: agencies,
          error: agenciesError?.message,
        },
        users: {
          count: users?.length || 0,
          data: users,
          error: usersError?.message,
        },
        featureRequests: {
          count: featureRequests?.length || 0,
          data: featureRequests,
          error: featuresError?.message,
        },
        bookings: {
          count: bookings?.length || 0,
          data: bookings,
          error: bookingsError?.message,
        },
        tables: {
          data: tables,
          error: tablesError?.message,
        },
      },
      environment: {
        hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30) + "...",
      },
    })
  } catch (error) {
    console.error("Supabase test error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Supabase connection failed",
        error: error instanceof Error ? error.message : "Unknown error",
        environment: {
          hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
          hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
          hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
          supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30) + "...",
        },
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseServiceClient()
    const body = await request.json()

    // Test inserting a test record
    const { data, error } = await supabase
      .from("feature_requests")
      .insert({
        title: "Test Feature Request",
        description: "This is a test feature request to verify Supabase is working",
        user_id: "test-user",
        category: "feature",
        priority: "low",
        status: "open",
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        {
          success: false,
          message: "Failed to insert test data",
          error: error.message,
        },
        { status: 500 },
      )
    }

    // Clean up test data
    await supabase.from("feature_requests").delete().eq("id", data.id)

    return NextResponse.json({
      success: true,
      message: "Supabase write test successful",
      data: data,
    })
  } catch (error) {
    console.error("Supabase write test error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Supabase write test failed",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
