"use client"

import { useState, useEffect } from "react"
import Navigation from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { RefreshCw, CheckCircle, XCircle, AlertTriangle, Database, Key, FileText, Eye, EyeOff } from "lucide-react"
import Link from "next/link"

interface DebugResponse {
  success: boolean
  projects: any[]
  metadata: {
    count: number
    source: string
    databaseId: string
    requiredFields: string[]
    errors?: string[]
    warnings?: string[]
    debugInfo?: {
      tokenUsed?: string
      availableFields?: string[]
      fieldTypes?: Record<string, string>
      processedRecords?: any[]
      skippedRecords?: any[]
    }
  }
}

export default function CommercialDebugPage() {
  const [debugData, setDebugData] = useState<DebugResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [showRawData, setShowRawData] = useState(false)
  const [testCount, setTestCount] = useState(0)

  const runDiagnostics = async () => {
    try {
      setLoading(true)
      setTestCount((prev) => prev + 1)

      console.log("🔍 Running Commercial Projects Database diagnostics...")

      const response = await fetch("/api/commercial", {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache",
        },
      })

      const result: DebugResponse = await response.json()
      console.log("🔍 Commercial Debug Response:", result)

      setDebugData(result)
    } catch (error) {
      console.error("❌ Commercial debug test failed:", error)
      setDebugData({
        success: false,
        projects: [],
        metadata: {
          count: 0,
          source: "error",
          databaseId: "20955dd5594d8064aeffc4761a8a7c38",
          requiredFields: ["projectTitle", "categoryTags", "thumbnail", "link"],
          errors: [`Network error: ${error instanceof Error ? error.message : "Unknown error"}`],
        },
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    runDiagnostics()
  }, [])

  const StatusIcon = ({ success }: { success: boolean }) =>
    success ? <CheckCircle className="w-5 h-5 text-green-600" /> : <XCircle className="w-5 h-5 text-red-600" />

  return (
    <div className="bg-white min-h-screen overflow-x-hidden">
      <div className="w-[calc(100%-40px)] sm:w-[calc(100%-60px)] mx-[20px] sm:mx-[30px] py-[30px]">
        {/* Navigation */}
        <div className="mb-8">
          <Navigation />
        </div>

        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold mb-2">Commercial Projects Database Debug</h1>
              <p className="text-gray-600">Comprehensive diagnostics for Commercial Notion database connection</p>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/commercial">
                <Button variant="outline" size="sm">
                  Back to Commercial
                </Button>
              </Link>
              <Link href="/cms-setup">
                <Button variant="outline" size="sm">
                  CMS Setup
                </Button>
              </Link>
              <Button onClick={runDiagnostics} disabled={loading} size="sm">
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                {loading ? "Testing..." : "Run Test"}
              </Button>
            </div>
          </div>

          {testCount > 0 && (
            <Badge variant="outline">
              Test #{testCount} - {new Date().toLocaleTimeString()}
            </Badge>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <Card>
            <CardContent className="flex items-center justify-center py-20">
              <div className="text-center">
                <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
                <p className="text-gray-600">Running commercial database diagnostics...</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Debug Results */}
        {!loading && debugData && (
          <div className="space-y-6">
            {/* Overall Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <StatusIcon success={debugData.success} />
                  Commercial Database Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm">
                      <strong>Connection:</strong> {debugData.success ? "✅ Success" : "❌ Failed"}
                    </p>
                    <p className="text-sm">
                      <strong>Projects Found:</strong> {debugData.metadata.count}
                    </p>
                    <p className="text-sm">
                      <strong>Data Source:</strong> {debugData.metadata.source}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm">
                      <strong>Database ID:</strong> {debugData.metadata.databaseId}
                    </p>
                    <p className="text-sm">
                      <strong>Required Fields:</strong> {debugData.metadata.requiredFields.join(", ")}
                    </p>
                    <p className="text-sm">
                      <strong>Token Used:</strong> {debugData.metadata.debugInfo?.tokenUsed || "Unknown"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Commercial Database Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  Commercial Database Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Target Database</h4>
                  <div className="space-y-2">
                    <p className="text-sm font-mono bg-gray-100 p-2 rounded">{debugData.metadata.databaseId}</p>
                    <p className="text-xs text-gray-600">
                      Format:{" "}
                      {debugData.metadata.databaseId.includes("-")
                        ? "❌ Contains dashes (will be cleaned)"
                        : "✅ Clean format (no dashes)"}
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Required Fields</h4>
                  <div className="space-y-1">
                    {debugData.metadata.requiredFields.map((field) => (
                      <div key={field} className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {field}
                        </Badge>
                        {debugData.metadata.debugInfo?.availableFields?.includes(field) ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-600" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {debugData.metadata.debugInfo?.availableFields && (
                  <div>
                    <h4 className="font-medium mb-2">Available Fields</h4>
                    <div className="flex flex-wrap gap-1">
                      {debugData.metadata.debugInfo.availableFields.map((field) => (
                        <Badge key={field} variant="secondary" className="text-xs">
                          {field}
                          {debugData.metadata.debugInfo?.fieldTypes?.[field] && (
                            <span className="ml-1 text-gray-500">
                              ({debugData.metadata.debugInfo.fieldTypes[field]})
                            </span>
                          )}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Authentication Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="w-5 h-5" />
                  Authentication Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm">
                    <strong>Token Used:</strong> {debugData.metadata.debugInfo?.tokenUsed || "None"}
                  </p>
                  <p className="text-sm text-gray-600">
                    The API tries: COMMERCIAL_TOKEN → NOTION_TOKEN → PERSONAL_TOKEN → fallback tokens.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Errors and Warnings */}
            {(debugData.metadata.errors?.length || debugData.metadata.warnings?.length) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    Issues Found
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {debugData.metadata.errors && debugData.metadata.errors.length > 0 && (
                    <div>
                      <h4 className="font-medium text-red-700 mb-2">Errors</h4>
                      <ul className="space-y-1">
                        {debugData.metadata.errors.map((error, index) => (
                          <li key={index} className="text-sm text-red-600 bg-red-50 p-2 rounded">
                            {error}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {debugData.metadata.warnings && debugData.metadata.warnings.length > 0 && (
                    <div>
                      <h4 className="font-medium text-yellow-700 mb-2">Warnings</h4>
                      <ul className="space-y-1">
                        {debugData.metadata.warnings.map((warning, index) => (
                          <li key={index} className="text-sm text-yellow-600 bg-yellow-50 p-2 rounded">
                            {warning}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Processing Results */}
            {debugData.metadata.debugInfo && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Processing Results
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-green-700 mb-2">
                        Processed Records ({debugData.metadata.debugInfo.processedRecords?.length || 0})
                      </h4>
                      {debugData.metadata.debugInfo.processedRecords?.map((record, index) => (
                        <div key={index} className="text-sm bg-green-50 p-2 rounded mb-1">
                          <p>
                            <strong>Title:</strong> {record.title}
                          </p>
                          <p>
                            <strong>Categories:</strong> {record.categories || "None"}
                          </p>
                          <p>
                            <strong>Link:</strong> {record.link ? "✅" : "❌"}
                          </p>
                        </div>
                      ))}
                    </div>

                    <div>
                      <h4 className="font-medium text-red-700 mb-2">
                        Skipped Records ({debugData.metadata.debugInfo.skippedRecords?.length || 0})
                      </h4>
                      {debugData.metadata.debugInfo.skippedRecords?.map((record, index) => (
                        <div key={index} className="text-sm bg-red-50 p-2 rounded mb-1">
                          <p>
                            <strong>Reason:</strong> {record.reason}
                          </p>
                          <p>
                            <strong>ID:</strong> {record.id}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Raw Data */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Raw API Response
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setShowRawData(!showRawData)}>
                    {showRawData ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    {showRawData ? "Hide" : "Show"} Raw Data
                  </Button>
                </CardTitle>
              </CardHeader>
              {showRawData && (
                <CardContent>
                  <pre className="text-xs bg-gray-100 p-4 rounded overflow-auto max-h-96">
                    {JSON.stringify(debugData, null, 2)}
                  </pre>
                </CardContent>
              )}
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
