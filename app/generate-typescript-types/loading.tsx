import { Loader2 } from "lucide-react"

export default function Loading() {
  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Generating TypeScript types...</p>
        </div>
      </div>
    </div>
  )
}
