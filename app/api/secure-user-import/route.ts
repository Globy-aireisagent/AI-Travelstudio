import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseServiceClient } from "@/lib/supabase-client"
import crypto from "crypto"

export async function POST(request: NextRequest) {
  try {
    console.log("🔐 Starting secure user import with Supabase...")

    const { users, settings } = await request.json()

    if (!users || !Array.isArray(users)) {
      return NextResponse.json({ error: "Invalid users data" }, { status: 400 })
    }

    const supabase = getSupabaseServiceClient()
    const results = []

    for (const user of users) {
      try {
        console.log(`👤 Processing user: ${user.email}`)

        const result = await importUserToSupabase(user, settings, supabase)
        results.push(result)

        // Log de import actie
        if (settings.auditLog) {
          await logImportAction(user, result, settings, supabase)
        }
      } catch (error) {
        console.error(`❌ Failed to import user ${user.email}:`, error)
        results.push({
          success: false,
          user,
          error: error instanceof Error ? error.message : "Unknown error",
          actions: [],
        })
      }
    }

    const successful = results.filter((r) => r.success).length
    console.log(`✅ Import complete: ${successful}/${users.length} users imported successfully`)

    return NextResponse.json({
      success: true,
      results,
      summary: {
        total: users.length,
        successful,
        failed: users.length - successful,
      },
    })
  } catch (error) {
    console.error("❌ Secure import failed:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 },
    )
  }
}

async function importUserToSupabase(user: any, settings: any, supabase: any) {
  const actions = []

  try {
    // 1. Check of gebruiker al bestaat
    const { data: existingUser } = await supabase.from("users").select("*").eq("email", user.email).single()

    if (existingUser) {
      throw new Error("Gebruiker bestaat al in het systeem")
    }

    // 2. Maak user aan in Supabase
    const userData = {
      email: user.email,
      first_name: user.firstName || "",
      last_name: user.lastName || "",
      role: settings.preserveRoles ? user.role : "agent",
      status: "pending_verification",
      travel_compositor_id: user.id,
      agency_name: user.agencyName,
      agency_id: user.agencyId,
      microsite_id: user.micrositeId,
      email_verified: false,
      password_reset_required: settings.forcePasswordReset,
      import_source: "travel_compositor",
      import_date: new Date().toISOString(),
    }

    const { data: newUser, error: insertError } = await supabase.from("users").insert(userData).select().single()

    if (insertError) {
      throw new Error(`Database insert failed: ${insertError.message}`)
    }

    actions.push("✅ Gebruiker aangemaakt in Supabase")

    // 3. Genereer email verificatie token
    if (settings.requireEmailVerification) {
      const verificationToken = crypto.randomBytes(32).toString("hex")
      const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 uur

      const { error: tokenError } = await supabase.from("email_verification_tokens").insert({
        user_id: newUser.id,
        token: verificationToken,
        expires_at: tokenExpiry.toISOString(),
      })

      if (tokenError) {
        console.error("Token creation failed:", tokenError)
      } else {
        actions.push("🔐 Email verificatie token gegenereerd")
      }
    }

    // 4. Genereer password reset token
    if (settings.forcePasswordReset) {
      const resetToken = crypto.randomBytes(32).toString("hex")
      const resetExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 dagen

      const { error: resetError } = await supabase.from("password_reset_tokens").insert({
        user_id: newUser.id,
        token: resetToken,
        expires_at: resetExpiry.toISOString(),
      })

      if (resetError) {
        console.error("Reset token creation failed:", resetError)
      } else {
        actions.push("🔑 Wachtwoord reset token gegenereerd")
      }
    }

    // 5. Importeer booking metadata (optioneel)
    if (settings.importBookings && user.bookingsCount > 0) {
      actions.push(`📋 Klaar voor import van ${user.bookingsCount} bookings`)
    }

    return {
      success: true,
      user,
      actions,
      userId: newUser.id,
    }
  } catch (error) {
    console.error(`❌ Import failed for ${user.email}:`, error)
    return {
      success: false,
      user,
      error: error instanceof Error ? error.message : "Unknown error",
      actions,
    }
  }
}

async function logImportAction(user: any, result: any, settings: any, supabase: any) {
  try {
    await supabase.from("audit_logs").insert({
      action: "user_import",
      resource_type: "user",
      resource_id: user.email,
      details: {
        source: "travel_compositor",
        settings,
        success: result.success,
        actions: result.actions,
        error: result.error,
      },
    })

    console.log(`📝 Audit log created for ${user.email}`)
  } catch (error) {
    console.error("❌ Failed to create audit log:", error)
  }
}
