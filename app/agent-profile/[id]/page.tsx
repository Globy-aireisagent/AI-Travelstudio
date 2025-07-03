import AgentProfileDashboard from "@/components/agent-profile-dashboard"

interface AgentProfilePageProps {
  params: {
    id: string
  }
}

export default function AgentProfilePage({ params }: AgentProfilePageProps) {
  return <AgentProfileDashboard agentId={params.id} />
}
