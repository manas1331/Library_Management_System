"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Download, Loader2, RefreshCw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function FineReport() {
  const [fines, setFines] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  
  // Summary statistics
  const [summary, setSummary] = useState({
    totalFines: 0,
    totalCollected: 0,
    totalPending: 0,
    averageFine: 0
  })
  
  useEffect(() => {
    fetchFineData()
  }, [])
  
  const fetchFineData = async () => {
    setLoading(true)
    try {
      const response = await fetch("http://localhost:8080/api/fines")
      
      if (!response.ok) {
        throw new Error("Failed to fetch fine data")
      }
      
      const data = await response.json()
      setFines(data)
      
      // Calculate summary statistics
      let totalAmount = 0
      let totalCollected = 0
      
      data.forEach((fine: any) => {
        totalAmount += fine.amount
        if (fine.paid) {
          totalCollected += fine.amount
        }
      })
      
      const averageFine = data.length > 0 ? totalAmount / data.length : 0
      
      setSummary({
        totalFines: totalAmount,
        totalCollected: totalCollected,
        totalPending: totalAmount - totalCollected,
        averageFine: averageFine
      })
    } catch (error) {
      console.error("Error fetching fine data:", error)
      toast({
        title: "Error",
        description: "Failed to load fine report data.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }
  
  const handleExportCSV = () => {
    // Generate CSV content
    const headers = ["Fine ID", "Book Barcode", "Member ID", "Amount", "Reason", "Date", "Paid Status"]
    const rows = fines.map(fine => [
      fine.id,
      fine.bookItemBarcode,
      fine.memberId,
      `$${fine.amount.toFixed(2)}`,
      fine.reason,
      fine.creationDate ? new Date(fine.creationDate).toLocaleDateString() : "Unknown",
      fine.paid ? "Paid" : "Unpaid"
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
    link.setAttribute("download", `fine_report_${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Fines</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${summary.totalFines.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Collected</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${summary.totalCollected.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {summary.totalFines > 0 ? `${Math.round((summary.totalCollected / summary.totalFines) * 100)}% of total` : "0% of total"}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${summary.totalPending.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {summary.totalFines > 0 ? `${Math.round((summary.totalPending / summary.totalFines) * 100)}% of total` : "0% of total"}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg. Fine</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${summary.averageFine.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Per incident</p>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Fine Report</CardTitle>
            <CardDescription>View and export fine collection data</CardDescription>
          </div>
          
          <div className="flex space-x-2">
            <Button variant="outline" onClick={fetchFineData} disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
              Refresh
            </Button>
            <Button variant="outline" onClick={handleExportCSV} disabled={loading || fines.length === 0}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-10">
              <Loader2 className="h-8 w-8 animate-spin mx-auto" />
              <p className="mt-2 text-muted-foreground">Loading fine data...</p>
            </div>
          ) : fines.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-muted-foreground">No fine data available.</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Member ID</TableHead>
                    <TableHead>Book Barcode</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fines.slice(0, 10).map((fine) => (
                    <TableRow key={fine.id}>
                      <TableCell>{fine.memberId}</TableCell>
                      <TableCell>{fine.bookItemBarcode}</TableCell>
                      <TableCell>{fine.reason}</TableCell>
                      <TableCell>
                        {fine.creationDate ? new Date(fine.creationDate).toLocaleDateString() : "Unknown"}
                      </TableCell>
                      <TableCell>${fine.amount.toFixed(2)}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          fine.paid ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"
                        }`}>
                          {fine.paid ? "Paid" : "Unpaid"}
                        </span>
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