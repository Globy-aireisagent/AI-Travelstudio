export default function Loading() {
  return (
    <div className="container mx-auto py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Booking Endpoint Discovery</h1>
          <p className="text-gray-600 mt-2">Loading...</p>
        </div>

        <div className="animate-pulse space-y-6">
          <div className="bg-gray-200 h-64 rounded-lg"></div>
          <div className="bg-gray-200 h-32 rounded-lg"></div>
        </div>
      </div>
    </div>
  )
}
