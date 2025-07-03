export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Skeleton */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">Single Microsite Import (Test)</h1>
          <p className="text-xl text-gray-600">Loading...</p>
        </div>

        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>

        {/* Import Controls Skeleton */}
        <div className="bg-white rounded-lg shadow-sm border p-6 space-y-4">
          <div className="h-6 bg-gray-200 rounded w-64 animate-pulse" />
          <div className="h-4 bg-gray-200 rounded w-96 animate-pulse" />
          <div className="h-10 bg-gray-200 rounded w-32 animate-pulse" />
        </div>

        {/* Statistics Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-16 animate-pulse" />
                  <div className="h-8 bg-gray-200 rounded w-12 animate-pulse" />
                </div>
                <div className="h-8 w-8 bg-gray-200 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>

        {/* Agencies List Skeleton */}
        <div className="bg-white rounded-lg shadow-sm border p-6 space-y-4">
          <div className="h-6 bg-gray-200 rounded w-48 animate-pulse" />
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="border rounded-lg p-4">
                <div className="space-y-2">
                  <div className="h-5 bg-gray-200 rounded w-48 animate-pulse" />
                  <div className="flex gap-4">
                    <div className="h-4 bg-gray-200 rounded w-24 animate-pulse" />
                    <div className="h-4 bg-gray-200 rounded w-32 animate-pulse" />
                    <div className="h-4 bg-gray-200 rounded w-20 animate-pulse" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Info Box Skeleton */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="h-5 bg-blue-200 rounded w-64 animate-pulse mb-4" />
          <div className="space-y-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-4 bg-blue-200 rounded w-full animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
