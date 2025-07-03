export default function PackageWerkbladLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      {/* Header Skeleton */}
      <header className="bg-white/80 backdrop-blur-sm border-b shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-200 rounded-xl animate-pulse"></div>
              <div>
                <div className="h-6 w-48 bg-gray-200 rounded animate-pulse mb-2"></div>
                <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="h-8 w-32 bg-gray-200 rounded-full animate-pulse"></div>
              <div className="h-10 w-24 bg-gray-200 rounded-2xl animate-pulse"></div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Skeleton */}
      <div className="container mx-auto px-6 py-8">
        {/* Package Overview Skeleton */}
        <div className="mb-8 bg-white/80 backdrop-blur-sm rounded-lg shadow-xl">
          <div className="h-32 bg-gradient-to-r from-purple-200 to-blue-200 rounded-t-lg animate-pulse"></div>
          <div className="p-6">
            <div className="h-4 w-full bg-gray-200 rounded animate-pulse mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 rounded animate-pulse"></div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs Skeleton */}
        <div className="space-y-6">
          <div className="h-12 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg animate-pulse"></div>

          {/* Content Skeleton */}
          <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-xl">
            <div className="p-6">
              <div className="h-6 w-48 bg-gray-200 rounded animate-pulse mb-4"></div>
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-24 bg-gray-200 rounded animate-pulse"></div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons Skeleton */}
        <div className="flex justify-center space-x-4 mt-8">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-12 w-32 bg-gray-200 rounded-2xl animate-pulse"></div>
          ))}
        </div>
      </div>
    </div>
  )
}
