import { Loader2 } from "lucide-react"

export default function DebugConnectionLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-12 w-12 animate-spin text-blue-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-700 mb-2">Loading Debug Tool...</h2>
        <p className="text-gray-500">Preparing connection diagnostics</p>
      </div>
    </div>
  )
}
