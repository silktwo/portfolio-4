import { NextResponse } from "next/server"
import { testDatabaseConnection, validateDatabaseSchema, NOTION_CONFIG } from "@/lib/notion-cms"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    console.log("Testing CMS connections...")

    // Test Personal Projects Database
    const personalProjectsTest = await testDatabaseConnection(
      NOTION_CONFIG.PERSONAL_PROJECTS.DATABASE_ID,
      NOTION_CONFIG.PERSONAL_PROJECTS.TOKEN_ENV,
    )

    const personalProjectsSchema = await validateDatabaseSchema(
      NOTION_CONFIG.PERSONAL_PROJECTS.DATABASE_ID,
      [NOTION_CONFIG.PERSONAL_PROJECTS.FIELDS.TITLE, NOTION_CONFIG.PERSONAL_PROJECTS.FIELDS.FILE],
      NOTION_CONFIG.PERSONAL_PROJECTS.TOKEN_ENV,
    )

    // Test Blog Posts Database
    const blogPostsTest = await testDatabaseConnection(
      NOTION_CONFIG.BLOG_POSTS.DATABASE_ID,
      NOTION_CONFIG.BLOG_POSTS.TOKEN_ENV,
    )

    const blogPostsSchema = await validateDatabaseSchema(
      NOTION_CONFIG.BLOG_POSTS.DATABASE_ID,
      [
        NOTION_CONFIG.BLOG_POSTS.FIELDS.TITLE,
        NOTION_CONFIG.BLOG_POSTS.FIELDS.DATE,
        NOTION_CONFIG.BLOG_POSTS.FIELDS.PUBLISH,
      ],
      NOTION_CONFIG.BLOG_POSTS.TOKEN_ENV,
    )

    const status = {
      personalProjects: {
        connection: personalProjectsTest,
        schema: personalProjectsSchema,
        databaseId: NOTION_CONFIG.PERSONAL_PROJECTS.DATABASE_ID,
        requiredFields: [NOTION_CONFIG.PERSONAL_PROJECTS.FIELDS.TITLE, NOTION_CONFIG.PERSONAL_PROJECTS.FIELDS.FILE],
      },
      blogPosts: {
        connection: blogPostsTest,
        schema: blogPostsSchema,
        databaseId: NOTION_CONFIG.BLOG_POSTS.DATABASE_ID,
        requiredFields: [
          NOTION_CONFIG.BLOG_POSTS.FIELDS.TITLE,
          NOTION_CONFIG.BLOG_POSTS.FIELDS.DATE,
          NOTION_CONFIG.BLOG_POSTS.FIELDS.PUBLISH,
        ],
      },
      overall: {
        personalProjectsReady: personalProjectsTest.success && personalProjectsSchema.valid,
        blogPostsReady: blogPostsTest.success && blogPostsSchema.valid,
        allSystemsReady:
          personalProjectsTest.success &&
          personalProjectsSchema.valid &&
          blogPostsTest.success &&
          blogPostsSchema.valid,
      },
    }

    return NextResponse.json(status)
  } catch (error) {
    console.error("Error checking CMS status:", error)
    return NextResponse.json({ error: "Failed to check CMS status" }, { status: 500 })
  }
}
