export async function GET() {
  const username = process.env.TRAVEL_COMPOSITOR_USERNAME
  const password = process.env.TRAVEL_COMPOSITOR_PASSWORD
  const micrositeId = process.env.TRAVEL_COMPOSITOR_MICROSITE_ID

  return Response.json({
    message: "Test endpoint works!",
    hasUsername: !!username,
    hasPassword: !!password,
    hasMicrositeId: !!micrositeId,
    usernameLength: username?.length || 0,
    micrositeId: micrositeId ? `${micrositeId.substring(0, 3)}...` : "missing",
  })
}
