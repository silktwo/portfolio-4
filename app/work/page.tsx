"use client"

import { Badge } from "@/components/ui/badge"
import { useState, useEffect } from "react"
import Navigation from "@/components/navigation"
import InfoSection from "@/components/info-section"
import BackToTop from "@/components/back-to-top"
import Footer from "@/components/footer"
import { X, ExternalLink } from "lucide-react"
import Link from "next/link"

interface CaseProject {
  id: string
  projectTitle: string
  slug: string
  categoryTags: string[]
  description: string
  team: string
  introImage: string
  projectMedia: string[]
  draftProcess: string[]
  publish: boolean
  link: string
  thumbnail: string
  comingSoon: boolean
}

// Project Card Component
function ProjectCard({ project, className = "" }: { project: CaseProject; className?: string }) {
  const [imageError, setImageError] = useState(false)

  const handleImageError = () => {
    setImageError(true)
  }

  return (
    <Link href={`/work/${project.slug}`} className={`flex flex-col gap-2 ${className} cursor-pointer group`}>
      <div className="flex items-center gap-1">
        <p className="font-medium text-black text-[12px] leading-[14px] uppercase">{project.projectTitle}</p>
        {project.categoryTags && project.categoryTags.length > 0 && (
          <p className="text-gray-500 text-[12px] leading-[14px] uppercase">, {project.categoryTags.join(", ")}</p>
        )}
      </div>
      <div className="relative bg-gray-100 overflow-hidden transition-transform duration-200 group-hover:scale-[1.02] rounded-lg">
        {project.comingSoon && (
          <div className="absolute top-2 left-2 z-10">
            <Badge className="bg-black text-white text-[10px] px-2 py-1">COMING SOON</Badge>
          </div>
        )}
        <img
          src={imageError ? "/placeholder.svg?height=300&width=400" : project.thumbnail}
          alt={project.projectTitle}
          className="w-full h-auto object-contain rounded-lg"
          onError={handleImageError}
        />
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Badge className="bg-black text-white rounded-full p-1">
            <ExternalLink className="w-3 h-3" />
          </Badge>
        </div>
      </div>
    </Link>
  )
}

// Three Column Works Section Component
function ThreeColumnWorksSection({ activeFilters }: { activeFilters: string[] }) {
  const [projects, setProjects] = useState<CaseProject[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchProjects() {
      try {
        setLoading(true)
        setError(null)
        console.log("🔄 Fetching projects from API...")

        const response = await fetch("/api/cases")
        const result = await response.json()

        console.log("📊 API response:", result)

        if (!result.success) {
          console.log("⚠️ Failed to fetch projects:", result.metadata?.errors)
          setError(result.metadata?.errors?.join(", ") || "Failed to load projects")
        } else if (result.data.length === 0) {
          console.log("⚠️ No projects returned from API")
          setError("No projects found in database")
        } else {
          console.log(`✅ Successfully loaded ${result.data.length} projects from API`)
          setProjects(result.data)
        }
      } catch (err) {
        console.error("❌ Failed to fetch projects:", err)
        setError(`Failed to load projects: ${err instanceof Error ? err.message : "Unknown error"}`)
      } finally {
        setLoading(false)
      }
    }

    fetchProjects()
  }, [])

  if (loading) {
    return (
      <section className="w-full mt-8 mb-16">
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading case studies...</p>
          </div>
        </div>
      </section>
    )
  }

  if (error || projects.length === 0) {
    return (
      <section className="w-full mt-8 mb-16">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
          <div className="text-center">
            <h3 className="text-lg font-medium text-yellow-800 mb-2">Database Connection Issue</h3>
            <p className="text-yellow-700 mb-4">{error || "No case studies available"}</p>
            <div className="flex justify-center gap-4">
              <Link href="/cases-debug">
                <button className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700">
                  Debug Connection
                </button>
              </Link>
              <Link href="/cms-setup">
                <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Setup CMS</button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    )
  }

  // Filter projects based on active filters
  const filteredProjects =
    activeFilters.length === 0
      ? projects
      : projects.filter((project) =>
          (project?.categoryTags ?? []).some((category: string) => activeFilters.includes(category)),
        )

  // Split filtered projects into columns based on screen size
  const column1 = filteredProjects.filter((_, index) => index % 3 === 0)
  const column2 = filteredProjects.filter((_, index) => index % 3 === 1)
  const column3 = filteredProjects.filter((_, index) => index % 3 === 2)

  return (
    <section className="w-full mt-8 mb-16">
      {/* Mobile: Single column */}
      <div className="grid grid-cols-1 gap-[8px] md:hidden">
        {filteredProjects.map((project, index) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>

      {/* Tablet: Two columns */}
      <div className="hidden md:grid lg:hidden grid-cols-2 gap-x-[10px] gap-y-[8px]">
        <div className="flex flex-col gap-[8px]">
          {filteredProjects
            .filter((_, index) => index % 2 === 0)
            .map((project, index) => (
              <ProjectCard key={project.id} project={project} />
            ))}
        </div>
        <div className="flex flex-col gap-[8px]">
          {filteredProjects
            .filter((_, index) => index % 2 === 1)
            .map((project, index) => (
              <ProjectCard key={project.id} project={project} />
            ))}
        </div>
      </div>

      {/* Desktop: Three columns */}
      <div className="hidden lg:grid grid-cols-3 gap-x-[10px] gap-y-[8px]">
        <div className="flex flex-col gap-[8px]">
          {column1.map((project, index) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
        <div className="flex flex-col gap-[8px]">
          {column2.map((project, index) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
        <div className="flex flex-col gap-[8px]">
          {column3.map((project, index) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </div>
    </section>
  )
}

export default function Work() {
  const [activePage, setActivePage] = useState<string | null>("Work")
  const [activeFilters, setActiveFilters] = useState<string[]>([])
  const [availableCategories, setAvailableCategories] = useState<string[]>([])

  // Fetch all unique categories from projects
  useEffect(() => {
    async function fetchCategories() {
      try {
        const response = await fetch("/api/cases")
        const result = await response.json()

        if (result.success) {
          const categories = new Set<string>()

          result.data.forEach((project: CaseProject) => {
            ;(project?.categoryTags ?? []).forEach((category: string) => {
              if (category) categories.add(category)
            })
          })

          setAvailableCategories(Array.from(categories))
        }
      } catch (error) {
        console.error("Failed to fetch categories:", error)
        setAvailableCategories([])
      }
    }

    fetchCategories()
  }, [])

  const toggleFilter = (filter: string) => {
    setActiveFilters((prev) => (prev.includes(filter) ? prev.filter((f) => f !== filter) : [...prev, filter]))
  }

  const clearFilters = () => {
    setActiveFilters([])
  }

  return (
    <div className="bg-white min-h-screen overflow-x-hidden">
      <div className="w-[calc(100%-40px)] sm:w-[calc(100%-60px)] mx-[20px] sm:mx-[30px] py-[30px]">
        {/* Top Navigation */}
        <div className="mb-4">
          <Navigation activePage={activePage} setActivePage={setActivePage} />
        </div>

        {/* Info Section */}
        <InfoSection />

        {/* Filter Categories with Active State and Circle Close */}
        <div className="flex items-center gap-2 mb-8 flex-wrap">
          {activeFilters.length > 0 && (
            <Badge
              onClick={clearFilters}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-full transition-colors cursor-pointer hover:opacity-80"
              style={{
                backgroundColor: "rgba(149, 149, 149, 0.40)",
                color: "rgba(148, 148, 148, 1)",
              }}
            >
              <span className="text-[11px] font-bold">CLEAR ALL</span>
              <div className="w-3 h-3 bg-[#949494] rounded-full flex items-center justify-center flex-shrink-0">
                <X className="w-2 h-2 text-white" />
              </div>
            </Badge>
          )}
          {availableCategories.map((filter, index) => {
            const isActive = activeFilters.includes(filter)
            return (
              <Badge
                key={index}
                onClick={() => toggleFilter(filter)}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full transition-all duration-200 cursor-pointer hover:opacity-80"
                style={{
                  backgroundColor: isActive ? "rgba(149, 149, 149, 0.40)" : "rgba(149, 149, 149, 0.2)",
                  color: "rgba(148, 148, 148, 1)",
                }}
              >
                <span className="text-[11px] font-bold">{filter.toUpperCase()}</span>
                {isActive && (
                  <div className="w-3 h-3 bg-[#949494] rounded-full flex items-center justify-center flex-shrink-0 animate-in fade-in-0 zoom-in-95 duration-200">
                    <X className="w-2 h-2 text-white" />
                  </div>
                )}
              </Badge>
            )
          })}
        </div>

        {/* Three Column Works Section */}
        <ThreeColumnWorksSection activeFilters={activeFilters} />

        {/* Footer Section without Case Logo */}
        <Footer showCaseLogo={false} />

        {/* Back to Top Button */}
        <BackToTop />
      </div>
    </div>
  )
}
