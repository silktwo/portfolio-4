"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, XCircle, AlertCircle, RefreshCw } from "lucide-react"

interface CMSStatus {
  personalProjects: {
    connection: { success: boolean; error?: string; recordCount?: number }
    schema: { valid: boolean; missingFields: string[]; availableFields: string[] }
    databaseId: string
    requiredFields: string[]
  }
  blogPosts: {
    connection: { success: boolean; error?: string; recordCount?: number }
    schema: { valid: boolean; missingFields: string[]; availableFields: string[] }
    databaseId: string
    requiredFields: string[]
  }
  overall: {
    personalProjectsReady: boolean
    blogPostsReady: boolean
    allSystemsReady: boolean
  }
}

export default function CMSStatus() {
  const [status, setStatus] = useState<CMSStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStatus = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch("/api/cms-status")
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      setStatus(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch CMS status")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStatus()
  }, [])

  if (loading) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5 animate-spin" />
            Checking CMS Status...
          </CardTitle>
        </CardHeader>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <XCircle className="w-5 h-5" />
            CMS Status Check Failed
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-600">{error}</p>
          <button onClick={fetchStatus} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Retry
          </button>
        </CardContent>
      </Card>
    )
  }

  if (!status) return null

  const StatusIcon = ({ success }: { success: boolean }) =>
    success ? <CheckCircle className="w-5 h-5 text-green-600" /> : <XCircle className="w-5 h-5 text-red-600" />

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Overall Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {status.overall.allSystemsReady ? (
              <CheckCircle className="w-6 h-6 text-green-600" />
            ) : (
              <AlertCircle className="w-6 h-6 text-yellow-600" />
            )}
            CMS Integration Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <StatusIcon success={status.overall.personalProjectsReady} />
              <span>Personal Projects</span>
              <Badge variant={status.overall.personalProjectsReady ? "default" : "destructive"}>
                {status.overall.personalProjectsReady ? "Ready" : "Issues"}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <StatusIcon success={status.overall.blogPostsReady} />
              <span>Blog Posts</span>
              <Badge variant={status.overall.blogPostsReady ? "default" : "destructive"}>
                {status.overall.blogPostsReady ? "Ready" : "Issues"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Personal Projects Status */}
      <Card>
        <CardHeader>
          <CardTitle>Personal Projects Database</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-gray-600">Database ID: {status.personalProjects.databaseId}</p>
          </div>

          <div className="flex items-center gap-2">
            <StatusIcon success={status.personalProjects.connection.success} />
            <span>Connection</span>
            {status.personalProjects.connection.success ? (
              <Badge variant="default">Connected</Badge>
            ) : (
              <Badge variant="destructive">Failed</Badge>
            )}
          </div>

          {status.personalProjects.connection.error && (
            <p className="text-red-600 text-sm">{status.personalProjects.connection.error}</p>
          )}

          <div className="flex items-center gap-2">
            <StatusIcon success={status.personalProjects.schema.valid} />
            <span>Schema</span>
            {status.personalProjects.schema.valid ? (
              <Badge variant="default">Valid</Badge>
            ) : (
              <Badge variant="destructive">Missing Fields</Badge>
            )}
          </div>

          {status.personalProjects.schema.missingFields.length > 0 && (
            <div className="text-sm">
              <p className="text-red-600">Missing required fields:</p>
              <ul className="list-disc list-inside text-red-600">
                {status.personalProjects.schema.missingFields.map((field) => (
                  <li key={field}>{field}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="text-sm">
            <p>Required fields: {status.personalProjects.requiredFields.join(", ")}</p>
            <p>Available fields: {status.personalProjects.schema.availableFields.join(", ")}</p>
          </div>
        </CardContent>
      </Card>

      {/* Blog Posts Status */}
      <Card>
        <CardHeader>
          <CardTitle>Blog Posts Database</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-gray-600">Database ID: {status.blogPosts.databaseId}</p>
          </div>

          <div className="flex items-center gap-2">
            <StatusIcon success={status.blogPosts.connection.success} />
            <span>Connection</span>
            {status.blogPosts.connection.success ? (
              <Badge variant="default">Connected</Badge>
            ) : (
              <Badge variant="destructive">Failed</Badge>
            )}
          </div>

          {status.blogPosts.connection.error && (
            <p className="text-red-600 text-sm">{status.blogPosts.connection.error}</p>
          )}

          <div className="flex items-center gap-2">
            <StatusIcon success={status.blogPosts.schema.valid} />
            <span>Schema</span>
            {status.blogPosts.schema.valid ? (
              <Badge variant="default">Valid</Badge>
            ) : (
              <Badge variant="destructive">Missing Fields</Badge>
            )}
          </div>

          {status.blogPosts.schema.missingFields.length > 0 && (
            <div className="text-sm">
              <p className="text-red-600">Missing required fields:</p>
              <ul className="list-disc list-inside text-red-600">
                {status.blogPosts.schema.missingFields.map((field) => (
                  <li key={field}>{field}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="text-sm">
            <p>Required fields: {status.blogPosts.requiredFields.join(", ")}</p>
            <p>Available fields: {status.blogPosts.schema.availableFields.join(", ")}</p>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-center">
        <button
          onClick={fetchStatus}
          className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh Status
        </button>
      </div>
    </div>
  )
}
