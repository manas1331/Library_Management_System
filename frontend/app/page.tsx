// "use client"

// import { useState } from "react"
// import { BookCatalog } from "@/components/book-catalog"
// import { BookCheckout } from "@/components/book-checkout"
// import { BookReturn } from "@/components/book-return"
// import { MemberManagement } from "@/components/member-management"
// import { Navbar } from "@/components/navbar"
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// export default function Home() {
//   const [activeTab, setActiveTab] = useState("catalog")

//   return (
//     <main className="min-h-screen bg-gray-50">
//       <Navbar />
//       <div className="container mx-auto py-8 px-4">
//         <h1 className="text-3xl font-bold text-center mb-8">Library Management System</h1>

//         <Tabs defaultValue="catalog" className="w-full" onValueChange={setActiveTab}>
//           <TabsList className="grid w-full grid-cols-4">
//             <TabsTrigger value="catalog">Book Catalog</TabsTrigger>
//             <TabsTrigger value="checkout">Checkout</TabsTrigger>
//             <TabsTrigger value="return">Return</TabsTrigger>
//             <TabsTrigger value="members">Members</TabsTrigger>
//           </TabsList>

//           <TabsContent value="catalog" className="mt-6">
//             <BookCatalog />
//           </TabsContent>

//           <TabsContent value="checkout" className="mt-6">
//             <BookCheckout />
//           </TabsContent>

//           <TabsContent value="return" className="mt-6">
//             <BookReturn />
//           </TabsContent>

//           <TabsContent value="members" className="mt-6">
//             <MemberManagement />
//           </TabsContent>
//         </Tabs>
//       </div>
//     </main>
//   )
// }

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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
          <p className="mt-4 text-lg text-gray-600">Loading...</p>
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
    <main className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold text-center mb-8">
          {isLibrarian ? "Library Management System" : "Library Portal"}
        </h1>
        
        {isLibrarian ? (
          // Librarian view with all tabs
          <Tabs defaultValue="catalog" className="w-full" onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="catalog">Book Catalog</TabsTrigger>
              <TabsTrigger value="checkout">Checkout</TabsTrigger>
              <TabsTrigger value="return">Return</TabsTrigger>
              <TabsTrigger value="members">Members</TabsTrigger>
            </TabsList>

            <TabsContent value="catalog" className="mt-6">
              <BookCatalog />
            </TabsContent>

            <TabsContent value="checkout" className="mt-6">
              <BookCheckout />
            </TabsContent>

            <TabsContent value="return" className="mt-6">
              <BookReturn />
            </TabsContent>

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
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-2xl font-semibold mb-6">My Borrowed Books</h2>
                {/* Member-specific borrowing view - you may need to create a component for this */}
                <p className="text-muted-foreground text-center py-10">
                  Your borrowed books will appear here. Visit your profile to see more details.
                </p>
              </div>
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