"use client"

import { useState, useEffect } from "react"
import { Search, Edit, Save, X, Plus, Minus, Loader2 } from "lucide-react"
import type { Book } from "@/types"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "./ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useAuth } from "@/contexts/auth-context"

export function BookCatalog() {
  const [books, setBooks] = useState<Book[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [searchBy, setSearchBy] = useState("title")
  const [loading, setLoading] = useState(true)
  const [selectedBook, setSelectedBook] = useState<Book | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editedBookItem, setEditedBookItem] = useState<{
    barcode: string,
    status: string
  } | null>(null)
  const [quantityToChange, setQuantityToChange] = useState<number>(1)
  const [isUpdatingQuantity, setIsUpdatingQuantity] = useState<boolean>(false)

  const { user } = useAuth()

  const isAdmin = () => {
    return user?.role === "LIBRARIAN"
  }

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setLoading(true);
        const response = await fetch("http://localhost:8080/api/books")
        if (!response.ok) {
          throw new Error("Failed to fetch books")
        }
        const data = await response.json()
        setBooks(data)
      } catch (error) {
        console.error("Error fetching books:", error)
        toast({
          title: "Error",
          description: "Failed to fetch books. Please try again later.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchBooks()
  }, [])

  const openBookDetails = (book: Book) => {
    setSelectedBook(book)
    setIsModalOpen(true)
  }

  const handleUpdateBookItem = async () => {
    if (!editedBookItem || !selectedBook) return
    
    try {
      const response = await fetch(`http://localhost:8080/api/books/items/${editedBookItem.barcode}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          status: editedBookItem.status
        })
      })
      
      if (!response.ok) throw new Error("Failed to update book item")
      
      const updatedBookItems = selectedBook.bookItems.map(item => 
        item.barcode === editedBookItem.barcode ? {...item, status: editedBookItem.status} : item
      )
      
      const updatedBook = {...selectedBook, bookItems: updatedBookItems}
      setSelectedBook(updatedBook)
      
      setBooks(books.map(book => book.id === updatedBook.id ? updatedBook : book))
      
      toast({
        title: "Success",
        description: "Book item updated successfully",
      })
      
      setIsEditing(false)
      setEditedBookItem(null)
    } catch (error) {
      console.error("Error updating book item:", error)
      toast({
        title: "Error",
        description: "Failed to update book item",
        variant: "destructive",
      })
    }
  }

  const handleUpdateQuantity = async (bookId: string, operation: 'increase' | 'decrease') => {
    if (!quantityToChange || quantityToChange < 1) {
      toast({
        title: "Invalid quantity",
        description: "Please enter a positive number",
        variant: "destructive",
      })
      return
    }
    
    setIsUpdatingQuantity(true)
    try {
      const response = await fetch(`http://localhost:8080/api/books/${bookId}/items/quantity`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          quantity: quantityToChange,
          operation: operation
        })
      })
      
      if (!response.ok) {
        throw new Error(operation === 'decrease' ? 
          "Failed to remove book items. Make sure there are enough available copies." : 
          "Failed to add book items")
      }
      
      const updatedBook = await response.json()
      
      setBooks(books.map(book => book.id === updatedBook.id ? updatedBook : book))
      
      if (selectedBook && selectedBook.id === updatedBook.id) {
        setSelectedBook(updatedBook)
      }
      
      toast({
        title: "Success",
        description: operation === 'increase' ? 
          `Added ${quantityToChange} book item(s)` : 
          `Removed ${quantityToChange} book item(s)`,
      })
    } catch (error) {
      console.error(`Error ${operation} book items:`, error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : `Failed to ${operation} book items`,
        variant: "destructive",
      })
    } finally {
      setIsUpdatingQuantity(false)
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
      <div className="flex flex-col md:flex-row gap-4">
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

      {loading ? (
        <div className="text-center py-10">Loading books...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBooks.map((book) => (
            <Card key={book.id} className="overflow-hidden">
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
                    <span className="text-muted-foreground">Available:</span>
                    <span className="font-medium">
                      {book.bookItems.filter((item) => item.status === "AVAILABLE").length} / {book.bookItems.length}
                    </span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" onClick={() => openBookDetails(book)}>
                  View Details
                </Button>
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

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedBook?.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 text-sm">
            <div>
              <strong>Author:</strong> {selectedBook?.authors.join(", ")}
            </div>
            <div>
              <strong>Subject:</strong> {selectedBook?.subject}
            </div>
            <div>
              <strong>ISBN:</strong> {selectedBook?.isbn}
            </div>
            <div>
              <strong>Publisher:</strong> {selectedBook?.publisher}
            </div>
            <div>
              <strong>Available Copies:</strong>{" "}
              {selectedBook?.bookItems.filter((item) => item.status === "AVAILABLE").length} /{" "}
              {selectedBook?.bookItems.length}
            </div>
          </div>
          
          {isAdmin() && selectedBook && (
            <div className="mt-4">
              <h3 className="font-medium mb-2">Book Items</h3>
              <div className="border rounded-md overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Barcode</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedBook.bookItems.map((item) => (
                      <TableRow key={item.barcode}>
                        <TableCell>{item.barcode}</TableCell>
                        <TableCell>
                          {isEditing && editedBookItem?.barcode === item.barcode ? (
                            <Select 
                              value={editedBookItem.status}
                              onValueChange={(value) => setEditedBookItem({...editedBookItem, status: value})}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="AVAILABLE">AVAILABLE</SelectItem>
                                <SelectItem value="RESERVED">RESERVED</SelectItem>
                                <SelectItem value="LOANED">LOANED</SelectItem>
                                <SelectItem value="LOST">LOST</SelectItem>
                              </SelectContent>
                            </Select>
                          ) : (
                            <span className={
                              item.status === "AVAILABLE" ? "text-green-600" : 
                              item.status === "LOANED" ? "text-blue-600" :
                              item.status === "RESERVED" ? "text-amber-600" : "text-red-600"
                            }>
                              {item.status}
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          {isEditing && editedBookItem?.barcode === item.barcode ? (
                            <div className="flex space-x-2">
                              <Button size="sm" variant="outline" onClick={handleUpdateBookItem}>
                                <Save className="h-4 w-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={() => {
                                  setIsEditing(false)
                                  setEditedBookItem(null)
                                }}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ) : (
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              onClick={() => {
                                setIsEditing(true)
                                setEditedBookItem({
                                  barcode: item.barcode,
                                  status: item.status
                                })
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {isAdmin() && selectedBook && (
            <div className="mt-4 border-t pt-4">
              <h3 className="font-medium mb-2">Manage Inventory</h3>
              <div className="flex items-center space-x-2 mb-3">
                <Input
                  type="number"
                  min="1"
                  className="w-20"
                  value={quantityToChange}
                  onChange={(e) => setQuantityToChange(parseInt(e.target.value) || 1)}
                />
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleUpdateQuantity(selectedBook.id, 'increase')}
                  disabled={isUpdatingQuantity}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Copies
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleUpdateQuantity(selectedBook.id, 'decrease')}
                  disabled={
                    isUpdatingQuantity || 
                    !selectedBook.bookItems.some(item => item.status === "AVAILABLE")
                  }
                >
                  <Minus className="h-4 w-4 mr-1" />
                  Remove Copies
                </Button>
                {isUpdatingQuantity && <Loader2 className="h-4 w-4 animate-spin ml-2" />}
              </div>
              <p className="text-xs text-muted-foreground">
                Note: Copies can only be removed if they are currently available (not checked out or reserved).
              </p>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}