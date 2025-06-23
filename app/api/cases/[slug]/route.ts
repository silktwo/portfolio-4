import { type NextRequest, NextResponse } from "next/server"
import { getCaseBySlug } from "@/lib/notion-cases"

export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params
    console.log(`🔍 API: Fetching case with slug: ${slug}`)

    const project = await getCaseBySlug(slug)

    if (project) {
      console.log(`✅ API: Found project: ${project.projectTitle}`)
      return NextResponse.json({
        success: true,
        data: project,
      })
    }

    console.log(`❌ API: Project not found: ${slug}`)
    return NextResponse.json(
      {
        success: false,
        error: "Project not found",
        data: null,
      },
      { status: 404 },
    )
  } catch (error) {
    console.error("❌ API: Error fetching project:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        data: null,
      },
      { status: 500 },
    )
  }
}
