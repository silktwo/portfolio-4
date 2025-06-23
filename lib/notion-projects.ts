export interface PersonalProject {
  id: string
  title: string
  slug: string
  image: string
  height?: string
}

// Client-side function that fetches from the new projects API route
export async function getPersonalProjects(): Promise<PersonalProject[]> {
  try {
    console.log("🔄 Fetching personal projects from /api/projects...")

    const response = await fetch("/api/projects", {
      cache: "no-store",
      headers: {
        "Cache-Control": "no-cache",
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    console.log(`✅ Received ${data.projects?.length || 0} projects from API`)

    return data.projects || []
  } catch (error) {
    console.error("❌ Error fetching personal projects:", error)
    return []
  }
}

export async function getPersonalProject(slug: string): Promise<PersonalProject | null> {
  try {
    const projects = await getPersonalProjects()
    return projects.find((p) => p.slug === slug) || null
  } catch (error) {
    console.error("❌ Error fetching personal project:", error)
    return null
  }
}
