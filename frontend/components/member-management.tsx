"use client"

import { useState, useEffect } from "react"
import { Edit, Plus, Search, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { set } from "date-fns"

export function MemberManagement() {
  const [members, setMembers] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedMember, setSelectedMember] = useState<any | null>(null) // For editing a specific member
  const [newMember, setNewMember] = useState({
    name: "",
    email: "",
    phone: "",
    address: {
      street: "",
      city: "",
      state: "",
      zipCode: "",
      country: ""
    },
  })
  const { toast } = useToast()

  // Fetch all members
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

  // Filter members based on search query
  const filteredMembers = members.filter((member) => {
    if (!searchQuery) return true

    const query = searchQuery.toLowerCase()
    return (
      member.name.toLowerCase().includes(query) ||
      member.email.toLowerCase().includes(query) ||
      member.id.toLowerCase().includes(query)
    )
  })
  const openEditDialog = (member: any) => {
    setSelectedMember(member)
    setNewMember({
      name: member.name,
      email: member.email,
      phone: member.phone,
      address: {
        street: member.address.street,
        city: member.address.city,
        state: member.address.state,
        zipCode: member.address.zipCode,
        country: member.address.country,
      },
    })
    setIsEditDialogOpen(true)
  }
  // Edit a member
  const handleEditMember = async () => {
    if (!selectedMember) return
    try {
      const response = await fetch(`http://localhost:8080/api/members/${selectedMember.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newMember),
      })

      if (!response.ok) {
        throw new Error("Failed to update member")
      }

      const updatedMember = await response.json()
      setMembers(members.map((member) => (member.id === selectedMember.id ? updatedMember : member)))

      toast({
        title: "Success",
        description: `Member ${updatedMember.name} has been updated successfully.`,
      })
      setIsEditDialogOpen(false)
      setSelectedMember(null)
    } catch (error) {
      console.error("Error updating member:", error)
      toast({
        title: "Error",
        description: "Failed to update member. Please try again.",
        variant: "destructive",
      })
    }
  }
  // Delete a member
  const handleDeleteMember = async (id: string) => {
    try {
      const response = await fetch(`http://localhost:8080/api/members/${id}`, {
        method: "DELETE",
      })
  
      if (!response.ok) {
        throw new Error("Failed to delete member")
      }
  
      setMembers(members.filter((member) => member.id !== id))
  
      toast({
        title: "Success",
        description: "Member has been deleted successfully.",
      })
    } catch (error) {
      console.error("Error deleting member:", error)
      toast({
        title: "Error",
        description: "Failed to delete member. Please try again.",
        variant: "destructive",
      })
    }
  }
  // Add a new member
  const handleAddMember = async () => {
    if (!newMember.name || !newMember.email || !newMember.phone) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await fetch("http://localhost:8080/api/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newMember),
      })

      if (!response.ok) {
        throw new Error("Failed to add member")
      }

      const addedMember = await response.json()
      setMembers([...members, addedMember])

      toast({
        title: "Success",
        description: `Member ${newMember.name} has been added successfully with ID: ${addedMember.id}`,
      })

      // Reset form and close dialog
      setNewMember({
        name: "",
        email: "",
        phone: "",
        address: {
          street: "",
          city: "",
          state: "",
          zipCode: "",
          country: ""
        },
      })
      setIsAddDialogOpen(false)
    } catch (error) {
      console.error("Error adding member:", error)
      toast({
        title: "Error",
        description: "Failed to add member. Please try again.",
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
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Member
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Member</DialogTitle>
              <DialogDescription>Enter the details of the new library member.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={newMember.name}
                  onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                  placeholder="John Doe"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newMember.email}
                  onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                  placeholder="john.doe@example.com"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={newMember.phone}
                  onChange={(e) => setNewMember({ ...newMember, phone: e.target.value })}
                  placeholder="555-123-4567"
                />
              </div>
              {/* <div className="grid gap-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={newMember.address}
                  onChange={(e) => setNewMember({ ...newMember, address: e.target.value })}
                  placeholder="123 Main St, City, State"
                />
              </div> */}
              <div className="grid gap-2">
                <Label htmlFor="street">Street</Label>
                <Input
                  id="street"
                  value={newMember.address.street}
                  onChange={(e) =>
                    setNewMember({
                      ...newMember,
                      address: { ...newMember.address, street: e.target.value },
                    })
                  }
                  placeholder="123 Main St"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={newMember.address.city}
                  onChange={(e) =>
                    setNewMember({
                      ...newMember,
                      address: { ...newMember.address, city: e.target.value },
                    })
                  }
                  placeholder="City"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  value={newMember.address.state}
                  onChange={(e) =>
                    setNewMember({
                      ...newMember,
                      address: { ...newMember.address, state: e.target.value },
                    })
                  }
                  placeholder="State"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="zipCode">Zip Code</Label>
                <Input
                  id="zipCode"
                  value={newMember.address.zipCode}
                  onChange={(e) =>
                    setNewMember({
                      ...newMember,
                      address: { ...newMember.address, zipCode: e.target.value },
                    })
                  }
                  placeholder="12345"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddMember}>Add Member</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Library Members</CardTitle>
          <CardDescription>Manage library members and their accounts</CardDescription>
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
                        <div className="flex space-x-2">
                        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="icon" onClick={() => openEditDialog(member)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Edit Member</DialogTitle>
                                <DialogDescription>Update the details of the library member.</DialogDescription>
                              </DialogHeader>
                                <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                              <Label htmlFor="name">Full Name</Label>
                              <Input
                                id="name"
                                value={newMember.name}
                                onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                                placeholder="John Doe"
                              />
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="email">Email</Label>
                              <Input
                                id="email"
                                type="email"
                                value={newMember.email}
                                onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                                placeholder="john.doe@example.com"
                              />
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="phone">Phone</Label>
                              <Input
                                id="phone"
                                value={newMember.phone}
                                onChange={(e) => setNewMember({ ...newMember, phone: e.target.value })}
                                placeholder="555-123-4567"
                              />
                            </div>
                            {/* <div className="grid gap-2">
                              <Label htmlFor="address">Address</Label>
                              <Input
                                id="address"
                                value={newMember.address}
                                onChange={(e) => setNewMember({ ...newMember, address: e.target.value })}
                                placeholder="123 Main St, City, State"
                              />
                            </div> */}
                            <div className="grid gap-2">
                              <Label htmlFor="street">Street</Label>
                              <Input
                                id="street"
                                value={newMember.address.street}
                                onChange={(e) =>
                                  setNewMember({
                                    ...newMember,
                                    address: { ...newMember.address, street: e.target.value },
                                  })
                                }
                                placeholder="123 Main St"
                              />
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="city">City</Label>
                              <Input
                                id="city"
                                value={newMember.address.city}
                                onChange={(e) =>
                                  setNewMember({
                                    ...newMember,
                                    address: { ...newMember.address, city: e.target.value },
                                  })
                                }
                                placeholder="City"
                              />
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="state">State</Label>
                              <Input
                                id="state"
                                value={newMember.address.state}
                                onChange={(e) =>
                                  setNewMember({
                                    ...newMember,
                                    address: { ...newMember.address, state: e.target.value },
                                  })
                                }
                                placeholder="State"
                              />
                            
                            </div>
                              <div className="grid gap-2">
                                <Label htmlFor="zipCode">Zip Code</Label>
                                <Input
                                  id="zipCode"
                                  value={newMember.address.zipCode}
                                  onChange={(e) =>
                                    setNewMember({
                                      ...newMember,
                                      address: { ...newMember.address, zipCode: e.target.value },
                                    })
                                  }
                                  placeholder="12345"
                                />
                              </div>
          
                              </div>
                              <DialogFooter>
                                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                                  Cancel
                                </Button>
                                <Button onClick={handleEditMember}>Save Changes</Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteMember(member.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}

                  {filteredMembers.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
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