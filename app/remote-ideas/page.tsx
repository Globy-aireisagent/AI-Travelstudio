"use client"

import { RemoteTravelIdeaBrowser } from "@/components/remote-travel-idea-browser"

export default function RemoteIdeasPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Remote Travel Ideas</h1>
        <p className="text-gray-600 mt-2">Blader door beschikbare travel ideas en importeer alleen wat je nodig hebt</p>
      </div>

      <RemoteTravelIdeaBrowser />
    </div>
  )
}
