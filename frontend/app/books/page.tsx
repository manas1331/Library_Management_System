import { Navbar } from "@/components/navbar"
import { BookCatalogWithAdd } from "./add_books"

export default function BooksPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto py-8 px-4">
        <BookCatalogWithAdd />
      </div>
    </div>
  )
}