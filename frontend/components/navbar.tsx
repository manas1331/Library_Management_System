"use client"

import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { BookOpen, LogOut, Menu, User, LogIn, UserPlus, Book, BookCheck, BookX, BarChart } from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function Navbar() {
  const { user, logout, isAuthenticated } = useAuth()

  return (
    <header className="bg-white border-b sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center">
          <Link href="/" className="flex items-center space-x-2">
            <BookOpen className="h-6 w-6" />
            <span className="font-bold text-xl">Library System</span>
          </Link>
        </div>
        
        <div className="hidden md:flex space-x-6">
          <Link href="/" className="text-gray-700 hover:text-gray-900">
            Home
          </Link>
          <Link href="/books" className="text-gray-700 hover:text-gray-900">
            Books
          </Link>
          
          {isAuthenticated && (user?.role === "LIBRARIAN" || user?.role === "MEMBER") && (
            <>
              <Link href="/checkout" className="text-gray-700 hover:text-gray-900">
                Checkout
              </Link>
              <Link href="/return" className="text-gray-700 hover:text-gray-900">
                Return
              </Link>
            </>
          )}
          
          {isAuthenticated && user?.role === "LIBRARIAN" && (
            <>
              
              <Link href="/reports" className="text-gray-700 hover:text-gray-900">
                Reports
              </Link>
            </>
          )}
        </div>
        
        <div className="flex items-center space-x-4">
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{user?.name}</DropdownMenuLabel>
                <DropdownMenuLabel className="text-xs text-gray-500">{user?.email}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                
                <DropdownMenuItem asChild className="cursor-pointer">
                  <Link href="/profile">My Profile</Link>
                </DropdownMenuItem>

                {user?.role === "MEMBER" && (
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link href="/membership/manage">Manage Membership</Link>
                  </DropdownMenuItem>
                )}
                
                <DropdownMenuItem onClick={logout} className="justify-start px-2 cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center space-x-2">
              <Button variant="ghost" asChild>
                <Link href="/auth/login">
                  <LogIn className="mr-2 h-4 w-4" />
                  Login
                </Link>
              </Button>
              <Button asChild>
                <Link href="/membership">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Register
                </Link>
              </Button>
            </div>
          )}
          
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle>Library System</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-4 mt-6">
                <Link href="/" className="flex items-center gap-2 text-lg">
                  <BookOpen className="h-5 w-5" />
                  Home
                </Link>
                <Link href="/books" className="flex items-center gap-2 text-lg">
                  <Book className="h-5 w-5" />
                  Books
                </Link>
                
                {isAuthenticated && (user?.role === "LIBRARIAN" || user?.role === "MEMBER") && (
                  <>
                    <Link href="/checkout" className="flex items-center gap-2 text-lg">
                      <BookCheck className="h-5 w-5" />
                      Checkout
                    </Link>
                    <Link href="/return" className="flex items-center gap-2 text-lg">
                      <BookX className="h-5 w-5" />
                      Return
                    </Link>
                  </>
                )}
                
                {isAuthenticated && user?.role === "LIBRARIAN" && (
                  <>
                    <Link href="/admin" className="flex items-center gap-2 text-lg">
                      <User className="h-5 w-5" />
                      Admin
                    </Link>
                    <Link href="/reports" className="flex items-center gap-2 text-lg">
                      <Book className="h-5 w-5" />
                      Reports
                    </Link>
                  </>
                )}
                
                {user?.role === "MEMBER" && (
                  <Link href="/membership/manage" className="flex items-center gap-2 text-lg">
                    <UserPlus className="h-5 w-5" />
                    Manage Membership
                  </Link>
                )}
                
                {isAuthenticated ? (
                  <Button variant="ghost" onClick={logout} className="justify-start px-2 cursor-pointer">
                    <LogOut className="mr-2 h-5 w-5" />
                    Log out
                  </Button>
                ) : (
                  <>
                    <Link href="/auth/login" className="flex items-center gap-2 text-lg">
                      <LogIn className="h-5 w-5" />
                      Login
                    </Link>
                    <Link href="/membership" className="flex items-center gap-2 text-lg">
                      <UserPlus className="h-5 w-5" />
                      Register
                    </Link>
                  </>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}