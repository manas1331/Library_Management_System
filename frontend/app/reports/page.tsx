"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/contexts/auth-context"
import { Loader2 } from "lucide-react"
import { BookLendingReport } from "@/components/reports/book-lending-report"
import { MemberReport } from "@/components/reports/member-report"
import { FineReport } from "@/components/reports/fine-report"
import { OverdueReport } from "@/components/reports/overdue-report"

export default function ReportsPage() {
  const { user, isAuthenticated, loading } = useAuth()
  const router = useRouter()
  
  // Redirect if not authenticated or not an admin
  useEffect(() => {
    if (!loading && (!isAuthenticated || user?.role !== "LIBRARIAN")) {
      router.push("/")
    }
  }, [loading, isAuthenticated, user, router])
  
  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
          <p className="mt-4 text-lg text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }
  
  // If not authenticated or not an admin, don't render anything
  if (!isAuthenticated || user?.role !== "LIBRARIAN") {
    return null
  }
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1 container mx-auto py-8 px-4">
        <div className="flex flex-col items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-center">Library Management Reports</h1>
          <p className="text-muted-foreground mt-2">Access and export detailed reports about library operations</p>
        </div>
        
        <Tabs defaultValue="lending" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="lending">Book Lending</TabsTrigger>
            <TabsTrigger value="members">Member Activity</TabsTrigger>
            <TabsTrigger value="fines">Fines & Revenue</TabsTrigger>
            <TabsTrigger value="overdue">Overdue Books</TabsTrigger>
          </TabsList>
          
          <TabsContent value="lending" className="mt-6">
            <BookLendingReport />
          </TabsContent>
          
          <TabsContent value="members" className="mt-6">
            <MemberReport />
          </TabsContent>
          
          <TabsContent value="fines" className="mt-6">
            <FineReport />
          </TabsContent>
          
          <TabsContent value="overdue" className="mt-6">
            <OverdueReport />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}