"use client"

import Link from "next/link"
import { ChevronRight, Home } from "lucide-react"

interface BreadcrumbProps {
  items: {
    label: string
    href?: string
  }[]
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm text-gray-400 overflow-x-auto pb-2 scrollbar-hide"
    >
      <Link href="/" className="flex items-center hover:text-futura-teal transition-colors flex-shrink-0">
        <Home className="h-3 w-3 sm:h-4 sm:w-4" />
        <span className="sr-only">Home</span>
      </Link>
      {items.map((item, index) => (
        <div key={item.label} className="flex items-center flex-shrink-0">
          <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 mx-1" />
          {item.href ? (
            <Link
              href={item.href}
              className="hover:text-futura-teal transition-colors truncate max-w-[100px] sm:max-w-none"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-white truncate max-w-[120px] sm:max-w-none">{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  )
}

