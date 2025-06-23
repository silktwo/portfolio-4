import { createNotionClient, NOTION_CONFIG } from "@/lib/notion-cms"

export interface BlogPost {
  id: string
  title: string
  slug: string
  date: string
  description: string
  published: boolean
  attachments: Array<{
    name: string
    url: string
    type: "image" | "file"
  }>
  content?: string
}

export async function getBlogPosts(): Promise<BlogPost[]> {
  try {
    const notion = createNotionClient(NOTION_CONFIG.BLOG_POSTS.TOKEN_ENV)
    if (!notion) {
      console.error("Failed to create Notion client for Blog Posts")
      return []
    }

    const response = await notion.databases.query({
      database_id: NOTION_CONFIG.BLOG_POSTS.DATABASE_ID,
      filter: {
        property: NOTION_CONFIG.BLOG_POSTS.FIELDS.PUBLISH,
        checkbox: {
          equals: true,
        },
      },
      sorts: [
        {
          property: NOTION_CONFIG.BLOG_POSTS.FIELDS.DATE,
          direction: "descending",
        },
      ],
    })

    console.log(`Fetched ${response.results.length} published blog posts`)

    const posts = response.results.map((page: any) => {
      const properties = page.properties

      // Extract title from blogPost field
      let title = ""
      let description = ""

      const titleField = properties[NOTION_CONFIG.BLOG_POSTS.FIELDS.TITLE]
      if (titleField?.title?.[0]?.plain_text) {
        title = titleField.title[0].plain_text
        description = title
      } else if (titleField?.rich_text?.[0]?.plain_text) {
        title = titleField.rich_text[0].plain_text
        description = title
      } else {
        title = `Entry ${page.id.slice(-8)}`
        description = ""
      }

      // Extract date
      const dateField = properties[NOTION_CONFIG.BLOG_POSTS.FIELDS.DATE]
      const date = dateField?.date?.start || new Date().toISOString()

      // Create slug from title
      const slug =
        title !== `Entry ${page.id.slice(-8)}`
          ? title
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, "-")
              .replace(/(^-|-$)/g, "")
          : page.id

      // Extract attachments
      const attachments: Array<{ name: string; url: string; type: "image" | "file" }> = []
      const attachmentsField = properties[NOTION_CONFIG.BLOG_POSTS.FIELDS.ATTACHMENTS]

      if (attachmentsField?.files && Array.isArray(attachmentsField.files)) {
        attachmentsField.files.forEach((file: any) => {
          try {
            if (file.type === "file" && file.file?.url) {
              attachments.push({
                name: file.name || "Attachment",
                url: file.file.url,
                type: file.name?.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? "image" : "file",
              })
            } else if (file.type === "external" && file.external?.url) {
              attachments.push({
                name: file.name || "External File",
                url: file.external.url,
                type: file.name?.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? "image" : "file",
              })
            }
          } catch (fileError) {
            console.warn("Error processing attachment:", fileError)
          }
        })
      }

      // Extract published status
      const publishField = properties[NOTION_CONFIG.BLOG_POSTS.FIELDS.PUBLISH]
      const published = publishField?.checkbox || false

      return {
        id: page.id,
        title,
        slug,
        date,
        description,
        published,
        attachments,
      }
    })

    return posts
  } catch (error) {
    console.error("Error fetching blog posts:", error)
    return []
  }
}

export async function getBlogPost(slug: string): Promise<BlogPost | null> {
  try {
    const posts = await getBlogPosts()
    return posts.find((p) => p.slug === slug) || null
  } catch (error) {
    console.error("Error fetching blog post:", error)
    return null
  }
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  const day = date.getDate().toString().padStart(2, "0")
  const month = (date.getMonth() + 1).toString().padStart(2, "0")
  const year = date.getFullYear().toString().slice(-2)
  return `${day} ${month} ${year}`
}
