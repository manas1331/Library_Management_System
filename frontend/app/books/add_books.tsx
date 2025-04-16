"use client"
import { useAuth } from "@/contexts/auth-context"
import React, { useState, useEffect } from "react"
import { Plus, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { useRouter } from "next/navigation"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import { toast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog"

import type { Book } from "@/types"


export function BookCatalogWithAdd() {
  const router= useRouter()
  const { user, loading: authLoading } = useAuth()
  const [books, setBooks] = useState<Book[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [searchBy, setSearchBy] = useState("title")
  const [loading, setLoading] = useState(true)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [selectedBook, setSelectedBook] = useState<Book | null>(null) // For the book being updated
  // const [newBookItem, setNewBookItem] = useState({
  //   barcode: "",
  //   status: "AVAILABLE",
  //   rack: ""
  // })
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false)
  const [form, setForm] = useState({
    title: "",
    authors: "",
    subject: "",
    isbn: "",
    publisher: ""
  })
  const [newBookItem, setNewBookItem] = useState({
    barcode: "",
    isReferenceOnly: false,
    status: "AVAILABLE",
    price: 0,
    format: "",
    rack: "",
    dateOfPurchase: "",
  })
  const [selectedBookItems, setSelectedBookItems] = useState<any[]>([])
  const [isViewItemsModalOpen, setIsViewItemsModalOpen] = useState(false)
  const [loadingItems, setLoadingItems] = useState(false)
  const { toast } = useToast()
  useEffect(() => {
    console.log("User:", user)
    console.log("User Role:", user?.role)
  }, [user])
  const handleReserveBook = async (bookItemBarcode: string) => {
    try {
      const response = await fetch(`http://localhost:8080/api/reservations/reserve`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ bookItemBarcode,memberId: user?.id }), // Pass the user ID for reservation
      })
  
      if (!response.ok) {
        throw new Error("Failed to reserve book")
      }
  
      toast({
        title: "Success",
        description: "Book reserved successfully!",
      })
    } catch (error) {
      console.error("Error reserving book:", error)
      toast({
        title: "Error",
        description: "Failed to reserve book. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleAddBookItem = async () => {
    if (!selectedBook) return
  
    if (
      newBookItem.barcode.trim() === "" ||
      newBookItem.rack.trim() === "" ||
      newBookItem.format.trim() === "" ||
      isNaN(newBookItem.price) ||
      newBookItem.price < 0
    ) {
    
      toast({
        title: "Error",
        description: "Please fill in all fields.",
        variant: "destructive",
      })
      return
    }
  
    try {
      console.log("Submitting book item:", {
        ...newBookItem,
        status: "AVAILABLE"
      })      
      const response = await fetch(`http://localhost:8080/api/books/${selectedBook.id}/items`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify( {...newBookItem, status: "AVAILABLE"}),
      })
  
      if (!response.ok) throw new Error("Failed to add book item")
  
      const addedBookItem = await response.json()
  
      // Update the selected book's bookItems
      const updatedBook = {
        ...selectedBook,
        bookItems: [...selectedBook.bookItems, addedBookItem],
      }
  
      // Update the books state
      setBooks(books.map((book) => (book.id === selectedBook.id ? updatedBook : book)))
  
      toast({
        title: "Success",
        description: "Book item added successfully!",
      })
  
      setIsAddItemModalOpen(false)
      setNewBookItem({
        barcode: "",
        status: "AVAILABLE",
        rack: "",
        price: 0,
        format: "",
        isReferenceOnly: false,
        dateOfPurchase:""
      })

    } catch (error) {
      toast({
        title: "Error",
        description: "Could not add book item.",
        variant: "destructive",
      })
    }
  }
  const fetchBooks = async () => {
    try {
      const response = await fetch("http://localhost:8080/api/books")
      if (!response.ok) throw new Error("Failed to fetch books")
      const data = await response.json()
      setBooks(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not fetch books.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }
  const fetchBookItems = async (bookId: string) => {
    setLoadingItems(true)
    try {
      const response = await fetch(`http://localhost:8080/api/books/${bookId}/items`)
      if (!response.ok) throw new Error("Failed to fetch book items")
      const data = await response.json()
      setSelectedBookItems(data)
      setIsViewItemsModalOpen(true)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch book items. Please try again later.",
        variant: "destructive",
      })
    } finally {
      setLoadingItems(false)
    }
  }
  useEffect(() => {
    fetchBooks()
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }


const handleAddBook = async () => {
  try {
    const newBook = {
      title: form.title,
      authors: form.authors.split(",").map((a) => a.trim()),
      subject: form.subject,
      isbn: form.isbn,
      publisher: form.publisher,
      language: "English", // Default language
      numberOfPages: 0, // Default value that can be updated later
      publicationDate: new Date().toISOString().split('T')[0], // Current date as default
      bookItems: [] // Initialize with empty array
    }

    const response = await fetch("http://localhost:8080/api/books", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(newBook)
    })

    if (!response.ok) throw new Error("Failed to add book")
    
    const addedBook = await response.json();
    
    // Update the books state with the new book
    setBooks(prevBooks => [...prevBooks, addedBook]);

    toast({
      title: "Success",
      description: "Book added successfully!"
    })

    setIsAddModalOpen(false)
    setForm({ title: "", authors: "", subject: "", isbn: "", publisher: "" })
  } catch (error) {
    toast({
      title: "Error",
      description: "Could not add book.",
      variant: "destructive"
    })
  }
}

  const filteredBooks = books.filter((book) => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    switch (searchBy) {
      case "title":
        return book.title.toLowerCase().includes(query)
      case "author":
        return book.authors.some((author) => author.toLowerCase().includes(query))
      case "subject":
        return book.subject.toLowerCase().includes(query)
      case "isbn":
        return book.isbn.includes(query)
      default:
        return true
    }
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-start justify-between">
        <div className="flex flex-col md:flex-row gap-4 flex-1">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search books..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={searchBy} onValueChange={setSearchBy}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Search by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="title">Title</SelectItem>
              <SelectItem value="author">Author</SelectItem>
              <SelectItem value="subject">Subject</SelectItem>
              <SelectItem value="isbn">ISBN</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {user?.role === "LIBRARIAN" && (
  <Button onClick={() => setIsAddModalOpen(true)}>
    <Plus className="mr-2 h-4 w-4" /> Add Book
  </Button>
)}
      </div>

      {loading ? (
        <div className="text-center py-10">Loading books...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBooks.map((book) => (
            <Card key={book.id} className="overflow-hidden bg-card text-card-foreground">
              <CardHeader className="pb-3">
                <CardTitle className="line-clamp-2">{book.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Author:</span>
                    <span className="font-medium">{book.authors.join(", ")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subject:</span>
                    <span>{book.subject}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">ISBN:</span>
                    <span>{book.isbn}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Publisher:</span>
                    <span>{book.publisher}</span>
                  </div>
                  <div className="flex justify-between">
      <span className="text-muted-foreground">Book Items:</span>
      <span>{book.bookItems?.length || 0}</span> {/* Display the number of book items */}
    </div>
                </div>
              </CardContent>
              <CardFooter>
              
              {user?.role === "LIBRARIAN" && (
                <div className="flex space-x-2">
  <Button
    variant="outline"
    onClick={() => {
      setSelectedBook(book)
      setIsAddItemModalOpen(true)
    }}
  >
    Add Book Item
  </Button>
  <Button
  variant="default"
  onClick={() => fetchBookItems(book.id)}
>
  View Book Items
</Button>
</div>
)}
            {user?.role === "MEMBER" && (
  <div className="flex space-x-2">
    <Button
  variant="default"
  onClick={() => fetchBookItems(book.id)}
>
  View Book Items
</Button>
  </div>
)}
              </CardFooter>
            </Card>
          ))}
          {filteredBooks.length === 0 && (
            <div className="col-span-full text-center py-10 text-muted-foreground">
              No books found matching your search criteria.
            </div>
          )}
        </div>
      )}
      <Dialog open={isAddItemModalOpen} onOpenChange={setIsAddItemModalOpen}>
    <DialogContent>
    <DialogHeader>
      <DialogTitle>Add Book Item</DialogTitle>
    </DialogHeader>
    <div className="space-y-3">
      <Input
        placeholder="Barcode"
        value={newBookItem.barcode}
        onChange={(e) => setNewBookItem({ ...newBookItem, barcode: e.target.value })}
      />
      <Input
        placeholder="Rack"
        value={newBookItem.rack}
        onChange={(e) => setNewBookItem({ ...newBookItem, rack: e.target.value })}
      />
      <Input
        placeholder="Price"
        type="number"
        onChange={(e) => setNewBookItem({ ...newBookItem, price: parseFloat(e.target.value) })}
      />
      <Input
        placeholder="Format"
        onChange={(e) => setNewBookItem({ ...newBookItem, format: e.target.value })}
      />
      <Input
        placeholder="Date of Purchase (yyyy-MM-dd)"
        onChange={(e) => setNewBookItem({ ...newBookItem, dateOfPurchase: e.target.value })}
      />
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="isReferenceOnly"
          checked={newBookItem.isReferenceOnly}
          onChange={(e) => setNewBookItem({ ...newBookItem, isReferenceOnly: e.target.checked })}
        />
        <label htmlFor="isReferenceOnly">Reference Only</label>
      </div>
    </div>
    
    <DialogFooter>
      <Button variant="outline" onClick={() => setIsAddItemModalOpen(false)}>
        Cancel
      </Button>
      <Button onClick={handleAddBookItem}>Add Book Item</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add a New Book</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input name="title" placeholder="Title" value={form.title} onChange={handleInputChange} />
            <Input name="authors" placeholder="Authors (comma separated)" value={form.authors} onChange={handleInputChange} />
            <Input name="subject" placeholder="Subject" value={form.subject} onChange={handleInputChange} />
            <Input name="isbn" placeholder="ISBN" value={form.isbn} onChange={handleInputChange} />
            <Input name="publisher" placeholder="Publisher" value={form.publisher} onChange={handleInputChange} />
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddBook}>Add Book</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={isViewItemsModalOpen} onOpenChange={setIsViewItemsModalOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">Book Items</DialogTitle>
          </DialogHeader>
          {loadingItems ? (
            <div className="text-center py-10 text-muted-foreground">Loading book items...</div>
          ) : selectedBookItems.length > 0 ? (
            <div className="rounded-md border">
              <Table className="min-w-full">
                <TableHeader>
                  <TableRow className="bg-muted">
                    <TableHead className="px-4 py-2 text-left">Barcode</TableHead>
                    <TableHead className="px-4 py-2 text-left">Status</TableHead>
                    <TableHead className="px-4 py-2 text-left">Rack</TableHead>
                    <TableHead className="px-4 py-2 text-left">Price</TableHead>
                    <TableHead className="px-4 py-2 text-left">Format</TableHead>
                    <TableHead className="px-4 py-2 text-left">Reference Only</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedBookItems.map((item) => (
                    <TableRow key={item.barcode} className="hover:bg-muted">
                      <TableCell className="px-4 py-2">{item.barcode}</TableCell>
                      <TableCell className="px-4 py-2">{item.status}</TableCell>
                      <TableCell className="px-4 py-2">{item.rack}</TableCell>
                      <TableCell className="px-4 py-2">${item.price.toFixed(2)}</TableCell>
                      <TableCell className="px-4 py-2">{item.format}</TableCell>
                      <TableCell className="px-4 py-2">{item.isReferenceOnly ? "Yes" : "No"}</TableCell>
                      <TableCell className="px-4 py-2"><Button
      size="sm"
      onClick={() => handleReserveBook(item.barcode)}
      disabled={item.isReferenceOnly || item.status !== "AVAILABLE"} // Optional
    >
      Reserve
    </Button>
    </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-10 text-muted-foreground">
              No book items found for this book.
            </div>
          )}
          
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsViewItemsModalOpen(false)}>
              Close
            </Button>
            
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
