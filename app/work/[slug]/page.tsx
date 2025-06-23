import { getCaseBySlug } from "@/lib/notion-cases"
import WorkPageClient from "./WorkPageClient"
import type { Metadata } from "next"

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const { slug } = await params
    // Get project from CMS
    const project = await getCaseBySlug(slug)

    if (project) {
      return {
        title: `${project.projectTitle} - Dmytro Kifuliak`,
        description: project.description || `Case study: ${project.projectTitle}`,
      }
    }
  } catch (error) {
    console.error("Error generating metadata:", error)
  }

  // Default metadata
  return {
    title: "Case Study - Dmytro Kifuliak",
    description: "View this case study project",
  }
}

export default async function WorkPage({ params }: Props) {
  try {
    console.log(`🔍 Server: Fetching project with slug: ${await params.slug}`)

    // Get project from CASES CMS
    const { slug } = await params
    const project = await getCaseBySlug(slug)

    if (project) {
      console.log(`✅ Server: Found project: ${project.projectTitle}`)
      return <WorkPageClient params={params} initialProject={project} dataSource="database" />
    }

    // If no project found, show not found page
    console.log(`❌ Server: Project not found: ${slug}`)
    return <WorkPageClient params={params} initialProject={null} dataSource="fallback" />
  } catch (error) {
    console.error("Error in WorkPage:", error)
    return <WorkPageClient params={params} initialProject={null} dataSource="fallback" />
  }
}