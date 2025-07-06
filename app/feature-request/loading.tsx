import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function FeatureRequestLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      {/* Header Skeleton */}
      <header className="bg-white/80 backdrop-blur-sm border-b shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gray-200 rounded-2xl animate-pulse"></div>
            <div className="w-10 h-10 bg-gray-200 rounded-xl animate-pulse"></div>
            <div>
              <div className="h-6 w-48 bg-gray-200 rounded animate-pulse mb-1"></div>
              <div className="h-4 w-64 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-6 max-w-4xl">
        <Card className="bg-white rounded-3xl shadow-2xl border-0">
          <CardHeader className="bg-gray-200 rounded-t-3xl animate-pulse">
            <div className="h-8 w-64 bg-gray-300 rounded mb-2"></div>
            <div className="h-4 w-96 bg-gray-300 rounded"></div>
          </CardHeader>
          <CardContent className="p-8 space-y-8">
            {/* Form Fields Skeleton */}
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-12 w-full bg-gray-200 rounded-2xl animate-pulse"></div>
              </div>
              <div className="space-y-2">
                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-12 w-full bg-gray-200 rounded-2xl animate-pulse"></div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="h-4 w-28 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-12 w-full bg-gray-200 rounded-2xl animate-pulse"></div>
            </div>

            <div className="space-y-2">
              <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-32 w-full bg-gray-200 rounded-2xl animate-pulse"></div>
            </div>

            {/* Category Grid Skeleton */}
            <div className="space-y-4">
              <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
              <div className="grid gap-3 md:grid-cols-2">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="h-16 bg-gray-200 rounded-2xl animate-pulse"></div>
                ))}
              </div>
            </div>

            {/* Priority Grid Skeleton */}
            <div className="space-y-4">
              <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
              <div className="grid gap-3 md:grid-cols-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-16 bg-gray-200 rounded-2xl animate-pulse"></div>
                ))}
              </div>
            </div>

            {/* Submit Button Skeleton */}
            <div className="flex gap-4 pt-6">
              <div className="flex-1 h-12 bg-gray-200 rounded-2xl animate-pulse"></div>
              <div className="w-24 h-12 bg-gray-200 rounded-2xl animate-pulse"></div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
