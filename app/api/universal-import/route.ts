import { type NextRequest, NextResponse } from "next/server"
import { UniversalTravelImporter } from "@/lib/universal-travel-importer"

export async function POST(request: NextRequest) {
  try {
    const { type, id, micrositeId, userEmail, userRole } = await request.json()

    console.log(`🚀 Universal import request: ${type} ${id} by ${userRole} ${userEmail}`)

    // Permission validation
    if (!userEmail || !userRole) {
      return NextResponse.json({ error: "User authentication required" }, { status: 401 })
    }

    const importer = new UniversalTravelImporter()

    // Add user context to the import request
    const importRequest = {
      type,
      id,
      micrositeId,
      userEmail,
      userRole,
    }

    const result = await importer.import(importRequest)

    // Additional permission check for the imported data
    if (result.success && result.data) {
      const canImport = await validateImportPermission(result.data, userRole, userEmail, type)

      if (!canImport) {
        console.log(`❌ Permission denied for ${userRole} ${userEmail} to import ${type} ${id}`)
        return NextResponse.json(
          {
            success: false,
            error: "Je hebt geen toestemming om deze data te importeren",
          },
          { status: 403 },
        )
      }
    }

    console.log(`✅ Import ${result.success ? "successful" : "failed"} for ${userRole} ${userEmail}`)

    return NextResponse.json(result)
  } catch (error) {
    console.error("❌ Universal import error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 },
    )
  }
}

// Validate if user can import this specific data
async function validateImportPermission(
  data: any,
  userRole: string,
  userEmail: string,
  type: string,
): Promise<boolean> {
  // Super admins can import everything
  if (userRole === "super_admin") return true

  // Admins can import everything from their microsites
  if (userRole === "admin") return true

  // Agents can only import their own data
  if (userRole === "agent") {
    switch (type) {
      case "booking":
        const bookingOwnerEmail = data.client?.email || data.clientEmail || data.customer?.email
        return bookingOwnerEmail === userEmail

      case "idea":
        const ideaOwnerEmail = data.customer?.email || data.clientEmail || data.user
        return ideaOwnerEmail === userEmail

      case "package":
        // Packages are generally public, but could be restricted
        return true

      default:
        return false
    }
  }

  return false
}
