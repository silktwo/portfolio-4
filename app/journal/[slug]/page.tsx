"use client"

import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { useEffect, useState } from "react"
import { formatDate, type BlogPost } from "@/lib/notion"

export default function JournalArticle({ params }: { params: { slug: string } }) {
  const [article, setArticle] = useState<BlogPost | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchArticle() {
      try {
        setLoading(true)
        const response = await fetch(`/api/blog/${params.slug}`)
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Article not found")
          }
          throw new Error(`Failed to fetch article: ${response.status}`)
        }
        const post = await response.json()
        setArticle(post)
        setError(null)
      } catch (error) {
        console.error("Error fetching article:", error)
        setError(error instanceof Error ? error.message : "Failed to load article")
      } finally {
        setLoading(false)
      }
    }

    fetchArticle()
    window.scrollTo(0, 0)
  }, [params.slug])

  if (loading) {
    return (
      <div className="bg-white min-h-screen overflow-x-hidden">
        <div className="w-[calc(100%-60px)] max-w-[800px] mx-auto py-[30px]">
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-500">Loading article...</div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !article) {
    return (
      <div className="bg-white min-h-screen overflow-x-hidden">
        <div className="w-[calc(100%-60px)] max-w-[800px] mx-auto py-[30px]">
          <div className="mb-8">
            <Link href="/journal">
              <Badge className="inline-flex items-center gap-1 py-1 px-4 rounded-full bg-black text-white hover:bg-gray-800 cursor-pointer">
                <span className="text-[10px] font-medium">← Back to Journal</span>
              </Badge>
            </Link>
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Article Not Found</h1>
            <p className="text-gray-600">{error || "The article you're looking for doesn't exist."}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white min-h-screen overflow-x-hidden">
      <div className="w-[calc(100%-60px)] max-w-[800px] mx-auto py-[30px]">
        {/* Back Link */}
        <div className="mb-8">
          <Link href="/journal">
            <Badge className="inline-flex items-center gap-1 py-1 px-4 rounded-full bg-black text-white hover:bg-gray-800 cursor-pointer">
              <span className="text-[10px] font-medium">← Back to Journal</span>
            </Badge>
          </Link>
        </div>

        {/* Article Header */}
        <div className="mb-8">
          <div className="font-medium text-black text-[11px] mb-2">{formatDate(article.date)}</div>
          <h1 className="font-bold text-black text-[24px] mb-4">{article.title}</h1>
        </div>

        {/* Article Content */}
        {article.content ? (
          <div className="mb-12">
            <div className="font-medium text-black text-[14px] leading-[20px] whitespace-pre-line">
              {article.content}
            </div>
          </div>
        ) : article.excerpt ? (
          <div className="mb-12">
            <div className="font-medium text-black text-[14px] leading-[20px] whitespace-pre-line">
              {article.excerpt}
            </div>
          </div>
        ) : (
          <div className="mb-12">
            <div className="text-gray-500 text-[14px]">No content available for this article.</div>
          </div>
        )}

        {/* Article Images */}
        {article.attachments && article.attachments.filter((att) => att.type === "image").length > 0 && (
          <div className="mb-12">
            <h3 className="font-bold text-black text-[12px] mb-4">IMAGES:</h3>
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
              {article.attachments
                .filter((att) => att.type === "image")
                .map((image, index) => (
                  <div key={index} className="bg-gray-100 rounded-lg overflow-hidden">
                    <img
                      src={image.url || "/placeholder.svg"}
                      alt={`${article.title} - Image ${index + 1}`}
                      className="w-full h-auto object-cover rounded-lg"
                    />
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* File Attachments */}
        {article.attachments && article.attachments.filter((att) => att.type === "file").length > 0 && (
          <div className="mb-12">
            <h3 className="font-bold text-black text-[12px] mb-4">ATTACHMENTS:</h3>
            <div className="space-y-2">
              {article.attachments
                .filter((att) => att.type === "file")
                .map((file, index) => (
                  <a
                    key={index}
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-[11px] text-blue-600 hover:underline"
                  >
                    📎 {file.name}
                  </a>
                ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-8 border-t border-gray-200">
          <Link href="/journal">
            <Badge className="inline-flex items-center gap-1 py-1 px-4 rounded-full bg-black text-white hover:bg-gray-800 cursor-pointer">
              <span className="text-[10px] font-medium">← Back to Journal</span>
            </Badge>
          </Link>
        </div>
      </div>
    </div>
  )
}
