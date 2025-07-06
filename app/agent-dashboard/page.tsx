"use client"

import dynamic from "next/dynamic"
import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import { FaUsers } from "react-icons/fa"
import { MdDashboard } from "react-icons/md"
import { PiUserGear } from "react-icons/pi"
import Link from "next/link"

// Load the heavy dashboard purely on the client; skip SSR to avoid `useSession` issues
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

const AgentDashboard = () => {
  const { status } = useSession()

  if (status === "loading") {
    return <p>Loading...</p>
  }

  if (status === "unauthenticated") {
    redirect("/auth/login")
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Agent Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Dashboard Card */}
        <div className="bg-white shadow-md rounded-md p-4">
          <MdDashboard className="text-4xl text-blue-500 mb-2" />
          <h2 className="text-lg font-semibold">Dashboard Overview</h2>
          <p className="text-gray-600">View key metrics and insights related to your agent performance.</p>
          <Link href="/agent-dashboard" className="text-blue-500 hover:underline block mt-2">
            Go to Dashboard
          </Link>
        </div>

        {/* Users Card */}
        <div className="bg-white shadow-md rounded-md p-4">
          <FaUsers className="text-4xl text-green-500 mb-2" />
          <h2 className="text-lg font-semibold">Manage Users</h2>
          <p className="text-gray-600">Add, edit, and manage user accounts within your organization.</p>
          <Link href="/agent-dashboard/users" className="text-green-500 hover:underline block mt-2">
            Manage Users
          </Link>
        </div>

        {/* Control Center Card */}
        <div className="bg-white shadow-md rounded-md p-4">
          <PiUserGear className="text-4xl text-purple-500 mb-2" />
          <h2 className="text-lg font-semibold">Control Center</h2>
          <p className="text-gray-600">Access administrative tools and settings to configure your system.</p>
          <Link href="/admin/control-center" className="text-purple-500 hover:underline block mt-2">
            Control Center
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function AgentDashboardPage() {
  return <AgentDashboardClient />
}
