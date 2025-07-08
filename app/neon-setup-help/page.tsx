"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { CheckCircle, AlertTriangle, Database, Play, Copy } from "lucide-react"
import { useState } from "react"

export default function NeonSetupHelpPage() {
  const [copiedScript, setCopiedScript] = useState<string | null>(null)

  const copyToClipboard = async (text: string, scriptName: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedScript(scriptName)
      setTimeout(() => setCopiedScript(null), 2000)
    } catch (err) {
      console.error("Failed to copy text: ", err)
    }
  }

  const script1 = `-- Create agencies table first (referenced by other tables)
CREATE TABLE IF NOT EXISTS agencies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),
    address TEXT,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);`

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Neon Database Setup Help</h1>
        <p className="text-muted-foreground">Stap-voor-stap instructies om je Neon database op te zetten</p>
      </div>

      <div className="grid gap-6">
        {/* Problem Identification */}
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Probleem:</strong> De Run knop in Neon SQL Editor wordt niet blauw/actief. Dit kan komen door:
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Syntax fouten in de SQL</li>
              <li>Database connectie problemen</li>
              <li>Te lange SQL scripts (Neon heeft limieten)</li>
            </ul>
          </AlertDescription>
        </Alert>

        {/* Solution Steps */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Oplossing: Scripts Opsplitsen
            </CardTitle>
            <CardDescription>Voer de SQL scripts uit in kleine delen om problemen te voorkomen</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">Stap 1: Maak Agencies Tabel</h4>
                  <Button size="sm" variant="outline" onClick={() => copyToClipboard(script1, "agencies")}>
                    <Copy className="h-4 w-4 mr-1" />
                    {copiedScript === "agencies" ? "Gekopieerd!" : "Kopieer"}
                  </Button>
                </div>
                <pre className="text-xs bg-gray-50 p-2 rounded overflow-x-auto">{script1}</pre>
              </div>

              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Stap 2: Maak Users Tabel</h4>
                <pre className="text-xs bg-gray-50 p-2 rounded overflow-x-auto">
                  {`CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    role VARCHAR(50) DEFAULT 'client',
    status VARCHAR(20) DEFAULT 'active',
    agency_id UUID REFERENCES agencies(id),
    phone VARCHAR(50),
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);`}
                </pre>
              </div>

              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Stap 3: Maak Feature Tables</h4>
                <pre className="text-xs bg-gray-50 p-2 rounded overflow-x-auto">
                  {`CREATE TABLE IF NOT EXISTS feature_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100) DEFAULT 'general',
    priority VARCHAR(20) DEFAULT 'medium',
    status VARCHAR(20) DEFAULT 'open',
    user_id UUID REFERENCES users(id),
    votes_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);`}
                </pre>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Troubleshooting */}
        <Card>
          <CardHeader>
            <CardTitle>Troubleshooting Tips</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                <div>
                  <p className="font-medium">Run knop grijs?</p>
                  <p className="text-sm text-muted-foreground">
                    Probeer een kleinere query eerst, zoals: <code>SELECT NOW();</code>
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                <div>
                  <p className="font-medium">Syntax errors?</p>
                  <p className="text-sm text-muted-foreground">Controleer of alle haakjes en komma's correct zijn</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                <div>
                  <p className="font-medium">Database sleeping?</p>
                  <p className="text-sm text-muted-foreground">
                    Neon free tier databases slapen na inactiviteit. Wacht even en probeer opnieuw.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Test */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="h-5 w-5" />
              Quick Test
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-2">Test eerst of je database werkt met deze simpele query:</p>
            <pre className="bg-gray-50 p-3 rounded text-sm">SELECT NOW() as current_time;</pre>
            <p className="text-sm text-muted-foreground mt-2">
              Als deze werkt, dan is je connectie goed en kun je de tabellen maken.
            </p>
          </CardContent>
        </Card>

        {/* Next Steps */}
        <Card>
          <CardHeader>
            <CardTitle>Na Setup</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p>
                ✅ Test je setup op: <code>/test-neon</code>
              </p>
              <p>
                ✅ Probeer het feature systeem: <code>/feature-request</code>
              </p>
              <p>
                ✅ Bekijk de agent dashboard: <code>/agent-dashboard</code>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
