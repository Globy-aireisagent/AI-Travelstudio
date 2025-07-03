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
              <div className="h-8 w-24 bg-gray-200 rounded-full animate-pulse"></div>
              <div className="h-10 w-32 bg-gray-200 rounded-2xl animate-pulse"></div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Skeleton */}
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Package Overview Skeleton */}
          <div className="mb-8 bg-white/80 backdrop-blur-sm rounded-lg shadow-xl">
            <div className="bg-gradient-to-r from-purple-500 to-blue-600 rounded-t-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="h-8 w-64 bg-white/20 rounded animate-pulse mb-2"></div>
                  <div className="h-4 w-48 bg-white/20 rounded animate-pulse"></div>
                </div>
                <div className="text-right">
                  <div className="h-8 w-24 bg-white/20 rounded animate-pulse mb-1"></div>
                  <div className="h-4 w-20 bg-white/20 rounded animate-pulse"></div>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-3">
                    <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
                    <div>
                      <div className="h-5 w-20 bg-gray-200 rounded animate-pulse mb-1"></div>
                      <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Tabs Skeleton */}
          <div className="space-y-6">
            <div className="grid w-full grid-cols-6 bg-white/80 backdrop-blur-sm shadow-lg rounded-2xl p-2 gap-2">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-10 bg-gray-200 rounded-xl animate-pulse"></div>
              ))}
            </div>

            {/* Content Cards Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white/80 backdrop-blur-sm rounded-lg shadow-lg">
                  <div className="p-6">
                    <div className="h-6 w-32 bg-gray-200 rounded animate-pulse mb-4"></div>
                    <div className="space-y-2">
                      <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-4 w-1/2 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Action Buttons Skeleton */}
            <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-lg">
              <div className="p-6">
                <div className="flex flex-wrap gap-4 justify-center">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
