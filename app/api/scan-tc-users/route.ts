import { type NextRequest, NextResponse } from "next/server"

interface TravelCompositorUser {
  id: string
  email: string
  firstName: string
  lastName: string
  agencyName: string
  agencyId: string
  micrositeId: string
  role: string
  status: string
  bookingsCount: number
  ideasCount: number
  lastLogin: string
  canImport: boolean
  importReason?: string
}

export async function POST(request: NextRequest) {
  try {
    console.log("🔍 Scanning Travel Compositor for users...")

    const { includeInactive = false } = await request.json()

    // Microsites configuratie
    const microsites = [
      {
        id: "1",
        name: "Primary Microsite",
        username: process.env.TRAVEL_COMPOSITOR_USERNAME!,
        password: process.env.TRAVEL_COMPOSITOR_PASSWORD!,
        micrositeId: process.env.TRAVEL_COMPOSITOR_MICROSITE_ID!,
      },
      {
        id: "2",
        name: "Secondary Microsite",
        username: process.env.TRAVEL_COMPOSITOR_USERNAME_2!,
        password: process.env.TRAVEL_COMPOSITOR_PASSWORD_2!,
        micrositeId: process.env.TRAVEL_COMPOSITOR_MICROSITE_ID_2!,
      },
      {
        id: "3",
        name: "Tertiary Microsite",
        username: process.env.TRAVEL_COMPOSITOR_USERNAME_3!,
        password: process.env.TRAVEL_COMPOSITOR_PASSWORD_3!,
        micrositeId: process.env.TRAVEL_COMPOSITOR_MICROSITE_ID_3!,
      },
      {
        id: "4",
        name: "Quaternary Microsite",
        username: process.env.TRAVEL_COMPOSITOR_USERNAME_4!,
        password: process.env.TRAVEL_COMPOSITOR_PASSWORD_4!,
        micrositeId: process.env.TRAVEL_COMPOSITOR_MICROSITE_ID_4!,
      },
    ].filter((config) => config.username && config.password && config.micrositeId)

    const allUsers: TravelCompositorUser[] = []

    for (const microsite of microsites) {
      try {
        console.log(`🔍 Scanning ${microsite.name}...`)

        const users = await scanMicrositeUsers(microsite, includeInactive)
        allUsers.push(...users)

        console.log(`✅ Found ${users.length} users in ${microsite.name}`)
      } catch (error) {
        console.error(`❌ Failed to scan ${microsite.name}:`, error)
        continue
      }
    }

    // Dedupliceer users op email
    const uniqueUsers = deduplicateUsers(allUsers)

    console.log(`✅ Scan complete: ${uniqueUsers.length} unique users found`)

    return NextResponse.json({
      success: true,
      users: uniqueUsers,
      summary: {
        total: uniqueUsers.length,
        importable: uniqueUsers.filter((u) => u.canImport).length,
        micrositesScanned: microsites.length,
      },
    })
  } catch (error) {
    console.error("❌ User scan failed:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 },
    )
  }
}

async function scanMicrositeUsers(microsite: any, includeInactive: boolean): Promise<TravelCompositorUser[]> {
  const baseUrl = "https://online.travelcompositor.com"

  // 1. Authenticeer
  const authResponse = await fetch(`${baseUrl}/resources/authentication/authenticate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      username: microsite.username,
      password: microsite.password,
      micrositeId: microsite.micrositeId,
    }),
  })

  if (!authResponse.ok) {
    throw new Error(`Authentication failed for ${microsite.name}: ${authResponse.status}`)
  }

  const authData = await authResponse.json()
  const token = authData.token

  // 2. Haal users op - probeer verschillende endpoints
  const userEndpoints = [
    `/resources/user/${microsite.micrositeId}`,
    `/resources/users/${microsite.micrositeId}`,
    `/resources/agency/${microsite.micrositeId}`,
  ]

  let users: any[] = []

  for (const endpoint of userEndpoints) {
    try {
      const response = await fetch(`${baseUrl}${endpoint}`, {
        headers: {
          "auth-token": token,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      })

      if (response.ok) {
        const data = await response.json()

        // Verschillende response formaten
        if (data.users) {
          users = data.users
        } else if (data.user) {
          users = Array.isArray(data.user) ? data.user : [data.user]
        } else if (data.agencies) {
          // Als we agencies krijgen, extract users
          users = extractUsersFromAgencies(data.agencies)
        } else if (Array.isArray(data)) {
          users = data
        }

        if (users.length > 0) {
          console.log(`📋 Found ${users.length} users via ${endpoint}`)
          break
        }
      }
    } catch (error) {
      console.log(`⚠️ Endpoint ${endpoint} failed:`, error)
      continue
    }
  }

  // 3. Transform users naar ons formaat
  const transformedUsers: TravelCompositorUser[] = []

  for (const user of users) {
    try {
      const transformedUser = await transformUser(user, microsite, token, baseUrl)

      // Filter op status
      if (!includeInactive && transformedUser.status !== "active") {
        continue
      }

      transformedUsers.push(transformedUser)
    } catch (error) {
      console.log(`⚠️ Failed to transform user:`, error)
      continue
    }
  }

  return transformedUsers
}

function extractUsersFromAgencies(agencies: any[]): any[] {
  const users: any[] = []

  for (const agency of agencies) {
    if (agency.users && Array.isArray(agency.users)) {
      for (const user of agency.users) {
        users.push({
          ...user,
          agencyName: agency.name || agency.agencyName,
          agencyId: agency.id || agency.agencyId,
        })
      }
    }
  }

  return users
}

async function transformUser(user: any, microsite: any, token: string, baseUrl: string): Promise<TravelCompositorUser> {
  // Haal extra user data op indien nodig
  let bookingsCount = 0
  let ideasCount = 0

  try {
    // Probeer bookings te tellen
    const bookingResponse = await fetch(
      `${baseUrl}/resources/booking/${microsite.micrositeId}?clientEmail=${encodeURIComponent(user.email || user.username)}`,
      {
        headers: {
          "auth-token": token,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      },
    )

    if (bookingResponse.ok) {
      const bookingData = await bookingResponse.json()
      bookingsCount = bookingData.booking?.length || bookingData.bookings?.length || 0
    }
  } catch (error) {
    // Niet kritiek als dit faalt
  }

  try {
    // Probeer ideas te tellen
    const ideaResponse = await fetch(
      `${baseUrl}/resources/travelideas/${microsite.micrositeId}?clientEmail=${encodeURIComponent(user.email || user.username)}`,
      {
        headers: {
          "auth-token": token,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      },
    )

    if (ideaResponse.ok) {
      const ideaData = await ideaResponse.json()
      ideasCount = ideaData.travelIdea?.length || ideaData.ideas?.length || 0
    }
  } catch (error) {
    // Niet kritiek als dit faalt
  }

  // Bepaal of user importeerbaar is
  const canImport = determineImportability(user)

  return {
    id: user.id || user.userId || user.username,
    email: user.email || user.username || "",
    firstName: user.firstName || user.first_name || user.name?.split(" ")[0] || "",
    lastName: user.lastName || user.last_name || user.name?.split(" ").slice(1).join(" ") || "",
    agencyName: user.agencyName || user.agency_name || "Unknown Agency",
    agencyId: user.agencyId || user.agency_id || "",
    micrositeId: microsite.micrositeId,
    role: user.role || user.userRole || "agent",
    status: user.status || user.active ? "active" : "inactive",
    bookingsCount,
    ideasCount,
    lastLogin: user.lastLogin || user.last_login || "",
    canImport: canImport.canImport,
    importReason: canImport.reason,
  }
}

function determineImportability(user: any): { canImport: boolean; reason?: string } {
  // Check email
  if (!user.email && !user.username) {
    return { canImport: false, reason: "Geen email adres" }
  }

  // Check voor test accounts
  const email = user.email || user.username || ""
  if (email.includes("test") || email.includes("demo") || email.includes("example")) {
    return { canImport: false, reason: "Test account" }
  }

  // Check voor systeem accounts
  if (email.includes("system") || email.includes("admin@") || email.includes("noreply")) {
    return { canImport: false, reason: "Systeem account" }
  }

  // Check status
  if (user.status === "deleted" || user.status === "suspended") {
    return { canImport: false, reason: `Status: ${user.status}` }
  }

  return { canImport: true }
}

function deduplicateUsers(users: TravelCompositorUser[]): TravelCompositorUser[] {
  const seen = new Map<string, TravelCompositorUser>()

  for (const user of users) {
    const key = user.email.toLowerCase()

    if (!seen.has(key)) {
      seen.set(key, user)
    } else {
      // Als we dezelfde user in meerdere microsites hebben,
      // neem degene met de meeste data
      const existing = seen.get(key)!
      if (user.bookingsCount + user.ideasCount > existing.bookingsCount + existing.ideasCount) {
        seen.set(key, user)
      }
    }
  }

  return Array.from(seen.values())
}
