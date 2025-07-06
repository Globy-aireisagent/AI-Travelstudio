export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <h2 className="text-xl font-semibold text-gray-900">Loading Single Microsite Test...</h2>
        <p className="text-gray-600">Setting up the import interface...</p>
      </div>
    </div>
  )
}
