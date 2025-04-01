"use client"

import { useState } from "react"
import { BookCopy, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"

export function BookCheckout() {
  const [memberBarcode, setMemberBarcode] = useState("")
  const [bookBarcode, setBookBarcode] = useState("")
  const [memberDetails, setMemberDetails] = useState<any>(null)
  const [bookDetails, setBookDetails] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleMemberSearch = async () => {
    if (!memberBarcode) return

    setIsLoading(true)
    // In a real app, this would be an API call
    try {
      // Mock data for demo
      setMemberDetails({
        id: "M1001",
        name: "John Doe",
        email: "john.doe@example.com",
        booksCheckedOut: 2,
        status: "ACTIVE",
        memberSince: "2022-01-15",
      })
    } catch (error) {
      console.error("Error fetching member:", error)
      toast({
        title: "Error",
        description: "Failed to find member. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleBookSearch = async () => {
    if (!bookBarcode) return

    setIsLoading(true)
    // In a real app, this would be an API call
    try {
      // Mock data for demo
      setBookDetails({
        barcode: bookBarcode,
        title: "The Great Gatsby",
        author: "F. Scott Fitzgerald",
        status: "AVAILABLE",
        isbn: "978-0-7432-7356-5",
        dueDate: null,
      })
    } catch (error) {
      console.error("Error fetching book:", error)
      toast({
        title: "Error",
        description: "Failed to find book. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCheckout = async () => {
    if (!memberDetails || !bookDetails) return

    setIsLoading(true)
    // In a real app, this would be an API call
    try {
      // Mock checkout process
      setTimeout(() => {
        toast({
          title: "Success",
          description: "Book has been checked out successfully.",
        })

        // Reset form
        setMemberBarcode("")
        setBookBarcode("")
        setMemberDetails(null)
        setBookDetails(null)
        setIsLoading(false)
      }, 1000)
    } catch (error) {
      console.error("Error checking out book:", error)
      toast({
        title: "Error",
        description: "Failed to checkout book. Please try again.",
        variant: "destructive",
      })
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Book Checkout</CardTitle>
          <CardDescription>Scan member and book barcodes to checkout a book</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="memberBarcode">Member Barcode</Label>
              <div className="flex space-x-2">
                <Input
                  id="memberBarcode"
                  placeholder="Scan or enter member barcode"
                  value={memberBarcode}
                  onChange={(e) => setMemberBarcode(e.target.value)}
                />
                <Button onClick={handleMemberSearch} disabled={!memberBarcode || isLoading}>
                  <User className="mr-2 h-4 w-4" />
                  Find
                </Button>
              </div>
            </div>

            {memberDetails && (
              <div className="bg-muted p-4 rounded-md">
                <h3 className="font-medium mb-2">Member Details</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <span className="text-muted-foreground">Name:</span>
                  <span>{memberDetails.name}</span>
                  <span className="text-muted-foreground">ID:</span>
                  <span>{memberDetails.id}</span>
                  <span className="text-muted-foreground">Books Checked Out:</span>
                  <span>{memberDetails.booksCheckedOut}/5</span>
                  <span className="text-muted-foreground">Status:</span>
                  <span className={memberDetails.status === "ACTIVE" ? "text-green-600" : "text-red-600"}>
                    {memberDetails.status}
                  </span>
                </div>
              </div>
            )}
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="bookBarcode">Book Barcode</Label>
              <div className="flex space-x-2">
                <Input
                  id="bookBarcode"
                  placeholder="Scan or enter book barcode"
                  value={bookBarcode}
                  onChange={(e) => setBookBarcode(e.target.value)}
                  disabled={!memberDetails}
                />
                <Button onClick={handleBookSearch} disabled={!bookBarcode || !memberDetails || isLoading}>
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
                  <span className={bookDetails.status === "AVAILABLE" ? "text-green-600" : "text-red-600"}>
                    {bookDetails.status}
                  </span>
                </div>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button
            className="w-full"
            disabled={
              !memberDetails ||
              !bookDetails ||
              isLoading ||
              bookDetails?.status !== "AVAILABLE" ||
              memberDetails?.booksCheckedOut >= 5
            }
            onClick={handleCheckout}
          >
            {isLoading ? "Processing..." : "Checkout Book"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

