import { type NextRequest, NextResponse } from "next/server"
import { getCaseBySlug } from "@/lib/notion-cases"

export async function GET(request: NextRequest, { params }: { params: { slug: string } }) {
  try {
    console.log(`🔍 API: Fetching case with slug: ${params.slug}`)

    const project = await getCaseBySlug(params.slug)

    if (project) {
      console.log(`✅ API: Found project: ${project.projectTitle}`)
      return NextResponse.json({
        success: true,
        data: project,
      })
    }

    console.log(`❌ API: Project not found: ${params.slug}`)
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
