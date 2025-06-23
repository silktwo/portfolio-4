"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Database, Key, Settings, Copy, Eye, EyeOff } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface DatabaseConfig {
  name: string
  tokenEnvVar: string
  databaseIdEnvVar: string
  defaultToken?: string
  defaultDatabaseId?: string
  requiredFields: string[]
  description: string
}

const DATABASE_CONFIGS: DatabaseConfig[] = [
  {
    name: "Personal Projects",
    tokenEnvVar: "PERSONAL_TOKEN",
    databaseIdEnvVar: "PERSONAL_DATABASE_ID",
    defaultDatabaseId: "20955dd5594d809999c8c3562cc7e95f",
    requiredFields: ["workTitle", "workFile"],
    description: "Personal portfolio projects and case studies",
  },
  {
    name: "Commercial Projects",
    tokenEnvVar: "COMMERCIAL_TOKEN",
    databaseIdEnvVar: "COMMERCIAL_DATABASE_ID",
    defaultToken: "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",
    defaultDatabaseId: "20955dd5594d8064aeffc4761a8a7c38",
    requiredFields: ["projectTitle", "categoryTags", "thumbnail", "link"],
    description: "Commercial work and client projects",
  },
  {
    name: "Case Studies",
    tokenEnvVar: "CASES_TOKEN",
    databaseIdEnvVar: "CASES_DATABASE_ID",
    defaultToken: "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",
    defaultDatabaseId: "20855dd5594d805f94d8d0f5686b292d",
    requiredFields: [
      "projectTitle",
      "categoryTags",
      "description",
      "team",
      "thumbnail",
      "introImage",
      "projectMedia",
      "draftProcess",
      "addMedia",
      "publish",
      "comingSoon",
      "link",
    ],
    description: "Detailed case studies with full project documentation",
  },
  {
    name: "Blog Posts",
    tokenEnvVar: "NOTION_TOKEN",
    databaseIdEnvVar: "NOTION_DATABASE_ID",
    requiredFields: ["title", "slug", "content"],
    description: "Blog posts and journal entries",
  },
]

export default function CMSSetup() {
  const [configs, setConfigs] = useState<Record<string, { token: string; databaseId: string }>>({})
  const [showTokens, setShowTokens] = useState<Record<string, boolean>>({})
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    // Initialize with default values
    const initialConfigs: Record<string, { token: string; databaseId: string }> = {}
    DATABASE_CONFIGS.forEach((config) => {
      initialConfigs[config.name] = {
        token: config.defaultToken || "",
        databaseId: config.defaultDatabaseId || "",
      }
    })
    setConfigs(initialConfigs)
  }, [])

  const updateConfig = (name: string, field: "token" | "databaseId", value: string) => {
    setConfigs((prev) => ({
      ...prev,
      [name]: {
        ...prev[name],
        [field]: value,
      },
    }))
  }

  const toggleTokenVisibility = (name: string) => {
    setShowTokens((prev) => ({
      ...prev,
      [name]: !prev[name],
    }))
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied to clipboard",
      description: `${label} copied successfully`,
    })
  }

  const generateEnvFile = () => {
    let envContent = "# Notion CMS Configuration\n"
    envContent += "# Add these variables to your .env.local file\n\n"

    DATABASE_CONFIGS.forEach((config) => {
      const userConfig = configs[config.name]
      if (userConfig?.token) {
        envContent += `${config.tokenEnvVar}=${userConfig.token}\n`
      }
      if (userConfig?.databaseId) {
        envContent += `${config.databaseIdEnvVar}=${userConfig.databaseId}\n`
      }
      envContent += "\n"
    })

    return envContent
  }

  const downloadEnvFile = () => {
    const envContent = generateEnvFile()
    const blob = new Blob([envContent], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = ".env.local"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({
      title: "Environment file downloaded",
      description: "Add the .env.local file to your project root",
    })
  }

  const testConnection = async (configName: string) => {
    setSaving(true)
    try {
      const config = DATABASE_CONFIGS.find((c) => c.name === configName)
      if (!config) return

      let endpoint = ""
      if (configName === "Personal Projects") endpoint = "/api/projects"
      else if (configName === "Commercial Projects") endpoint = "/api/commercial"
      else if (configName === "Case Studies") endpoint = "/api/cases"
      else if (configName === "Blog Posts") endpoint = "/api/blog"

      if (endpoint) {
        const response = await fetch(endpoint)
        const result = await response.json()

        if (result.success) {
          toast({
            title: "Connection successful",
            description: `Found ${result.metadata.count} records in ${configName}`,
          })
        } else {
          toast({
            title: "Connection failed",
            description: result.metadata.errors?.[0] || "Unknown error",
            variant: "destructive",
          })
        }
      }
    } catch (error) {
      toast({
        title: "Test failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-6 h-6" />
            Notion CMS Setup
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">
            Configure your Notion databases for Personal Projects, Commercial Projects, Case Studies, and Blog Posts.
            Enter your API tokens and database IDs below.
          </p>
          <div className="flex gap-2">
            <Button onClick={downloadEnvFile} variant="outline">
              <Copy className="w-4 h-4 mr-2" />
              Download .env.local
            </Button>
            <Button onClick={() => copyToClipboard(generateEnvFile(), "Environment variables")} variant="outline">
              <Copy className="w-4 h-4 mr-2" />
              Copy to Clipboard
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Database Configuration Tabs */}
      <Tabs defaultValue="Case Studies" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          {DATABASE_CONFIGS.map((config) => (
            <TabsTrigger key={config.name} value={config.name} className="text-xs">
              {config.name}
            </TabsTrigger>
          ))}
        </TabsList>

        {DATABASE_CONFIGS.map((config) => (
          <TabsContent key={config.name} value={config.name}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  {config.name} Configuration
                </CardTitle>
                <p className="text-sm text-gray-600">{config.description}</p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* API Token */}
                <div className="space-y-2">
                  <Label htmlFor={`${config.name}-token`} className="flex items-center gap-2">
                    <Key className="w-4 h-4" />
                    Notion API Token
                  </Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Input
                        id={`${config.name}-token`}
                        type={showTokens[config.name] ? "text" : "password"}
                        value={configs[config.name]?.token || ""}
                        onChange={(e) => updateConfig(config.name, "token", e.target.value)}
                        placeholder="ntn_..."
                        className="pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => toggleTokenVisibility(config.name)}
                      >
                        {showTokens[config.name] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => copyToClipboard(configs[config.name]?.token || "", `${config.name} token`)}
                      disabled={!configs[config.name]?.token}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500">Environment variable: {config.tokenEnvVar}</p>
                </div>

                {/* Database ID */}
                <div className="space-y-2">
                  <Label htmlFor={`${config.name}-database`}>Database ID</Label>
                  <div className="flex gap-2">
                    <Input
                      id={`${config.name}-database`}
                      value={configs[config.name]?.databaseId || ""}
                      onChange={(e) => updateConfig(config.name, "databaseId", e.target.value)}
                      placeholder="Database ID (with or without dashes)"
                      className="flex-1"
                    />
                    <Button
                      variant="outline"
                      onClick={() =>
                        copyToClipboard(configs[config.name]?.databaseId || "", `${config.name} database ID`)
                      }
                      disabled={!configs[config.name]?.databaseId}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500">Environment variable: {config.databaseIdEnvVar}</p>
                </div>

                {/* Required Fields */}
                <div className="space-y-2">
                  <Label>Required Database Fields</Label>
                  <div className="flex flex-wrap gap-1">
                    {config.requiredFields.map((field) => (
                      <Badge key={field} variant="outline" className="text-xs">
                        {field}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Test Connection */}
                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={() => testConnection(config.name)}
                    disabled={saving || !configs[config.name]?.token || !configs[config.name]?.databaseId}
                  >
                    {saving ? "Testing..." : "Test Connection"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* Environment Variables Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Environment Variables Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="text-xs bg-gray-100 p-4 rounded overflow-auto max-h-64">{generateEnvFile()}</pre>
        </CardContent>
      </Card>

      {/* Setup Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>🚀 Setup Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium">1. Create Notion Integration</h4>
            <ul className="text-sm space-y-1 ml-4">
              <li>• Go to https://www.notion.so/my-integrations</li>
              <li>• Click "New integration"</li>
              <li>• Give it a name and select your workspace</li>
              <li>• Copy the "Internal Integration Token"</li>
            </ul>
          </div>

          <Separator />

          <div className="space-y-2">
            <h4 className="font-medium">2. Share Databases with Integration</h4>
            <ul className="text-sm space-y-1 ml-4">
              <li>• Open each Notion database</li>
              <li>• Click "Share" in the top right</li>
              <li>• Add your integration and give it "Edit" permissions</li>
            </ul>
          </div>

          <Separator />

          <div className="space-y-2">
            <h4 className="font-medium">3. Get Database IDs</h4>
            <ul className="text-sm space-y-1 ml-4">
              <li>• Open your database in Notion</li>
              <li>• Copy the URL - the database ID is the long string after the last "/"</li>
              <li>• Example: notion.so/myworkspace/DATABASE_ID?v=...</li>
            </ul>
          </div>

          <Separator />

          <div className="space-y-2">
            <h4 className="font-medium">4. Add Environment Variables</h4>
            <ul className="text-sm space-y-1 ml-4">
              <li>• Download or copy the .env.local file above</li>
              <li>• Add it to your project root directory</li>
              <li>• Restart your development server</li>
            </ul>
          </div>

          <Separator />

          <div className="space-y-2">
            <h4 className="font-medium">5. Database Schema Requirements</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
              {DATABASE_CONFIGS.map((config) => (
                <div key={config.name} className="border rounded p-3">
                  <h5 className="font-medium text-sm mb-2">{config.name}</h5>
                  <ul className="text-xs space-y-1">
                    {config.requiredFields.slice(0, 6).map((field) => (
                      <li key={field}>• {field}</li>
                    ))}
                    {config.requiredFields.length > 6 && (
                      <li className="text-gray-500">• ... and {config.requiredFields.length - 6} more</li>
                    )}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
