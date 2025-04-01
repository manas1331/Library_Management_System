"use client"

import { useState } from "react"
import { BookCopy, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

export function BookReturn() {
  const [bookBarcode, setBookBarcode] = useState("")
  const [bookDetails, setBookDetails] = useState<any>(null)
  const [fine, setFine] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleBookSearch = async () => {
    if (!bookBarcode) return

    setIsLoading(true)
    // In a real app, this would be an API call
    try {
      // Mock data for demo
      setTimeout(() => {
        const mockBook = {
          barcode: bookBarcode,
          title: "The Great Gatsby",
          author: "F. Scott Fitzgerald",
          status: "LOANED",
          borrower: {
            id: "M1001",
            name: "John Doe",
          },
          checkoutDate: "2023-05-01",
          dueDate: "2023-05-11",
        }

        setBookDetails(mockBook)

        // Calculate fine if overdue
        const dueDate = new Date(mockBook.dueDate)
        const today = new Date()
        const diffTime = today.getTime() - dueDate.getTime()
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

        if (diffDays > 0) {
          // $0.50 per day fine
          setFine(diffDays * 0.5)
        } else {
          setFine(0)
        }

        setIsLoading(false)
      }, 1000)
    } catch (error) {
      console.error("Error fetching book:", error)
      toast({
        title: "Error",
        description: "Failed to find book. Please try again.",
        variant: "destructive",
      })
      setIsLoading(false)
    }
  }

  const handleReturn = async () => {
    if (!bookDetails) return

    setIsLoading(true)
    // In a real app, this would be an API call
    try {
      // Mock return process
      setTimeout(() => {
        toast({
          title: "Success",
          description:
            fine && fine > 0
              ? `Book returned with a fine of $${fine.toFixed(2)}.`
              : "Book has been returned successfully.",
        })

        // Reset form
        setBookBarcode("")
        setBookDetails(null)
        setFine(null)
        setIsLoading(false)
      }, 1000)
    } catch (error) {
      console.error("Error returning book:", error)
      toast({
        title: "Error",
        description: "Failed to return book. Please try again.",
        variant: "destructive",
      })
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Book Return</CardTitle>
          <CardDescription>Scan book barcode to return a book</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="bookBarcode">Book Barcode</Label>
              <div className="flex space-x-2">
                <Input
                  id="bookBarcode"
                  placeholder="Scan or enter book barcode"
                  value={bookBarcode}
                  onChange={(e) => setBookBarcode(e.target.value)}
                />
                <Button onClick={handleBookSearch} disabled={!bookBarcode || isLoading}>
                  <BookCopy className="mr-2 h-4 w-4" />
                  Find
                </Button>
              </div>
            </div>

            {bookDetails && (
              <div className="bg-muted p-4 rounded-md">
                <h3 className="font-medium mb-2">Book Details</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <span className="text-muted-foreground">Title:</span>
                  <span>{bookDetails.title}</span>
                  <span className="text-muted-foreground">Author:</span>
                  <span>{bookDetails.author}</span>
                  <span className="text-muted-foreground">Barcode:</span>
                  <span>{bookDetails.barcode}</span>
                  <span className="text-muted-foreground">Status:</span>
                  <span>{bookDetails.status}</span>
                  <span className="text-muted-foreground">Borrower:</span>
                  <span>
                    {bookDetails.borrower.name} ({bookDetails.borrower.id})
                  </span>
                  <span className="text-muted-foreground">Checkout Date:</span>
                  <span>{new Date(bookDetails.checkoutDate).toLocaleDateString()}</span>
                  <span className="text-muted-foreground">Due Date:</span>
                  <span className="flex items-center">
                    {new Date(bookDetails.dueDate).toLocaleDateString()}
                    <Calendar className="ml-1 h-4 w-4" />
                  </span>
                </div>

                {fine !== null && fine > 0 && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700">
                    <p className="font-medium">Late Return Fine</p>
                    <p className="text-sm">This book is overdue. A fine of ${fine.toFixed(2)} will be charged.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button
            className="w-full"
            disabled={!bookDetails || isLoading || bookDetails?.status !== "LOANED"}
            onClick={handleReturn}
          >
            {isLoading ? "Processing..." : "Return Book"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

