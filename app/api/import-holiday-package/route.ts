import { type NextRequest, NextResponse } from "next/server"

// Multi-microsite client for holiday packages
class HolidayPackageClient {
  private configs = [
    {
      id: "1",
      name: "rondreis-planner",
      username: process.env.TRAVEL_COMPOSITOR_USERNAME!,
      password: process.env.TRAVEL_COMPOSITOR_PASSWORD!,
      micrositeId: process.env.TRAVEL_COMPOSITOR_MICROSITE_ID!,
    },
    {
      id: "2",
      name: "reisbureaunederland",
      username: process.env.TRAVEL_COMPOSITOR_USERNAME_2!,
      password: process.env.TRAVEL_COMPOSITOR_PASSWORD_2!,
      micrositeId: process.env.TRAVEL_COMPOSITOR_MICROSITE_ID_2!,
    },
    {
      id: "3",
      name: "microsite-3",
      username: process.env.TRAVEL_COMPOSITOR_USERNAME_3!,
      password: process.env.TRAVEL_COMPOSITOR_PASSWORD_3!,
      micrositeId: process.env.TRAVEL_COMPOSITOR_MICROSITE_ID_3!,
    },
    {
      id: "4",
      name: "microsite-4",
      username: process.env.TRAVEL_COMPOSITOR_USERNAME_4!,
      password: process.env.TRAVEL_COMPOSITOR_PASSWORD_4!,
      micrositeId: process.env.TRAVEL_COMPOSITOR_MICROSITE_ID_4!,
    },
  ]

  private async makeAuthenticatedRequest(config: any, endpoint: string) {
    const auth = Buffer.from(`${config.username}:${config.password}`).toString("base64")

    const response = await fetch(`https://api.travelcompositor.com${endpoint}`, {
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    return response.json()
  }

  async findHolidayPackage(packageId: string, specificMicrositeId?: string) {
    const configsToTry = specificMicrositeId ? this.configs.filter((c) => c.id === specificMicrositeId) : this.configs

    const searchMethods = [
      // Method 1: Direct package lookup
      (config: any) => this.makeAuthenticatedRequest(config, `/resources/package/${config.micrositeId}/${packageId}`),

      // Method 2: Holiday packages endpoint
      (config: any) =>
        this.makeAuthenticatedRequest(config, `/resources/packages/${config.micrositeId}`).then((packages) =>
          packages.find((p: any) => p.id === packageId || p.packageId === packageId),
        ),

      // Method 3: Travel ideas (sometimes packages are stored as ideas)
      (config: any) =>
        this.makeAuthenticatedRequest(config, `/resources/travelideas/${config.micrositeId}`).then((ideas) =>
          ideas.find((i: any) => i.id === packageId || i.ideaId === packageId),
        ),

      // Method 4: Search in calendar packages
      (config: any) =>
        this.makeAuthenticatedRequest(config, `/resources/packages/${config.micrositeId}/calendar`).then((calendar) =>
          calendar.packages?.find((p: any) => p.id === packageId),
        ),
    ]

    for (const config of configsToTry) {
      console.log(`🔍 Searching in ${config.name} (${config.id})...`)

      for (let i = 0; i < searchMethods.length; i++) {
        try {
          console.log(`  📋 Method ${i + 1}: Trying search method...`)
          const result = await searchMethods[i](config)

          if (result) {
            console.log(`✅ Found package in ${config.name} using method ${i + 1}`)
            return {
              package: result,
              microsite: config,
              searchMethod: `Method ${i + 1} in ${config.name}`,
            }
          }
        } catch (error) {
          console.log(`  ❌ Method ${i + 1} failed:`, error instanceof Error ? error.message : "Unknown error")
          continue
        }
      }
    }

    throw new Error(`Holiday Package ${packageId} not found in any configured microsite`)
  }
}

export async function POST(request: NextRequest) {
  try {
    const { holidayPackageId, micrositeId } = await request.json()

    if (!holidayPackageId) {
      return NextResponse.json({ error: "Holiday Package ID is required" }, { status: 400 })
    }

    console.log(`🏖️ Starting holiday package import for: ${holidayPackageId}`)
    console.log(`📍 Microsite preference: ${micrositeId || "auto-detect"}`)

    const client = new HolidayPackageClient()
    const result = await client.findHolidayPackage(holidayPackageId, micrositeId === "auto" ? undefined : micrositeId)

    console.log(`✅ Holiday package found:`, {
      packageId: result.package.id || result.package.packageId,
      microsite: result.microsite.name,
      searchMethod: result.searchMethod,
    })

    return NextResponse.json({
      success: true,
      package: result.package,
      microsite: result.microsite,
      searchMethod: result.searchMethod,
      message: `Holiday Package ${holidayPackageId} successfully imported from ${result.microsite.name}`,
    })
  } catch (error) {
    console.error("❌ Holiday package import error:", error)

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error occurred",
        success: false,
      },
      { status: 404 },
    )
  }
}
