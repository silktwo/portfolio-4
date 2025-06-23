"use client"

import Navigation from "@/components/navigation"
import CMSSetup from "@/components/cms-setup"
import Footer from "@/components/footer"

export default function CMSSetupPage() {
  return (
    <div className="bg-white min-h-screen overflow-x-hidden">
      <div className="w-[calc(100%-40px)] sm:w-[calc(100%-60px)] mx-[20px] sm:mx-[30px] py-[30px]">
        {/* Top Navigation */}
        <div className="mb-8">
          <Navigation />
        </div>

        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">CMS Setup & Configuration</h1>
          <p className="text-gray-600">Configure your Notion databases for all project types</p>
        </div>

        {/* CMS Setup Component */}
        <CMSSetup />

        {/* Footer */}
        <div className="mt-16">
          <Footer />
        </div>
      </div>
    </div>
  )
}
