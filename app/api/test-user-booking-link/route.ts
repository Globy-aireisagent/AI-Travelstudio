import { NextResponse } from "next/server"

export async function GET() {
  try {
    console.log("🔍 Testing user-booking linkage...")

    const results = {
      microsites: [] as any[],
      linkageIssues: [] as string[],
      successfulLinks: 0,
      totalBookings: 0,
    }

    // Test alle microsites
    for (let config = 1; config <= 4; config++) {
      try {
        console.log(`Testing microsite ${config}...`)

        // 1. Haal users op
        const usersResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/travel-compositor/user/${config}`)
        const usersData = await usersResponse.json()
        const users = usersData.users || []

        // 2. Haal bookings op
        const bookingsResponse = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/api/travel-compositor/booking-super-fast?config=${config}`,
        )
        const bookingsData = await bookingsResponse.json()
        const bookings = bookingsData.bookings || []

        results.totalBookings += bookings.length

        // 3. Test koppeling voor elke user
        const micrositeResult = {
          micrositeId: config,
          totalUsers: users.length,
          totalBookings: bookings.length,
          userBookingLinks: [] as any[],
        }

        for (const user of users) {
          // Zoek bookings voor deze user
          const userBookings = bookings.filter((booking: any) => {
            // Verschillende manieren om te koppelen
            const emailMatch = booking.clientEmail?.toLowerCase() === user.email?.toLowerCase()
            const userIdMatch = booking.userId === user.id || booking.clientId === user.id
            const nameMatch =
              booking.clientName?.toLowerCase().includes(user.name?.toLowerCase()) ||
              user.name?.toLowerCase().includes(booking.clientName?.toLowerCase())

            return emailMatch || userIdMatch || nameMatch
          })

          micrositeResult.userBookingLinks.push({
            userId: user.id,
            userEmail: user.email,
            userName: user.name,
            linkedBookings: userBookings.length,
            bookingReferences: userBookings.map((b: any) => b.bookingReference),
            linkMethods: userBookings.map((b: any) => {
              const methods = []
              if (b.clientEmail?.toLowerCase() === user.email?.toLowerCase()) methods.push("email")
              if (b.userId === user.id || b.clientId === user.id) methods.push("userId")
              if (
                b.clientName?.toLowerCase().includes(user.name?.toLowerCase()) ||
                user.name?.toLowerCase().includes(b.clientName?.toLowerCase())
              )
                methods.push("name")
              return methods
            }),
          })

          results.successfulLinks += userBookings.length
        }

        results.microsites.push(micrositeResult)

        // Check voor orphaned bookings (bookings zonder user)
        const linkedBookingIds = new Set()
        micrositeResult.userBookingLinks.forEach((link) => {
          bookings
            .filter((b: any) => link.bookingReferences.includes(b.bookingReference))
            .forEach((b: any) => linkedBookingIds.add(b.id))
        })

        const orphanedBookings = bookings.filter((b: any) => !linkedBookingIds.has(b.id))
        if (orphanedBookings.length > 0) {
          results.linkageIssues.push(`Microsite ${config}: ${orphanedBookings.length} bookings zonder user koppeling`)
        }
      } catch (error) {
        results.linkageIssues.push(`Microsite ${config}: ${error}`)
      }
    }

    return NextResponse.json({
      success: true,
      summary: {
        totalMicrosites: results.microsites.length,
        totalBookings: results.totalBookings,
        successfulLinks: results.successfulLinks,
        linkageRate: results.totalBookings > 0 ? (results.successfulLinks / results.totalBookings) * 100 : 0,
        issues: results.linkageIssues.length,
      },
      details: results,
      recommendations: [
        "Gebruik email matching als primaire methode",
        "Implementeer fallback op naam matching",
        "Overweeg booking metadata te verrijken met user IDs",
        "Monitor orphaned bookings regelmatig",
      ],
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
