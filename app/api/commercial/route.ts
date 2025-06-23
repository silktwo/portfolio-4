import { NextResponse } from "next/server"
import { Client } from "@notionhq/client"

export const dynamic = "force-dynamic"

interface CommercialProject {
  id: string
  title: string
  categories: string[]
  image: string
  link: string
}

interface APIResponse {
  success: boolean
  projects: CommercialProject[]
  metadata: {
    count: number
    source: string
    databaseId: string
    requiredFields: string[]
    errors?: string[]
    warnings?: string[]
    debugInfo?: any
  }
}

// Create Notion client using environment variables
function createNotionClient(): { client: Client | null; tokenUsed: string; errors: string[] } {
  const errors: string[] = []

  try {
    const token = process.env.COMMERCIAL_TOKEN || "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"
    if (!token) {
      errors.push("No COMMERCIAL_TOKEN found in environment variables")
      return { client: null, tokenUsed: "COMMERCIAL_TOKEN", errors }
    }

    const client = new Client({ auth: token })
    console.log(`✅ Successfully created Notion client using COMMERCIAL_TOKEN`)
    return { client, tokenUsed: "COMMERCIAL_TOKEN", errors }
  } catch (error) {
    const errorMsg = `❌ Failed to create client with COMMERCIAL_TOKEN: ${error instanceof Error ? error.message : "Unknown error"}`
    console.error(errorMsg)
    errors.push(errorMsg)
    return { client: null, tokenUsed: "COMMERCIAL_TOKEN", errors }
  }
}

// Test database connection
async function testDatabaseConnection(client: Client): Promise<{ success: boolean; error?: string }> {
  try {
    const databaseId = process.env.COMMERCIAL_DATABASE_ID || "20955dd5594d8064aeffc4761a8a7c38"
    if (!databaseId) {
      return { success: false, error: "No COMMERCIAL_DATABASE_ID found in environment variables" }
    }

    console.log(`🔍 Testing connection to database: ${databaseId}`)

    await client.databases.retrieve({
      database_id: databaseId,
    })

    console.log(`✅ Database connection successful`)
    return { success: true }
  } catch (error) {
    const errorMsg = `❌ Database connection failed: ${error instanceof Error ? error.message : "Unknown error"}`
    console.error(errorMsg)
    return { success: false, error: errorMsg }
  }
}

// Fetch projects from Notion
async function fetchProjectsFromNotion(client: Client): Promise<{
  projects: CommercialProject[]
  errors: string[]
  warnings: string[]
}> {
  const errors: string[] = []
  const warnings: string[] = []

  try {
    const databaseId = process.env.COMMERCIAL_DATABASE_ID || "20955dd5594d8064aeffc4761a8a7c38"
    if (!databaseId) {
      errors.push("No COMMERCIAL_DATABASE_ID found in environment variables")
      return { projects: [], errors, warnings }
    }

    console.log("📥 Fetching commercial projects from Notion...")

    const response = await client.databases.query({
      database_id: databaseId,
      page_size: 50,
    })

    console.log(`📊 Retrieved ${response.results.length} records from database`)

    if (response.results.length === 0) {
      warnings.push("No records found in the commercial database")
      return { projects: [], errors, warnings }
    }

    const projects: CommercialProject[] = []

    for (const [index, page] of response.results.entries()) {
      try {
        const pageData = page as any
        const properties = pageData.properties

        console.log(`🔄 Processing record ${index + 1}/${response.results.length}`)

        // Extract title from projectTitle field
        let title = ""
        const titleField = properties.projectTitle || properties.title || properties.name

        if (titleField) {
          if (titleField.title && titleField.title[0]?.plain_text) {
            title = titleField.title[0].plain_text
          } else if (titleField.rich_text && titleField.rich_text[0]?.plain_text) {
            title = titleField.rich_text[0].plain_text
          }
        }

        // Extract thumbnail
        let image = ""
        const thumbnailField = properties.thumbnail || properties.image || properties.cover

        if (thumbnailField?.files && thumbnailField.files[0]) {
          const file = thumbnailField.files[0]
          if (file.type === "file" && file.file?.url) {
            image = file.file.url
          } else if (file.type === "external" && file.external?.url) {
            image = file.external.url
          }
        }

        // Extract link
        let link = ""
        const linkField = properties.link || properties.url
        if (linkField?.url) {
          link = linkField.url
        }

        // Extract categories from categoryTags
        let categories: string[] = []
        const categoriesField = properties.categoryTags || properties.categories || properties.tags
        if (categoriesField?.multi_select) {
          categories = categoriesField.multi_select.map((cat: any) => cat.name).filter(Boolean)
        }

        // Only include projects with required fields
        if (title && image && link) {
          const project: CommercialProject = {
            id: pageData.id,
            title,
            categories,
            image,
            link,
          }

          projects.push(project)
          console.log(`✅ Added project: ${title}`)
        } else {
          const missing = []
          if (!title) missing.push("projectTitle")
          if (!image) missing.push("thumbnail")
          if (!link) missing.push("link")
          warnings.push(`⚠️ Skipped record ${pageData.id}: missing ${missing.join(", ")}`)
        }
      } catch (recordError) {
        const error = `❌ Error processing record ${index + 1}: ${recordError instanceof Error ? recordError.message : "Unknown error"}`
        console.error(error)
        errors.push(error)
      }
    }

    console.log(`🎉 Successfully processed ${projects.length} projects`)
    return { projects, errors, warnings }
  } catch (error) {
    const errorMsg = `❌ Failed to fetch projects: ${error instanceof Error ? error.message : "Unknown error"}`
    console.error(errorMsg)
    errors.push(errorMsg)
    return { projects: [], errors, warnings }
  }
}

export async function GET() {
  console.log("🚀 Commercial Projects API route called")

  const databaseId = process.env.COMMERCIAL_DATABASE_ID || "20955dd5594d8064aeffc4761a8a7c38"

  const response: APIResponse = {
    success: false,
    projects: [],
    metadata: {
      count: 0,
      source: "error",
      databaseId,
      requiredFields: ["projectTitle", "thumbnail", "link", "categoryTags"],
      errors: [],
      warnings: [],
    },
  }

  try {
    // Step 1: Create Notion client
    const { client, tokenUsed, errors: clientErrors } = createNotionClient()
    response.metadata.errors = [...(response.metadata.errors || []), ...clientErrors]

    if (!client) {
      const errorMsg = "❌ Failed to create Notion client"
      response.metadata.errors?.push(errorMsg)
      console.error(errorMsg)
      return NextResponse.json(response, { status: 200 })
    }

    console.log(`✅ Using token: ${tokenUsed}`)

    // Step 2: Test database connection
    const connectionTest = await testDatabaseConnection(client)
    if (!connectionTest.success) {
      const errorMsg = connectionTest.error || "Database connection failed"
      response.metadata.errors?.push(errorMsg)
      console.error(errorMsg)
      return NextResponse.json(response, { status: 200 })
    }

    // Step 3: Fetch projects
    const { projects, errors: fetchErrors, warnings } = await fetchProjectsFromNotion(client)

    response.success = true
    response.projects = projects
    response.metadata.count = projects.length
    response.metadata.source = projects.length > 0 ? "notion" : "empty"
    response.metadata.errors = [...(response.metadata.errors || []), ...fetchErrors]
    response.metadata.warnings = warnings
    response.metadata.debugInfo = { tokenUsed }

    console.log(`🎉 API response ready: ${projects.length} projects`)

    return NextResponse.json(response)
  } catch (error) {
    const errorMsg = `❌ Unexpected error in API route: ${error instanceof Error ? error.message : "Unknown error"}`
    console.error(errorMsg)
    response.metadata.errors?.push(errorMsg)
    return NextResponse.json(response, { status: 200 })
  }
}
