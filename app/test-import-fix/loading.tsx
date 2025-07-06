export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="h-8 bg-gray-200 rounded-lg animate-pulse mb-2"></div>
          <div className="h-4 bg-gray-100 rounded animate-pulse w-1/2"></div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-lg border p-6">
            <div className="h-6 bg-gray-200 rounded animate-pulse mb-4"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-100 rounded animate-pulse"></div>
              <div className="h-4 bg-gray-100 rounded animate-pulse w-3/4"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
