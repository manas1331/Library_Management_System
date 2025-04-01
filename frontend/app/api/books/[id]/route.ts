import { NextResponse } from "next/server"
import { type Book, BookStatus } from "@/types"

// Mock database
const books: Book[] = [
  {
    id: "1",
    isbn: "978-0-7475-3269-9",
    title: "Harry Potter and the Philosopher's Stone",
    subject: "Fantasy",
    publisher: "Bloomsbury",
    language: "English",
    numberOfPages: 223,
    authors: ["J.K. Rowling"],
    publicationDate: "1997-06-26",
    bookItems: [
      { barcode: "HP1001", status: BookStatus.AVAILABLE, rack: "A1" },
      { barcode: "HP1002", status: BookStatus.LOANED, rack: "A1" },
    ],
  },
  {
    id: "2",
    isbn: "978-0-06-112008-4",
    title: "To Kill a Mockingbird",
    subject: "Fiction",
    publisher: "J.B. Lippincott & Co.",
    language: "English",
    numberOfPages: 281,
    authors: ["Harper Lee"],
    publicationDate: "1960-07-11",
    bookItems: [{ barcode: "TKM1001", status: BookStatus.AVAILABLE, rack: "B2" }],
  },
  {
    id: "3",
    isbn: "978-0-385-50420-5",
    title: "The Da Vinci Code",
    subject: "Mystery",
    publisher: "Doubleday",
    language: "English",
    numberOfPages: 454,
    authors: ["Dan Brown"],
    publicationDate: "2003-03-18",
    bookItems: [
      { barcode: "DVC1001", status: BookStatus.LOANED, rack: "C3" },
      { barcode: "DVC1002", status: BookStatus.AVAILABLE, rack: "C3" },
      { barcode: "DVC1003", status: BookStatus.AVAILABLE, rack: "C3" },
    ],
  },
]

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const id = params.id
  const book = books.find((b) => b.id === id)

  if (!book) {
    return NextResponse.json({ error: "Book not found" }, { status: 404 })
  }

  return NextResponse.json(book)
}

