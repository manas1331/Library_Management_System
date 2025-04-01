"use client"

import { useState } from "react"
import Link from "next/link"
import { Book, LogOut, Menu, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

export function Navbar() {
  const [isLibrarian, setIsLibrarian] = useState(true)

  return (
    <nav className="bg-white border-b">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Book className="h-6 w-6 text-primary" />
          <span className="text-xl font-semibold">LibraryMS</span>
        </div>

        <div className="hidden md:flex items-center space-x-6">
          <Link href="/" className="text-gray-700 hover:text-primary">
            Home
          </Link>
          <Link href="/books" className="text-gray-700 hover:text-primary">
            Books
          </Link>
          {isLibrarian && (
            <>
              <Link href="/members" className="text-gray-700 hover:text-primary">
                Members
              </Link>
              <Link href="/reports" className="text-gray-700 hover:text-primary">
                Reports
              </Link>
            </>
          )}
        </div>

        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" className="rounded-full">
            <User className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <LogOut className="h-5 w-5" />
          </Button>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <div className="flex flex-col space-y-4 mt-8">
                <Link href="/" className="text-gray-700 hover:text-primary">
                  Home
                </Link>
                <Link href="/books" className="text-gray-700 hover:text-primary">
                  Books
                </Link>
                {isLibrarian && (
                  <>
                    <Link href="/members" className="text-gray-700 hover:text-primary">
                      Members
                    </Link>
                    <Link href="/reports" className="text-gray-700 hover:text-primary">
                      Reports
                    </Link>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  )
}

