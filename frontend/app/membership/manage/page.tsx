"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { MembershipManagement } from "@/components/membership-management"
import { Navbar } from "@/components/navbar"
import { useAuth } from "@/contexts/auth-context"

export default function ManageMembershipPage() {
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

  if (!user || user.role !== "MEMBER") {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 container mx-auto py-8 px-4 text-center">
          <h1 className="text-3xl font-bold mb-4">Access Denied</h1>
          <p>You need to be logged in as a member to access this page.</p>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold text-center mb-8">Manage Your Membership</h1>
        <MembershipManagement />
      </main>
    </div>
  )
}