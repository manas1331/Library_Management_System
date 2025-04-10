"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export default function ListMembers() {
  const [members, setMembers] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchMembers = async () => {
      setLoading(true)
      try {
        const response = await fetch("http://localhost:8080/api/members")
        if (!response.ok) {
          throw new Error("Failed to fetch members")
        }
        const data = await response.json()
        setMembers(data)
      } catch (error) {
        console.error("Error fetching members:", error)
        toast({
          title: "Error",
          description: "Failed to fetch members. Please try again later.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchMembers()
  }, [])

  const filteredMembers = members.filter((member) => {
    if (!searchQuery) return true

    const query = searchQuery.toLowerCase()
    return (
      member.name.toLowerCase().includes(query) ||
      member.email.toLowerCase().includes(query) ||
      member.id.toLowerCase().includes(query)
    )
  })
  const handleRemoveMember = async (id: string) => {
    try {
      const response = await fetch(`http://localhost:8080/api/members/${id}`, {
        method: "DELETE",
      })
      if (!response.ok) {
        throw new Error("Failed to remove member")
      }
      setMembers(members.filter((member) => member.id !== id))

      toast({
        title: "Success",
        description: "Member has been removed successfully.",
      })
    } catch (error) {
      console.error("Error removing member:", error)
      toast({
        title: "Error",
        description: "Failed to remove member. Please try again.",
        variant: "destructive",
      })
    }
  }
  const handleBlockUnblockMember = async (id: string, action: "block" | "unblock") => {
    try {
      const response = await fetch(`http://localhost:8080/api/members/${id}/${action}`, {
        method: "PUT",
      })

      if (!response.ok) {
        throw new Error(`Failed to ${action} member`)
      }

      const updatedMembers = members.map((member) =>
        member.id === id
          ? { ...member, status: action === "block" ? "BLACKLISTED" : "ACTIVE" }
          : member
      )
      setMembers(updatedMembers)

      toast({
        title: "Success",
        description: `Member has been ${action === "block" ? "blocked" : "unblocked"} successfully.`,
      })
    } catch (error) {
      console.error(`Error ${action}ing member:`, error)
      toast({
        title: "Error",
        description: `Failed to ${action} member. Please try again.`,
        variant: "destructive",
      })
    }
  }
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search members..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Library Members</CardTitle>
          <CardDescription>View,search and manage library members</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-10">Loading members...</div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Books</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMembers.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell className="font-medium">{member.id}</TableCell>
                      <TableCell>{member.name}</TableCell>
                      <TableCell>{member.email}</TableCell>
                      <TableCell>{member.totalBooksCheckedout}/5</TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            member.status === "ACTIVE" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                          }`}
                        >
                          {member.status}
                        </span>
                      </TableCell>
                      <TableCell>
                      <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant="outline" size="sm">
        Actions
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent>
      {member.status === "ACTIVE" ? (
        <DropdownMenuItem onClick={() => handleBlockUnblockMember(member.id, "block")}>
          Block
        </DropdownMenuItem>
      ) : (
        <DropdownMenuItem onClick={() => handleBlockUnblockMember(member.id, "unblock")}>
          Unblock
        </DropdownMenuItem>
      )}
      <DropdownMenuItem onClick={() => handleRemoveMember(member.id)}>
        Remove
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
  </TableCell>
                    </TableRow>
                  ))}

                  {filteredMembers.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                        No members found matching your search criteria.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}