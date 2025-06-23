import { Client } from "@notionhq/client"

// Unified Notion CMS configuration with your provided tokens
export const NOTION_CONFIG = {
  // Personal Projects Database
  PERSONAL_PROJECTS: {
    DATABASE_ID: "20955dd5594d809999c8c3562cc7e95f",
    TOKEN: "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",
    TOKEN_ENV: "PERSONAL_TOKEN",
    FIELDS: {
      TITLE: "workTitle",
      FILE: "workFile",
    },
  },
  // Commercial Projects Database
  COMMERCIAL_PROJECTS: {
    DATABASE_ID: "20955dd5594d8064aeffc4761a8a7c38",
    TOKEN: "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",
    TOKEN_ENV: "COMMERCIAL_TOKEN",
    FIELDS: {
      TITLE: "projectTitle",
      TAGS: "categoryTags",
      THUMBNAIL: "thumbnail",
      LINK: "link",
    },
  },
  // Case Studies Database
  CASE_STUDIES: {
    DATABASE_ID: "20855dd5594d805f94d8d0f5686b292d",
    TOKEN: "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",
    TOKEN_ENV: "CASES_TOKEN",
    FIELDS: {
      TITLE: "projectTitle",
      TAGS: "categoryTags",
      DESCRIPTION: "description",
      TEAM: "team",
      THUMBNAIL: "thumbnail",
      INTRO_IMAGE: "introImage",
      PROJECT_MEDIA: "projectMedia",
      DRAFT_PROCESS: "draftProcess",
      ADD_MEDIA: "addMedia",
      PUBLISH: "publish",
      COMING_SOON: "comingSoon",
      LINK: "link",
    },
  },
  // Blog Posts Database
  BLOG_POSTS: {
    DATABASE_ID: "20855dd5594d80a8b3e2cdf91d74eb53",
    TOKEN: "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",
    TOKEN_ENV: "NOTION_TOKEN",
    FIELDS: {
      TITLE: "blogPost",
      DATE: "date",
      PUBLISH: "publish",
      ATTACHMENTS: "attachments",
    },
  },
}

// Create Notion client with your provided tokens
function createNotionClient(preferredConfig?: keyof typeof NOTION_CONFIG): Client | null {
  const configs = [
    preferredConfig ? NOTION_CONFIG[preferredConfig] : null,
    NOTION_CONFIG.PERSONAL_PROJECTS,
    NOTION_CONFIG.COMMERCIAL_PROJECTS,
    NOTION_CONFIG.CASE_STUDIES,
    NOTION_CONFIG.BLOG_POSTS,
  ].filter(Boolean)

  for (const config of configs) {
    if (config?.TOKEN) {
      try {
        return new Client({ auth: config.TOKEN })
      } catch (error) {
        console.warn(`Failed to create Notion client with ${config.TOKEN_ENV}:`, error)
        continue
      }
    }
  }

  // Fallback to environment variables
  const envTokens = [
    process.env.PERSONAL_TOKEN,
    process.env.COMMERCIAL_TOKEN,
    process.env.CASES_TOKEN,
    process.env.NOTION_TOKEN,
  ].filter(Boolean)

  for (const token of envTokens) {
    if (token) {
      try {
        return new Client({ auth: token })
      } catch (error) {
        console.warn(`Failed to create Notion client with env token:`, error)
        continue
      }
    }
  }

  console.error("No valid Notion token found")
  return null
}

// Test database connection
export async function testDatabaseConnection(configKey: keyof typeof NOTION_CONFIG): Promise<{
  success: boolean
  error?: string
  recordCount?: number
}> {
  try {
    const config = NOTION_CONFIG[configKey]
    const notion = new Client({ auth: config.TOKEN })

    const response = await notion.databases.query({
      database_id: config.DATABASE_ID,
      page_size: 1,
    })

    return {
      success: true,
      recordCount: response.results.length,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

// Validate database schema
export async function validateDatabaseSchema(
  configKey: keyof typeof NOTION_CONFIG,
  requiredFields: string[],
): Promise<{
  valid: boolean
  missingFields: string[]
  availableFields: string[]
}> {
  try {
    const config = NOTION_CONFIG[configKey]
    const notion = new Client({ auth: config.TOKEN })

    const database = await notion.databases.retrieve({
      database_id: config.DATABASE_ID,
    })

    const availableFields = Object.keys(database.properties)
    const missingFields = requiredFields.filter((field) => !availableFields.includes(field))

    return {
      valid: missingFields.length === 0,
      missingFields,
      availableFields,
    }
  } catch (error) {
    console.error("Error validating database schema:", error)
    return { valid: false, missingFields: requiredFields, availableFields: [] }
  }
}

export { createNotionClient }
