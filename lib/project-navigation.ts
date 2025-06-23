// Project navigation utility
export interface Project {
  slug: string
  title: string
  category: "personal" | "commercial" | "mixed"
}

export const allProjects: Project[] = [
  // Personal Projects
  { slug: "experimental-typography-series", title: "EXPERIMENTAL TYPOGRAPHY SERIES", category: "personal" },
  { slug: "generative-art-collection", title: "GENERATIVE ART COLLECTION", category: "personal" },
  { slug: "urban-photography-project", title: "URBAN PHOTOGRAPHY PROJECT", category: "personal" },
  { slug: "interactive-installations", title: "INTERACTIVE INSTALLATIONS", category: "personal" },
  { slug: "motion-graphics-experiments", title: "MOTION GRAPHICS EXPERIMENTS", category: "personal" },
  { slug: "digital-collage-series", title: "DIGITAL COLLAGE SERIES", category: "personal" },
  { slug: "sound-visualization-project", title: "SOUND VISUALIZATION PROJECT", category: "personal" },
  { slug: "abstract-compositions", title: "ABSTRACT COMPOSITIONS", category: "personal" },
  { slug: "cultural-identity-exploration", title: "CULTURAL IDENTITY EXPLORATION", category: "personal" },

  // Commercial Projects
  { slug: "bomb-shelter-map-venice", title: "BOMB SHELTER MAP OF VENICE", category: "commercial" },
  { slug: "genocide-speech-monitor", title: "GENOCIDE SPEECH MONITOR", category: "commercial" },
  { slug: "ukraine-expo-2025-osaka", title: "NOT FOR SALE, UKRAINE AT EXPO 2025", category: "commercial" },
  { slug: "blood-for-blood-site", title: "BLOOD FOR BLOOD", category: "commercial" },
  { slug: "sense-bank-svitlo-kazok", title: "SENSE BANK, SVITLO KAZOK", category: "commercial" },
  { slug: "go-karpaty-kefir-spoon", title: "GO KARPATY, KEFIR SPOON PRO MAX", category: "commercial" },
  { slug: "bickerstaff-agency-site", title: "BICKERSTAFF AGENCY", category: "commercial" },
  { slug: "brand-ukraine-identity", title: "BRAND UKRAINE", category: "commercial" },

  // Mixed Projects (appear on main page)
  { slug: "maitreya-logo-design", title: "MAITREYA", category: "mixed" },
  { slug: "derzhstat-identity", title: "DERZHSTAT", category: "mixed" },
  { slug: "crimes-without-punishment", title: "CRIMES WITHOUT PUNISHMENT", category: "mixed" },
  { slug: "bickerstaff-identity", title: "BICKERSTAFF", category: "mixed" },
  { slug: "birding-vision", title: "BIRDING VISION", category: "mixed" },
  { slug: "fresh-black-cold-brew", title: "FRESH BLACK COLD BREW", category: "mixed" },
  { slug: "galychyna-packaging", title: "GALYCHYNA", category: "mixed" },
  { slug: "lezo-font-design", title: "LEZO", category: "mixed" },
  { slug: "etnodim-3d-visualisation", title: "ETNODIM", category: "mixed" },
  { slug: "galychyna-visuals", title: "GALYCHYNA VISUALS", category: "mixed" },
  { slug: "pen-ink-packaging", title: "PEN INK", category: "mixed" },
]

export function getNextProject(currentSlug: string): Project | null {
  const currentIndex = allProjects.findIndex((p) => p.slug === currentSlug)
  if (currentIndex === -1 || currentIndex === allProjects.length - 1) {
    return allProjects[0] // Loop back to first project
  }
  return allProjects[currentIndex + 1]
}

export function getPreviousProject(currentSlug: string): Project | null {
  const currentIndex = allProjects.findIndex((p) => p.slug === currentSlug)
  if (currentIndex === -1 || currentIndex === 0) {
    return allProjects[allProjects.length - 1] // Loop back to last project
  }
  return allProjects[currentIndex - 1]
}

export function getProjectBySlug(slug: string): Project | null {
  return allProjects.find((p) => p.slug === slug) || null
}
