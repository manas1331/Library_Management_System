"use client"

import { useState, useEffect } from "react"
import { Search } from "lucide-react"
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
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"

export function BookCatalog() {
  const [books, setBooks] = useState<Book[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [searchBy, setSearchBy] = useState("title")
  const [loading, setLoading] = useState(true)
  const [selectedBook, setSelectedBook] = useState<Book | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

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

      {/* Dialog for Book Details */}
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