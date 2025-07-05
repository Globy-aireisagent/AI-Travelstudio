export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto bg-blue-200 rounded-full animate-pulse"></div>
          <h1 className="text-4xl font-bold text-gray-900">Loading Newreisplan Test...</h1>
          <p className="text-xl text-gray-600">Preparing connection tests</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl p-6 shadow-sm">
              <div className="w-full h-4 bg-gray-200 rounded animate-pulse mb-4"></div>
              <div className="w-3/4 h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
              <div className="w-1/2 h-4 bg-gray-200 rounded animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
