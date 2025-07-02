"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function DebugOpenAITest() {
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const testOpenAI = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/test-openai")
      const data = await response.json()
      setResult(data)
    } catch (error) {
      setResult({ error: "Failed to test OpenAI API", details: error })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>OpenAI API Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={testOpenAI} disabled={loading}>
            {loading ? "Testing..." : "Test OpenAI API"}
          </Button>

          {result && (
            <div className="mt-4">
              <h3 className="font-semibold mb-2">Result:</h3>
              <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">{JSON.stringify(result, null, 2)}</pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
