import { NextResponse } from "next/server"
import { Client } from "@notionhq/client"

export const dynamic = "force-dynamic"

interface PersonalProject {
  id: string
  title: string
  slug: string
  image: string
  height?: string
}

async function getPersonalProjectsFromNotion(): Promise<PersonalProject[]> {
  try {
    const token = process.env.PERSONAL_TOKEN || "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"
    const databaseId = process.env.PERSONAL_DATABASE_ID || "20955dd5594d809999c8c3562cc7e95f"

    if (!token) {
      console.error("No PERSONAL_TOKEN found in environment variables")
      return []
    }

    if (!databaseId) {
      console.error("No PERSONAL_DATABASE_ID found in environment variables")
      return []
    }

    const notion = new Client({ auth: token })

    console.log("Querying Personal Projects database:", databaseId.slice(0, 8) + "...")

    const response = await notion.databases.query({
      database_id: databaseId,
      sorts: [
        {
          property: "workTitle",
          direction: "ascending",
        },
      ],
    })

    console.log(`Fetched ${response.results.length} projects from Personal Projects database`)

    if (response.results.length === 0) {
      console.warn("No projects found in Personal Projects database")
      return []
    }

    const projects = response.results
      .map((page: any) => {
        const properties = page.properties

        // Extract title from workTitle field
        let title = ""
        const titleField = properties.workTitle || properties.title || properties.name
        if (titleField?.title?.[0]?.plain_text) {
          title = titleField.title[0].plain_text
        } else if (titleField?.rich_text?.[0]?.plain_text) {
          title = titleField.rich_text[0].plain_text
        }

        if (!title) {
          console.warn(`Skipping project ${page.id} - no workTitle found`)
          return null
        }

        // Extract image from workFile field
        let image = ""
        const fileField = properties.workFile || properties.image || properties.file
        if (fileField?.files && Array.isArray(fileField.files)) {
          const file = fileField.files[0]
          if (file) {
            if (file.type === "file" && file.file?.url) {
              image = file.file.url
            } else if (file.type === "external" && file.external?.url) {
              image = file.external.url
            }
          }
        }

        if (!image) {
          console.warn(`Skipping project ${page.id} - no workFile found`)
          return null
        }

        // Create slug from title
        const slug = title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "")

        return {
          id: page.id,
          title: title.toUpperCase(),
          slug,
          image,
          height: "200px",
        }
      })
      .filter(Boolean)

    console.log(`Successfully processed ${projects.length} valid projects`)
    return projects
  } catch (error) {
    console.error("Error fetching personal projects from Notion:", error)
    return []
  }
}

export async function GET() {
  try {
    console.log("Personal Projects API route called")
    const projects = await getPersonalProjectsFromNotion()

    return NextResponse.json({
      projects,
      metadata: {
        isRealData: projects.length > 0,
        source: projects.length > 0 ? "notion" : "empty",
        count: projects.length,
        databaseId: process.env.PERSONAL_DATABASE_ID || "20955dd5594d809999c8c3562cc7e95f",
        requiredFields: ["workTitle", "workFile"],
      },
    })
  } catch (error) {
    console.error("Error in Personal Projects API route:", error)

    return NextResponse.json({
      projects: [],
      metadata: {
        isRealData: false,
        source: "error",
        count: 0,
        databaseId: process.env.PERSONAL_DATABASE_ID || "20955dd5594d809999c8c3562cc7e95f",
        requiredFields: ["workTitle", "workFile"],
        error: error instanceof Error ? error.message : "Unknown error",
      },
    })
  }
}
