export interface CaseProject {
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

export interface HomepageProject {
  id: string
  projectTitle: string
  slug: string
  categoryTags: string[]
  thumbnail: string
  publish: boolean
  comingSoon: boolean
}

function cleanDatabaseId(id: string): string {
  return id.replace(/-/g, "")
}

function extractTextFromRichText(richText: any[]): string {
  if (!richText || !Array.isArray(richText)) return ""
  return richText.map((text) => text.plain_text || "").join("")
}

function extractTextFromProperty(property: any): string {
  if (!property) return ""

  if (property.rich_text && Array.isArray(property.rich_text)) {
    return extractTextFromRichText(property.rich_text)
  }

  if (property.title && Array.isArray(property.title)) {
    return extractTextFromRichText(property.title)
  }

  return ""
}

function extractFilesFromProperty(files: any[]): string[] {
  if (!files || !Array.isArray(files)) return []
  return files
    .map((file) => {
      if (file.type === "file") return file.file?.url || ""
      if (file.type === "external") return file.external?.url || ""
      return ""
    })
    .filter(Boolean)
}

function extractMultiSelectFromProperty(multiSelect: any[]): string[] {
  if (!multiSelect || !Array.isArray(multiSelect)) return []
  return multiSelect.map((item) => item.name || "").filter(Boolean)
}

// Function to get a single case by slug (full case data)
export async function getCaseBySlug(slug: string): Promise<CaseProject | null> {
  try {
    console.log(`🔍 Searching for case with slug: ${slug}`)

    // Get all cases first
    const result = await getCaseProjects()

    if (!result.success || result.data.length === 0) {
      console.log("❌ No cases found or failed to fetch")
      return null
    }

    // Find case by matching slug
    const project = result.data.find((project) => project.slug === slug)

    if (project) {
      console.log(`✅ Found matching project: ${project.projectTitle}`)
      return project
    }

    console.log(`❌ No project found for slug: ${slug}`)
    return null
  } catch (error) {
    console.error("❌ Error in getCaseBySlug:", error)
    return null
  }
}

export async function getCaseProjects(): Promise<{
  success: boolean
  data: CaseProject[]
  metadata: {
    count: number
    errors: string[]
    warnings: string[]
    debugInfo: any
  }
}> {
  const metadata = {
    count: 0,
    errors: [] as string[],
    warnings: [] as string[],
    debugInfo: {} as any,
  }

  try {
    console.log("🔍 Starting case projects fetch...")

    // Get environment variables
    const token = process.env.CASES_TOKEN
    const databaseId = cleanDatabaseId(process.env.CASES_DATABASE_ID || "20855dd5594d805f94d8d0f5686b292d")

    metadata.debugInfo.token = token ? `${token.substring(0, 10)}...` : "Not found"
    metadata.debugInfo.databaseId = databaseId

    if (!token) {
      metadata.errors.push("No CASES_TOKEN found. Please set CASES_TOKEN environment variable.")
      return { success: false, data: [], metadata }
    }

    if (!databaseId) {
      metadata.errors.push("No CASES_DATABASE_ID found. Please set CASES_DATABASE_ID environment variable.")
      return { success: false, data: [], metadata }
    }

    console.log("🔑 Using token:", token.substring(0, 10) + "...")
    console.log("🗄️ Using database ID:", databaseId)

    // Import Notion client
    const { Client } = await import("@notionhq/client")

    const notion = new Client({
      auth: token,
      timeoutMs: 15000,
    })

    console.log("📡 Fetching from Notion database...")

    // Query the database - get all projects for both homepage and case pages
    const response = await notion.databases.query({
      database_id: databaseId,
      page_size: 100,
    })

    console.log("📊 Raw response received:", response.results.length, "records")
    metadata.debugInfo.rawCount = response.results.length

    const projects: CaseProject[] = []

    for (const page of response.results) {
      try {
        if (!("properties" in page)) {
          metadata.warnings.push(`Skipping page ${page.id}: No properties found`)
          continue
        }

        const properties = page.properties

        // Extract required fields with proper field mapping
        const projectTitle = extractTextFromProperty(properties.projectTitle)
        let slug = extractTextFromProperty(properties.slug)
        
        // If no slug field exists, generate from projectTitle
        if (!slug && projectTitle) {
          slug = projectTitle
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "")
        }
        
        const description = extractTextFromProperty(properties.description)
        const team = extractTextFromProperty(properties.team)
        const categoryTags = extractMultiSelectFromProperty(properties.categoryTags?.multi_select || [])
        const introImage = extractFilesFromProperty(properties.introImage?.files || [])[0] || ""
        const projectMedia = extractFilesFromProperty(properties.projectMedia?.files || [])
        const draftProcess = extractFilesFromProperty(properties.draftProcess?.files || [])
        const publish = properties.publish?.checkbox || false
        const link = properties.link?.url || ""
        const thumbnail = extractFilesFromProperty(properties.thumbnail?.files || [])[0] || ""
        const comingSoon = properties.comingSoon?.checkbox || false

        // Validate required fields
        if (!projectTitle) {
          metadata.warnings.push(`Skipping project: Missing projectTitle`)
          continue
        }

        if (!slug) {
          metadata.warnings.push(`Skipping project "${projectTitle}": Missing slug`)
          continue
        }

        const project: CaseProject = {
          id: page.id,
          projectTitle,
          slug,
          categoryTags,
          description,
          team,
          introImage,
          projectMedia,
          draftProcess,
          publish,
          link,
          thumbnail,
          comingSoon,
        }

        projects.push(project)
        console.log("✅ Processed project:", projectTitle, "with slug:", slug)
      } catch (error) {
        metadata.warnings.push(
          `Error processing page ${page.id}: ${error instanceof Error ? error.message : "Unknown error"}`,
        )
        console.error("Error processing page:", error)
      }
    }

    metadata.count = projects.length
    metadata.debugInfo.processedCount = projects.length

    console.log("🎉 Successfully processed", projects.length, "case projects")

    return {
      success: true,
      data: projects,
      metadata,
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
    metadata.errors.push(`Failed to fetch case projects: ${errorMessage}`)
    console.error("❌ Error in getCaseProjects:", error)

    return {
      success: false,
      data: [],
      metadata,
    }
  }
}
