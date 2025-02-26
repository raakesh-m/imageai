import Link from "next/link"
import { DarkModeToggle } from "./DarkModeToggle"

export default function Navbar() {
  return (
    <nav className="bg-background border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold text-primary">
              AI Image Generator
            </Link>
          </div>
          <div className="flex items-center">
            <DarkModeToggle />
          </div>
        </div>
      </div>
    </nav>
  )
}

