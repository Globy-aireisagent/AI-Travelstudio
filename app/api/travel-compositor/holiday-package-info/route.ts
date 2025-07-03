import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const configs = [
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
    ]

    const results = []

    for (const config of configs) {
      try {
        const auth = Buffer.from(`${config.username}:${config.password}`).toString("base64")

        // Try to get packages list
        const packagesResponse = await fetch(
          `https://api.travelcompositor.com/resources/packages/${config.micrositeId}`,
          {
            headers: {
              Authorization: `Basic ${auth}`,
              "Content-Type": "application/json",
            },
          },
        )

        if (packagesResponse.ok) {
          const packages = await packagesResponse.json()
          results.push({
            microsite: config.name,
            micrositeId: config.id,
            packagesCount: Array.isArray(packages) ? packages.length : 0,
            samplePackages: Array.isArray(packages)
              ? packages.slice(0, 5).map((p: any) => ({
                  id: p.id || p.packageId,
                  name: p.name || p.title,
                  destination: p.destination,
                }))
              : [],
            status: "success",
          })
        } else {
          results.push({
            microsite: config.name,
            micrositeId: config.id,
            status: "failed",
            error: `HTTP ${packagesResponse.status}`,
          })
        }
      } catch (error) {
        results.push({
          microsite: config.name,
          micrositeId: config.id,
          status: "error",
          error: error instanceof Error ? error.message : "Unknown error",
        })
      }
    }

    return NextResponse.json({
      success: true,
      microsites: results,
      totalMicrosites: configs.length,
      availableMicrosites: results.filter((r) => r.status === "success").length,
    })
  } catch (error) {
    console.error("❌ Holiday package info error:", error)

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error occurred",
        success: false,
      },
      { status: 500 },
    )
  }
}
