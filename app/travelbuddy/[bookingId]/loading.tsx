export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-700 mb-2">TravelBuddy wordt geladen...</h2>
        <p className="text-gray-500">We bereiden je persoonlijke reis-assistent voor</p>
      </div>
    </div>
  )
}
