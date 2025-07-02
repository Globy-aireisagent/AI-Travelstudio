import { Skeleton } from "@/components/ui/skeleton"

export default function IntakePreviewLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="px-4 py-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    </div>
  )
}
