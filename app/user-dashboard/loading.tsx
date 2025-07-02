export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <div className="h-10 bg-gray-200 rounded w-96 mx-auto mb-4 animate-pulse"></div>
          <div className="h-6 bg-gray-200 rounded w-64 mx-auto animate-pulse"></div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-lg p-6">
              <div className="h-8 w-8 bg-gray-200 rounded mx-auto mb-2 animate-pulse"></div>
              <div className="h-8 bg-gray-200 rounded w-16 mx-auto mb-2 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-20 mx-auto animate-pulse"></div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-lg p-6">
          <div className="h-6 bg-gray-200 rounded w-32 mb-4 animate-pulse"></div>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 bg-gray-200 rounded animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
