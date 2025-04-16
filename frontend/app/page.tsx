"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { BookCatalog } from "@/components/book-catalog"
import { BookCheckout } from "@/components/book-checkout"
import { BookReturn } from "@/components/book-return"
import { MemberManagement } from "@/components/member-management"
import { Navbar } from "@/components/navbar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/hooks/use-auth"
import { Loader2 } from "lucide-react"
import { UserBorrowings } from "@/components/user-borrowings"
import { UserBorrowingHistory } from "@/components/user-borrowing-history"

export default function Home() {
  const [activeTab, setActiveTab] = useState("catalog")
  const { user, isAuthenticated, loading } = useAuth()
  const router = useRouter()
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/auth/login")
    }
  }, [loading, isAuthenticated, router])
  
  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
          <p className="mt-4 text-lg text-foreground/70">Loading...</p>
        </div>
      </div>
    )
  }
  
  // If not authenticated, don't render anything (redirect will handle it)
  if (!isAuthenticated) {
    return null
  }
  
  const isLibrarian = user?.role === "LIBRARIAN"

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold text-center mb-8">
          {isLibrarian ? "Library Management System" : "Library Portal"}
        </h1>
        
        {isLibrarian ? (
          // Librarian view with all tabs
          <Tabs defaultValue="catalog" className="w-full" onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-1">
              <TabsTrigger value="catalog">Book Catalog</TabsTrigger>
              {/* <TabsTrigger value="checkout">Checkout</TabsTrigger>
              <TabsTrigger value="return">Return</TabsTrigger> */}
              {/* <TabsTrigger value="members">Members</TabsTrigger> */}
            </TabsList>

            <TabsContent value="catalog" className="mt-6">
              <BookCatalog />
            </TabsContent>

            {/* <TabsContent value="checkout" className="mt-6">
              <BookCheckout />
            </TabsContent>

            <TabsContent value="return" className="mt-6">
              <BookReturn />
            </TabsContent> */}

            <TabsContent value="members" className="mt-6">
              <MemberManagement />
            </TabsContent>
          </Tabs>
        ) : (
          // Member view with limited tabs
          <Tabs defaultValue="catalog" className="w-full" onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="catalog">Book Catalog</TabsTrigger>
              <TabsTrigger value="myborrowing">My Borrowings</TabsTrigger>
            </TabsList>

            <TabsContent value="catalog" className="mt-6">
              <BookCatalog />
            </TabsContent>

            <TabsContent value="myborrowing" className="mt-6">
              {user && user.role === "MEMBER" && (
                <Tabs defaultValue="borrowing" className="mt-6">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="borrowing">My Borrowings</TabsTrigger>
                    <TabsTrigger value="history">Borrowing History</TabsTrigger>
                    <TabsTrigger value="reservation">Reservation History</TabsTrigger>
                  </TabsList>
                  <TabsContent value="borrowing" className="mt-4">
                    <UserBorrowings />
                  </TabsContent>
                  <TabsContent value="history" className="mt-4">
                    <UserBorrowingHistory />
                  </TabsContent>
                  <TabsContent value="reservation" className="mt-4">
                    Hello world
                  </TabsContent>
                </Tabs>
              )}
            </TabsContent>
          </Tabs>
        )}
        
        {/* Welcome message */}
        {user && (
          <div className="mt-8 text-center text-sm text-muted-foreground">
            Welcome, {user.name}! You are logged in as a {user.role === "LIBRARIAN" ? "Librarian" : "Member"}.
          </div>
        )}
      </div>
    </main>
  )
}