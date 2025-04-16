"use client"

import { useEffect, useState } from "react"
import { Book, Calendar } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"

export function UserBorrowingHistory() {
  const { user } = useAuth()
  const [borrowings, setBorrowings] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (user?.id) {
      fetchBorrowingHistory()
    }
  }, [user])

  const fetchBorrowingHistory = async () => {
    if (!user?.id) return
    
    setIsLoading(true)
    try {
      // Fetch all lendings for this member (both active and returned)
      const response = await fetch(`http://localhost:8080/api/lendings/member/${user.id}`)
      
      if (!response.ok) {
        throw new Error("Failed to fetch borrowing history")
      }
      
      const lendingsData = await response.json()
      
      // For each lending, fetch the book details
      const borrowingsWithDetails = await Promise.all(
        lendingsData.map(async (lending: any) => {
          try {
            const bookResponse = await fetch(`http://localhost:8080/api/books/barcode/${lending.bookItemBarcode}`)
            if (!bookResponse.ok) {
              throw new Error(`Failed to fetch book details for ${lending.bookItemBarcode}`)
            }
            
            const bookData = await bookResponse.json()
            const bookItem = bookData.bookItems.find((item: any) => item.barcode === lending.bookItemBarcode)
            
            return {
              lendingId: lending.id,
              bookItemBarcode: lending.bookItemBarcode,
              checkoutDate: lending.creationDate,
              dueDate: lending.dueDate,
              returnDate: lending.returnDate,
              title: bookData.title,
              authors: bookData.authors.join(", "),
              isbn: bookData.isbn,
              status: lending.returnDate ? "RETURNED" : bookItem?.status || "UNKNOWN",
              isOverdue: !lending.returnDate && new Date() > new Date(lending.dueDate)
            }
          } catch (error) {
            console.error(`Error fetching book details: ${error}`)
            return {
              lendingId: lending.id,
              bookItemBarcode: lending.bookItemBarcode,
              checkoutDate: lending.creationDate,
              dueDate: lending.dueDate,
              returnDate: lending.returnDate,
              title: "Unknown Book",
              authors: "Unknown",
              isbn: "Unknown",
              status: lending.returnDate ? "RETURNED" : "UNKNOWN",
              isOverdue: !lending.returnDate && new Date() > new Date(lending.dueDate)
            }
          }
        })
      )
      
      // Sort by checkout date, most recent first
      borrowingsWithDetails.sort((a, b) => 
        new Date(b.checkoutDate).getTime() - new Date(a.checkoutDate).getTime()
      )
      
      setBorrowings(borrowingsWithDetails)
    } catch (error) {
      console.error("Error fetching borrowing history:", error)
      toast({
        title: "Error",
        description: "Failed to load your borrowing history.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return <div className="text-center py-4">Loading your borrowing history...</div>
  }

  if (borrowings.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Calendar className="h-12 w-12 mx-auto mb-4 opacity-30" />
        <p>You don't have any borrowing history yet.</p>
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Title</TableHead>
          <TableHead>Author(s)</TableHead>
          <TableHead>Borrowed Date</TableHead>
          <TableHead>Due Date</TableHead>
          <TableHead>Returned Date</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {borrowings.map((book) => (
          <TableRow key={book.lendingId}>
            <TableCell className="font-medium">{book.title}</TableCell>
            <TableCell>{book.authors}</TableCell>
            <TableCell>{new Date(book.checkoutDate).toLocaleDateString()}</TableCell>
            <TableCell>{new Date(book.dueDate).toLocaleDateString()}</TableCell>
            <TableCell>
              {book.returnDate ? new Date(book.returnDate).toLocaleDateString() : "Not returned"}
            </TableCell>
            <TableCell>
              <Badge 
                variant={
                  book.status === "RETURNED" ? "outline" : 
                  book.isOverdue ? "destructive" : "secondary"
                }
              >
                {book.status}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}