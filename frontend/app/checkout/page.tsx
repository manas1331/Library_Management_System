"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { BookCheckout } from "@/components/book-checkout"
import { Navbar } from "@/components/navbar"
import { useAuth } from "@/contexts/auth-context"

export default function CheckoutPage() {
  const { user, isAuthenticated, loading } = useAuth()
  const router = useRouter()
  
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/auth/login")
    }
  }, [isAuthenticated, loading, router])

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  if (!user || (user.role !== "LIBRARIAN" && user.role !== "MEMBER")) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 container mx-auto py-8 px-4 text-center">
          <h1 className="text-3xl font-bold mb-4">Access Denied</h1>
          <p>You need to be logged in as a member or librarian to access this page.</p>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold text-center mb-8">Book Checkout</h1>
        <BookCheckout />
      </main>
    </div>
  )
}