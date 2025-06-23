"use client"

import { useState, useEffect } from "react"
import Navigation from "@/components/navigation"
import BackToTop from "@/components/back-to-top"
import Footer from "@/components/footer"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RefreshCw, AlertTriangle, CheckCircle, XCircle } from "lucide-react"
import Link from "next/link"

interface PersonalProject {
  id: string
  title: string
  slug: string
  image: string
  height?: string
}

interface APIResponse {
  success: boolean
  projects: PersonalProject[]
  metadata: {
    count: number
    source: string
    databaseId: string
    requiredFields: string[]
    errors?: string[]
    warnings?: string[]
    debugInfo?: any
  }
}

// Project Card Component
function ProjectCard({ project }: { project: PersonalProject }) {
  const [imageError, setImageError] = useState(false)

  const handleImageError = () => {
    setImageError(true)
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="relative bg-gray-100 overflow-hidden transition-transform duration-200 hover:scale-[1.02] rounded-lg">
        <img
          src={imageError ? "/placeholder.svg?height=200&width=200" : project.image}
          alt={project.title}
          className="w-full h-full object-cover rounded-lg"
          style={{ height: project.height || "200px" }}
          onError={handleImageError}
        />
      </div>
      <p className="font-medium text-black text-[12px] leading-[14px] uppercase">{project.title}</p>
    </div>
  )
}

// Error Display Component
function ErrorDisplay({ errors, warnings }: { errors?: string[]; warnings?: string[] }) {
  if (!errors?.length && !warnings?.length) return null

  return (
    <div className="space-y-4 mb-8">
      {errors && errors.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700">
              <XCircle className="w-5 h-5" />
              Connection Errors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1">
              {errors.map((error, index) => (
                <li key={index} className="text-red-600 text-sm">
                  {error}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {warnings && warnings.length > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-700">
              <AlertTriangle className="w-5 h-5" />
              Warnings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1">
              {warnings.map((warning, index) => (
                <li key={index} className="text-yellow-600 text-sm">
                  {warning}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// Success Display Component
function SuccessDisplay({ metadata }: { metadata: APIResponse["metadata"] }) {
  return (
    <Card className="border-green-200 bg-green-50 mb-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-green-700">
          <CheckCircle className="w-5 h-5" />
          Database Connected Successfully
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p>
              <strong>Projects Found:</strong> {metadata.count}
            </p>
            <p>
              <strong>Database ID:</strong> {metadata.databaseId.slice(0, 8)}...
            </p>
          </div>
          <div>
            <p>
              <strong>Source:</strong> {metadata.source}
            </p>
            <p>
              <strong>Required Fields:</strong> {metadata.requiredFields.join(", ")}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function ProjectsPage() {
  const [data, setData] = useState<APIResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [retryCount, setRetryCount] = useState(0)

  const fetchProjects = async () => {
    try {
      setLoading(true)
      console.log("Fetching projects from API...")

      const response = await fetch("/api/projects", {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache",
        },
      })

      const result: APIResponse = await response.json()
      console.log("API Response:", result)

      setData(result)
    } catch (error) {
      console.error("Error fetching projects:", error)
      setData({
        success: false,
        projects: [],
        metadata: {
          count: 0,
          source: "error",
          databaseId: "20955dd5594d809999c8c3562cc7e95f",
          requiredFields: ["workTitle", "workFile"],
          errors: [`Network error: ${error instanceof Error ? error.message : "Unknown error"}`],
        },
      })
    } finally {
      setLoading(false)
    }
  }

  const handleRetry = () => {
    setRetryCount((prev) => prev + 1)
    fetchProjects()
  }

  useEffect(() => {
    fetchProjects()
  }, [])

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
            <h1 className="text-2xl font-bold">Personal Projects</h1>
            <div className="flex items-center gap-2">
              <Link href="/projects-debug">
                <Button variant="outline" size="sm">
                  Debug Connection
                </Button>
              </Link>
              <Button onClick={handleRetry} disabled={loading} size="sm">
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                {loading ? "Loading..." : "Retry"}
              </Button>
            </div>
          </div>

          {retryCount > 0 && (
            <Badge variant="outline" className="mb-4">
              Retry attempt: {retryCount}
            </Badge>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Connecting to Personal Projects Database...</p>
              <p className="text-sm text-gray-500 mt-2">Database ID: 20955dd5594d809999c8c3562cc7e95f</p>
            </div>
          </div>
        )}

        {/* Results */}
        {!loading && data && (
          <>
            {/* Success/Error Display */}
            {data.success ? (
              <SuccessDisplay metadata={data.metadata} />
            ) : (
              <ErrorDisplay errors={data.metadata.errors} warnings={data.metadata.warnings} />
            )}

            {/* Projects Grid */}
            {data.projects.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-12 gap-2 mb-16">
                {data.projects.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            ) : (
              <Card className="text-center py-20">
                <CardContent>
                  <p className="text-gray-500 mb-4">No projects found</p>
                  <p className="text-sm text-gray-400 mb-4">
                    Make sure your Notion database has entries with both workTitle and workFile fields populated.
                  </p>
                  <Button onClick={handleRetry} variant="outline">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Try Again
                  </Button>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {/* Footer */}
        <Footer />
        <BackToTop />
      </div>
    </div>
  )
}
