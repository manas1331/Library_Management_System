"use client"

import { useState, useEffect } from "react"
import { BookCopy, User, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"

export function BookCheckout() {
  const [memberId, setMemberId] = useState("") // Renamed from memberBarcode
  const [bookBarcode, setBookBarcode] = useState("")
  const [memberDetails, setMemberDetails] = useState<any>(null)
  const [bookDetails, setBookDetails] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [availableBooks, setAvailableBooks] = useState<any[]>([])
  const [copySuccess, setCopySuccess] = useState<string | null>(null)
  const { toast } = useToast()
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    const fetchAvailableBooks = async () => {
      try {
        const response = await fetch("http://localhost:8080/api/books")
        if (!response.ok) throw new Error("Failed to fetch books")
        const data = await response.json()
        
        // Process books to count available copies
        const processedBooks = data.map((book: any) => ({
          id: book.id,
          title: book.title,
          authors: book.authors.join(", "),
          availableCopies: book.bookItems.filter((item: any) => item.status === "AVAILABLE").length,
          totalCopies: book.bookItems.length,
          // Get the barcode of the first available copy
          availableBarcode: book.bookItems.find((item: any) => item.status === "AVAILABLE")?.barcode || null
        }))
        
        setAvailableBooks(processedBooks)
      } catch (error) {
        console.error("Error fetching available books:", error)
      }
    }

    fetchAvailableBooks()
  }, [])

  const handleCopyBarcode = async (barcode: string) => {
    try {
      await navigator.clipboard.writeText(barcode)
      setCopySuccess(barcode)
      setTimeout(() => setCopySuccess(null), 2000)
    } catch (err) {
      console.error("Failed to copy barcode:", err)
    }
  }

  const handleMemberSearch = async () => {
    if (!memberId) return

    setIsLoading(true)
    try {
      // Call the API using member ID instead of barcode
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
      // Call the actual API to get book details by barcode
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
      
      // Check if this book is reserved by the current member
      let isReservedByMember = false;
      if (bookItem.status === "RESERVED" && memberDetails) {
        try {
          // Try to get reservation details for this book
          const reservationResponse = await fetch(`http://localhost:8080/api/reservations/barcode/${bookBarcode}`)
          console.log("Reservation Response Status:", reservationResponse.status)
          
          if (reservationResponse.ok) {
            const reservation = await reservationResponse.json()
            console.log("Reservation data:", reservation)
            isReservedByMember = reservation.memberId === memberDetails.id
          } else {
            // Alternative: Check member's reservations instead
            const memberReservationsResponse = await fetch(`http://localhost:8080/api/reservations/member/${memberDetails.id}`)
            
            if (memberReservationsResponse.ok) {
              const memberReservations = await memberReservationsResponse.json()
              console.log("Member reservations:", memberReservations)
              
              // Check if any of the member's reservations match this book barcode
              isReservedByMember = memberReservations.some(
                (res: any) => res.bookItemBarcode === bookBarcode && 
                             (res.status === "COMPLETED" || res.status === "PENDING")
              )
            }
          }
        } catch (error) {
          console.error("Error checking reservation:", error)
          // Don't throw error, just log it and continue
        }
      }
      
      setBookDetails({
        barcode: bookItem.barcode,
        title: bookData.title,
        author: bookData.authors.join(", "),
        status: bookItem.status,
        isbn: bookData.isbn,
        dueDate: bookItem.dueDate,
        isReservedByMember: isReservedByMember
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
    try {
      const response = await fetch("http://localhost:8080/api/lendings/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          bookItemBarcode: bookDetails.barcode,
          memberId: memberDetails.id
        })
      })
      
      if (!response.ok) {
        throw new Error("Failed to checkout book")
      }
      
      const result = await response.json()
      
      toast({
        title: "Success",
        description: "Book has been checked out successfully.",
      })

      // Reset form
      setMemberId("")
      setBookBarcode("")
      setMemberDetails(null)
      setBookDetails(null)
      
      // Redirect to the profile page to see borrowings
      if (user && user.role === "MEMBER") {
        router.push('/profile')
      }
    } catch (error) {
      console.error("Error checking out book:", error)
      toast({
        title: "Error",
        description: "Failed to checkout book. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Book Checkout</CardTitle>
          <CardDescription>Scan member and book barcodes to checkout a book</CardDescription>
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
        <CardFooter className="flex flex-col gap-2">
          <Button
            className="w-full"
            disabled={
              !memberDetails ||
              !bookDetails ||
              isLoading ||
              (bookDetails?.status !== "AVAILABLE" && !bookDetails?.isReservedByMember) ||
              memberDetails?.booksCheckedOut >= 5
            }
            onClick={handleCheckout}
          >
            {isLoading ? "Processing..." : (
              bookDetails?.isReservedByMember ? "Checkout Reserved Book" : "Checkout Book"
            )}
          </Button>
          
          {/* Add helpful user message for reserved books */}
          {bookDetails?.isReservedByMember && (
            <p className="text-sm text-amber-600 text-center">
              This book was reserved by you and is now available for checkout.
            </p>
          )}
          
          {/* Add error message if book is reserved by someone else */}
          {bookDetails?.status === "RESERVED" && !bookDetails?.isReservedByMember && (
            <p className="text-sm text-red-600 text-center">
              This book is currently reserved by another member.
            </p>
          )}
        </CardFooter>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Available Books</CardTitle>
            <CardDescription>Quick access to book barcodes and member information</CardDescription>
          </div>
          {user && user.role === "MEMBER" && (
            <div className="flex items-center space-x-4 bg-muted px-4 py-2 rounded-lg">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">Member ID:</span>
                <code className="bg-background px-2 py-1 rounded text-sm">{user.id}</code>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleCopyBarcode(user.id)}
                className="h-8 w-8 p-0"
              >
                {copySuccess === user.id ? (
                  <span className="text-green-600 text-xs">✓</span>
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-[40%]">Title</TableHead>
                  <TableHead className="w-[25%]">Author</TableHead>
                  <TableHead className="w-[15%] text-center">Available</TableHead>
                  <TableHead className="w-[15%]">Barcode</TableHead>
                  <TableHead className="w-[5%]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {availableBooks.map((book) => (
                  <TableRow key={book.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">{book.title}</TableCell>
                    <TableCell>{book.authors}</TableCell>
                    <TableCell className="text-center">
                      <span className={book.availableCopies === 0 ? "text-red-500" : "text-green-500"}>
                        {book.availableCopies} / {book.totalCopies}
                      </span>
                    </TableCell>
                    <TableCell>
                      <code className="bg-muted px-2 py-1 rounded text-sm">
                        {book.availableBarcode || "N/A"}
                      </code>
                    </TableCell>
                    <TableCell>
                      {book.availableBarcode && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopyBarcode(book.availableBarcode)}
                          className="h-8 w-8 p-0"
                        >
                          {copySuccess === book.availableBarcode ? (
                            <span className="text-green-600 text-xs">✓</span>
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}