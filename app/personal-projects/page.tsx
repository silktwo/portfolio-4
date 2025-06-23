"use client"

import { useState, useEffect } from "react"
import Navigation from "@/components/navigation"
import InfoSection from "@/components/info-section"
import BackToTop from "@/components/back-to-top"
import Footer from "@/components/footer"
import { ChevronLeft, ChevronRight, X } from "lucide-react"
import { getPersonalProjects, type PersonalProject } from "@/lib/notion-projects"

// Image Lightbox Component
function ImageLightbox({
  images,
  currentIndex,
  isOpen,
  onClose,
  onNext,
  onPrev,
}: {
  images: Array<{ url: string; name: string }>
  currentIndex: number
  isOpen: boolean
  onClose: () => void
  onNext: () => void
  onPrev: () => void
}) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return

      if (e.key === "Escape") onClose()
      if (e.key === "ArrowLeft") onPrev()
      if (e.key === "ArrowRight") onNext()
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, onClose, onNext, onPrev])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center p-4">
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-60 p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Navigation buttons */}
      {images.length > 1 && (
        <>
          <button
            onClick={onPrev}
            className="absolute left-4 z-60 p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={onNext}
            className="absolute right-4 z-60 p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Image - Responsive scaling */}
      <div className="w-full h-full flex items-center justify-center">
        <img
          src={images[currentIndex]?.url || "/placeholder.svg"}
          alt={images[currentIndex]?.name || "Image"}
          className="max-w-full max-h-full object-contain"
          style={{
            width: "auto",
            height: "auto",
            maxWidth: "100%",
            maxHeight: "100%",
          }}
        />
      </div>

      {/* Image counter */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-sm">
          {currentIndex + 1} / {images.length}
        </div>
      )}

      {/* Background overlay */}
      <div className="absolute inset-0 -z-10" onClick={onClose} />
    </div>
  )
}

// Project Card Component
function ProjectCard({ project, className = "" }: { project: PersonalProject; className?: string }) {
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxImages, setLightboxImages] = useState<Array<{ url: string; name: string }>>([])
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [imageError, setImageError] = useState(false)

  const openLightbox = () => {
    const images = [{ url: project.image, name: project.title }]
    setLightboxImages(images)
    setCurrentImageIndex(0)
    setLightboxOpen(true)
  }

  const closeLightbox = () => {
    setLightboxOpen(false)
  }

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % lightboxImages.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + lightboxImages.length) % lightboxImages.length)
  }

  const handleImageError = () => {
    setImageError(true)
  }

  return (
    <>
      <div className={`flex flex-col gap-2 ${className}`}>
        <div
          className="relative bg-gray-100 overflow-hidden transition-transform duration-200 hover:scale-[1.02] rounded-lg cursor-pointer group"
          onClick={openLightbox}
        >
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

      {/* Image Lightbox */}
      <ImageLightbox
        images={lightboxImages}
        currentIndex={currentImageIndex}
        isOpen={lightboxOpen}
        onClose={closeLightbox}
        onNext={nextImage}
        onPrev={prevImage}
      />
    </>
  )
}

// Grid Gallery Section Component
function GridGallerySection({ projects }: { projects: PersonalProject[] }) {
  if (projects.length === 0) {
    return (
      <section className="w-full mt-8 mb-16">
        <div className="text-center py-20">
          <p className="text-gray-500 text-sm">No projects found in the database.</p>
          <p className="text-gray-400 text-xs mt-2">
            Add projects to your Notion database with workTitle and workFile fields.
          </p>
        </div>
      </section>
    )
  }

  return (
    <section className="w-full mt-8 mb-16">
      {/* 12-column grid with minimal 8px spacing */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-12 gap-2">
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </section>
  )
}

export default function PersonalProjects() {
  const [activePage, setActivePage] = useState<string | null>("Personal Projects")
  const [projects, setProjects] = useState<PersonalProject[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchProjects() {
      try {
        setLoading(true)
        setError(null)
        console.log("Fetching personal projects from Notion...")

        const projectsData = await getPersonalProjects()
        console.log(`Loaded ${projectsData.length} projects from database`)

        setProjects(projectsData)

        if (projectsData.length === 0) {
          setError("No projects found in the Notion database.")
        }
      } catch (err) {
        console.error("Error loading projects:", err)
        setError("Failed to load projects from Notion database.")
        setProjects([])
      } finally {
        setLoading(false)
      }
    }

    fetchProjects()
  }, [])

  if (loading) {
    return (
      <div className="bg-white min-h-screen overflow-x-hidden">
        <div className="w-[calc(100%-40px)] sm:w-[calc(100%-60px)] mx-[20px] sm:mx-[30px] py-[30px] min-h-screen">
          <div className="mb-4">
            <Navigation activePage={activePage} setActivePage={setActivePage} />
          </div>
          <InfoSection />
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-4"></div>
              <p className="text-sm text-gray-600">Loading projects from Notion...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white min-h-screen overflow-x-hidden">
      <div className="w-[calc(100%-40px)] sm:w-[calc(100%-60px)] mx-[20px] sm:mx-[30px] py-[30px] min-h-screen">
        {/* Top Navigation */}
        <div className="mb-4">
          <Navigation activePage={activePage} setActivePage={setActivePage} />
        </div>

        {/* Info Section */}
        <InfoSection />

        {/* Error message if database connection fails */}
        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm">{error}</p>
            <p className="text-red-600 text-xs mt-2">
              Make sure your Notion database has entries with both workTitle and workFile fields populated.
            </p>
          </div>
        )}

        {/* Grid Gallery Section - Only shows data from Notion */}
        <GridGallerySection projects={projects} />

        {/* Footer Section */}
        <Footer />

        {/* Back to Top Button */}
        <BackToTop />
      </div>
    </div>
  )
}
