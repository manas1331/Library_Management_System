"use client"

import { useState } from "react"
import { BookCopy, User, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"

export function BookReservation() {
  const [memberId, setMemberId] = useState("")
  const [bookBarcode, setBookBarcode] = useState("")
  const [memberDetails, setMemberDetails] = useState<any>(null)
  const [bookDetails, setBookDetails] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const { user } = useAuth()
  const router = useRouter()

  const handleMemberSearch = async () => {
    if (!memberId) return

    setIsLoading(true)
    try {
      // Call the API to get member details
      const response = await fetch(`http://localhost:8080/api/members/${memberId}`)
      
      if (!response.ok) {
        throw new Error("Member not found")
      }
      
      const data = await response.json()
      setMemberDetails({
        id: data.id,
        name: data.name || (data.person ? data.person.name : 'Unknown'),
        email: data.email || (data.person ? data.person.email : 'Unknown'),
        booksCheckedOut: data.totalBooksCheckedout,
        status: data.status,
        memberSince: data.dateOfMembership,
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
    try {
      // Call the API to get book item details by barcode
      const response = await fetch(`http://localhost:8080/api/books/barcode/${bookBarcode}`)
      
      if (!response.ok) {
        throw new Error("Book not found")
      }
      
      const bookData = await response.json()
      
      // Find the specific book item with the matching barcode
      const bookItem = bookData.bookItems.find((item: any) => item.barcode === bookBarcode)
      
      if (!bookItem) {
        throw new Error("Book item not found")
      }
      
      // Only allow reservation if the book is currently checked out
      // if (bookItem.status !== "LOANED" && bookItem.status !== "RESERVED") {
      //   throw new Error("This book is available for checkout, not reservation")
      // }
      if (bookItem.status !== "AVAILABLE") {
        throw new Error("Only available books can be reserved")
      }

      setBookDetails({
        barcode: bookItem.barcode,
        title: bookData.title,
        author: bookData.authors.join(", "),
        status: bookItem.status,
        isbn: bookData.isbn,
        dueDate: bookItem.dueDate,
        currentHolder: bookItem.borrower || "Unknown"
      })
    } catch (error) {
      console.error("Error fetching book:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to find book. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleReservation = async () => {
    if (!memberDetails || !bookDetails) return

    setIsLoading(true)
    try {
      // Step 1: Create the reservation
      const createResponse = await fetch("http://localhost:8080/api/reservations/reserve", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          bookItemBarcode: bookDetails.barcode,
          memberId: memberDetails.id
        })
      })
      
      if (!createResponse.ok) {
        const errorData = await createResponse.json()
        throw new Error(errorData.message || "Failed to create reservation")
      }
      
      // Get the created reservation which contains the reservation ID
      const reservationData = await createResponse.json()
      
      // Step 2: Complete the reservation
      const completeResponse = await fetch(`http://localhost:8080/api/reservations/${reservationData.id}/complete`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        }
      })
      
      if (!completeResponse.ok) {
        // If completion fails, attempt to cancel the created reservation
        await fetch(`http://localhost:8080/api/reservations/${reservationData.id}/cancel`, {
          method: "PUT"
        });
        throw new Error("Failed to complete reservation")
      }
      
      toast({
        title: "Success",
        description: "Book has been reserved successfully.",
      })

      // Reset form
      setMemberId("")
      setBookBarcode("")
      setMemberDetails(null)
      setBookDetails(null)
      
      // Redirect to the profile page if the user is a member
      if (user && user.role === "MEMBER") {
        router.push('/profile')
      }
    } catch (error) {
      console.error("Error reserving book:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to reserve book. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Book Reservation</CardTitle>
          <CardDescription>Reserve books that are currently checked out by other members</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="memberId">Member ID</Label>
              <div className="flex space-x-2">
                <Input
                  id="memberId"
                  placeholder="Enter member ID"
                  value={memberId}
                  onChange={(e) => setMemberId(e.target.value)}
                />
                <Button onClick={handleMemberSearch} disabled={!memberId || isLoading}>
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
                  <span className="text-muted-foreground">Email:</span>
                  <span>{memberDetails.email}</span>
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
                  placeholder="Enter book barcode"
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
                  <span className={
                    bookDetails.status === "AVAILABLE" ? "text-green-600" : 
                    bookDetails.status === "RESERVED" ? "text-orange-600" : 
                    "text-red-600"
                  }>
                    {bookDetails.status}
                  </span>
                  {bookDetails.dueDate && (
                    <>
                      <span className="text-muted-foreground">Due Date:</span>
                      <span>{new Date(bookDetails.dueDate).toLocaleDateString()}</span>
                    </>
                  )}
                  {bookDetails.currentHolder && (
                    <>
                      <span className="text-muted-foreground">Current Holder:</span>
                      <span>{bookDetails.currentHolder}</span>
                    </>
                  )}
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
              memberDetails?.status !== "ACTIVE"
            }
            onClick={handleReservation}
          >
            {isLoading ? (
              "Processing..."
            ) : (
              <>
                <Calendar className="mr-2 h-4 w-4" />
                Reserve Book
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}