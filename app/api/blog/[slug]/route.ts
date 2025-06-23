import { NextResponse } from "next/server"
import { getBlogPost } from "@/lib/notion"

export const dynamic = "force-dynamic" // No caching

export async function GET(request: Request, { params }: { params: { slug: string } }) {
  try {
    const post = await getBlogPost(params.slug)
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 })
    }
    return NextResponse.json(post)
  } catch (error) {
    console.error("Error in blog post API route:", error)
    return NextResponse.json({ error: "Failed to fetch blog post" }, { status: 500 })
  }
}
