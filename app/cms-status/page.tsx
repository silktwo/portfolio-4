"use client"

import Navigation from "@/components/navigation"
import CMSStatus from "@/components/cms-status"
import Footer from "@/components/footer"

export default function CMSStatusPage() {
  return (
    <div className="bg-white min-h-screen overflow-x-hidden">
      <div className="w-[calc(100%-40px)] sm:w-[calc(100%-60px)] mx-[20px] sm:mx-[30px] py-[30px]">
        {/* Top Navigation */}
        <div className="mb-8">
          <Navigation />
        </div>

        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">CMS Integration Status</h1>
          <p className="text-gray-600">Monitor the connection status of your Notion databases</p>
        </div>

        {/* CMS Status Component */}
        <CMSStatus />

        {/* Footer */}
        <div className="mt-16">
          <Footer />
        </div>
      </div>
    </div>
  )
}
