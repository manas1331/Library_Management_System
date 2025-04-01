"use client"

import { useState } from "react"
import { BookCatalog } from "@/components/book-catalog"
import { BookCheckout } from "@/components/book-checkout"
import { BookReturn } from "@/components/book-return"
import { MemberManagement } from "@/components/member-management"
import { Navbar } from "@/components/navbar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function Home() {
  const [activeTab, setActiveTab] = useState("catalog")

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold text-center mb-8">Library Management System</h1>

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
      </div>
    </main>
  )
}

