import { Navbar } from "@/components/navbar"
import { BookCatalogWithAdd } from "./add_books"

export default function BooksPage() {
  return (
    <>
      <Navbar />
      <BookCatalogWithAdd />
    </>
)
}