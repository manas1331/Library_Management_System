"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Download, Loader2, RefreshCw, Edit, Save, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"

export function MemberReport() {
  const [members, setMembers] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  
  // Metrics
  const [metrics, setMetrics] = useState({
    totalMembers: 0,
    activeMembers: 0,
    blockedMembers: 0,
    averageCheckouts: 0
  })

  const [editingMemberId, setEditingMemberId] = useState<string | null>(null)
  const [newStatus, setNewStatus] = useState<string>("ACTIVE")
  
  useEffect(() => {
    fetchMemberData()
  }, [])
  
  const fetchMemberData = async () => {
    setLoading(true)
    try {
      const response = await fetch("http://localhost:8080/api/members")
      
      if (!response.ok) {
        throw new Error("Failed to fetch member data")
      }
      
      const data = await response.json()
      setMembers(data)
      
      // Calculate metrics
      const totalMembers = data.length
      const activeMembers = data.filter((m: any) => m.status === "ACTIVE").length
      const blockedMembers = data.filter((m: any) => m.status === "BLACKLISTED").length
      
      // Calculate average checkouts
      let totalCheckouts = 0
      data.forEach((m: any) => {
        totalCheckouts += m.totalBooksCheckedout || 0
      })
      const averageCheckouts = totalMembers > 0 ? (totalCheckouts / totalMembers).toFixed(1) : 0
      
      setMetrics({
        totalMembers,
        activeMembers,
        blockedMembers,
        averageCheckouts: Number(averageCheckouts)
      })
    } catch (error) {
      console.error("Error fetching member data:", error)
      toast({
        title: "Error",
        description: "Failed to load member report data.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }
  
  const handleExportCSV = () => {
    // Generate CSV content
    const headers = ["Member ID", "Name", "Email", "Phone", "Status", "Member Since", "Books Checked Out"]
    const rows = members.map(member => [
      member.id,
      member.name || (member.person ? member.person.name : "Unknown"),
      member.email || (member.person ? member.person.email : "Unknown"),
      member.phone || (member.person ? member.person.phone : "Unknown"),
      member.status,
      member.dateOfMembership ? new Date(member.dateOfMembership).toLocaleDateString() : "Unknown",
      member.totalBooksCheckedout || 0
    ])
    
    // Combine headers and rows
    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n")
    
    // Create a Blob and download link
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `member_report_${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleUpdateMemberStatus = async (memberId: string) => {
    try {
      const response = await fetch(`http://localhost:8080/api/members/${memberId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          status: newStatus
        })
      })
      
      if (!response.ok) {
        throw new Error("Failed to update member status")
      }
      
      // Update the members list with the new status
      setMembers(members.map(member => 
        member.id === memberId ? {...member, status: newStatus} : member
      ))
      
      toast({
        title: "Success",
        description: "Member status updated successfully",
      })
      
      setEditingMemberId(null)
    } catch (error) {
      console.error("Error updating member status:", error)
      toast({
        title: "Error",
        description: "Failed to update member status",
        variant: "destructive",
      })
    }
  }
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalMembers}</div>
            <p className="text-xs text-muted-foreground">Registered library members</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Members</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.activeMembers}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.totalMembers > 0 ? `${Math.round((metrics.activeMembers / metrics.totalMembers) * 100)}% of total` : "0% of total"}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Blocked Members</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.blockedMembers}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.totalMembers > 0 ? `${Math.round((metrics.blockedMembers / metrics.totalMembers) * 100)}% of total` : "0% of total"}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg. Checkouts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.averageCheckouts}</div>
            <p className="text-xs text-muted-foreground">Books per member</p>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Member Report</CardTitle>
            <CardDescription>View and export member activity data</CardDescription>
          </div>
          
          <div className="flex space-x-2">
            <Button variant="outline" onClick={fetchMemberData} disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
              Refresh
            </Button>
            <Button variant="outline" onClick={handleExportCSV} disabled={loading || members.length === 0}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-10">
              <Loader2 className="h-8 w-8 animate-spin mx-auto" />
              <p className="mt-2 text-muted-foreground">Loading member data...</p>
            </div>
          ) : members.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-muted-foreground">No member data available.</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Member Since</TableHead>
                    <TableHead>Books Checked Out</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {members.slice(0, 10).map((member) => (
                    <TableRow key={member.id}>
                      <TableCell className="font-medium">{member.id}</TableCell>
                      <TableCell>{member.name || (member.person ? member.person.name : "Unknown")}</TableCell>
                      <TableCell>{member.email || (member.person ? member.person.email : "Unknown")}</TableCell>
                      <TableCell>
                        {editingMemberId === member.id ? (
                          <div className="flex items-center space-x-2">
                            <Select 
                              value={newStatus} 
                              onValueChange={setNewStatus}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="ACTIVE">ACTIVE</SelectItem>
                                <SelectItem value="CLOSED">CLOSED</SelectItem>
                                <SelectItem value="CANCELED">CANCELED</SelectItem>
                                <SelectItem value="BLACKLISTED">BLACKLISTED</SelectItem>
                              </SelectContent>
                            </Select>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              onClick={() => handleUpdateMemberStatus(member.id)}
                            >
                              <Save className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              onClick={() => setEditingMemberId(null)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              member.status === "ACTIVE" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                            }`}>
                              {member.status}
                            </span>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              onClick={() => {
                                setEditingMemberId(member.id)
                                setNewStatus(member.status)
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {member.dateOfMembership ? new Date(member.dateOfMembership).toLocaleDateString() : "Unknown"}
                      </TableCell>
                      <TableCell>{member.totalBooksCheckedout || 0}/5</TableCell>
                      <TableCell>
                        <Button size="sm" variant="outline" onClick={() => setEditingMemberId(member.id)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}