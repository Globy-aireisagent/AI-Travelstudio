"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { AnalyticsData } from "@/lib/analytics-service"

export function RealAnalyticsDashboard({ userId = "default" }: { userId?: string }) {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAnalytics()
  }, [userId])

  const fetchAnalytics = async () => {
    try {
      const response = await fetch(`/api/analytics?userId=${userId}`)
      const data = await response.json()
      setAnalytics(data)
    } catch (error) {
      console.error("Failed to fetch analytics:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading analytics...</div>
  }

  if (!analytics) {
    return <div className="text-center py-8">Failed to load analytics</div>
  }

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Gebruik Overzicht</CardTitle>
          <CardDescription>Je activiteit deze maand</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span>Roadbooks gegenereerd</span>
              <span className="font-bold">
                {analytics.roadbooksGenerated} / {analytics.roadbooksLimit}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span>Media bestanden</span>
              <span className="font-bold">
                {analytics.mediaGenerated} / {analytics.mediaLimit}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span>AI Reisbuddies</span>
              <span className="font-bold">
                {analytics.aiReisbuddies} / {analytics.reisbuddiesLimit}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span>Totaal berichten</span>
              <span className="font-bold">{analytics.totalMessages.toLocaleString()}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Populaire Bestemmingen</CardTitle>
          <CardDescription>Meest gegenereerde roadbooks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analytics.popularDestinations.length > 0 ? (
              analytics.popularDestinations.map((item, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-sm">{item.destination}</span>
                  <Badge variant="outline">{item.count}</Badge>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500 py-4">Nog geen bestemmingen gegenereerd</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default RealAnalyticsDashboard
