"use client"

import { useState } from "react"
import { BookCopy, Calendar, AlertCircle, DollarSign } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Switch } from "@/components/ui/switch"

export function BookReturn() {
  const [bookBarcode, setBookBarcode] = useState("")
  const [bookDetails, setBookDetails] = useState<any>(null)
  const [lendingDetails, setLendingDetails] = useState<any>(null)
  const [fine, setFine] = useState<{amount: number, id: string} | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isPaying, setIsPaying] = useState(false)
  const [returnSuccess, setReturnSuccess] = useState(false)
  const [testMode, setTestMode] = useState(true)
  const { toast } = useToast()

  const getCurrentDate = () => {
    if (testMode) {
      return new Date("2025-05-01T00:00:00");
    }
    return new Date();
  }

  const handleBookSearch = async () => {
    if (!bookBarcode) return

    setIsLoading(true)
    setReturnSuccess(false)
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
          name: memberData.name || 'Unknown',
        },
        checkoutDate: lendingData.creationDate,
        dueDate: lendingData.dueDate,
      })

      // Calculate fine if overdue
      const dueDate = new Date(lendingData.dueDate)
      const today = getCurrentDate()
      if (today > dueDate) {
        const diffTime = today.getTime() - dueDate.getTime()
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        // Now the fine is $1.00 per day
        setFine({
          amount: diffDays * 1.0,
          id: "" // Will be set after return if a fine is created
        })
      } else {
        setFine(null)
      }
    } catch (error) {
      console.error("Error fetching book:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to find book or active lending. Please try again.",
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
    try {
      // Log the request for debugging
      console.log("Returning book with barcode:", bookBarcode);

      let response;
      
      if (testMode) {
        // Use the test endpoint with a simulated date
        const testDate = getCurrentDate();
        const dateString = testDate.toISOString().split('T')[0]; // Format as YYYY-MM-DD
        
        response = await fetch("http://localhost:8080/api/lendings/test/return", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            bookItemBarcode: bookBarcode,
            referenceDate: dateString
          })
        });
      } else {
        // Use the normal return endpoint
        response = await fetch("http://localhost:8080/api/lendings/return", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            bookItemBarcode: bookBarcode
          })
        });
      }
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to return book: ${errorText}`);
      }
      
      const responseData = await response.json();
      console.log("Return response:", responseData);
      
      // Check if a fine was created
      if (responseData.fine) {
        setFine({
          amount: responseData.fineAmount,
          id: responseData.fine.id
        });
        
        toast({
          title: "Book Returned",
          description: `Book returned with a fine of $${responseData.fineAmount.toFixed(2)} for ${responseData.daysOverdue || 'late'} day(s) late.`,
        });
      } else {
        setFine(null);
        
        toast({
          title: "Success",
          description: "Book has been returned successfully.",
        });
        
        // Reset form if no fine
        setBookBarcode("");
        setBookDetails(null);
        setLendingDetails(null);
      }
      
      setReturnSuccess(true);
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

  const handlePayFine = async () => {
    if (!fine || !bookBarcode) return;
    
    setIsPaying(true);
    try {
      const response = await fetch(`http://localhost:8080/api/fines/book/${bookBarcode}/pay`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        }
      });
      
      if (!response.ok) {
        throw new Error("Failed to process payment");
      }
      
      toast({
        title: "Payment Successful",
        description: `Fine of $${fine.amount.toFixed(2)} has been paid successfully.`,
      });
      
      // Reset the form
      setBookBarcode("");
      setBookDetails(null);
      setLendingDetails(null);
      setFine(null);
      setReturnSuccess(false);
    } catch (error) {
      console.error("Error paying fine:", error);
      toast({
        title: "Payment Failed",
        description: error instanceof Error ? error.message : "Failed to process fine payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsPaying(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Switch 
            id="test-mode" 
            checked={testMode} 
            onCheckedChange={setTestMode} 
          />
          <Label htmlFor="test-mode">Test Mode</Label>
        </div>
        {testMode && (
          <div className="text-sm text-muted-foreground">
            Using simulated date: {getCurrentDate().toLocaleDateString()}
          </div>
        )}
      </div>
      
      {testMode && (
        <Alert className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Test Mode Active</AlertTitle>
          <AlertDescription>
            System is using a simulated date: {getCurrentDate().toLocaleDateString()} for testing fine calculation.
          </AlertDescription>
        </Alert>
      )}
      <Card>
        <CardHeader>
          <CardTitle>Return a Book</CardTitle>
          <CardDescription>Enter the barcode of the book being returned</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6">
            <div className="grid gap-2">
              <Label htmlFor="barcode">Book Barcode</Label>
              <div className="flex gap-2">
                <Input
                  id="barcode"
                  placeholder="Enter the book barcode..."
                  value={bookBarcode}
                  onChange={(e) => setBookBarcode(e.target.value)}
                  disabled={isLoading || returnSuccess}
                />
                <Button onClick={handleBookSearch} disabled={!bookBarcode || isLoading || returnSuccess}>
                  {isLoading ? "Searching..." : "Search"}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {bookDetails && (
        <Card>
          <CardHeader>
            <CardTitle>Book Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-1">
                <div className="flex flex-col">
                  <span className="text-sm font-medium">Title</span>
                  <span>{bookDetails.title}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">Author</span>
                  <span>{bookDetails.author}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-1">
                <div className="flex flex-col">
                  <span className="text-sm font-medium">Barcode</span>
                  <span>{bookDetails.barcode}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">Status</span>
                  <span>{bookDetails.status}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-1">
                <div className="flex flex-col">
                  <span className="text-sm font-medium">Borrowed By</span>
                  <span>{bookDetails.borrower.name}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">Checkout Date</span>
                  <span>{new Date(bookDetails.checkoutDate).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium">Due Date</span>
                <span>{new Date(bookDetails.dueDate).toLocaleDateString()}</span>
              </div>
              
              {fine && fine.amount > 0 && !returnSuccess && (
                <Alert variant="warning">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Late Return</AlertTitle>
                  <AlertDescription>
                    This book is overdue and will incur a fine of ${fine.amount.toFixed(2)}.
                  </AlertDescription>
                </Alert>
              )}
              
              {fine && fine.amount > 0 && returnSuccess && (
                <Alert variant="destructive">
                  <DollarSign className="h-4 w-4" />
                  <AlertTitle>Fine Due</AlertTitle>
                  <AlertDescription>
                    A fine of ${fine.amount.toFixed(2)} has been applied for late return.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            {!returnSuccess ? (
              <Button onClick={handleReturn} disabled={isLoading || !bookDetails}>
                {isLoading ? "Processing..." : "Return Book"}
              </Button>
            ) : fine && fine.amount > 0 ? (
              <Button 
                onClick={handlePayFine} 
                disabled={isPaying}
                variant="destructive"
              >
                {isPaying ? "Processing Payment..." : `Pay Fine ($${fine.amount.toFixed(2)})`}
              </Button>
            ) : (
              <Button onClick={() => {
                setBookBarcode("");
                setBookDetails(null);
                setLendingDetails(null);
                setReturnSuccess(false);
              }}>
                Return Another Book
              </Button>
            )}
          </CardFooter>
        </Card>
      )}
    </div>
  )
}