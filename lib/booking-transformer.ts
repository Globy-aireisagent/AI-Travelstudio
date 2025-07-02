// Booking transformer utility
export async function transformToRoadbook(booking: any) {
  const dayMap = new Map()

  booking.activities?.forEach((activity: any) => {
    const date = activity.date
    if (!dayMap.has(date)) {
      dayMap.set(date, {
        date,
        activities: [],
        hotel: null,
      })
    }
    dayMap.get(date).activities.push(activity)
  })

  booking.hotels?.forEach((hotel: any) => {
    const checkinDate = hotel.checkin.split("T")[0]
    if (dayMap.has(checkinDate)) {
      dayMap.get(checkinDate).hotel = hotel
    }
  })

  const days = Array.from(dayMap.values()).map((day, index) => ({
    day: index + 1,
    date: day.date,
    title: generateDayTitle(day),
    activities: day.activities,
    accommodation: day.hotel,
    locations: extractLocations(day),
  }))

  return {
    id: booking.id,
    title: `Reis naar ${booking.destination}`,
    client: booking.client?.name,
    startDate: booking.startDate,
    endDate: booking.endDate,
    totalDays: days.length,
    days,
    vouchers: booking.vouchers || [],
  }
}

function generateDayTitle(day: any): string {
  const locations = day.activities.map((a: any) => a.location).filter(Boolean)
  const uniqueLocations = [...new Set(locations)]

  if (uniqueLocations.length > 0) {
    return uniqueLocations.join(" - ")
  }

  return `Dag ${day.date}`
}

function extractLocations(day: any): string[] {
  const locations = []

  if (day.hotel) {
    locations.push(day.hotel.city)
  }

  day.activities.forEach((activity: any) => {
    if (activity.location) {
      locations.push(activity.location)
    }
  })

  return [...new Set(locations)]
}
