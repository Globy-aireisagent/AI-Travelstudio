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
              <div className="h-10 w-32 bg-gray-200 rounded-2xl animate-pulse"></div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Skeleton */}
      <div className="container mx-auto px-6 py-8">
        {/* Package Header Skeleton */}
        <div className="mb-8 p-8 bg-white/80 backdrop-blur-sm rounded-xl shadow-xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Image Skeleton */}
            <div className="lg:col-span-1">
              <div className="aspect-video bg-gray-200 rounded-xl animate-pulse"></div>
            </div>

            {/* Info Skeleton */}
            <div className="lg:col-span-2">
              <div className="space-y-4">
                <div className="h-8 w-3/4 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-6 w-full bg-gray-200 rounded animate-pulse"></div>
                <div className="h-6 w-2/3 bg-gray-200 rounded animate-pulse"></div>

                {/* Key Details Skeleton */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="p-4 bg-gray-100 rounded-lg">
                      <div className="w-6 h-6 bg-gray-200 rounded mx-auto mb-2 animate-pulse"></div>
                      <div className="h-4 w-16 bg-gray-200 rounded mx-auto mb-1 animate-pulse"></div>
                      <div className="h-5 w-20 bg-gray-200 rounded mx-auto animate-pulse"></div>
                    </div>
                  ))}
                </div>

                {/* Badges Skeleton */}
                <div className="flex flex-wrap gap-2 mt-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-6 w-20 bg-gray-200 rounded-full animate-pulse"></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Skeleton */}
        <div className="space-y-6">
          <div className="grid grid-cols-6 gap-2 bg-white/80 backdrop-blur-sm shadow-lg rounded-2xl p-2">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-10 bg-gray-200 rounded-xl animate-pulse"></div>
            ))}
          </div>

          {/* Content Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="p-6 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg">
                <div className="h-6 w-1/2 bg-gray-200 rounded animate-pulse mb-4"></div>
                <div className="space-y-3">
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
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-12 w-32 bg-gray-200 rounded-2xl animate-pulse"></div>
          ))}
        </div>
      </div>
    </div>
  )
}
