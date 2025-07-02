import { Loader2 } from "lucide-react"

export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
        <p>Searching for activity images...</p>
      </div>
    </div>
  )
}
