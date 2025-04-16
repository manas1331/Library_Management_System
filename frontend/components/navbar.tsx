"use client"

import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { BookOpen, LogOut, Menu, User, LogIn, UserPlus, Book, BookCheck, BookX, BarChart, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
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
  const { theme, setTheme } = useTheme()
  
  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  return (
    <header className="bg-background border-b sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center">
          <Link href="/" className="flex items-center space-x-2">
            <BookOpen className="h-6 w-6" />
            <span className="font-bold text-xl">Library System</span>
          </Link>
        </div>
        
        <div className="hidden md:flex space-x-6">
          <Link href="/" className="text-foreground hover:text-foreground/80">
            Home
          </Link>
          <Link href="/books" className="text-foreground hover:text-foreground/80">
            Books
          </Link>
          
          {isAuthenticated && (user?.role === "LIBRARIAN" || user?.role === "MEMBER") && (
            <>
              <Link href="/checkout" className="text-foreground hover:text-foreground/80">
                Checkout
              </Link>
              <Link href="/return" className="text-foreground hover:text-foreground/80">
                Return
              </Link>
            </>
          )}
          
          {isAuthenticated && user?.role === "LIBRARIAN" && (
            <>
              <Link href="/reports" className="text-foreground hover:text-foreground/80">
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
                <DropdownMenuLabel className="text-xs text-muted-foreground">{user?.email}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                
                <DropdownMenuItem asChild className="cursor-pointer">
                  <Link href="/profile">My Profile</Link>
                </DropdownMenuItem>

                {user?.role === "MEMBER" && (
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link href="/membership/manage">Manage Membership</Link>
                  </DropdownMenuItem>
                )}
                
                <DropdownMenuItem onClick={toggleTheme} className="justify-between px-2 cursor-pointer">
                  <span className="flex items-center">
                    {theme === 'dark' ? <Sun className="mr-2 h-4 w-4" /> : <Moon className="mr-2 h-4 w-4" />}
                    <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
                  </span>
                </DropdownMenuItem>
                
                <DropdownMenuItem onClick={logout} className="justify-start px-2 cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center space-x-2">
              <Button variant="ghost" onClick={toggleTheme} size="icon" className="mr-2">
                {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                <span className="sr-only">Toggle theme</span>
              </Button>
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
        </div>
      </div>
    </header>
  )
}