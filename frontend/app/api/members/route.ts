import { NextResponse } from "next/server"
import { AccountStatus } from "@/types"

// In a real application, this would connect to a database
export async function GET() {
  const members = [
    {
      id: "M1001",
      name: "John Doe",
      email: "john.doe@example.com",
      phone: "555-123-4567",
      booksCheckedOut: 2,
      status: AccountStatus.ACTIVE,
      memberSince: "2022-01-15",
    },
    {
      id: "M1002",
      name: "Jane Smith",
      email: "jane.smith@example.com",
      phone: "555-987-6543",
      booksCheckedOut: 0,
      status: AccountStatus.ACTIVE,
      memberSince: "2022-03-22",
    },
    {
      id: "M1003",
      name: "Robert Johnson",
      email: "robert.j@example.com",
      phone: "555-456-7890",
      booksCheckedOut: 5,
      status: AccountStatus.ACTIVE,
      memberSince: "2021-11-05",
    },
    {
      id: "M1004",
      name: "Emily Davis",
      email: "emily.d@example.com",
      phone: "555-789-0123",
      booksCheckedOut: 1,
      status: AccountStatus.BLACKLISTED,
      memberSince: "2022-05-18",
    },
  ]

  return NextResponse.json(members)
}

export async function POST(request: Request) {
  const data = await request.json()

  // Validate required fields
  if (!data.name || !data.email || !data.phone) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  // In a real app, this would save to a database
  const newMember = {
    id: `M${Math.floor(1000 + Math.random() * 9000)}`,
    name: data.name,
    email: data.email,
    phone: data.phone,
    address: data.address || "",
    booksCheckedOut: 0,
    status: AccountStatus.ACTIVE,
    memberSince: new Date().toISOString().split("T")[0],
  }

  return NextResponse.json(newMember, { status: 201 })
}

