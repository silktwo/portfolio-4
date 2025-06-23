"use client"

import { Separator } from "@/components/ui/separator"

export default function InfoSection() {
  const socialLinks = [
    { name: "instagram", url: "https://www.instagram.com/tiredxs/" },
    { name: "telegram", url: "http://t.me/tiredxs" },
    { name: "mail", url: "mailto:kifuliak66@gmail.com" },
    { name: "read.cv", url: "https://read.cv/tiredxs" },
    { name: "are.na", url: "https://www.are.na/dima-kifuliak" },
  ]

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-12 mb-8 lg:mb-12">
      {/* Column 1: Description */}
      <div className="flex flex-col lg:col-span-1">
        <p className="text-[12px] font-medium text-black leading-[16px]">
          Dmytro Kifuliak. All-in-one designer with 7+ years of experience. Conceives and builds visual systems from
          start to finish — not just beautiful things, but clear, thoughtful, and effective ones. Helps bring clarity to
          chaos and give form to the formless.
          <br />
          <br />I believe good design starts with respect — for the context, the user, and the team.
          <br />
          <br />I value structure and thoughtfulness. In my work, I focus not only on my own vision but also on the
          interests of the team.
          <br />
          <br />
          Open to collaboration. Always forward. Thanks, bye.
        </p>
      </div>

      {/* Column 2: Services & Clients */}
      <div className="flex flex-col sm:flex-row lg:flex-row gap-4 lg:col-span-1">
        {/* Services */}
        <div className="flex flex-col gap-1 flex-1">
          <h3 className="text-[12px] font-bold text-black leading-normal">SERVICES:</h3>
          <Separator className="h-[0.5px] w-full bg-black mb-1" />
          <div className="text-[12px] font-medium text-black leading-[16px]">
            {[
              "Art Direction",
              "Graphic Design",
              "Packaging",
              "Branding",
              "Editorial Design",
              "Motion Design",
              "Web Design",
              "Social Media",
              "Creative Coding",
            ].map((service, index) => (
              <div key={index}>{service}</div>
            ))}
          </div>
        </div>

        {/* Clients */}
        <div className="flex flex-col gap-1 flex-1">
          <h3 className="text-[12px] font-bold text-black leading-normal">SELECTED CLIENTS:</h3>
          <Separator className="h-[0.5px] w-full bg-black mb-1" />
          <div className="text-[12px] font-medium text-black leading-[16px]">
            {[
              "Brand Ukraine",
              "Uklon",
              "Silpo",
              "Etnodim",
              "Galychyna",
              "Fresh Black",
              "Office of the President of Ukraine",
              "Ministry of Foreign Affairs of Ukraine",
              "Ministry of Digital Transformation of Ukraine",
              "Ukrainian Institute",
              "Vodafone Ukraine",
              "Sense Bank",
            ].map((client, index) => (
              <div key={index}>{client}</div>
            ))}
          </div>
        </div>
      </div>

      {/* Column 3: Let's Get Connected */}
      <div className="flex flex-col gap-1 lg:col-span-1">
        <h3 className="text-[12px] font-bold text-black leading-normal">{"LET'S GET CONNECTED:"}</h3>
        <Separator className="h-[0.5px] w-full bg-black mb-1" />
        <p className="text-[12px] font-medium text-black leading-[16px] mb-2">
          Looking to collaborate on innovative projects at the intersection of technology, culture, and design.
          Especially interested in visual systems, identity work, and visual storytelling.
        </p>
        <div className="text-[12px] font-medium text-black leading-[16px]">
          {socialLinks.map((link, index) => (
            <div key={index} className="hover:underline cursor-pointer">
              <a href={link.url} target="_blank" rel="noopener noreferrer">
                {link.name}
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
