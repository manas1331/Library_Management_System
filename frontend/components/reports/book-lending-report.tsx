"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CalendarIcon, Download, Loader2, RefreshCw } from "lucide-react"
import { DateRange } from "react-day-picker"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useToast } from "@/hooks/use-toast"

export function BookLendingReport() {
  const [lendingData, setLendingData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [dateRange, setDateRange] = useState<DateRange | undefined>()
  const [timeframe, setTimeframe] = useState("last30days")
  const { toast } = useToast()
  
  // Statistics
  const [stats, setStats] = useState({
    totalLendings: 0,
    avgCheckoutDuration: 0,
    popularBooks: [] as any[],
    activeMembers: [] as any[]
  })
  
  useEffect(() => {
    fetchLendingData()
  }, [timeframe, dateRange])
  
  const fetchLendingData = async () => {
    setLoading(true)
    try {
      // Build API URL with timeframe or date range parameters
      let url = "http://localhost:8080/api/lendings"
      
      // In a real implementation, you would add query parameters for filtering
      // For now, we'll fetch all and filter client-side
      const response = await fetch(url)
      
      if (!response.ok) {
        throw new Error("Failed to fetch lending data")
      }
      
      const data = await response.json()
      
      // Filter based on selected date range or timeframe
      const filteredData = filterLendingData(data)
      setLendingData(filteredData)
      
      // Calculate statistics
      calculateStatistics(filteredData)
    } catch (error) {
      console.error("Error fetching lending data:", error)
      toast({
        title: "Error",
        description: "Failed to load lending report data.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }
  
  const filterLendingData = (data: any[]) => {
    if (dateRange && dateRange.from && dateRange.to) {
      // Filter by custom date range
      return data.filter(item => {
        const creationDate = new Date(item.creationDate)
        return creationDate >= dateRange.from! && creationDate <= dateRange.to!
      })
    } else {
      // Filter by selected timeframe
      const now = new Date()
      let startDate = new Date()
      
      switch (timeframe) {
        case "last7days":
          startDate.setDate(now.getDate() - 7)
          break
        case "last30days":
          startDate.setDate(now.getDate() - 30)
          break
        case "last90days":
          startDate.setDate(now.getDate() - 90)
          break
        case "alltime":
          return data // Return all data
        default:
          startDate.setDate(now.getDate() - 30)
      }
      
      return data.filter(item => {
        const creationDate = new Date(item.creationDate)
        return creationDate >= startDate
      })
    }
  }
  
  const calculateStatistics = (data: any[]) => {
    // Total lendings
    const totalLendings = data.length
    
    // Average checkout duration (in days)
    let totalDuration = 0
    const completedLendings = data.filter(item => item.returnDate)
    
    completedLendings.forEach(item => {
      const checkoutDate = new Date(item.creationDate)
      const returnDate = new Date(item.returnDate)
      const durationDays = Math.round((returnDate.getTime() - checkoutDate.getTime()) / (1000 * 60 * 60 * 24))
      totalDuration += durationDays
    })
    
    const avgCheckoutDuration = completedLendings.length ? Math.round(totalDuration / completedLendings.length) : 0
    
    // For this demo, we'll use placeholder data for popular books and active members
    // In a real implementation, you would calculate these from the data
    
    setStats({
      totalLendings,
      avgCheckoutDuration,
      popularBooks: [],
      activeMembers: []
    })
  }
  
  const handleExportCSV = () => {
    // Generate CSV content
    const headers = ["Lending ID", "Book Barcode", "Member ID", "Checkout Date", "Due Date", "Return Date", "Status"]
    const rows = lendingData.map(item => [
      item.id,
      item.bookItemBarcode,
      item.memberId,
      new Date(item.creationDate).toLocaleDateString(),
      new Date(item.dueDate).toLocaleDateString(),
      item.returnDate ? new Date(item.returnDate).toLocaleDateString() : "Not returned",
      item.returnDate ? "Returned" : "Active"
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
    link.setAttribute("download", `lending_report_${new Date().toISOString().split("T")[0]}.csv`)
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
            <CardTitle className="text-sm font-medium">Total Book Lendings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalLendings}</div>
            <p className="text-xs text-muted-foreground">
              {timeframe === "last7days" ? "Past 7 days" : 
               timeframe === "last30days" ? "Past 30 days" : 
               timeframe === "last90days" ? "Past 90 days" : "All time"}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg. Checkout Duration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgCheckoutDuration} days</div>
            <p className="text-xs text-muted-foreground">Per book checkout</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Overdue Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {lendingData.length ? 
                Math.round((lendingData.filter(item => new Date(item.dueDate) < new Date() && !item.returnDate).length / lendingData.length) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">Current overdue percentage</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Lendings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {lendingData.filter(item => !item.returnDate).length}
            </div>
            <p className="text-xs text-muted-foreground">Books currently checked out</p>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Book Lending Report</CardTitle>
          <CardDescription>View and export detailed lending history</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Label htmlFor="timeframe">Time Period</Label>
              <Select value={timeframe} onValueChange={setTimeframe}>
                <SelectTrigger id="timeframe">
                  <SelectValue placeholder="Select timeframe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="last7days">Last 7 Days</SelectItem>
                  <SelectItem value="last30days">Last 30 Days</SelectItem>
                  <SelectItem value="last90days">Last 90 Days</SelectItem>
                  <SelectItem value="alltime">All Time</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex-1">
              <Label>Custom Date Range</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dateRange && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange?.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, "LLL dd, y")} -{" "}
                          {format(dateRange.to, "LLL dd, y")}
                        </>
                      ) : (
                        format(dateRange.from, "LLL dd, y")
                      )
                    ) : (
                      <span>Pick a date range</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={dateRange?.from}
                    selected={dateRange}
                    onSelect={setDateRange}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="flex items-end space-x-2">
              <Button variant="outline" onClick={fetchLendingData} disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
                Refresh
              </Button>
              <Button variant="outline" onClick={handleExportCSV} disabled={loading || lendingData.length === 0}>
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>
          
          {loading ? (
            <div className="text-center py-10">
              <Loader2 className="h-8 w-8 animate-spin mx-auto" />
              <p className="mt-2 text-muted-foreground">Loading lending data...</p>
            </div>
          ) : lendingData.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-muted-foreground">No lending data available for the selected period.</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Book Barcode</TableHead>
                    <TableHead>Member ID</TableHead>
                    <TableHead>Checkout Date</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Return Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lendingData.slice(0, 10).map((lending) => (
                    <TableRow key={lending.id}>
                      <TableCell>{lending.bookItemBarcode}</TableCell>
                      <TableCell>{lending.memberId}</TableCell>
                      <TableCell>{new Date(lending.creationDate).toLocaleDateString()}</TableCell>
                      <TableCell>{new Date(lending.dueDate).toLocaleDateString()}</TableCell>
                      <TableCell>
                        {lending.returnDate ? new Date(lending.returnDate).toLocaleDateString() : "Not returned"}
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          lending.returnDate 
                            ? "bg-green-100 text-green-800" 
                            : new Date(lending.dueDate) < new Date() 
                              ? "bg-red-100 text-red-800" 
                              : "bg-blue-100 text-blue-800"
                        }`}>
                          {lending.returnDate 
                            ? "Returned" 
                            : new Date(lending.dueDate) < new Date() 
                              ? "Overdue" 
                              : "Active"}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {Math.min(10, lendingData.length)} of {lendingData.length} records
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}