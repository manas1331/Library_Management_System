// "use client"

// import { useState, useEffect } from "react"
// import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
// import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
// import { Badge } from "@/components/ui/badge"
// import { Button } from "@/components/ui/button"
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
// import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"
// import { User, Book, Calendar, Edit } from "lucide-react"
// import { Separator } from "@/components/ui/separator"

// export default function ProfilePage() {
//   const [member, setMember] = useState<any>(null)
//   const [loading, setLoading] = useState(true)

//   useEffect(() => {
//     // Simulate API call to fetch member details
//     const fetchMember = async () => {
//       setLoading(true)
//       try {
//         // Replace with actual API endpoint
//         // const response = await fetch("http://localhost:8080/api/members/current")
//         // const data = await response.json()
        
//         // Mock data for demonstration
//         const mockData = {
//           id: "M1001",
//           name: "John Doe",
//           email: "john.doe@example.com",
//           phone: "+1 (555) 123-4567",
//           address: {
//             street: "123 Main Street",
//             city: "Springfield",
//             state: "IL",
//             zipCode: "62704",
//             country: "USA"
//           },
//           dateOfMembership: "2023-01-15",
//           status: "ACTIVE",
//           totalBooksCheckedout: 2,
//           booksCheckedOut: [
//             {
//               barcode: "B10001",
//               title: "The Great Gatsby",
//               authors: ["F. Scott Fitzgerald"],
//               dueDate: "2025-04-20",
//               status: "BORROWED"
//             },
//             {
//               barcode: "B10024",
//               title: "To Kill a Mockingbird",
//               authors: ["Harper Lee"],
//               dueDate: "2025-04-25",
//               status: "BORROWED"
//             }
//           ],
//           borrowingHistory: [
//             {
//               barcode: "B10013",
//               title: "1984",
//               authors: ["George Orwell"],
//               borrowDate: "2024-12-10",
//               returnDate: "2024-12-25",
//               status: "RETURNED"
//             },
//             {
//               barcode: "B10056",
//               title: "Pride and Prejudice",
//               authors: ["Jane Austen"],
//               borrowDate: "2024-11-05",
//               returnDate: "2024-11-20",
//               status: "RETURNED"
//             }
//           ]
//         }
        
//         setMember(mockData)
//       } catch (error) {
//         console.error("Error fetching member details:", error)
//       } finally {
//         setLoading(false)
//       }
//     }

//     fetchMember()
//   }, [])

//   if (loading) {
//     return (
//       <div className="container mx-auto py-8 px-4 flex justify-center items-center h-[70vh]">
//         <div className="text-center space-y-4">
//           <div className="animate-pulse h-8 w-32 bg-muted rounded-md mx-auto"></div>
//           <div className="animate-pulse h-64 w-full max-w-3xl bg-muted rounded-md"></div>
//         </div>
//       </div>
//     )
//   }

//   if (!member) {
//     return (
//       <div className="container mx-auto py-8 px-4">
//         <Card>
//           <CardContent className="flex flex-col items-center justify-center py-12">
//             <User className="h-12 w-12 text-muted-foreground mb-4" />
//             <h3 className="text-lg font-medium mb-2">Member Not Found</h3>
//             <p className="text-muted-foreground">Unable to retrieve member information.</p>
//           </CardContent>
//         </Card>
//       </div>
//     )
//   }

//   return (
//     <div className="container mx-auto py-8 px-4">
//       <Card className="mb-8">
//         <CardHeader className="pb-4">
//           <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
//             <div className="flex items-center gap-4">
//               <Avatar className="h-16 w-16 border">
//                 <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${member.name}`} alt={member.name} />
//                 <AvatarFallback>{member.name.split(' ').map((n: string) => n[0]).join('')}</AvatarFallback>
//               </Avatar>
//               <div>
//                 <CardTitle className="text-2xl">{member.name}</CardTitle>
//                 <CardDescription>Member ID: {member.id}</CardDescription>
//               </div>
//             </div>
//             <Badge variant={member.status === "ACTIVE" ? "default" : "destructive"} className="text-sm h-6">
//               {member.status}
//             </Badge>
//           </div>
//         </CardHeader>
//         <Separator />
//         <CardContent className="pt-6">
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//             <div className="space-y-4">
//               <div>
//                 <h3 className="font-medium text-sm text-muted-foreground mb-1">Personal Information</h3>
//                 <div className="text-base">
//                   <p className="flex items-center gap-2 mb-2">
//                     <span className="text-muted-foreground">Email:</span>
//                     {member.email}
//                   </p>
//                   <p className="flex items-center gap-2 mb-2">
//                     <span className="text-muted-foreground">Phone:</span>
//                     {member.phone}
//                   </p>
//                 </div>
//               </div>
              
//               <div>
//                 <h3 className="font-medium text-sm text-muted-foreground mb-1">Address</h3>
//                 <p className="text-base">
//                   {member.address.street}, {member.address.city},<br />
//                   {member.address.state}, {member.address.zipCode},<br />
//                   {member.address.country}
//                 </p>
//               </div>
//             </div>
            
//             <div className="space-y-4">
//               <div>
//                 <h3 className="font-medium text-sm text-muted-foreground mb-1">Membership Details</h3>
//                 <div className="text-base">
//                   <p className="flex items-center gap-2 mb-2">
//                     <Calendar className="h-4 w-4 text-muted-foreground" />
//                     <span className="text-muted-foreground">Member Since:</span>
//                     {new Date(member.dateOfMembership).toLocaleDateString()}
//                   </p>
//                   <div className="flex items-center gap-2 mb-2">
//                     <span className="text-muted-foreground">Books Checked Out:</span>
//                     <Badge variant="outline" className="ml-1">
//                         {member.totalBooksCheckedout}/5
//                     </Badge>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </CardContent>
//         <CardFooter className="border-t pt-6 flex justify-end">
//           <Button variant="outline" size="sm" className="flex items-center gap-2">
//             <Edit className="h-4 w-4" /> 
//             Edit Profile
//           </Button>
//         </CardFooter>
//       </Card>

//       <Tabs defaultValue="current" className="w-full">
//         <TabsList className="mb-4">
//           <TabsTrigger value="current">Current Borrowings</TabsTrigger>
//           <TabsTrigger value="history">Borrowing History</TabsTrigger>
//         </TabsList>
        
//         <TabsContent value="current">
//           <Card>
//             <CardHeader>
//               <CardTitle>Currently Borrowed Books</CardTitle>
//               <CardDescription>Books you currently have checked out from the library</CardDescription>
//             </CardHeader>
//             <CardContent>
//               {member.booksCheckedOut && member.booksCheckedOut.length > 0 ? (
//                 <Table>
//                   <TableHeader>
//                     <TableRow>
//                       <TableHead>Title</TableHead>
//                       <TableHead>Author(s)</TableHead>
//                       <TableHead>Due Date</TableHead>
//                       <TableHead>Status</TableHead>
//                     </TableRow>
//                   </TableHeader>
//                   <TableBody>
//                     {member.booksCheckedOut.map((book: any) => (
//                       <TableRow key={book.barcode}>
//                         <TableCell className="font-medium">{book.title}</TableCell>
//                         <TableCell>{book.authors.join(", ")}</TableCell>
//                         <TableCell>{new Date(book.dueDate).toLocaleDateString()}</TableCell>
//                         <TableCell>
//                           <Badge>{book.status}</Badge>
//                         </TableCell>
//                       </TableRow>
//                     ))}
//                   </TableBody>
//                 </Table>
//               ) : (
//                 <div className="text-center py-8">
//                   <Book className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-50" />
//                   <p className="text-muted-foreground">You currently have no books checked out.</p>
//                 </div>
//               )}
//             </CardContent>
//           </Card>
//         </TabsContent>
        
//         <TabsContent value="history">
//           <Card>
//             <CardHeader>
//               <CardTitle>Borrowing History</CardTitle>
//               <CardDescription>Books you have previously borrowed</CardDescription>
//             </CardHeader>
//             <CardContent>
//               {member.borrowingHistory && member.borrowingHistory.length > 0 ? (
//                 <Table>
//                   <TableHeader>
//                     <TableRow>
//                       <TableHead>Title</TableHead>
//                       <TableHead>Author(s)</TableHead>
//                       <TableHead>Borrowed Date</TableHead>
//                       <TableHead>Returned Date</TableHead>
//                       <TableHead>Status</TableHead>
//                     </TableRow>
//                   </TableHeader>
//                   <TableBody>
//                     {member.borrowingHistory.map((book: any) => (
//                       <TableRow key={book.barcode}>
//                         <TableCell className="font-medium">{book.title}</TableCell>
//                         <TableCell>{book.authors.join(", ")}</TableCell>
//                         <TableCell>{new Date(book.borrowDate).toLocaleDateString()}</TableCell>
//                         <TableCell>{book.returnDate ? new Date(book.returnDate).toLocaleDateString() : "N/A"}</TableCell>
//                         <TableCell>
//                           <Badge variant="secondary">{book.status}</Badge>
//                         </TableCell>
//                       </TableRow>
//                     ))}
//                   </TableBody>
//                 </Table>
//               ) : (
//                 <div className="text-center py-8">
//                   <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-50" />
//                   <p className="text-muted-foreground">You have no borrowing history yet.</p>
//                 </div>
//               )}
//             </CardContent>
//           </Card>
//         </TabsContent>
//       </Tabs>
//     </div>
//   )
// }

"use client"

import { useState, useEffect } from "react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"
import { User, Book, Calendar, Edit } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"

export default function ProfilePage() {
  const { user: authUser, isAuthenticated, loading: authLoading } = useAuth()
  const [member, setMember] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/auth/login")
    }
  }, [authLoading, isAuthenticated, router])

  useEffect(() => {
    // Don't fetch if not authenticated
    if (!isAuthenticated) return;

    // Simulate API call to fetch member details
    const fetchMember = async () => {
      setLoading(true)
      try {
        // Replace with actual API endpoint that uses the authenticated user's ID
        // const response = await fetch(`http://localhost:8080/api/members/${authUser?.id}`)
        // const data = await response.json()
        
        // Mock data for demonstration - now using authUser data where available
        const mockData = {
          id: authUser?.id || "M1001",
          name: authUser?.name || "John Doe",
          email: authUser?.email || "john.doe@example.com",
          phone: "+1 (555) 123-4567",
          address: {
            street: "123 Main Street",
            city: "Springfield",
            state: "IL",
            zipCode: "62704",
            country: "USA"
          },
          dateOfMembership: "2023-01-15",
          status: "ACTIVE",
          totalBooksCheckedout: 2,
          booksCheckedOut: [
            {
              barcode: "B10001",
              title: "The Great Gatsby",
              authors: ["F. Scott Fitzgerald"],
              dueDate: "2025-04-20",
              status: "BORROWED"
            },
            {
              barcode: "B10024",
              title: "To Kill a Mockingbird",
              authors: ["Harper Lee"],
              dueDate: "2025-04-25",
              status: "BORROWED"
            }
          ],
          borrowingHistory: [
            {
              barcode: "B10013",
              title: "1984",
              authors: ["George Orwell"],
              borrowDate: "2024-12-10",
              returnDate: "2024-12-25",
              status: "RETURNED"
            },
            {
              barcode: "B10056",
              title: "Pride and Prejudice",
              authors: ["Jane Austen"],
              borrowDate: "2024-11-05",
              returnDate: "2024-11-20",
              status: "RETURNED"
            }
          ]
        }
        
        setMember(mockData)
      } catch (error) {
        console.error("Error fetching member details:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchMember()
  }, [authUser, isAuthenticated])

  // Show loading while checking auth or fetching data
  if (authLoading || loading) {
    return (
      <>
        <Navbar />
        <div className="container mx-auto py-8 px-4 flex justify-center items-center h-[70vh]">
          <div className="text-center space-y-4">
            <div className="animate-pulse h-8 w-32 bg-muted rounded-md mx-auto"></div>
            <div className="animate-pulse h-64 w-full max-w-3xl bg-muted rounded-md"></div>
          </div>
        </div>
      </>
    )
  }

  // If not authenticated, this will never render due to the redirect
  if (!isAuthenticated) {
    return null;
  }

  if (!member) {
    return (
      <>
        <Navbar />
        <div className="container mx-auto py-8 px-4">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <User className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Member Not Found</h3>
              <p className="text-muted-foreground">Unable to retrieve member information.</p>
            </CardContent>
          </Card>
        </div>
      </>
    )
  }

  return (
    <>
      <Navbar />
      <div className="container mx-auto py-8 px-4">
        <Card className="mb-8">
          <CardHeader className="pb-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16 border">
                  <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${member.name}`} alt={member.name} />
                  <AvatarFallback>{member.name.split(' ').map((n: string) => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-2xl">{member.name}</CardTitle>
                  <CardDescription>Member ID: {member.id}</CardDescription>
                </div>
              </div>
              <Badge variant={member.status === "ACTIVE" ? "default" : "destructive"} className="text-sm h-6">
                {member.status}
              </Badge>
            </div>
          </CardHeader>
          <Separator />
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground mb-1">Personal Information</h3>
                  <div className="text-base">
                    <p className="flex items-center gap-2 mb-2">
                      <span className="text-muted-foreground">Email:</span>
                      {member.email}
                    </p>
                    <p className="flex items-center gap-2 mb-2">
                      <span className="text-muted-foreground">Phone:</span>
                      {member.phone}
                    </p>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground mb-1">Address</h3>
                  <p className="text-base">
                    {member.address.street}, {member.address.city},<br />
                    {member.address.state}, {member.address.zipCode},<br />
                    {member.address.country}
                  </p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground mb-1">Membership Details</h3>
                  <div className="text-base">
                    <p className="flex items-center gap-2 mb-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Member Since:</span>
                      {new Date(member.dateOfMembership).toLocaleDateString()}
                    </p>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-muted-foreground">Books Checked Out:</span>
                      <Badge variant="outline" className="ml-1">
                          {member.totalBooksCheckedout}/5
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="border-t pt-6 flex justify-end">
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <Edit className="h-4 w-4" /> 
              Edit Profile
            </Button>
          </CardFooter>
        </Card>

        <Tabs defaultValue="current" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="current">Current Borrowings</TabsTrigger>
            <TabsTrigger value="history">Borrowing History</TabsTrigger>
          </TabsList>
          
          <TabsContent value="current">
            <Card>
              <CardHeader>
                <CardTitle>Currently Borrowed Books</CardTitle>
                <CardDescription>Books you currently have checked out from the library</CardDescription>
              </CardHeader>
              <CardContent>
                {member.booksCheckedOut && member.booksCheckedOut.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Author(s)</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {member.booksCheckedOut.map((book: any) => (
                        <TableRow key={book.barcode}>
                          <TableCell className="font-medium">{book.title}</TableCell>
                          <TableCell>{book.authors.join(", ")}</TableCell>
                          <TableCell>{new Date(book.dueDate).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <Badge>{book.status}</Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8">
                    <Book className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-50" />
                    <p className="text-muted-foreground">You currently have no books checked out.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Borrowing History</CardTitle>
                <CardDescription>Books you have previously borrowed</CardDescription>
              </CardHeader>
              <CardContent>
                {member.borrowingHistory && member.borrowingHistory.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Author(s)</TableHead>
                        <TableHead>Borrowed Date</TableHead>
                        <TableHead>Returned Date</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {member.borrowingHistory.map((book: any) => (
                        <TableRow key={book.barcode}>
                          <TableCell className="font-medium">{book.title}</TableCell>
                          <TableCell>{book.authors.join(", ")}</TableCell>
                          <TableCell>{new Date(book.borrowDate).toLocaleDateString()}</TableCell>
                          <TableCell>{book.returnDate ? new Date(book.returnDate).toLocaleDateString() : "N/A"}</TableCell>
                          <TableCell>
                            <Badge variant="secondary">{book.status}</Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-50" />
                    <p className="text-muted-foreground">You have no borrowing history yet.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  )
}