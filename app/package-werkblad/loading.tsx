export default function PackageWerkbladLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
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
              <div className="h-10 w-24 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-10 w-24 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Skeleton */}
      <div className="container mx-auto px-6 py-8">
        {/* Package Overview Skeleton */}
        <div className="mb-8 bg-white/80 backdrop-blur-sm rounded-lg shadow-xl">
          <div className="bg-gradient-to-r from-orange-500 to-red-600 rounded-t-lg p-6">
            <div className="flex justify-between items-start">
              <div>
                <div className="h-8 w-64 bg-white/20 rounded animate-pulse mb-4"></div>
                <div className="flex items-center space-x-4">
                  <div className="h-4 w-24 bg-white/20 rounded animate-pulse"></div>
                  <div className="h-4 w-20 bg-white/20 rounded animate-pulse"></div>
                  <div className="h-4 w-32 bg-white/20 rounded animate-pulse"></div>
                </div>
              </div>
              <div className="text-right">
                <div className="h-8 w-32 bg-white/20 rounded animate-pulse mb-2"></div>
                <div className="h-4 w-24 bg-white/20 rounded animate-pulse mb-2"></div>
                <div className="h-6 w-20 bg-white/20 rounded animate-pulse"></div>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="h-64 w-full bg-gray-200 rounded-lg animate-pulse mb-6"></div>
            <div className="space-y-4">
              <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 w-1/2 bg-gray-200 rounded animate-pulse"></div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="p-4 bg-gray-100 rounded-lg">
                  <div className="h-8 w-8 bg-gray-200 rounded animate-pulse mx-auto mb-2"></div>
                  <div className="h-6 w-12 bg-gray-200 rounded animate-pulse mx-auto mb-2"></div>
                  <div className="h-4 w-16 bg-gray-200 rounded animate-pulse mx-auto"></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs Skeleton */}
        <div className="space-y-6">
          <div className="grid w-full grid-cols-2 md:grid-cols-6 gap-1 bg-white/80 backdrop-blur-sm rounded-lg p-1">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="flex flex-col items-center space-y-1 p-3">
                <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-3 w-12 bg-gray-200 rounded animate-pulse"></div>
              </div>
            ))}
          </div>

          {/* Content Cards Skeleton */}
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white/80 backdrop-blur-sm rounded-lg shadow-lg p-6">
                <div className="h-6 w-48 bg-gray-200 rounded animate-pulse mb-4"></div>
                <div className="space-y-2">
                  <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 w-1/2 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons Skeleton */}
        <div className="flex justify-center space-x-4 mt-8">
          <div className="h-10 w-24 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>
    </div>
  )
}
