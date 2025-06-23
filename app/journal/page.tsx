"use client"

import { Badge } from "@/components/ui/badge"
import { useState, useEffect } from "react"
import Navigation from "@/components/navigation"
import BackToTop from "@/components/back-to-top"
import Footer from "@/components/footer"
import { formatDate, type BlogPost } from "@/lib/notion"
import { X, ChevronLeft, ChevronRight } from "lucide-react"

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

export default function Journal() {
  const [activePage, setActivePage] = useState<string | null>("Journal")
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Lightbox state
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxImages, setLightboxImages] = useState<Array<{ url: string; name: string }>>([])
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  // Fetch blog posts from API route
  useEffect(() => {
    async function fetchPosts() {
      try {
        setLoading(true)
        const response = await fetch("/api/blog")
        if (!response.ok) {
          throw new Error(`Failed to fetch blog posts: ${response.status}`)
        }
        const posts = await response.json()
        setBlogPosts(posts)
        setError(null)
      } catch (error) {
        console.error("Error fetching blog posts:", error)
        setError("Failed to load blog posts. Please check your Notion configuration.")
      } finally {
        setLoading(false)
      }
    }

    fetchPosts()
  }, [])

  // Lightbox functions
  const openLightbox = (images: Array<{ url: string; name: string }>, startIndex = 0) => {
    setLightboxImages(images)
    setCurrentImageIndex(startIndex)
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

  const renderImageLayout = (entry: BlogPost) => {
    const images = entry.attachments.filter((att) => att.type === "image")

    if (images.length === 0) {
      return null
    }

    if (images.length === 1) {
      return (
        <div className="w-full cursor-pointer" onClick={() => openLightbox(images, 0)}>
          <img
            src={images[0].url || "/placeholder.svg"}
            alt={entry.description || "Journal image"}
            className="w-full h-auto object-contain rounded-lg hover:opacity-90 transition-opacity"
          />
        </div>
      )
    } else {
      return (
        <div className="grid grid-cols-2 gap-2">
          {images.slice(0, 4).map((image, imgIndex) => (
            <div key={imgIndex} className="cursor-pointer" onClick={() => openLightbox(images, imgIndex)}>
              <img
                src={image.url || "/placeholder.svg"}
                alt={`Journal image ${imgIndex + 1}`}
                className="w-full h-auto object-cover rounded-lg hover:opacity-90 transition-opacity aspect-square"
              />
            </div>
          ))}
        </div>
      )
    }
  }

  if (loading) {
    return (
      <div className="bg-white min-h-screen overflow-x-hidden">
        <div className="w-[calc(100%-40px)] sm:w-[calc(100%-60px)] mx-[20px] sm:mx-[30px] py-[30px]">
          <div className="mb-4">
            <Navigation activePage={activePage} setActivePage={setActivePage} />
          </div>
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-500">Loading journal entries...</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white min-h-screen overflow-x-hidden">
      <div className="w-[calc(100%-40px)] sm:w-[calc(100%-60px)] mx-[20px] sm:mx-[30px] py-[30px]">
        {/* Top Navigation */}
        <div className="mb-4">
          <Navigation activePage={activePage} setActivePage={setActivePage} />
        </div>

        {/* Online Status with Blinking Animation */}
        <Badge
          variant="outline"
          className="inline-flex items-center justify-center gap-[5px] pl-1.5 pr-2.5 py-0.5 mb-8 rounded-full border border-solid border-gray-200"
        >
          <div className="relative w-1 h-1 bg-[#1fef00] rounded-sm animate-pulse" />
          <span className="relative w-fit mt-[-1px] font-medium text-[#0e0e0e] text-[11px] tracking-[0] leading-[normal]">
            Online
          </span>
        </Badge>

        {/* Error State */}
        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
            <p className="text-red-500 text-xs mt-2">
              Make sure your NOTION_TOKEN and NOTION_DATABASE_ID are properly configured in your environment variables.
            </p>
          </div>
        )}

        {/* Journal Entries */}
        <div className="flex flex-col w-full max-w-[600px] items-start gap-[29px] mb-16">
          {blogPosts.length === 0 && !loading && !error ? (
            <div className="text-gray-500">
              <p className="mb-2">No published journal entries found.</p>
              <p className="text-xs">
                Make sure you have entries in your Notion database with the "publish" checkbox checked.
              </p>
            </div>
          ) : (
            blogPosts.map((entry) => (
              <div key={entry.id} className="flex flex-col items-start gap-[19px] relative self-stretch w-full">
                <div className="flex items-start gap-[20px] sm:gap-[40px] relative self-stretch w-full">
                  <div className="relative w-fit mt-[-1px] font-medium text-black text-[12px] tracking-[0] leading-[normal] whitespace-nowrap">
                    {formatDate(entry.date)}
                  </div>

                  <div className="flex flex-col w-full items-start gap-[5px] relative">
                    {/* Show description content only if it exists and is not empty */}
                    {entry.description && entry.description.trim() && (
                      <div className="relative self-stretch mt-[-1px] font-medium text-black text-[12px] tracking-[0] leading-[normal]">
                        {entry.description}
                      </div>
                    )}

                    {/* File Attachments */}
                    {entry.attachments.filter((att) => att.type === "file").length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {entry.attachments
                          .filter((att) => att.type === "file")
                          .map((file, fileIndex) => (
                            <a
                              key={fileIndex}
                              href={file.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[10px] text-blue-600 hover:underline"
                            >
                              📎 {file.name}
                            </a>
                          ))}
                      </div>
                    )}
                  </div>
                </div>

                {renderImageLayout(entry)}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <Footer />
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

      {/* Back to Top Button */}
      <BackToTop />
    </div>
  )
}
