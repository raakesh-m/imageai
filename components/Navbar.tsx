import Link from "next/link"
import { DarkModeToggle } from "./DarkModeToggle"

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link 
            href="/" 
            className="flex items-center space-x-3 transition-opacity hover:opacity-90"
          >
            <svg
              width="40"
              height="40"
              viewBox="0 0 150 150"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="dark:filter dark:brightness-110"
            >
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FF8C00" />
                  <stop offset="100%" stopColor="#8A2BE2" />
                </linearGradient>
              </defs>
              
              <circle 
                cx="75" 
                cy="75" 
                r="50" 
                fill="url(#gradient)" 
                stroke="currentColor" 
                strokeWidth="3" 
                opacity="0.9" 
              />
              <path 
                d="M 55 60 Q 75 30, 95 60 Q 115 90, 75 120 Q 35 90, 55 60 Z"
                stroke="white"
                strokeWidth="3"
                fill="none"
              />
              <circle cx="65" cy="55" r="3" fill="white" />
              <circle cx="85" cy="55" r="3" fill="white" />
              <circle cx="75" cy="75" r="3" fill="white" />
              <circle cx="65" cy="95" r="3" fill="white" />
              <circle cx="85" cy="95" r="3" fill="white" />
            </svg>
            
            <div className="flex flex-col">
              <span className="text-xl font-bold bg-gradient-to-r from-orange-500 to-purple-600 bg-clip-text text-transparent">
                AI Image Gen
              </span>
              <span className="text-xs text-muted-foreground hidden sm:inline-block">
                Create stunning AI images
              </span>
            </div>
          </Link>

          <div className="flex items-center space-x-4">
            <div className="hidden sm:flex items-center space-x-1">
              <Link 
                href="https://github.com/raakesh-m/imageai" 
                target="_blank"
                className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                GitHub
              </Link>
              <Link 
                href="/docs" 
                className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Docs
              </Link>
            </div>
            <div className="h-6 w-px bg-border hidden sm:block" />
            <DarkModeToggle />
          </div>
        </div>
      </div>
    </nav>
  )
}

