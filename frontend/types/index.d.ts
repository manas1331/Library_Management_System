// Add or update the Book type
export interface Book {
  id: string;
  isbn: string;
  title: string;
  subject: string;
  publisher: string;
  language: string;
  numberOfPages: number;
  authors: string[];
  publicationDate: string;
  bookItems: BookItem[];
}

export interface BookItem {
  barcode: string;
  isReferenceOnly: boolean;
  price: number;
  format: string;
  status: "AVAILABLE" | "RESERVED" | "LOANED" | "LOST";
  dateOfPurchase: string;
  rack: string;
}