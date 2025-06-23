"use client"

import { useState, useEffect } from "react"
import Navigation from "@/components/navigation"
import Footer from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { CheckCircle, XCircle, AlertCircle, Database, Key, FileText, RefreshCwIcon as Refresh } from "lucide-react"

interface DebugResult {
  success: boolean
  data: any[]
  metadata: {
    count: number
    errors: string[]
    warnings: string[]
    debugInfo: any
  }
}

export default function CasesDebugPage() {
  const [debugResult, setDebugResult] = useState<DebugResult | null>(null)
  const [loading, setLoading] = useState(false)

  const runDebugTest = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/cases")
      const result = await response.json()
      setDebugResult(result)
    } catch (error) {
      setDebugResult({
        success: false,
        data: [],
        metadata: {
          count: 0,
          errors: [error instanceof Error ? error.message : "Unknown error"],
          warnings: [],
          debugInfo: { clientError: true },
        },
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    runDebugTest()
  }, [])

  return (
    <div className="bg-white min-h-screen overflow-x-hidden">
      <div className="w-[calc(100%-40px)] sm:w-[calc(100%-60px)] mx-[20px] sm:mx-[30px] py-[30px]">
        {/* Navigation */}
        <div className="mb-8">
          <Navigation />
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">Cases Database Debug</h1>
          <p className="text-gray-600">Diagnostic information for your Cases Notion database connection</p>
        </div>

        {/* Test Button */}
        <div className="mb-6">
          <Button onClick={runDebugTest} disabled={loading}>
            <Refresh className="w-4 h-4 mr-2" />
            {loading ? "Running Test..." : "Run Test"}
          </Button>
        </div>

        {debugResult && (
          <div className="space-y-6">
            {/* Connection Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {debugResult.success ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600" />
                  )}
                  Connection Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Status:</span>
                    <Badge variant={debugResult.success ? "default" : "destructive"}>
                      {debugResult.success ? "Connected" : "Failed"}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Records Found:</span>
                    <span>{debugResult.metadata.count}</span>
                  </div>
                  {debugResult.metadata.debugInfo.token && (
                    <div className="flex items-center gap-2">
                      <Key className="w-4 h-4" />
                      <span className="font-medium">Token:</span>
                      <span className="font-mono text-sm">{debugResult.metadata.debugInfo.token}</span>
                    </div>
                  )}
                  {debugResult.metadata.debugInfo.databaseId && (
                    <div className="flex items-center gap-2">
                      <Database className="w-4 h-4" />
                      <span className="font-medium">Database ID:</span>
                      <span className="font-mono text-sm">{debugResult.metadata.debugInfo.databaseId}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Errors */}
            {debugResult.metadata.errors.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-600">
                    <XCircle className="w-5 h-5" />
                    Errors ({debugResult.metadata.errors.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {debugResult.metadata.errors.map((error, index) => (
                      <div key={index} className="text-sm text-red-600 bg-red-50 p-3 rounded">
                        {error}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Warnings */}
            {debugResult.metadata.warnings.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-yellow-600">
                    <AlertCircle className="w-5 h-5" />
                    Warnings ({debugResult.metadata.warnings.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {debugResult.metadata.warnings.map((warning, index) => (
                      <div key={index} className="text-sm text-yellow-600 bg-yellow-50 p-3 rounded">
                        {warning}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Processing Results */}
            {debugResult.data.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Processing Results ({debugResult.data.length} projects)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {debugResult.data.map((project, index) => (
                      <div key={index} className="border rounded p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium">{project.projectTitle || "Untitled"}</h4>
                          <div className="flex gap-1">
                            {project.publish && (
                              <Badge variant="default" className="text-xs">
                                Published
                              </Badge>
                            )}
                            {project.comingSoon && (
                              <Badge variant="secondary" className="text-xs">
                                Coming Soon
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="text-sm space-y-1">
                          <div>
                            <strong>Categories:</strong> {project.categoryTags?.join(", ") || "None"}
                          </div>
                          <div>
                            <strong>Description:</strong> {project.description || "None"}
                          </div>
                          <div>
                            <strong>Team:</strong> {project.team || "None"}
                          </div>
                          <div>
                            <strong>Thumbnail:</strong> {project.thumbnail ? "✅ Present" : "❌ Missing"}
                          </div>
                          <div>
                            <strong>Link:</strong> {project.link || "None"}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Required Database Schema */}
            <Card>
              <CardHeader>
                <CardTitle>Required Database Schema</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-sm">
                    <strong>Environment Variables:</strong>
                  </div>
                  <div className="bg-gray-100 p-3 rounded font-mono text-sm">
                    CASES_TOKEN=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
                    <br />
                    CASES_DATABASE_ID=20855dd5594d805f94d8d0f5686b292d
                  </div>

                  <Separator />

                  <div className="text-sm">
                    <strong>Required Notion Database Fields:</strong>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    <div>
                      • <strong>projectTitle</strong> (Title)
                    </div>
                    <div>
                      • <strong>categoryTags</strong> (Multi-select)
                    </div>
                    <div>
                      • <strong>description</strong> (Text)
                    </div>
                    <div>
                      • <strong>team</strong> (Text)
                    </div>
                    <div>
                      • <strong>thumbnail</strong> (Files)
                    </div>
                    <div>
                      • <strong>introImage</strong> (Files)
                    </div>
                    <div>
                      • <strong>projectMedia</strong> (Files)
                    </div>
                    <div>
                      • <strong>draftProcess</strong> (Files)
                    </div>
                    <div>
                      • <strong>addMedia</strong> (Files)
                    </div>
                    <div>
                      • <strong>publish</strong> (Checkbox)
                    </div>
                    <div>
                      • <strong>comingSoon</strong> (Checkbox)
                    </div>
                    <div>
                      • <strong>link</strong> (URL)
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Fix Suggestions */}
            <Card>
              <CardHeader>
                <CardTitle>🔧 Fix Suggestions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  {!debugResult.success && (
                    <>
                      <div>
                        <strong>1. Check Environment Variables</strong>
                        <ul className="ml-4 mt-1 space-y-1">
                          <li>• Ensure CASES_TOKEN is set correctly</li>
                          <li>• Ensure CASES_DATABASE_ID is set correctly</li>
                          <li>• Restart your development server after adding variables</li>
                        </ul>
                      </div>
                      <div>
                        <strong>2. Verify Notion Integration</strong>
                        <ul className="ml-4 mt-1 space-y-1">
                          <li>• Share your database with the Notion integration</li>
                          <li>• Give the integration "Edit" permissions</li>
                          <li>• Ensure the integration token is valid</li>
                        </ul>
                      </div>
                    </>
                  )}
                  <div>
                    <strong>3. Database Schema</strong>
                    <ul className="ml-4 mt-1 space-y-1">
                      <li>• Ensure all required fields exist in your database</li>
                      <li>• Check that field names match exactly (case-sensitive)</li>
                      <li>• Ensure the "publish" checkbox is checked for projects you want to display</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Footer */}
        <div className="mt-16">
          <Footer showCaseLogo={false} />
        </div>
      </div>
    </div>
  )
}
