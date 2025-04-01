export enum BookStatus {
  AVAILABLE = "AVAILABLE",
  RESERVED = "RESERVED",
  LOANED = "LOANED",
  LOST = "LOST",
}

export enum ReservationStatus {
  WAITING = "WAITING",
  PENDING = "PENDING",
  COMPLETED = "COMPLETED",
  CANCELED = "CANCELED",
  NONE = "NONE",
}

export enum AccountStatus {
  ACTIVE = "ACTIVE",
  CLOSED = "CLOSED",
  CANCELED = "CANCELED",
  BLACKLISTED = "BLACKLISTED",
  NONE = "NONE",
}

export interface BookItem {
  barcode: string
  isReferenceOnly?: boolean
  borrowed?: boolean
  dueDate?: string
  price?: number
  format?: string
  status: string
  dateOfPurchase?: string
  publicationDate?: string
  rack?: string
}

export interface Book {
  id: string
  isbn: string
  title: string
  subject: string
  publisher: string
  language: string
  numberOfPages: number
  authors: string[]
  publicationDate: string
  bookItems: BookItem[]
}

export interface Address {
  street: string
  city: string
  state: string
  zipCode: string
  country: string
}

export interface Person {
  name: string
  address?: Address
  email: string
  phone: string
}

export interface Member {
  id: string
  password?: string
  person: Person
  status: AccountStatus
  dateOfMembership: string
  totalBooksCheckedout: number
}

export interface BookReservation {
  id: string
  creationDate: string
  status: ReservationStatus
  bookItemBarcode: string
  memberId: string
}

export interface BookLending {
  id: string
  creationDate: string
  dueDate: string
  returnDate?: string
  bookItemBarcode: string
  memberId: string
}

export interface Fine {
  id: string
  creationDate: string
  amount: number
  bookItemBarcode: string
  memberId: string
  paymentDate?: string
}

