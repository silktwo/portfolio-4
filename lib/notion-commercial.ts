export interface CommercialProject {
  id: string
  title: string
  categories: string[]
  image: string
  link: string
}

// Client-side function that fetches from the commercial API route
export async function getCommercialProjects(): Promise<CommercialProject[]> {
  try {
    console.log("🔄 Fetching commercial projects from /api/commercial...")

    const response = await fetch("/api/commercial", {
      method: "GET",
      cache: "no-store",
      headers: {
        "Cache-Control": "no-cache",
        "Content-Type": "application/json",
      },
    })

    console.log(`📡 Response status: ${response.status}`)

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`❌ HTTP error! status: ${response.status}, body: ${errorText}`)
      return []
    }

    const data = await response.json()
    console.log("📊 Commercial API Response received")
    console.log("- Success:", data.success)
    console.log("- Project count:", data.projects?.length || 0)
    console.log("- Errors:", data.metadata?.errors?.length || 0)
    console.log("- Warnings:", data.metadata?.warnings?.length || 0)

    if (data.metadata?.errors?.length > 0) {
      console.error("❌ API returned errors:", data.metadata.errors)
    }

    if (data.metadata?.warnings?.length > 0) {
      console.warn("⚠️ API returned warnings:", data.metadata.warnings)
    }

    return data.projects || []
  } catch (error) {
    console.error("❌ Error fetching commercial projects:", error)
    return []
  }
}
