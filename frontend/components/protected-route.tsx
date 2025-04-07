"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"

export function ProtectedRoute({ 
  children,
  requireAuth = true,
  allowedRoles = undefined
}: { 
  children: React.ReactNode
  requireAuth?: boolean
  allowedRoles?: string[]
}) {
  const { user, loading, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (loading) return

    // If authentication is required but user is not authenticated
    if (requireAuth && !isAuthenticated) {
      router.push("/auth/login")
      return
    }

    // If user is authenticated but this route is for non-authenticated users only (like login page)
    if (!requireAuth && isAuthenticated) {
      router.push("/")
      return
    }

    // If specific roles are required, check if user has the required role
    if (requireAuth && isAuthenticated && allowedRoles && user) {
      const hasAllowedRole = allowedRoles.includes(user.role)
      if (!hasAllowedRole) {
        router.push("/")
      }
    }
  }, [requireAuth, isAuthenticated, loading, router, allowedRoles, user])

  // Show loading or nothing while checking authentication
  if (loading || (requireAuth && !isAuthenticated) || (!requireAuth && isAuthenticated)) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return <>{children}</>
}