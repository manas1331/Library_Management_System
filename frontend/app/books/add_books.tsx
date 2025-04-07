"use client"

import React, { useState, useEffect } from "react"
import { Plus, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
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
  const [books, setBooks] = useState<Book[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [searchBy, setSearchBy] = useState("title")
  const [loading, setLoading] = useState(true)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [selectedBook, setSelectedBook] = useState<Book | null>(null) // For the book being updated
  const [newBookItem, setNewBookItem] = useState({
    barcode: "",
    status: "AVAILABLE",
    rack: ""
  })
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false)
  const [form, setForm] = useState({
    title: "",
    authors: "",
    subject: "",
    isbn: "",
    publisher: ""
  })
  const handleAddBookItem = async () => {
    if (!selectedBook) return
  
    if (!newBookItem.barcode || !newBookItem.rack) {
      toast({
        title: "Error",
        description: "Please fill in all book item fields.",
        variant: "destructive"
      })
      return
    }
  
    try {
      const updatedBook = {
        ...selectedBook,
        bookItems: [...selectedBook.bookItems, newBookItem]
      }
  
      const response = await fetch(`http://localhost:8080/api/books/${selectedBook.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(updatedBook)
      })
  
      if (!response.ok) throw new Error("Failed to add book item")
  
      // Update the books state
      setBooks(books.map((book) => (book.id === selectedBook.id ? updatedBook : book)))
  
      toast({
        title: "Success",
        description: "Book item added successfully!"
      })
  
      setIsAddItemModalOpen(false)
      setNewBookItem({ barcode: "", status: "AVAILABLE", rack: "" })
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not add book item.",
        variant: "destructive"
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
        bookItems: []
      }

      const response = await fetch("http://localhost:8080/api/books", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(newBook)
      })

      if (!response.ok) throw new Error("Failed to add book")

      toast({
        title: "Success",
        description: "Book added successfully!"
      })

      setIsAddModalOpen(false)
      setForm({ title: "", authors: "", subject: "", isbn: "", publisher: "" })
      fetchBooks()
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
        <Button onClick={() => setIsAddModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Book
        </Button>
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
                </div>
              </CardContent>
            </Card>
          ))}
          {filteredBooks.length === 0 && (
            <div className="col-span-full text-center py-10 text-muted-foreground">
              No books found matching your search criteria.
            </div>
          )}
        </div>
      )}

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
    </div>
  )
}
