// Agent microsite management

import { MultiMicrositeClient, type MicrositeCredentials, type AgentMicrosites } from "./multi-microsite-client"

export class AgentMicrositeManager {
  private static instance: AgentMicrositeManager
  private agentClients: Map<string, MultiMicrositeClient> = new Map()

  static getInstance(): AgentMicrositeManager {
    if (!AgentMicrositeManager.instance) {
      AgentMicrositeManager.instance = new AgentMicrositeManager()
    }
    return AgentMicrositeManager.instance
  }

  // Initialize agent with their microsites
  initializeAgent(agentId: string, microsites: MicrositeCredentials[]) {
    const agentMicrosites: AgentMicrosites = {
      agentId,
      microsites,
    }

    const client = new MultiMicrositeClient(agentMicrosites)
    this.agentClients.set(agentId, client)

    return client
  }

  // Get client for specific agent
  getAgentClient(agentId: string): MultiMicrositeClient | null {
    return this.agentClients.get(agentId) || null
  }

  // Add microsite to existing agent
  addMicrositeToAgent(agentId: string, microsite: MicrositeCredentials) {
    const existingClient = this.agentClients.get(agentId)
    if (existingClient) {
      const currentMicrosites = existingClient.getAllMicrosites()
      const updatedMicrosites = [...currentMicrosites, microsite]

      // Reinitialize with updated microsites
      this.initializeAgent(agentId, updatedMicrosites)
    }
  }

  // Remove microsite from agent
  removeMicrositeFromAgent(agentId: string, micrositeId: string) {
    const existingClient = this.agentClients.get(agentId)
    if (existingClient) {
      const currentMicrosites = existingClient.getAllMicrosites()
      const updatedMicrosites = currentMicrosites.filter((m) => m.id !== micrositeId)

      // Reinitialize with updated microsites
      this.initializeAgent(agentId, updatedMicrosites)
    }
  }
}

// Update the createDefaultAgentClient function to support multiple microsites:

export function createDefaultAgentClient(agentId: string): MultiMicrositeClient {
  const microsites: MicrositeCredentials[] = [
    // Eerste microsite (huidige)
    {
      id: "microsite-1",
      name: "Hoofdmicrosite",
      username: process.env.TRAVEL_COMPOSITOR_USERNAME!,
      password: process.env.TRAVEL_COMPOSITOR_PASSWORD!,
      micrositeId: process.env.TRAVEL_COMPOSITOR_MICROSITE_ID!,
      baseUrl: "https://online.travelcompositor.com/api",
    },
    // Tweede microsite (nieuwe)
    {
      id: "microsite-2",
      name: "Tweede Microsite",
      username: process.env.TRAVEL_COMPOSITOR_USERNAME_2!,
      password: process.env.TRAVEL_COMPOSITOR_PASSWORD_2!,
      micrositeId: process.env.TRAVEL_COMPOSITOR_MICROSITE_ID_2!,
      baseUrl: "https://online.travelcompositor.com/api",
    },
  ]

  const manager = AgentMicrositeManager.getInstance()
  return manager.initializeAgent(agentId, microsites)
}
