"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { CheckCircle, XCircle, Database, RefreshCw, AlertTriangle, Copy, Eye, EyeOff, ExternalLink } from "lucide-react"

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

  "5. Create Feature Requests": `-- Create feature requests table (requires users table first)
CREATE TABLE IF NOT EXISTS feature_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    priority VARCHAR(20) DEFAULT 'medium',
    user_id UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO feature_requests (title, description, user_id)
SELECT 'Better Dashboard', 'Need a more intuitive dashboard', u.id
FROM users u WHERE u.email = 'john@rbstravel.com'
ON CONFLICT DO NOTHING;

SELECT fr.*, u.name as user_name 
FROM feature_requests fr 
LEFT JOIN users u ON fr.user_id = u.id;`,
}

export default function DatabaseSetupPage() {
  const [databaseUrl, setDatabaseUrl] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [result, setResult] = useState<TestResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [copiedScript, setCopiedScript] = useState<string | null>(null)

  // Parse DATABASE_URL to show connection details
  const parseConnectionString = (url: string) => {
    try {
      const parsed = new URL(url)
      return {
        host: parsed.hostname,
        port: parsed.port || "5432",
        database: parsed.pathname.slice(1),
        username: parsed.username,
        password: parsed.password,
        ssl: parsed.searchParams.get("sslmode") === "require",
      }
    } catch {
      return null
    }
  }

  const connectionDetails = parseConnectionString(databaseUrl)

  const testConnection = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/test-database-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ databaseUrl }),
      })

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
          "Check if your DATABASE_URL format is correct",
          "Verify your Neon database is active",
          "Make sure the credentials are correct",
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

  const copyForVercel = () => {
    const vercelCommand = `DATABASE_URL="${databaseUrl}"`
    navigator.clipboard.writeText(vercelCommand)
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Database Setup</h1>
        <p className="text-muted-foreground">Configure and test your Neon database connection</p>
      </div>

      <div className="space-y-6">
        {/* Database URL Input */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Database Connection
            </CardTitle>
            <CardDescription>Paste your Neon database connection string here to test and configure</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="database-url">DATABASE_URL</Label>
              <div className="relative">
                <Textarea
                  id="database-url"
                  placeholder="postgresql://username:password@hostname/database?sslmode=require"
                  value={databaseUrl}
                  onChange={(e) => setDatabaseUrl(e.target.value)}
                  className="min-h-[80px] font-mono text-sm"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              {!showPassword && databaseUrl && (
                <p className="text-xs text-muted-foreground">Password is hidden. Click the eye icon to show/hide.</p>
              )}
            </div>

            {connectionDetails && (
              <div className="bg-gray-50 p-3 rounded-lg">
                <h4 className="font-medium mb-2">Connection Details:</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <strong>Host:</strong> {connectionDetails.host}
                  </div>
                  <div>
                    <strong>Port:</strong> {connectionDetails.port}
                  </div>
                  <div>
                    <strong>Database:</strong> {connectionDetails.database}
                  </div>
                  <div>
                    <strong>Username:</strong> {connectionDetails.username}
                  </div>
                  <div>
                    <strong>SSL:</strong> {connectionDetails.ssl ? "Required" : "Not required"}
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <Button onClick={testConnection} disabled={!databaseUrl || loading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                Test Connection
              </Button>
              {databaseUrl && (
                <Button variant="outline" onClick={copyForVercel}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy for Vercel
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Test Results */}
        {result && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {result.success ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
                Test Results
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <span className={result.success ? "text-green-700" : "text-red-700"}>
                  {result.success ? "Connection Successful!" : "Connection Failed"}
                </span>
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
            </CardContent>
          </Card>
        )}

        {/* Vercel Setup Instructions */}
        {databaseUrl && (
          <Card>
            <CardHeader>
              <CardTitle>Vercel Environment Variable Setup</CardTitle>
              <CardDescription>Add this to your Vercel project environment variables</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <strong>Variable Name:</strong>
                  <Button size="sm" variant="outline" onClick={() => navigator.clipboard.writeText("DATABASE_URL")}>
                    <Copy className="h-4 w-4 mr-1" />
                    Copy
                  </Button>
                </div>
                <code className="text-sm">DATABASE_URL</code>
              </div>

              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <strong>Variable Value:</strong>
                  <Button size="sm" variant="outline" onClick={() => navigator.clipboard.writeText(databaseUrl)}>
                    <Copy className="h-4 w-4 mr-1" />
                    Copy
                  </Button>
                </div>
                <code className="text-xs break-all">
                  {showPassword ? databaseUrl : databaseUrl.replace(/:([^@]+)@/, ":***@")}
                </code>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">Steps:</p>
                <ol className="list-decimal list-inside text-sm space-y-1">
                  <li>Go to your Vercel Dashboard</li>
                  <li>Select your project</li>
                  <li>Go to Settings → Environment Variables</li>
                  <li>
                    Add new variable: <code>DATABASE_URL</code>
                  </li>
                  <li>Paste the value above</li>
                  <li>Save and redeploy</li>
                </ol>
              </div>
            </CardContent>
          </Card>
        )}

        {/* SQL Scripts */}
        <Card>
          <CardHeader>
            <CardTitle>SQL Scripts to Run</CardTitle>
            <CardDescription>
              Run these scripts in your Neon SQL Editor to set up your database
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
