"use client"

import type React from "react"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Image from "next/image"

interface NavigationProps {
  activePage?: string | null
  setActivePage?: (page: string | null) => void
}

export default function Navigation({ activePage, setActivePage }: NavigationProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [previousPath, setPreviousPath] = useState<string>("/")

  // Track previous path for navigation history
  useEffect(() => {
    const handleRouteChange = () => {
      setPreviousPath(pathname)
    }

    // Store current path as previous when component mounts
    if (pathname !== "/") {
      setPreviousPath("/")
    }

    return () => {
      handleRouteChange()
    }
  }, [pathname])

  const navCategories = [
    { name: "Dmytro Kifuliak", hasLogo: true, primary: true, path: "/" },
    { name: "Personal Projects", path: "/personal-projects" },
    { name: "Commercial", path: "/commercial" },
    { name: "Journal", path: "/journal" },
    { name: "Fonts", hasIndicator: true, path: "#", disabled: true, decorative: true },
  ]

  const isActivePage = (category: any) => {
    if (category.path === "/" && pathname === "/") return true
    if (category.path !== "/" && pathname.startsWith(category.path)) return true
    return activePage === category.name
  }

  const handleNavClick = (category: any, e: React.MouseEvent) => {
    // Disable fonts button or decorative buttons
    if (category.disabled || category.decorative) {
      e.preventDefault()
      return
    }

    // Check if clicking on current page
    if (isActivePage(category) && category.path !== "/") {
      e.preventDefault()
      // Go back to previous page or homepage
      const targetPath = previousPath && previousPath !== pathname ? previousPath : "/"
      router.push(targetPath)
      return
    }

    // Update previous path before navigation
    setPreviousPath(pathname)
  }

  return (
    <nav className="flex items-center gap-2 mb-4 flex-wrap">
      {navCategories.map((category, index) => {
        const isFirstButton = index === 0
        const isActive = isActivePage(category)
        const hasFontIndicator = category.hasIndicator
        const isDisabled = category.disabled
        const isDecorative = category.decorative

        // For decorative buttons, use a div instead of Link
        const ButtonWrapper = isDecorative
          ? ({ children }: { children: React.ReactNode }) => <div>{children}</div>
          : ({ children }: { children: React.ReactNode }) => (
              <Link href={category.path} onClick={(e) => handleNavClick(category, e)}>
                {children}
              </Link>
            )

        return (
          <ButtonWrapper key={index}>
            <Badge
              className={`inline-flex items-center justify-center gap-1 py-1 px-4 rounded-full transition-all duration-300 ease-in-out ${
                isDisabled ? "bg-gray-400 cursor-not-allowed opacity-50" : "bg-black hover:bg-gray-800 cursor-pointer"
              } h-8`}
            >
              {category.hasLogo && (
                <div className="w-5 h-3 flex-shrink-0 relative">
                  <Image
                    src="/logo-header.svg"
                    alt="Dmytro Kifuliak Logo"
                    width={20}
                    height={11}
                    className="w-full h-full"
                    onError={(e) => {
                      // Fallback if image fails to load – hide broken icon but
                      // don’t trigger a dev-overlay by logging an error.
                      const target = e.target as HTMLImageElement
                      target.style.display = "none"
                    }}
                  />
                </div>
              )}
              <span
                className={`text-[11px] font-${category.primary ? "bold" : "medium"} whitespace-nowrap text-[#E3E3E3]`}
              >
                {category.name}
              </span>
              {hasFontIndicator && <div className="w-1.5 h-1.5 bg-red-500 rounded-full flex-shrink-0" />}
              {isActive && !isFirstButton && !hasFontIndicator && !isDisabled && (
                <div className="w-3 h-3 bg-[#E3E3E3] rounded-full flex items-center justify-center flex-shrink-0">
                  <X className="w-2 h-2 text-black" />
                </div>
              )}
            </Badge>
          </ButtonWrapper>
        )
      })}
    </nav>
  )
}
