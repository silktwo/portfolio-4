import { NextResponse } from "next/server"
import { Client } from "@notionhq/client"

export const dynamic = "force-dynamic"

async function getBlogPosts() {
  try {
    const token = process.env.NOTION_TOKEN || "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"
    const databaseId = process.env.NOTION_DATABASE_ID || "20855dd5594d80a8b3e2cdf91d74eb53"

    if (!token) {
      throw new Error("No NOTION_TOKEN found in environment variables")
    }

    if (!databaseId) {
      throw new Error("No NOTION_DATABASE_ID found in environment variables")
    }

    const notion = new Client({ auth: token })

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
          property: "date",
          direction: "descending",
        },
      ],
    })

    return response.results.map((page: any) => {
      const properties = page.properties

      // Get description from the page content or properties
      let description = ""
      if (properties.description?.rich_text?.[0]?.plain_text) {
        description = properties.description.rich_text[0].plain_text
      }

      // Process attachments
      const attachments = (properties.attachments?.files || []).map((file: any) => {
        const isImage = file.name && /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(file.name)
        return {
          name: file.name || "Untitled",
          url: file.type === "file" ? file.file?.url : file.external?.url,
          type: isImage ? "image" : "file",
        }
      })

      return {
        id: page.id,
        title: properties.title?.title?.[0]?.plain_text || properties.blogPost?.title?.[0]?.plain_text || "Untitled",
        description,
        date: properties.date?.date?.start || null,
        published: properties.publish?.checkbox || false,
        attachments,
      }
    })
  } catch (error) {
    console.error("Error fetching blog posts:", error)
    throw error
  }
}

export async function GET() {
  try {
    const posts = await getBlogPosts()
    return NextResponse.json(posts)
  } catch (error) {
    console.error("Error in blog API route:", error)
    return NextResponse.json({ error: "Failed to fetch blog posts" }, { status: 500 })
  }
}
