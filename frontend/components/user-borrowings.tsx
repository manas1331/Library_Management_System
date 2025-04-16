"use client"

import { useEffect, useState } from "react"
import { Book, Calendar, Clock } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"

export function UserBorrowings() {
  const { user } = useAuth()
  const [borrowings, setBorrowings] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    if (user?.id) {
      fetchBorrowings()
    }
  }, [user])

  const fetchBorrowings = async () => {
    if (!user?.id) return
    
    setIsLoading(true)
    try {
      const response = await fetch(`http://localhost:8080/api/lendings/member/${user.id}`)
      
      if (!response.ok) {
        throw new Error("Failed to fetch borrowings")
      }
      
      const lendingsData = await response.json()
      
      // Filter only active borrowings (no return date)
      const activeBorrowings = lendingsData.filter((lending: any) => !lending.returnDate)
      
      // For each lending, fetch the book details
      const borrowingsWithDetails = await Promise.all(
        activeBorrowings.map(async (lending: any) => {
          try {
            const bookResponse = await fetch(`http://localhost:8080/api/books/barcode/${lending.bookItemBarcode}`)
            if (!bookResponse.ok) {
              throw new Error(`Failed to fetch book details for ${lending.bookItemBarcode}`)
            }
            
            const bookData = await bookResponse.json()
            
            return {
              lendingId: lending.id,
              bookItemBarcode: lending.bookItemBarcode,
              checkoutDate: lending.creationDate,
              dueDate: lending.dueDate,
              title: bookData.title,
              authors: bookData.authors.join(", "),
              isbn: bookData.isbn,
              isOverdue: new Date() > new Date(lending.dueDate)
            }
          } catch (error) {
            console.error(`Error fetching book details: ${error}`)
            return {
              lendingId: lending.id,
              bookItemBarcode: lending.bookItemBarcode,
              checkoutDate: lending.creationDate,
              dueDate: lending.dueDate,
              title: "Unknown Book",
              authors: "Unknown",
              isbn: "Unknown",
              isOverdue: new Date() > new Date(lending.dueDate)
            }
          }
        })
      )
      
      setBorrowings(borrowingsWithDetails)
    } catch (error) {
      console.error("Error fetching borrowings:", error)
      toast({
        title: "Error",
        description: "Failed to load your borrowings.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleReturnBook = (barcode: string) => {
    router.push(`/return?barcode=${barcode}`)
  }

  if (isLoading) {
    return <div className="text-center py-4">Loading your borrowings...</div>
  }

  if (borrowings.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Book className="h-12 w-12 mx-auto mb-4 opacity-30" />
        <p>You don't have any books checked out.</p>
        <p className="mt-2">
          <Button variant="outline" onClick={() => router.push('/books')}>
            Browse Books
          </Button>
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {borrowings.map((book) => (
        <Card key={book.bookItemBarcode} className={book.isOverdue ? "border-red-300" : ""}>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">{book.title}</CardTitle>
            <CardDescription>{book.authors}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div className="space-y-1 text-sm">
                <div className="flex items-center text-muted-foreground">
                  <Calendar className="mr-2 h-4 w-4" />
                  <span>Due: {new Date(book.dueDate).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center">
                  <Clock className="mr-2 h-4 w-4" />
                  <span>
                    {book.isOverdue ? (
                      <span className="text-red-600 font-medium">Overdue</span>
                    ) : (
                      <span className="text-green-600">On time</span>
                    )}
                  </span>
                </div>
              </div>
              <Button size="sm" onClick={() => handleReturnBook(book.bookItemBarcode)}>
                Return
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}