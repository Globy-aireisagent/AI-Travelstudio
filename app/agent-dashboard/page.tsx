"use client"

import dynamic from "next/dynamic"

// Load the dashboard client-side only to avoid SSR issues
const AgentDashboardClient = dynamic(() => import("@/components/agent-dashboard-client"), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600 text-lg">Dashboard laden...</p>
      </div>
    </div>
  ),
})

export default function AgentDashboardPage() {
  return <AgentDashboardClient />
}
