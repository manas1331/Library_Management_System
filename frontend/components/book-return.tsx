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
  const [lendingDetails, setLendingDetails] = useState<any>(null)
  const [fine, setFine] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleBookSearch = async () => {
    if (!bookBarcode) return

    setIsLoading(true)
    try {
      // First, get the lending details by barcode
      const lendingResponse = await fetch(`http://localhost:8080/api/lendings/barcode/${bookBarcode}`)
      
      if (!lendingResponse.ok) {
        throw new Error("No active lending found for this book")
      }
      
      const lendingData = await lendingResponse.json()
      setLendingDetails(lendingData)
      
      // Then get the book details
      const bookResponse = await fetch(`http://localhost:8080/api/books/barcode/${bookBarcode}`)
      
      if (!bookResponse.ok) {
        throw new Error("Book not found")
      }
      
      const bookData = await bookResponse.json()
      
      // Find the specific book item
      const bookItem = bookData.bookItems.find((item: any) => item.barcode === bookBarcode)
      
      if (!bookItem) {
        throw new Error("Book item not found")
      }
      
      // Fetch member details
      const memberResponse = await fetch(`http://localhost:8080/api/members/${lendingData.memberId}`)
      const memberData = await memberResponse.json()
      
      setBookDetails({
        barcode: bookItem.barcode,
        title: bookData.title,
        author: bookData.authors.join(", "),
        status: bookItem.status,
        borrower: {
          id: memberData.id,
          name: memberData.person ? memberData.person.name : (memberData.name || 'Unknown'),
        },
        checkoutDate: lendingData.creationDate,
        dueDate: lendingData.dueDate,
      })

      // Calculate fine if overdue
      const dueDate = new Date(lendingData.dueDate)
      const today = new Date()
      if (today > dueDate) {
        const diffTime = today.getTime() - dueDate.getTime()
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        setFine(diffDays * 0.5) // $0.50 per day fine
      } else {
        setFine(0)
      }
    } catch (error) {
      console.error("Error fetching book:", error)
      toast({
        title: "Error",
        description: "Failed to find book or active lending. Please try again.",
        variant: "destructive",
      })
      setBookDetails(null)
      setLendingDetails(null)
      setFine(null)
    } finally {
      setIsLoading(false)
    }
  }

  const handleReturn = async () => {
    if (!bookDetails || !lendingDetails) return

    setIsLoading(true)
    let returnSuccessful = false;
    
    try {
      // Log the request for debugging
      console.log("Returning book with barcode:", bookBarcode);
      
      const response = await fetch("http://localhost:8080/api/lendings/return", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          bookItemBarcode: bookBarcode
        })
      });
      
      // Log the response status
      console.log("Return book response status:", response.status);
      
      // We'll consider 200-299 range as success
      if (response.ok) {
        returnSuccessful = true;
      } 
      // For certain error codes, we might still treat it as success
      else if (response.status === 409) {
        // 409 Conflict might mean the book was already returned
        console.log("Book might have already been returned");
        returnSuccessful = true;
      }
      else {
        // Get error details from response if possible
        let errorMessage = "Failed to return book";
        try {
          const errorData = await response.json();
          console.log("Error data:", errorData);
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          // If response isn't JSON, use status text
          errorMessage = `${errorMessage}: ${response.statusText}`;
        }
        
        // Even though we have an error, let's verify if the book status changed
        try {
          const verifyResponse = await fetch(`http://localhost:8080/api/books/barcode/${bookBarcode}`);
          if (verifyResponse.ok) {
            const bookData = await verifyResponse.json();
            const bookItem = bookData.bookItems.find((item: any) => item.barcode === bookBarcode);
            if (bookItem && bookItem.status === "AVAILABLE") {
              console.log("Book appears to be returned despite error response");
              returnSuccessful = true;
            }
          }
        } catch (verifyError) {
          console.error("Error verifying book status:", verifyError);
        }
        
        if (!returnSuccessful) {
          throw new Error(errorMessage);
        }
      }
      
      // Proceed with recording fine if applicable
      if (returnSuccessful && fine && fine > 0) {
        console.log("Recording fine:", fine);
        
        try {
          const fineResponse = await fetch("http://localhost:8080/api/fines", {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              bookItemBarcode: bookBarcode,
              memberId: lendingDetails.memberId,
              amount: fine,
              reason: "Overdue book",
              paid: false
            })
          });
          
          if (!fineResponse.ok) {
            console.error("Failed to record fine, status:", fineResponse.status);
            // Continue despite fine recording failure
          }
        } catch (fineError) {
          console.error("Error recording fine:", fineError);
          // Continue despite fine recording failure
        }
      }
      
      // If we got here, either the return was successful or we verified the book is actually returned
      toast({
        title: "Success",
        description:
          fine && fine > 0
            ? `Book returned with a fine of $${fine.toFixed(2)}.`
            : "Book has been returned successfully.",
      });

      // Reset form
      setBookBarcode("");
      setBookDetails(null);
      setLendingDetails(null);
      setFine(null);
    } catch (error) {
      console.error("Error returning book:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to return book. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
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
                    <p className="text-sm">
                      This book is overdue. A fine of ${fine.toFixed(2)} will be charged.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button
            className="w-full"
            disabled={!bookDetails || isLoading}
            onClick={handleReturn}
          >
            {isLoading ? "Processing..." : "Return Book"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}