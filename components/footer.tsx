import Image from "next/image"

interface FooterProps {
  className?: string
  showCaseLogo?: boolean
}

export default function Footer({ className = "", showCaseLogo = false }: FooterProps) {
  const socialLinks = [
    { name: "instagram", url: "https://www.instagram.com/tiredxs/" },
    { name: "telegram", url: "http://t.me/tiredxs" },
    { name: "mail", url: "mailto:kifuliak66@gmail.com" },
    { name: "read.cv", url: "https://read.cv/tiredxs" },
    { name: "are.na", url: "https://www.are.na/dima-kifuliak" },
  ]

  return (
    <footer className={`w-full py-4 mt-8 ${className}`}>
      <div className="flex flex-col items-start gap-2">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <div className="w-[59px] h-[30px] relative">
              <Image
                src="/logo-footer.svg"
                alt="Dmytro Kifuliak Footer Logo"
                width={59}
                height={30}
                className="w-full h-full"
                priority
              />
            </div>
            <span className="text-[12px] font-medium text-black">Dmytro Kifuliak. © 2025</span>
          </div>
        </div>

        {showCaseLogo && (
          <div className="mt-4 mb-2">
            <div className="w-[307px] h-[159px] max-w-full relative">
              <Image
                src="/logo-case-footer.svg"
                alt="Case Study Logo - © 2025"
                width={307}
                height={159}
                className="w-full h-full"
                priority
              />
            </div>
          </div>
        )}

        <div className="flex items-center gap-2">
          <span className="text-[12px] font-medium text-black">SOCIAL:</span>
          <div className="flex items-center gap-1.5 flex-wrap">
            {socialLinks.map((link, index) => (
              <a
                key={index}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[12px] font-medium text-black hover:underline"
              >
                {link.name}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
