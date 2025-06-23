
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Navigation from "@/components/navigation"
import BackToTop from "@/components/back-to-top"
import Footer from "@/components/footer"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ExternalLink } from "lucide-react"
import Link from "next/link"
import type { CaseProject } from "@/lib/notion-cases"
import { getCaseProjects } from "@/lib/notion-cases"

interface WorkPageClientProps {
  params: {
    slug: string
  }
  initialProject?: CaseProject | null
  dataSource: "database" | "fallback"
}

export default function WorkPageClient({ params, initialProject, dataSource }: WorkPageClientProps) {
  const router = useRouter()
  const [project, setProject] = useState<CaseProject | null>(initialProject)
  const [allProjects, setAllProjects] = useState<CaseProject[]>([])
  const [loading, setLoading] = useState(!initialProject)
  const [error, setError] = useState<string | null>(null)
  const [imageErrors, setImageErrors] = useState<{ [key: string]: boolean }>({})

  useEffect(() => {
    if (!initialProject) {
      fetchProject()
    }
    fetchAllProjects()
  }, [params.slug, initialProject])

  const fetchProject = async () => {
    try {
      setLoading(true)
      setError(null)
      console.log(`🔄 Client: Fetching project with slug: ${params.slug}`)

      const response = await fetch(`/api/cases/${params.slug}`)
      const result = await response.json()

      if (result.success && result.data) {
        console.log(`✅ Client: Found project: ${result.data.projectTitle}`)
        setProject(result.data)
      } else {
        console.log(`❌ Client: Project not found: ${params.slug}`)
        setError("Project not found")
      }
    } catch (err) {
      console.error("❌ Client: Error fetching project:", err)
      setError(`Failed to load project: ${err instanceof Error ? err.message : "Unknown error"}`)
    } finally {
      setLoading(false)
    }
  }

  const fetchAllProjects = async () => {
    try {
      const result = await getCaseProjects()
      if (result.success && result.data.length > 0) {
        setAllProjects(result.data)
      }
    } catch (error) {
      console.error("Failed to fetch all projects:", error)
    }
  }

  const handleImageError = (imageUrl: string) => {
    setImageErrors((prev) => ({ ...prev, [imageUrl]: true }))
  }

  const getImageSrc = (imageUrl: string) => {
    return imageErrors[imageUrl] ? "/placeholder.svg?height=400&width=600" : imageUrl
  }

  // Get current project index
  const currentProjectIndex = allProjects.findIndex((p) => p.slug === params.slug)

  // Get next and previous projects
  const getNextProject = () => {
    if (allProjects.length <= 1) return null
    const nextIndex = (currentProjectIndex + 1) % allProjects.length
    return allProjects[nextIndex]
  }

  const getPreviousProject = () => {
    if (allProjects.length <= 1) return null
    const prevIndex = (currentProjectIndex - 1 + allProjects.length) % allProjects.length
    return allProjects[prevIndex]
  }

  const nextProject = getNextProject()
  const previousProject = getPreviousProject()

  // Function to render media in alternating layout
  const renderAlternatingMedia = (media: string[]) => {
    const elements = []
    let index = 0

    while (index < media.length) {
      if (index % 3 === 0) {
        // Two images side by side
        if (index + 1 < media.length) {
          elements.push(
            <div key={`pair-${index}`} className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
              <div className="bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={getImageSrc(media[index]) || "/placeholder.svg"}
                  alt={`${project?.projectTitle} - Image ${index + 1}`}
                  className="w-full h-auto"
                  onError={() => handleImageError(media[index])}
                />
              </div>
              <div className="bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={getImageSrc(media[index + 1]) || "/placeholder.svg"}
                  alt={`${project?.projectTitle} - Image ${index + 2}`}
                  className="w-full h-auto"
                  onError={() => handleImageError(media[index + 1])}
                />
              </div>
            </div>
          )
          index += 2
        } else {
          // Single image if only one left
          elements.push(
            <div key={`single-${index}`} className="mb-12">
              <img
                src={getImageSrc(media[index]) || "/placeholder.svg"}
                alt={`${project?.projectTitle} - Image ${index + 1}`}
                className="w-full h-auto rounded-lg"
                onError={() => handleImageError(media[index])}
              />
            </div>
          )
          index += 1
        }
      } else {
        // Full-width image
        elements.push(
          <div key={`full-${index}`} className="mb-12">
            <img
              src={getImageSrc(media[index]) || "/placeholder.svg"}
              alt={`${project?.projectTitle} - Image ${index + 1}`}
              className="w-full h-auto rounded-lg"
              onError={() => handleImageError(media[index])}
            />
          </div>
        )
        index += 1
      }
    }

    return elements
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <div className="w-[calc(100%-40px)] sm:w-[calc(100%-60px)] mx-[20px] sm:mx-[30px] py-[30px]">
          <div className="mb-4">
            <Navigation />
          </div>
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading case study...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <div className="w-[calc(100%-40px)] sm:w-[calc(100%-60px)] mx-[20px] sm:mx-[30px] py-[30px]">
          <div className="mb-4">
            <Navigation />
          </div>
          <div className="mb-8">
            <button
              onClick={() => router.back()}
              className="inline-flex items-center gap-2 text-gray-600 hover:text-black transition-colors mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <h1 className="text-2xl font-bold mb-2">Case Study Not Found</h1>
            <p className="text-gray-600 mb-4">{error || `The case study "${params.slug}" could not be found.`}</p>
            <div className="flex gap-4">
              <button
                onClick={() => router.push("/")}
                className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors"
              >
                Back to Homepage
              </button>
              <button
                onClick={() => router.push("/work")}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                View All Work
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="w-[calc(100%-40px)] sm:w-[calc(100%-60px)] mx-[20px] sm:mx-[30px] py-[30px]">
        {/* Navigation */}
        <div className="mb-4">
          <Navigation />
        </div>

        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-black transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        {/* Project Header */}
        <div className="mb-8">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            {(project.categoryTags ?? []).map((tag, index) => (
              <Badge key={index} className="bg-gray-100 text-gray-800 text-[10px] px-2 py-1 rounded-full font-medium">
                {tag.toUpperCase()}
              </Badge>
            ))}
            {project.comingSoon && (
              <Badge className="bg-black text-white text-[10px] px-2 py-1 rounded-full font-medium">COMING SOON</Badge>
            )}
          </div>

          <h1 className="text-2xl md:text-3xl font-bold text-black mb-4 leading-tight">{project.projectTitle}</h1>

          {project.description && (
            <p className="text-gray-600 text-base leading-relaxed mb-4 max-w-3xl">{project.description}</p>
          )}

          <div className="flex flex-col sm:flex-row gap-4 text-sm">
            {project.team && (
              <div>
                <span className="font-medium text-black">Team: </span>
                <span className="text-gray-600">{project.team}</span>
              </div>
            )}
            {project.link && (
              <a
                href={project.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-black hover:underline"
              >
                View Live Project
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>

        {/* Intro Image */}
        {project.introImage && (
          <div className="mb-12">
            <img
              src={getImageSrc(project.introImage) || "/placeholder.svg"}
              alt={`${project.projectTitle} - Main Image`}
              className="w-full h-auto rounded-lg"
              onError={() => handleImageError(project.introImage)}
            />
          </div>
        )}

        {/* Project Media - Alternating Layout */}
        {project.projectMedia && project.projectMedia.length > 0 && (
          <div className="mb-12">
            <h2 className="text-xl font-bold text-black mb-6">Project Gallery</h2>
            {renderAlternatingMedia(project.projectMedia)}
          </div>
        )}

        {/* Draft Process */}
        {project.draftProcess && project.draftProcess.length > 0 && (
          <div className="mb-12">
            <h2 className="text-xl font-bold text-black mb-6">Design Process</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {project.draftProcess.map((draft, index) => (
                <div key={index} className="bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={getImageSrc(draft) || "/placeholder.svg"}
                    alt={`${project.projectTitle} - Process ${index + 1}`}
                    className="w-full h-auto"
                    onError={() => handleImageError(draft)}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Project Navigation */}
        {(previousProject || nextProject) && (
          <div className="mb-12">
            <div className="flex items-center justify-center gap-8">
              {/* Previous Project */}
              <div className="flex-1 flex justify-start">
                {previousProject && (
                  <Link href={`/work/${previousProject.slug}`}>
                    <Button
                      variant="outline"
                      className="gap-2 px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors border-0"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Previous project
                    </Button>
                  </Link>
                )}
              </div>

              {/* Logo in the middle */}
              <div className="flex-shrink-0">
                <img src="/logo-footer.svg" alt="Logo" className="w-16 h-16" />
              </div>

              {/* Next Project */}
              <div className="flex-1 flex justify-end">
                {nextProject && (
                  <Link href={`/work/${nextProject.slug}`}>
                    <Button
                      variant="outline"
                      className="gap-2 px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors border-0"
                    >
                      Next project
                      <ArrowLeft className="w-4 h-4 rotate-180" />
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <Footer showCaseLogo={true} />

        {/* Back to Top */}
        <BackToTop />
      </div>
    </div>
  )
}
