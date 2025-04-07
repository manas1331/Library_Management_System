"use client"

import { createContext, useCallback, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"

type User = {
  id: string
  name: string
  email: string
  role: "MEMBER" | "LIBRARIAN"
}

type AuthContextType = {
  user: User | null
  loading: boolean
  login: (user: User) => Promise<void>
  logout: () => Promise<void>
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Load user from local storage on initial load
  useEffect(() => {
    const storedUser = localStorage.getItem("lms_user")
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (error) {
        console.error("Failed to parse stored user:", error)
        localStorage.removeItem("lms_user")
      }
    }
    setLoading(false)
  }, [])

  const login = useCallback(async (userData: User) => {
    setUser(userData)
    localStorage.setItem("lms_user", JSON.stringify(userData))
  }, [])

  const logout = useCallback(async () => {
    setUser(null)
    localStorage.removeItem("lms_user")
    router.push("/auth/login")
  }, [router])

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}