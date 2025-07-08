"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Database, RefreshCw, AlertTriangle, Copy, ExternalLink } from "lucide-react"

interface TestResult {
  success: boolean
  message?: string
  timestamp?: string
  tables_found?: number
  tables?: string[]
  record_counts?: Record<string, number | string>
  error?: string
  setup_needed?: boolean
  troubleshooting?: string[]
}

const SQL_SCRIPTS = {
  "1. Simple Test": `-- Test basic connection
SELECT 'Hello Neon!' as message, NOW() as current_time;`,

  "2. Create Test Table": `-- Create a simple test table
CREATE TABLE IF NOT EXISTS test_table (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO test_table (name) VALUES ('Test Record');
SELECT * FROM test_table;`,

  "3. Create Agencies": `-- Create agencies table
CREATE TABLE IF NOT EXISTS agencies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO agencies (name, code) VALUES 
('RBS Travel', 'RBS001'),
('Dream Destinations', 'DD002')
ON CONFLICT (code) DO NOTHING;

SELECT * FROM agencies;`,

  "4. Create Users": `-- Create users table (requires agencies table first)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(50) DEFAULT 'agent',
    agency_id UUID REFERENCES agencies(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO users (name, email, role, agency_id) 
SELECT 'John Doe', 'john@rbstravel.com', 'agent', a.id
FROM agencies a WHERE a.code = 'RBS001'
ON CONFLICT (email) DO NOTHING;

SELECT u.*, a.name as agency_name 
FROM users u LEFT JOIN agencies a ON u.agency_id = a.id;`,
}

export default function TestNeonPage() {
  const [result, setResult] = useState<TestResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [copiedScript, setCopiedScript] = useState<string | null>(null)

  const testConnection = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/test-neon")

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      setResult(data)
    } catch (error) {
      console.error("Test failed:", error)
      setResult({
        success: false,
        error: error instanceof Error ? error.message : "Failed to test connection",
        troubleshooting: [
          "Check if your app is running correctly",
          "Verify the API route exists",
          "Check browser console for more details",
        ],
      })
    } finally {
      setLoading(false)
    }
  }

  const copyScript = async (scriptName: string, script: string) => {
    try {
      await navigator.clipboard.writeText(script)
      setCopiedScript(scriptName)
      setTimeout(() => setCopiedScript(null), 2000)
    } catch (error) {
      console.error("Failed to copy:", error)
    }
  }

  useEffect(() => {
    testConnection()
  }, [])

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Neon Database Test</h1>
        <p className="text-muted-foreground">Test your Neon database connection step by step</p>
      </div>

      <div className="space-y-6">
        {/* Connection Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Connection Status
              <Button size="sm" variant="outline" onClick={testConnection} disabled={loading}>
                <RefreshCw className={`h-4 w-4 mr-1 ${loading ? "animate-spin" : ""}`} />
                Test Again
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Testing connection...</span>
              </div>
            ) : result ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  {result.success ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                  <span className={result.success ? "text-green-700" : "text-red-700"}>
                    {result.success ? "Connected!" : "Connection Failed"}
                  </span>
                  {result.setup_needed && <Badge variant="secondary">Setup Needed</Badge>}
                </div>

                {result.message && (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>{result.message}</AlertDescription>
                  </Alert>
                )}

                {result.timestamp && (
                  <div className="text-sm">
                    <strong>Database Time:</strong> {result.timestamp}
                  </div>
                )}

                {result.tables_found !== undefined && (
                  <div className="text-sm">
                    <strong>Tables Found:</strong> {result.tables_found}
                  </div>
                )}

                {result.error && (
                  <Alert variant="destructive">
                    <XCircle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Error:</strong> {result.error}
                    </AlertDescription>
                  </Alert>
                )}

                {result.troubleshooting && (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Troubleshooting Steps:</strong>
                      <ul className="list-disc list-inside mt-2 space-y-1">
                        {result.troubleshooting.map((tip, index) => (
                          <li key={index}>{tip}</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            ) : null}
          </CardContent>
        </Card>

        {/* Quick Setup Guide */}
        {result?.setup_needed && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                Quick Setup Guide
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Badge variant="outline">1</Badge>
                  <div>
                    <p className="font-medium">Use the Database Setup page</p>
                    <p className="text-sm text-muted-foreground">
                      Go to{" "}
                      <Button variant="link" className="p-0 h-auto" asChild>
                        <a href="/database-setup">/database-setup</a>
                      </Button>{" "}
                      to configure your DATABASE_URL
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Badge variant="outline">2</Badge>
                  <div>
                    <p className="font-medium">Get your Neon connection string</p>
                    <p className="text-sm text-muted-foreground">
                      Go to your Neon dashboard → Select your database → Connection Details
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Badge variant="outline">3</Badge>
                  <div>
                    <p className="font-medium">Add to Vercel environment variables</p>
                    <p className="text-sm text-muted-foreground">
                      Vercel Dashboard → Your Project → Settings → Environment Variables
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* SQL Scripts */}
        <Card>
          <CardHeader>
            <CardTitle>SQL Scripts to Try</CardTitle>
            <CardDescription>
              Copy these scripts and paste them in your Neon SQL Editor
              <Button variant="link" size="sm" className="ml-2 p-0 h-auto" asChild>
                <a href="https://console.neon.tech" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Open Neon Console
                </a>
              </Button>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(SQL_SCRIPTS).map(([name, script]) => (
              <div key={name} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">{name}</h4>
                  <Button size="sm" variant="outline" onClick={() => copyScript(name, script)}>
                    <Copy className="h-4 w-4 mr-1" />
                    {copiedScript === name ? "Copied!" : "Copy"}
                  </Button>
                </div>
                <pre className="bg-gray-50 p-3 rounded text-xs overflow-x-auto border">
                  <code>{script}</code>
                </pre>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Results Display */}
        {result?.tables && result.tables.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Database Tables</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {result.tables.map((table) => (
                  <Badge key={table} variant="outline">
                    {table}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {result?.record_counts && Object.keys(result.record_counts).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Record Counts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(result.record_counts).map(([table, count]) => (
                  <div key={table} className="flex justify-between items-center">
                    <span className="font-medium">{table}:</span>
                    <Badge variant={typeof count === "number" ? "default" : "secondary"}>{count}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
