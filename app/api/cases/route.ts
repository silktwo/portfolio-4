import { NextResponse } from "next/server"
import { Client } from "@notionhq/client"

export const dynamic = "force-dynamic"

async function getCaseProjectsFromNotion() {
  try {
    const token = process.env.CASES_TOKEN || "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"
    const databaseId = process.env.CASES_DATABASE_ID || "20855dd5594d805f94d8d0f5686b292d"

    if (!token) {
      throw new Error("No CASES_TOKEN found in environment variables")
    }

    if (!databaseId) {
      throw new Error("No CASES_DATABASE_ID found in environment variables")
    }

    const notion = new Client({ auth: token })

    console.log("🔍 Querying Cases database:", databaseId.slice(0, 8) + "...")

    const response = await notion.databases.query({
      database_id: databaseId,
      filter: {
        property: "publish",
        checkbox: {
          equals: true,
        },
      },
      sorts: [
        {
          property: "projectTitle",
          direction: "ascending",
        },
      ],
    })

    console.log(`📊 Retrieved ${response.results.length} published case studies`)

    const projects = response.results
      .map((page: any) => {
        const properties = page.properties

        // Extract title from projectTitle field
        let title = ""
        const titleField = properties.projectTitle || properties.title
        if (titleField?.title?.[0]?.plain_text) {
          title = titleField.title[0].plain_text
        } else if (titleField?.rich_text?.[0]?.plain_text) {
          title = titleField.rich_text[0].plain_text
        }

        if (!title) {
          console.warn(`Skipping case study ${page.id} - no projectTitle found`)
          return null
        }

        // Extract description
        let description = ""
        const descField = properties.description
        if (descField?.rich_text?.[0]?.plain_text) {
          description = descField.rich_text[0].plain_text
        }

        // Extract thumbnail
        let thumbnail = ""
        const thumbnailField = properties.thumbnail
        if (thumbnailField?.files?.[0]) {
          const file = thumbnailField.files[0]
          if (file.type === "file" && file.file?.url) {
            thumbnail = file.file.url
          } else if (file.type === "external" && file.external?.url) {
            thumbnail = file.external.url
          }
        }

        // Extract categories from categoryTags
        let categories: string[] = []
        const categoriesField = properties.categoryTags || properties.categories
        if (categoriesField?.multi_select) {
          categories = categoriesField.multi_select.map((cat: any) => cat.name).filter(Boolean)
        }

        // Extract team
        let team = ""
        const teamField = properties.team
        if (teamField?.rich_text?.[0]?.plain_text) {
          team = teamField.rich_text[0].plain_text
        }

        // Extract link
        let link = ""
        const linkField = properties.link
        if (linkField?.url) {
          link = linkField.url
        }

        // Create slug from title
        const slug = title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "")

        return {
          id: page.id,
          title,
          slug,
          description,
          thumbnail,
          categories,
          team,
          link,
          comingSoon: properties.comingSoon?.checkbox || false,
        }
      })
      .filter(Boolean)

    return {
      success: true,
      data: projects,
      metadata: {
        count: projects.length,
        errors: [],
        warnings: projects.length === 0 ? ["No published case studies found"] : [],
        debugInfo: { databaseId, tokenUsed: "CASES_TOKEN" },
      },
    }
  } catch (error) {
    console.error("❌ Error fetching case studies:", error)
    return {
      success: false,
      data: [],
      metadata: {
        count: 0,
        errors: [error instanceof Error ? error.message : "Unknown error"],
        warnings: [],
        debugInfo: { error: true },
      },
    }
  }
}

export async function GET() {
  try {
    console.log("🚀 Cases API route called")

    const result = await getCaseProjectsFromNotion()

    console.log("📊 Cases API result:", {
      success: result.success,
      count: result.metadata.count,
      errors: result.metadata.errors.length,
      warnings: result.metadata.warnings.length,
    })

    return NextResponse.json(result, { status: 200 })
  } catch (error) {
    console.error("❌ Cases API route error:", error)

    return NextResponse.json(
      {
        success: false,
        data: [],
        metadata: {
          count: 0,
          errors: [error instanceof Error ? error.message : "Unknown API error"],
          warnings: [],
          debugInfo: { apiError: true },
        },
      },
      { status: 200 },
    )
  }
}
