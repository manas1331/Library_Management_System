"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Download, Loader2, RefreshCw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function OverdueReport() {
  const [overdueBooks, setOverdueBooks] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  
  // Statistics
  const [stats, setStats] = useState({
    totalOverdue: 0,
    averageDaysOverdue: 0,
    potentialFines: 0
  })
  
  useEffect(() => {
    fetchOverdueData()
  }, [])
  
  const fetchOverdueData = async () => {
    setLoading(true)
    try {
      // Get all active lendings
      const response = await fetch("http://localhost:8080/api/lendings")
      
      if (!response.ok) {
        throw new Error("Failed to fetch lending data")
      }
      
      const data = await response.json()
      
      // Filter for overdue books (due date is in the past and not returned)
      const now = new Date()
      const overdue = data.filter((lending: any) => {
        const dueDate = new Date(lending.dueDate)
        return !lending.returnDate && dueDate < now
      })
      
      // Calculate days overdue for each book
      const overdueWithDays = await Promise.all(overdue.map(async (lending: any) => {
        const dueDate = new Date(lending.dueDate)
        const daysOverdue = Math.ceil((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24))
        const potentialFine = daysOverdue * 0.5 // $0.50 per day
        
        // Try to get book and member details
        let bookDetails: any = {}
        let memberDetails: any = {}
        
        try {
          const bookResponse = await fetch(`http://localhost:8080/api/books/barcode/${lending.bookItemBarcode}`)
          if (bookResponse.ok) {
            const bookData = await bookResponse.json()
            bookDetails = {
              title: bookData.title,
              authors: bookData.authors.join(", ")
            }
          }
        } catch (error) {
          console.error("Error fetching book details:", error)
        }
        
        try {
          const memberResponse = await fetch(`http://localhost:8080/api/members/${lending.memberId}`)
          if (memberResponse.ok) {
            const memberData = await memberResponse.json()
            memberDetails = {
              name: memberData.name || (memberData.person ? memberData.person.name : "Unknown"),
              email: memberData.email || (memberData.person ? memberData.person.email : "Unknown")
            }
          }
        } catch (error) {
          console.error("Error fetching member details:", error)
        }
        
        return {
          ...lending,
          daysOverdue,
          potentialFine,
          bookTitle: bookDetails.title || "Unknown",
          bookAuthors: bookDetails.authors || "Unknown",
          memberName: memberDetails.name || "Unknown",
          memberEmail: memberDetails.email || "Unknown"
        }
      }))
      
      setOverdueBooks(overdueWithDays)
      
      // Calculate statistics
      const totalOverdue = overdueWithDays.length
      let totalDaysOverdue = 0
      let totalPotentialFines = 0
      
      overdueWithDays.forEach(book => {
        totalDaysOverdue += book.daysOverdue
        totalPotentialFines += book.potentialFine
      })
      
      const averageDaysOverdue = totalOverdue > 0 ? Math.round(totalDaysOverdue / totalOverdue) : 0
      
      setStats({
        totalOverdue,
        averageDaysOverdue,
        potentialFines: totalPotentialFines
      })
    } catch (error) {
      console.error("Error fetching overdue data:", error)
      toast({
        title: "Error",
        description: "Failed to load overdue report data.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }
  
  const handleExportCSV = () => {
    // Generate CSV content
    const headers = ["Book Title", "Barcode", "Member", "Member ID", "Due Date", "Days Overdue", "Potential Fine"]
    const rows = overdueBooks.map(book => [
      book.bookTitle,
      book.bookItemBarcode,
      book.memberName,
      book.memberId,
      new Date(book.dueDate).toLocaleDateString(),
      book.daysOverdue,
      `$${book.potentialFine.toFixed(2)}`
    ])
    
    // Combine headers and rows
    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n")
    
    // Create a Blob and download link
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `overdue_report_${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Overdue Books</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOverdue}</div>
            <p className="text-xs text-muted-foreground">Books past due date</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg. Days Overdue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageDaysOverdue} days</div>
            <p className="text-xs text-muted-foreground">Past due date</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Potential Fines</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.potentialFines.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Uncollected fees ($0.50/day)</p>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Overdue Books Report</CardTitle>
            <CardDescription>Books that are past their due date</CardDescription>
          </div>
          
          <div className="flex space-x-2">
            <Button variant="outline" onClick={fetchOverdueData} disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
              Refresh
            </Button>
            <Button variant="outline" onClick={handleExportCSV} disabled={loading || overdueBooks.length === 0}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-10">
              <Loader2 className="h-8 w-8 animate-spin mx-auto" />
              <p className="mt-2 text-muted-foreground">Loading overdue data...</p>
            </div>
          ) : overdueBooks.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-muted-foreground">No overdue books at this time.</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Book Title</TableHead>
                    <TableHead>Barcode</TableHead>
                    <TableHead>Member</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Days Overdue</TableHead>
                    <TableHead>Potential Fine</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {overdueBooks.map((book) => (
                    <TableRow key={book.id}>
                      <TableCell className="font-medium">{book.bookTitle}</TableCell>
                      <TableCell>{book.bookItemBarcode}</TableCell>
                      <TableCell>{book.memberName}</TableCell>
                      <TableCell>{new Date(book.dueDate).toLocaleDateString()}</TableCell>
                      <TableCell className="text-red-600 font-medium">{book.daysOverdue} days</TableCell>
                      <TableCell>${book.potentialFine.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}